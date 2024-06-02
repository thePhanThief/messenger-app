import socket
import threading
import os
import hashlib
import json
import subprocess
import time
from queue import Queue

# File to store approved credentials
credentials_file = "approved_credentials.json"
admin_credentials_file = "approved_admin.json"

# Load approved credentials from the file
def load_credentials(credentials_file):
    if os.path.exists(credentials_file):
        with open(credentials_file, "r") as file:
            return json.load(file)
    return {}

# Save approved credentials to the file
def save_credentials(credentials):
    with open(credentials_file, "w") as file:
        json.dump(credentials, file)

approved_credentials = load_credentials(credentials_file)
admin_credentials = load_credentials(admin_credentials_file)

# Queue for pending client approvals
pending_clients = Queue()
admin_socket = None

# Event to indicate if an admin is connected
admin_connected = threading.Event()
current_client = None

# Dictionary to store client sockets
client_sockets = {}

# Function to send a message through the socket
def send_message(sock, message):
    try:
        sock.sendall((message + '\n').encode('utf-8'))
    except Exception as e:
        print(f"Error sending message: {e}")

# Function to receive a message from the socket
def receive_message(sock):
    data = b''
    try:
        while not data.endswith(b'\n'):
            part = sock.recv(1024)
            if not part:
                break
            data += part
        message = data.decode('utf-8').strip()
        return message
    except socket.error as e:
        print(f"Error receiving message: {e}")
        return ""

# Function to generate a random challenge string
def generate_challenge():
    return os.urandom(16).hex()

# Function to handle admin connections
def handle_admin(admin_socket):
    global admin_connected
    
    # Check if an admin is already connected
    if admin_connected.is_set():
        send_message(admin_socket, "Another admin is already connected.")
        admin_socket.close()
        return False

    try:
        # Prompt admin for username
        send_message(admin_socket, "Enter admin username:")
        username = receive_message(admin_socket)

        # Prompt admin for password
        send_message(admin_socket, "Enter admin password:")
        password = receive_message(admin_socket)

        # Hash the received password
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        # Validate admin credentials
        if username in admin_credentials and admin_credentials[username] == hashed_password:
            # Generate a challenge for the admin
            challenge = generate_challenge()
            send_message(admin_socket, f"CHALLENGE:{challenge}")

            # Receive the challenge response from the admin
            admin_hash = receive_message(admin_socket)
            if not admin_hash:
                send_message(admin_socket, "No challenge response received. Connection will be terminated.")
                admin_socket.close()
                return False

            # Verify the challenge response
            expected_hash = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
            if admin_hash != expected_hash:
                send_message(admin_socket, "Failed security check. Connection will be terminated.")
                admin_socket.close()
                return False

            # Generate and send a server hash for verification
            server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
            send_message(admin_socket, f"VERIFY:{server_hash}")

            # Receive and validate the verification response
            verification = receive_message(admin_socket)
            if verification != "VERIFIED":
                send_message(admin_socket, "Verification failed. Connection will be terminated.")
                admin_socket.close()
                return False

            # Admin login successful
            send_message(admin_socket, "Admin logged in successfully.")
            admin_connected.set()

            # Start a thread to handle admin commands
            threading.Thread(target=admin_command_handler, args=(admin_socket,)).start()
            return True
        else:
            # Invalid credentials
            send_message(admin_socket, "Invalid admin credentials. Connection will be closed.")
            admin_socket.close()
            return False
    except Exception as e:
        # Handle any exceptions during the admin handling process
        print(f"Admin handling error: {e}")
        send_message(admin_socket, "An error occurred. Connection will be closed.")
        admin_socket.close()
        return False

# Function to handle admin commands
def admin_command_handler(admin_socket):
    global pending_clients, admin_connected, approved_credentials, current_client

    # Function to periodically check the queue for pending clients
    def check_queue_periodically():
        while admin_connected.is_set():
            if not pending_clients.empty() and current_client is None:
                current_client = pending_clients.get()
                client_socket, client_username, client_hashed_password = current_client
                 # Only notify if the client socket is open
                if client_socket.fileno() != -1: 
                    send_message(admin_socket, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:")
                    send_message(client_socket, "You can now message the admin.")
                else:
                    current_client = None
                    continue
            # Check every second
            time.sleep(1) 

    # Start the periodic queue check in a separate thread
    threading.Thread(target=check_queue_periodically).start()

    try:
        while admin_connected.is_set():
            try:
                message = receive_message(admin_socket)
                if message == "":
                    # Ignore empty messages (keep-alive)
                    continue  
                if message.startswith('/approve') and current_client:
                    client_socket, client_username, client_hashed_password = current_client
                     # Skip if the client socket is closed
                    if client_socket.fileno() == -1: 
                        send_message(admin_socket, "The client has disconnected unexpectedly.")
                        current_client = None
                        continue
                    approved_credentials[client_username] = client_hashed_password
                    save_credentials(approved_credentials)
                    send_message(client_socket, "Please visit https://secure-chat-qvlga812w-nadav-salomons-projects.vercel.app/?callbackUrl=%2Fusers")

                    client_socket.close()
                    send_message(admin_socket, "Client approved successfully.")
                    current_client = None
                    notify_next_client_in_queue()

                elif message.startswith('/disapprove') and current_client:
                    client_socket, client_username, _ = current_client
                     # Skip if the client socket is closed
                    if client_socket.fileno() == -1: 
                        send_message(admin_socket, "The client has disconnected unexpectedly.")
                        current_client = None
                        notify_next_client_in_queue()
                        continue
                    send_message(client_socket, "You were disapproved. Connection will be terminated.")
                    client_socket.close()
                    send_message(admin_socket, "Client disapproved successfully.")
                    current_client = None
                    notify_next_client_in_queue()

                elif message.startswith('/remove '):
                    _, remove_username = message.split(' ', 1)
                    if remove_username in approved_credentials:
                        del approved_credentials[remove_username]
                        save_credentials(approved_credentials)
                        send_message(admin_socket, f"User '{remove_username}' has been removed from the approved list.")
                    else:
                        send_message(admin_socket, f"User '{remove_username}' not found in the approved list.")
                else:
                    if current_client:
                        client_socket, client_username, _ = current_client
                        if client_socket.fileno() != -1:  # Only send if the client socket is open
                            send_message(client_socket, f"[Admin] {message}")
            except Exception as e:
                print(f"Error in admin command handler: {e}")
                if current_client:
                    try:
                        client_socket, _, _ = current_client
                        client_socket.close()
                    except Exception as ex:
                        print(f"Error closing client socket: {ex}")
                    current_client = None
                    notify_next_client_in_queue()
                break

            # Handle additional admin commands when no client is being approved/disapproved
            if current_client is None:
                try:
                    message = receive_message(admin_socket)
                    if message.startswith('/remove '):
                        _, remove_username = message.split(' ', 1)
                        if remove_username in approved_credentials:
                            del approved_credentials[remove_username]
                            save_credentials(approved_credentials)
                            send_message(admin_socket, f"User '{remove_username}' has been removed from the approved list.")
                        else:
                            send_message(admin_socket, f"User '{remove_username}' not found in the approved list.")
                    elif message.startswith('/approve') or message.startswith('/disapprove'):
                        send_message(admin_socket, "No client is currently waiting for approval.")
                    else:
                        send_message(admin_socket, f"Unknown command: {message}")
                except Exception as e:
                    print(f"Error in admin command handler (idle): {e}")
                    break
    finally:
        admin_socket.close()
        admin_connected.clear()
        current_client = None
        print("[ADMIN DISCONNECTED] Admin has disconnected. Waiting for new admin connection.")

# Function to notify the next client in the queue
def notify_next_client_in_queue():
    global current_client, admin_socket
    if not pending_clients.empty():
        current_client = pending_clients.get()
        client_socket, client_username, client_hashed_password = current_client
        if client_socket.fileno() != -1:  # Only notify if the client socket is open
            send_message(admin_socket, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:")
            send_message(client_socket, "You can now message the admin.")
        else:
            current_client = None
            notify_next_client_in_queue()

# Function to update the positions of clients in the queue
def update_client_queue_positions():
    position = 1
    for client_socket, client_username, client_hashed_password in list(pending_clients.queue):
        if client_socket.fileno() == -1:  # Check if the socket is closed
            pending_clients.queue.remove((client_socket, client_username, client_hashed_password))
            print(f"Removed disconnected client '{client_username}' from queue.")
        else:
            try:
                send_message(client_socket, f"You are now number {position} in the queue.")
            except Exception as e:
                print(f"Error sending queue position to {client_username}: {e}")
        position += 1

# Function to handle client connections
def handle_client(client_socket, address):
    global pending_clients, admin_socket, current_client, client_sockets
    print(f"[NEW CONNECTION] {address} connected.")
    
    username = ""
    try:
        while True:
            send_message(client_socket, "Enter username:")
            username = receive_message(client_socket)
            if not username:
                send_message(client_socket, "No username received. Connection will be terminated.")
                client_socket.close()
                return
            
            send_message(client_socket, "Enter password:")
            password = receive_message(client_socket)
            if not password:
                send_message(client_socket, "No password received. Connection will be terminated.")
                client_socket.close()
                return

            hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
            
            if username in approved_credentials:
                if approved_credentials[username] != hashed_password:
                    send_message(client_socket, "Username already taken or password is incorrect. Please try again or choose a different username.")
                    continue
            elif any(client[1] == username for client in list(pending_clients.queue)):
                send_message(client_socket, "Username already taken. Please try again or choose a different username.")
                continue
            
            challenge = generate_challenge()
            send_message(client_socket, f"CHALLENGE:{challenge}")
            
            client_hash = receive_message(client_socket)
            if not client_hash:
                send_message(client_socket, "No challenge response received. Connection will be terminated.")
                client_socket.close()
                return
            
            expected_hash = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
            if client_hash != expected_hash:
                send_message(client_socket, "Failed security check. Connection will be terminated.")
                client_socket.close()
                return
            
            server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
            send_message(client_socket, f"VERIFY:{server_hash}")
            
            verification = receive_message(client_socket)
            if verification != "VERIFIED":
                send_message(client_socket, "Verification failed. Connection will be terminated.")
                client_socket.close()
                return
            
            if username in approved_credentials:
                send_message(client_socket, "Please visit https://secure-chat-qvlga812w-nadav-salomons-projects.vercel.app/?callbackUrl=%2Fusers")
                client_socket.close()
                return
            else:
                pending_clients.put((client_socket, username, hashed_password))
                client_sockets[username] = client_socket
                send_message(client_socket, "Waiting for admin approval.")
                
                if admin_connected.is_set() and current_client is None:
                    notify_next_client_in_queue()
                else:
                    update_client_queue_positions()

                while True:
                    try:
                        message = receive_message(client_socket)
                        # If the message is empty, the client may have disconnected
                        if not message:  
                            break
                          # Filter out empty messages
                        if message.strip():
                            send_message(admin_socket, f"[{username}] {message}")
                    except socket.error as e:
                        print(f"Error receiving message: {e}")
                        break
                    time.sleep(2)
    except socket.error as e:
        print(f"[DISCONNECTED] {address} has disconnected unexpectedly: {e}")
    except Exception as e:
        print(f"Error handling client {address}: {e}")
    finally:
        if username:
            pending_clients.queue = [client for client in list(pending_clients.queue) if client[1] != username]
            if current_client and current_client[1] == username:
                send_message(admin_socket, f"Client '{username}' disconnected unexpectedly and has been disapproved.")
                try:
                    current_client[0].close()
                except Exception as e:
                    print(f"Error closing client socket: {e}")
                current_client = None
                notify_next_client_in_queue()
            else:
                send_message(admin_socket, f"Client '{username}' disconnected unexpectedly and has been removed from the queue.")
        try:
            client_socket.close()
        except Exception as e:
            print(f"Error closing client socket: {e}")
        update_client_queue_positions()

# Function to start the server
def start_server(host='127.0.0.1', client_port=65432, admin_port=65433):
    global admin_socket
    client_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_server_socket.bind((host, client_port))
    client_server_socket.listen()
    print(f"[LISTENING] Client server is listening on {host}:{client_port}")
    
    admin_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    admin_server_socket.bind((host, admin_port))
    admin_server_socket.listen()
    print(f"[LISTENING] Admin server is listening on {host}:{admin_port}")
    
    admin_thread = threading.Thread(target=accept_admin_connections, args=(admin_server_socket,))
    admin_thread.start()

    try:
        while True:
            client_socket, address = client_server_socket.accept()
            thread = threading.Thread(target=handle_client, args=(client_socket, address))
            thread.start()
            print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}")
    except KeyboardInterrupt:
        print("[SHUTDOWN] Server is shutting down.")
    finally:
        client_server_socket.close()
        admin_server_socket.close()

# Function to accept admin connections
def accept_admin_connections(admin_server_socket):
    global admin_socket
    while True:
        admin_socket, admin_address = admin_server_socket.accept()
        if handle_admin(admin_socket):
            print("Admin logged in.")

if __name__ == '__main__':
    start_server() 
