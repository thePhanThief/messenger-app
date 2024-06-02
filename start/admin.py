import socket
import hashlib
import threading
import time

# Function to send a message through the socket
def send_message(sock, message):
    try:
        # Send message with newline character
        sock.sendall((message + '\n').encode('utf-8'))  
    except Exception as e:
        print(f"Error sending message: {e}")

# Function to receive a message from the socket
def receive_message(sock):
    # Initialize an empty byte string to store received data
    data = b''  
    try:
        # Continue receiving until newline character is found
        while not data.endswith(b'\n'):  
            # Receive data in chunks of 1024 bytes
            part = sock.recv(1024)  
            if not part:
                 # Break if no more data is received
                break 
            data += part
        # Decode received data to string and strip any extra whitespace
        message = data.decode('utf-8').strip()  
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
            # Send keep-alive every 5 seconds
            time.sleep(5)  

    # Start a new thread to send keep-alive messages
    keep_alive_thread = threading.Thread(target=send_keep_alive)
    keep_alive_thread.start()

    # Main loop to send messages
    while True:
        message = input()
        if message.strip():  # Avoid sending empty messages
            send_message(admin_socket, message)

# Function to run the admin client
def run_admin(server_host='127.0.0.1', admin_port=65433):
    # Create a TCP/IP socket
    admin_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
    try:
        # Connect to the server
        admin_socket.connect((server_host, admin_port))  
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    try:
        challenge = None
        # Receive and print server's welcome message
        print(receive_message(admin_socket))  
        # Prompt for username
        username = input()  
        # Send username to the server
        send_message(admin_socket, username)  
        
        # Receive and print server's prompt for password
        print(receive_message(admin_socket))  
        # Prompt for password
        password = input()  
        # Send password to the server
        send_message(admin_socket, password)  
        
        while True:
            server_message = receive_message(admin_socket)
            if not server_message:
                print("Server connection lost.")
                break
            if server_message.startswith("CHALLENGE:"):
                # Extract challenge string
                challenge = server_message.split(':')[1]  
                # Generate SHA-256 hash of the challenge
                response = hashlib.sha256(challenge.encode('utf-8')).hexdigest()  
                send_message(admin_socket, response)
            elif server_message.startswith("VERIFY:"):
                # Extract server's hash
                server_hash = server_message.split(':')[1]  
                # Generate expected hash
                expected_server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()  
                if server_hash == expected_server_hash:
                    send_message(admin_socket, "VERIFIED")
                else:
                    send_message(admin_socket, "Verification failed.")
                    break
            else:
                print(server_message)
                break
        
        # Start chat handling
        handle_chat(admin_socket)  

    except Exception as e:
        print("Error:", e)
    finally:
        try:
            # Close the socket connection
            admin_socket.close()  
        except Exception as e:
            print(f"Error closing admin socket: {e}")
        print("Disconnected from server.")

# Run the admin client if this script is executed directly
if __name__ == '__main__':
    run_admin()  
