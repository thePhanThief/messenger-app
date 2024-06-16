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
server_running = threading.Event()
current_client_info = None

# Generate a random challenge string for verification
def generate_challenge():
    return os.urandom(16).hex()

# Simple XOR encryption/decryption
def xor_encrypt_decrypt(message, key):
    return ''.join(chr(ord(c) ^ ord(k)) for c, k in zip(message, key * (len(message) // len(key) + 1)))

# Send message through the socket, optionally encrypting with session_key
def send_message(sock, message, session_key=None):
    try:
        if session_key:
            message = xor_encrypt_decrypt(message, session_key)
        sock.sendall((message + '\n').encode('utf-8'))
    except Exception as e:
        return
        
# Receive message from the socket, optionally decrypting with session_key
def receive_message(sock, session_key=None):
    data = b''
    try:
        while not data.endswith(b'\n'):
            part = sock.recv(1024)
            if not part:
                break
            data += part
        message = data.decode('utf-8').strip()
        if session_key:
            message = xor_encrypt_decrypt(message, session_key)
        return message
    except Exception as e:
        return ""

# Handle admin connections and verification
def handle_admin(admin_sock):
    global admin_connected, current_client_info, current_client, admin_session_key

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
                send_message(admin_sock, "Verification failed. Connection will be terminated.",)
                admin_sock.close()
                return False

            admin_session_key = hashlib.sha256((challenge + admin_hash).encode()).hexdigest()[:16]

            send_message(admin_sock, "Logged in successfully.")
            admin_connected.set()
            notify_clients_admin_status("Admin is now online. Please wait for your turn to be approved.")
            stop_event = threading.Event()
            threading.Thread(target=admin_command_handler, args=(admin_sock, stop_event)).start()

            if current_client_info:
                current_client = current_client_info
                current_client_info = None
                client_sock, client_username, client_hashed_password, session_key = current_client
                if client_sock.fileno() != -1:
                    send_message(admin_sock, f"Restored session with client '{client_username}'. Type /approve or /disapprove:", admin_session_key)
                    send_message(client_sock, "Admin is back online. You can continue to message the admin.", session_key)
            else:
                notify_next_client_in_queue()
            return True
        else:
            send_message(admin_sock, "Invalid admin credentials. Connection will be closed.",  admin_session_key)
            admin_sock.close()
            return False
    except Exception as e:
        print(f"Admin handling error: {e}")
        send_message(admin_sock, "An error occurred. Connection will be closed.",  admin_session_key)
        admin_sock.close()
        return False

# Handle client logoff and update the queue
def client_logoff(client_sock, username):
    global pending_clients, current_client
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

# Handle admin commands and manage the client approval queue
def admin_command_handler(admin_sock, stop_event):
    global pending_clients, admin_connected, approved_credentials, current_client, server_running, current_client_info, admin_session_key

    # Periodically check and update the client queue
    def check_queue_periodically():
        global current_client
        while admin_connected.is_set() and server_running.is_set() and not stop_event.is_set():
            if pending_clients and current_client is None:
                current_client = pending_clients.popleft()
                client_sock, client_username, client_hashed_password, session_key = current_client
                if client_sock.fileno() != -1:
                    send_message(admin_sock, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:", admin_session_key)
                    send_message(client_sock, "You can now message the admin.", session_key)
                else:
                    current_client = None
            time.sleep(1)

    queue_thread = threading.Thread(target=check_queue_periodically)
    queue_thread.start()

    while admin_connected.is_set() and server_running.is_set() and not stop_event.is_set():
        # Ensure messages are decrypted
        message = receive_message(admin_sock, admin_session_key)  
        if not message:
            continue
        if message.startswith('/'):
            execute_admin_command(message, admin_sock, stop_event)
        else:
            if current_client:
                client_sock, client_username, _, session_key = current_client
                if client_sock.fileno() != -1:
                    send_message(client_sock, f"[Admin] {message}", session_key)

    stop_event.set()
    admin_sock.close()
    admin_connected.clear()
    print("[ADMIN DISCONNECTED] Admin has disconnected. Waiting for new admin connection.")
    queue_thread.join()

# Execute admin commands
def execute_admin_command(command, admin_sock, stop_event):
    global current_client, pending_clients, approved_credentials, server_running, current_client_info

    #Approves the user and adds it to the approved_credentials file
    if command.startswith('/approve') and current_client:
        client_sock, client_username, client_hashed_password, session_key = current_client
        if client_sock.fileno() == -1:
            send_message(admin_sock, "The client has disconnected unexpectedly.", admin_session_key)
            current_client = None
            return
        approved_credentials[client_username] = client_hashed_password
        save_credentials(approved_credentials)
        send_message(client_sock, "Admin approved.\nPlease visit https://secure-chat-jxr767zd3-nadav-salomons-projects.vercel.app/ .\nConnection terminated.", session_key)
        client_sock.close()
        send_message(admin_sock, "Client approved successfully.", admin_session_key)
        current_client = None
        notify_next_client_in_queue()

    #Removes the client from the queue
    elif command.startswith('/disapprove') and current_client:
        client_sock, client_username, _, session_key = current_client
        if client_sock.fileno() == -1:
            send_message(admin_sock, "The client has disconnected unexpectedly.")
            current_client = None
            notify_next_client_in_queue()
            return
        send_message(client_sock, "You were disapproved. Connection will be terminated.", session_key)
        client_sock.close()
        send_message(admin_sock, "Client disapproved successfully.",admin_session_key)
        current_client = None
        notify_next_client_in_queue()

    #Removes an approved client from the approved_credentials file
    elif command.startswith('/remove '):
        _, remove_username = command.split(' ', 1)
        if remove_username in approved_credentials:
            del approved_credentials[remove_username]
            save_credentials(approved_credentials)
            send_message(admin_sock, f"User '{remove_username}' has been removed from the approved list.",admin_session_key)
        else:
            send_message(admin_sock, f"User '{remove_username}' not found in the approved list.", admin_session_key)

    #Cloeses off the admin
    elif command.startswith('/logoff'):
        notify_clients_admin_status("Admin has logged off. Please wait for a new admin to connect.")
        send_message(current_client[0], "Admin has logged off. Please wait for a new admin to connect.", current_client[3])
        send_message(admin_sock, "Admin logging off.",admin_session_key)
        current_client_info = current_client
        current_client = None
        stop_event.set()

    #Shuts down the server
    elif command.startswith('/shutdown'):
        if pending_clients:
            notify_clients_admin_status("Server is shutting down. Connection will be terminated.")
        send_message(admin_sock, "Server shutting down.",admin_session_key)
        server_running.clear()
        stop_event.set()

    else:
        send_message(admin_sock, "Unknown command.", admin_session_key)

# Notify the next client in the queue for approval
def notify_next_client_in_queue():
    global current_client, admin_socket
    if pending_clients:
        current_client = pending_clients.popleft()
        client_sock, client_username, client_hashed_password, session_key = current_client
        if client_sock.fileno() != -1:
            send_message(admin_socket, f"Next client '{client_username}' is waiting for approval. Type /approve or /disapprove:", admin_session_key)
            send_message(client_sock, "You can now message the admin.", session_key)
        else:
            current_client = None
            notify_next_client_in_queue()

# Update positions of clients in the queue
def update_client_queue_positions():
    position = 1
    for client_sock, client_username, client_hashed_password, session_key in list(pending_clients):
        if client_sock.fileno() == -1:
            pending_clients.remove((client_sock, client_username, client_hashed_password, session_key))
            print(f"Removed disconnected client '{client_username}' from queue.")
        else:
            try:
                send_message(client_sock, f"You are now number {position} in the queue.", session_key)
            except Exception as e:
                print(f"Error sending queue position to {client_username}: {e}")
        position += 1

# Notify all clients about the admin's status
def notify_clients_admin_status(message):
    for client_sock, client_username, _, session_key in pending_clients:
        try:
            send_message(client_sock, message, session_key)
        except Exception as e:
            print(f"Error notifying client {client_username}: {e}")

# Handle client connections, including login and verification
def handle_client(client_sock, address):
    global pending_clients, admin_socket, current_client, client_session_key
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
            
            # Check if the username is already in use
            if username in approved_credentials:
                if approved_credentials[username] != hashed_password:
                    send_message(client_sock, "Username already taken or password is incorrect. Please try again or choose a different username.")
                    continue
            elif any(client[1] == username for client in pending_clients) or (current_client and current_client[1] == username):
                send_message(client_sock, "Username already taken. Please try again or choose a different username.")
                continue
            
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
            
            server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
            send_message(client_sock, f"VERIFY:{server_hash}")
            
            verification = receive_message(client_sock)
            if verification != "VERIFIED":
                send_message(client_sock, "Verification failed. Connection will be terminated.")
                client_sock.close()
                return
            
            client_session_key = hashlib.sha256((challenge + client_hash).encode()).hexdigest()[:16]

            if username in approved_credentials:
                send_message(client_sock, "Please visit https://secure-chat-jxr767zd3-nadav-salomons-projects.vercel.app/")
                client_sock.close()
                return
            else:
                pending_clients.append((client_sock, username, hashed_password, client_session_key))
                send_message(client_sock, "Waiting for admin approval.")
                
                if admin_connected.is_set() and current_client is None:
                    notify_next_client_in_queue()
                else:
                    update_client_queue_positions()

                while server_running.is_set():
                    message = receive_message(client_sock, client_session_key)
                    if not message:
                        break
                    if message.strip():
                        send_message(admin_socket, f"[{username}] {message}", admin_session_key)
                    time.sleep(2)
    finally:
        client_logoff(client_sock, username)

# Start the server and handle connections
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
        for client_sock, _, _, _ in pending_clients:
            client_sock.close()
        print("Server has shut down cleanly.")

# Accept admin connections and handle them
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
