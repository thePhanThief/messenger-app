import socket
import hashlib
import threading

# Function to send a message through the socket
def send_message(sock, message):
    try:
        sock.sendall((message + '\n').encode('utf-8'))
        if message:
            print(f"Sent: {message}")
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

# Function to handle chat messages from the client
def handle_chat(client_socket, stop_chat):
    # Thread to read messages from the server
    def read_messages():
        while not stop_chat.is_set():
            message = receive_message(client_socket)
            if not message:
                continue
            print(message)
            if message.startswith("Admin approved") or message.startswith("You were disapproved") or message.startswith("Server is shutting down"):
                stop_chat.set()
                break

    # Start the thread for reading messages
    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    # Main loop to read user's input and send messages to the server
    while not stop_chat.is_set():
        if stop_chat.is_set():
            break
        try:
            message = input()
        except EOFError:
            break
        if message:
            send_message(client_socket, message)

    # Join the reading thread after exiting the loop
    read_thread.join()

# Function to run the client
def run_client(server_host='127.0.0.1', server_port=65432):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        client_socket.connect((server_host, server_port))
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    stop_chat = threading.Event()

    try:
        challenge = None
        # Main loop to handle server messages
        while True:
            server_message = receive_message(client_socket)
            if not server_message:
                raise Exception("Server connection lost.")
            if server_message.startswith("Enter username"):
                print(server_message)
                username = input().strip()
                send_message(client_socket, username)
            elif server_message.startswith("Enter password"):
                print(server_message)
                password = input().strip()
                send_message(client_socket, password)
            elif server_message.startswith("Username already taken"):
                print(server_message)
                continue
            elif server_message.startswith("CHALLENGE:"):
                challenge = server_message.split(':')[1]
                response = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
                send_message(client_socket, response)
            elif server_message.startswith("VERIFY:"):
                server_hash = server_message.split(':')[1]
                expected_server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
                if server_hash == expected_server_hash:
                    send_message(client_socket, "VERIFIED")
                else:
                    send_message(client_socket, "Verification failed.")
                    return
            elif server_message.startswith("Please visit"):
                print("lol")
                print(server_message)
                exit()
            else:
                print(server_message)
                break

        # Start handling chat after successful verification
        handle_chat(client_socket, stop_chat)

    except Exception as e:
        print("Error:", e)
    finally:
        try:
            client_socket.close()
        except Exception as e:
            print(f"Error closing client socket: {e}")
        print("Disconnected from server.")

if __name__ == '__main__':
    run_client()
