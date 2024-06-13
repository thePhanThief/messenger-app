import socket
import hashlib
import threading
import time

# Function to send a message through the socket
def send_message(sock, message):
    try:
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
        message = data.decode('utf-8').strip()
        return message
    except Exception as e:
        return ""

# Function to handle chat messages from the admin
def handle_chat(admin_socket, stop_event):
    # Thread to read messages from the server
    def read_messages():
        while not stop_event.is_set():
            message = receive_message(admin_socket)
            if not message:
                break
            print(message)

    # Start the thread for reading messages
    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    # Thread to send keep-alive messages to the server
    def send_keep_alive():
        while not stop_event.is_set():
            send_message(admin_socket, "")
            time.sleep(5)

    # Start the thread for sending keep-alive messages
    keep_alive_thread = threading.Thread(target=send_keep_alive)
    keep_alive_thread.start()

    # Main loop to read admin's input and send messages to the server
    try:
        while True:
            message = input().strip()
            if message == "/logoff" or message == "/shutdown":
                send_message(admin_socket, message)
                break
            if message:
                send_message(admin_socket, message)
    except Exception as e:
        stop_event.set()
        send_message(admin_socket, "/logoff")  # Send logoff message to the server
        print(f"Error detected, logging off...\nError code: {e}")
    
    # Stop the event and join threads
    stop_event.set()
    read_thread.join()
    keep_alive_thread.join()

# Function to run the admin client
def run_admin(server_host='127.0.0.1', admin_port=65433):
    admin_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        admin_socket.connect((server_host, admin_port))
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    stop_event = threading.Event()

    try:
        challenge = None
        server_message = receive_message(admin_socket)
        if server_message.startswith("Another admin is already connected"):
            raise Exception(server_message)

        print(server_message)

        # Get admin username
        username = input()
        send_message(admin_socket, username)

        server_message = receive_message(admin_socket)
        print(server_message)

        # Get admin password
        password = input()
        send_message(admin_socket, password)

        # Handle server messages and challenges
        while True:
            server_message = receive_message(admin_socket)
            if server_message.startswith("Invalid admin credentials"):
                raise Exception(server_message)
            if not server_message:
                raise Exception("Server connection lost.")
            if server_message.startswith("CHALLENGE:"):
                challenge = server_message.split(':')[1]
                response = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
                send_message(admin_socket, response)
            elif server_message.startswith("VERIFY:"):
                server_hash = server_message.split(':')[1]
                expected_server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
                if server_hash == expected_server_hash:
                    send_message(admin_socket, "VERIFIED")
                else:
                    send_message(admin_socket, "Verification failed.")
                    break
            else:
                print(server_message)
                break

        # Start handling chat after successful verification
        handle_chat(admin_socket, stop_event)

    except Exception as e:
        print("Error:", e)
    finally:
        try:
            admin_socket.close()
        except Exception as e:
            print(f"Error closing admin socket: {e}")
        print("Disconnected from server.")

if __name__ == '__main__':
    run_admin()
