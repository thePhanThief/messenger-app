import socket
import threading
import os
import hashlib
import json
import time
from collections import deque

# File to store approved credentials
CREDENTIALS_FILE = "approved_credentials.json"
ADMIN_CREDENTIALS_FILE = "approved_admin.json"

# Load approved credentials from the file
def load_credentials(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            return json.load(file)
    return {}

# Save approved credentials to the file
def save_credentials(credentials):
    with open(CREDENTIALS_FILE, "w") as file:
        json.dump(credentials, file)

# Initialize global variables
approved_credentials = load_credentials(CREDENTIALS_FILE)
admin_credentials = load_credentials(ADMIN_CREDENTIALS_FILE)
pending_clients = deque()
admin_socket = None
admin_connected = threading.Event()
current_client = None
client_sockets = {}
server_running = threading.Event()
current_client_info = None

# Function to send a message through the socket
def send_message(sock, message):
    try:
        if sock.fileno() != -1:
            sock.sendall((message + '\n').encode('utf-8'))
    except Exception as e:
        return

# Function to receive a message from the socket
def receive_message(sock):
    data = b''
    try:
        while not data.endswith(b'\n'):
            part = sock.recv(1024)
            if not part:
                break
            data += part
        return data.decode('utf-8').strip()
    except Exception as e:
        return ""

# Function to generate a random challenge string
def generate_challenge():
    return os.urandom(16).hex()

# Function to handle admin connections
def handle_admin(admin_sock):
    global admin_connected, current_client_info, current_client

    if admin_connected.is_set():
        send_message(admin_sock, "Another admin is already connected.")
        admin_sock.close()
        return False

    try:
        send_message(admin_sock, "Enter admin username:")
        username = receive_message(admin_sock)

        send_message(admin_sock, "Enter admin password:")
        password = receive_message(admin_sock)
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

        if username in admin_credentials and admin_credentials[username] == hashed_password:
            challenge = generate_challenge()
            send_message(admin_sock, f"CHALLENGE:{challenge}")
            admin_hash = receive_message(admin_sock)
            if not admin_hash:
                send_message(admin_sock, "No challenge response received. Connection will be terminated.")
                admin_sock.close()
                return False

            expected_hash = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
            if admin_hash != expected_hash:
                send_message(admin_sock, "Failed security check. Connection will be terminated.")
                admin_sock.close()
                return False

            server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
            send_message(admin_sock, f"VERIFY:{server_hash}")
            verification = receive_message(admin_sock)
            if verification != "VERIFIED":
                send_message(admin_sock, "Verification failed. Connection will be terminated.")
                admin_sock.close()
                return False

            send_message(admin_sock, "Admin logged in successfully.")
            admin_connected.set()
            notify_clients_admin_status("Admin is now online. Please wait for your turn to be approved.")
            stop_event = threading.Event()
            threading.Thread(target=admin_command_handler, args=(admin_sock, stop_event)).start()

            if current_client_info:
                current_client = current_client_info
                current_client_info = None
                client_sock, client_username, client_hashed_password = current_client
                if client_sock.fileno() != -1:
                    send_message(admin_sock, f"Restored session with client '{client_username}'. Type /approve or /disapprove:")
                    send_message(client_sock, "Admin is back online. You can continue to message the admin.")
            else:
                notify_next_client_in_queue()
            return True
        else:
            send_message(admin_sock, "Invalid admin credentials. Connection will be closed.")
            admin_sock.close()
            return False
    except Exception as e:
        print(f"Admin handling error: {e}")
        send_message(admin_sock, "An error occurred. Connection will be closed.")
        admin_sock.close()
        return False

# Function to handle client logoff
def client_logoff(client_sock, username):
    global pending_clients, current_client, client_sockets
    if username:
        pending_clients = deque([client for client in pending_clients if client[1] != username])
        if current_client and current_client[1] == username:
            try:
                current_client[0].close()
            except Exception as e:
                print(f"Error closing client socket: {e}")
            current_client = None
            notify_next_client_in_queue()

    try:
        client_sock.close()
    except Exception as e:
        print(f"Error closing client socket: {e}")
    update_client_queue_positions()

# Function to handle admin commands
def admin_command_handler(admin_sock, stop_event):
    global pending_clients, admin_connected, approved_credentials, current_client, server_running, current_client_info

    # Thread to check the client queue periodically
    def check_queue_periodically():
        global current_client
        while admin_connected.is_set() and server_running.is_set() and not stop_event.is_set():
            if pending_clients and current_client is None:
                current_client = pending_clients.popleft()
                client_sock, client_username, client_hashed_password = current_client
                if client_sock.fileno() != -1:
                    send_message(admin_sock, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:")
                    send_message(client_sock, "You can now message the admin.")
                else:
                    current_client = None
            time.sleep(1)

    # Start the thread for checking the client queue
    queue_thread = threading.Thread(target=check_queue_periodically)
    queue_thread.start()

    # Main loop to read admin's input and handle commands
    while admin_connected.is_set() and server_running.is_set() and not stop_event.is_set():
        message = receive_message(admin_sock)
        if not message:
            continue
        if message.startswith('/approve') and current_client:
            client_sock, client_username, client_hashed_password = current_client
            if client_sock.fileno() == -1:
                send_message(admin_sock, "The client has disconnected unexpectedly.")
                current_client = None
                continue
            approved_credentials[client_username] = client_hashed_password
            save_credentials(approved_credentials)
            send_message(client_sock, "Admin approved.\nPlease visit https://secure-chat-jxr767zd3-nadav-salomons-projects.vercel.app/ .\nConnection terminated.")
            client_sock.close()
            send_message(admin_sock, "Client approved successfully.")
            current_client = None
            notify_next_client_in_queue()

        elif message.startswith('/disapprove') and current_client:
            client_sock, client_username, _ = current_client
            if client_sock.fileno() == -1:
                send_message(admin_sock, "The client has disconnected unexpectedly.")
                current_client = None
                notify_next_client_in_queue()
                continue
            send_message(client_sock, "You were disapproved. Connection will be terminated.")
            client_sock.close()
            send_message(admin_sock, "Client disapproved successfully.")
            current_client = None
            notify_next_client_in_queue()

        elif message.startswith('/remove '):
            _, remove_username = message.split(' ', 1)
            if remove_username in approved_credentials:
                del approved_credentials[remove_username]
                save_credentials(approved_credentials)
                send_message(admin_sock, f"User '{remove_username}' has been removed from the approved list.")
            else:
                send_message(admin_sock, f"User '{remove_username}' not found in the approved list.")
        elif message.startswith('/logoff'):
            notify_clients_admin_status("Admin has logged off. Please wait for a new admin to connect.")
            send_message(admin_sock, "Admin logging off.")
            current_client_info = current_client  # Save the current client info before logging off
            current_client = None  # Clear the current client
            stop_event.set()  # Signal the stop event to stop the threads
            break
        elif message.startswith('/shutdown'):
            notify_clients_admin_status("Server is shutting down. Connection will be terminated.")
            send_message(admin_sock, "Server shutting down.")
            server_running.clear()
            stop_event.set()  # Signal the stop event to stop the threads
            break
        else:
            if current_client:
                client_sock, client_username, _ = current_client
                if client_sock.fileno() != -1:
                    send_message(client_sock, f"[Admin] {message}")
    
    # Signal the stop event and close the admin socket
    stop_event.set()
    admin_sock.close()
    admin_connected.clear()
    print("[ADMIN DISCONNECTED] Admin has disconnected. Waiting for new admin connection.")
    queue_thread.join()

# Function to notify the next client in the queue
def notify_next_client_in_queue():
    global current_client, admin_socket
    if pending_clients:
        current_client = pending_clients.popleft()
        client_sock, client_username, client_hashed_password = current_client
        if client_sock.fileno() != -1:
            send_message(admin_socket, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:")
            send_message(client_sock, "You can now message the admin.")
        else:
            current_client = None
            notify_next_client_in_queue()

# Function to update client queue positions
def update_client_queue_positions():
    position = 1
    for client_sock, client_username, client_hashed_password in list(pending_clients):
        if client_sock.fileno() == -1:
            pending_clients.remove((client_sock, client_username, client_hashed_password))
            print(f"Removed disconnected client '{client_username}' from queue.")
        else:
            try:
                send_message(client_sock, f"You are now number {position} in the queue.")
            except Exception as e:
                print(f"Error sending queue position to {client_username}: {e}")
        position += 1

# Function to notify clients about admin status
def notify_clients_admin_status(message):
    for _, client_sock in client_sockets.items():
        try:
            send_message(client_sock, message)
        except Exception as e:
            print(f"Error notifying client: {e}")

# Function to handle client connections
def handle_client(client_sock, address):
    global pending_clients, admin_socket, current_client, client_sockets
    print(f"[NEW CONNECTION] {address} connected.")
    
    username = ""
    try:
        while True:
            time.sleep(0.05)  # Yield control to allow other threads to run
            send_message(client_sock, "Enter username:")
            username = receive_message(client_sock)
            if not username:
                send_message(client_sock, "No username received. Connection will be terminated.")
                client_sock.close()
                return
            
            send_message(client_sock, "Enter password:")
            password = receive_message(client_sock)
            if not password:
                send_message(client_sock, "No password received. Connection will be terminated.")
                client_sock.close()
                return

            hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
            
            # Check if username is already taken or pending
            if username in approved_credentials:
                if approved_credentials[username] != hashed_password:
                    send_message(client_sock, "Username already taken or password is incorrect. Please try again or choose a different username.")
                    continue
            elif any(client[1] == username for client in pending_clients) or (current_client and current_client[1] == username):
                send_message(client_sock, "Username already taken. Please try again or choose a different username.")
                continue
            
            # Send challenge to the client
            challenge = generate_challenge()
            send_message(client_sock, f"CHALLENGE:{challenge}")
            
            client_hash = receive_message(client_sock)
            if not client_hash:
                send_message(client_sock, "No challenge response received. Connection will be terminated.")
                client_sock.close()
                return
            
            expected_hash = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
            if client_hash != expected_hash:
                send_message(client_sock, "Failed security check. Connection will be terminated.")
                client_sock.close()
                return
            
            # Verify client
            server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
            send_message(client_sock, f"VERIFY:{server_hash}")
            
            verification = receive_message(client_sock)
            if verification != "VERIFIED":
                send_message(client_sock, "Verification failed. Connection will be terminated.")
                client_sock.close()
                return
            
            # If client is approved, send approval message
            if username in approved_credentials:
                send_message(client_sock, "Please visit https://secure-chat-jxr767zd3-nadav-salomons-projects.vercel.app/")
                client_sock.close()
                return
            else:
                pending_clients.append((client_sock, username, hashed_password))
                client_sockets[username] = client_sock
                send_message(client_sock, "Waiting for admin approval.")
                
                # Notify next client if admin is connected
                if admin_connected.is_set() and current_client is None:
                    notify_next_client_in_queue()
                else:
                    update_client_queue_positions()

                # Main loop to handle client messages
                while server_running.is_set():
                    message = receive_message(client_sock)
                    if not message:
                        break
                    if message.strip():
                        send_message(admin_socket, f"[{username}] {message}")
                    time.sleep(2)
    finally:
        # Log off client and update queue
        client_logoff(client_sock, username)

# Function to start the server
def start_server(host='127.0.0.1', client_port=65432, admin_port=65433):
    global admin_socket, server_running
    client_server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_server_sock.settimeout(1.0)  # Set timeout for accept
    client_server_sock.bind((host, client_port))
    client_server_sock.listen()
    print(f"[LISTENING] Client server is listening on {host}:{client_port}")
    
    admin_server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    admin_server_sock.settimeout(1.0)  # Set timeout for accept
    admin_server_sock.bind((host, admin_port))
    admin_server_sock.listen()
    print(f"[LISTENING] Admin server is listening on {host}:{admin_port}")
    
    server_running.set()
    admin_thread = threading.Thread(target=accept_admin_connections, args=(admin_server_sock,))
    admin_thread.start()

    try:
        while server_running.is_set():
            try:
                client_sock, address = client_server_sock.accept()
                thread = threading.Thread(target=handle_client, args=(client_sock, address))
                thread.start()
                print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 3}")
            except socket.timeout:
                continue
    except KeyboardInterrupt:
        print("[SHUTDOWN] Server is shutting down.")
    finally:
        server_running.clear()
        client_server_sock.close()
        admin_server_sock.close()
        admin_thread.join()
        for client_sock in client_sockets.values():
            client_sock.close()
        print("Server has shut down cleanly.")

# Function to accept admin connections
def accept_admin_connections(admin_server_sock):
    global admin_socket
    while server_running.is_set():
        try:
            admin_socket, admin_address = admin_server_sock.accept()
            if handle_admin(admin_socket):
                print("Admin logged in.")
        except socket.timeout:
            continue
        except OSError as e:
            if not server_running.is_set():
                break
            print(f"Error accepting admin connection: {e}")

if __name__ == '__main__':
    start_server()
