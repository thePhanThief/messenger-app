import socket
import hashlib
import threading
import time

# Function to send a message through the socket
def send_message(sock, message):
    try:
        sock.sendall((message + '\n').encode('utf-8'))  # Send message with newline character
    except Exception as e:
        print(f"Error sending message: {e}")

# Function to receive a message from the socket
def receive_message(sock):
    data = b''  # Initialize an empty byte string to store received data
    try:
        while not data.endswith(b'\n'):  # Continue receiving until newline character is found
            part = sock.recv(1024)  # Receive data in chunks of 1024 bytes
            if not part:
                break  # Break if no more data is received
            data += part
        message = data.decode('utf-8').strip()  # Decode received data to string and strip any extra whitespace
        return message
    except Exception as e:
        print(f"Error receiving message: {e}")
        return ""

# Function to handle chat messages from the admin
def handle_chat(admin_socket):
    # Inner function to read messages in a separate thread
    def read_messages():
        while True:
            message = receive_message(admin_socket)
            if not message:
                break  # Exit loop if no message is received
            print(message)

    # Start a new thread to read messages
    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    # Inner function to send keep-alive messages
    def send_keep_alive():
        while True:
            send_message(admin_socket, "")
            time.sleep(5)  # Send keep-alive every 5 seconds

    # Start a new thread to send keep-alive messages
    keep_alive_thread = threading.Thread(target=send_keep_alive)
    keep_alive_thread.start()

    # Main loop to send messages
    while True:
        message = input()
        if message.strip():  # Avoid sending empty messages
            send_message(admin_socket, message)

    read_thread.join()  # Wait for the reading thread to finish
    keep_alive_thread.join()  # Wait for the keep-alive thread to finish

# Function to run the admin client
def run_admin(server_host='127.0.0.1', admin_port=65433):
    admin_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # Create a TCP/IP socket
    try:
        admin_socket.connect((server_host, admin_port))  # Connect to the server
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    try:
        challenge = None
        print(receive_message(admin_socket))  # Receive and print server's welcome message
        username = input()  # Prompt for username
        send_message(admin_socket, username)  # Send username to the server
        
        print(receive_message(admin_socket))  # Receive and print server's prompt for password
        password = input()  # Prompt for password
        send_message(admin_socket, password)  # Send password to the server
        
        while True:
            server_message = receive_message(admin_socket)
            if not server_message:
                print("Server connection lost.")
                break
            if server_message.startswith("CHALLENGE:"):
                challenge = server_message.split(':')[1]  # Extract challenge string
                response = hashlib.sha256(challenge.encode('utf-8')).hexdigest()  # Generate SHA-256 hash of the challenge
                send_message(admin_socket, response)
            elif server_message.startswith("VERIFY:"):
                server_hash = server_message.split(':')[1]  # Extract server's hash
                expected_server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()  # Generate expected hash
                if server_hash == expected_server_hash:
                    send_message(admin_socket, "VERIFIED")
                else:
                    send_message(admin_socket, "Verification failed.")
                    admin_socket.close()
                    return
            elif server_message.startswith("Admin logged in successfully."):
                print(server_message)
                handle_chat(admin_socket)
                return
            else:
                print(server_message)
                admin_socket.close()
                return

    except Exception as e:
        print("Error:", e)
    finally:
        try:
            admin_socket.close()  # Close the socket connection
        except Exception as e:
            print(f"Error closing admin socket: {e}")
        print("Disconnected from server.")

if __name__ == '__main__':
    run_admin()  # Run the admin client if this script is executed directly
