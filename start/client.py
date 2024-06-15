import socket
import hashlib
import threading
import os

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

# Handle chat messages and keep-alive signals from the client
def handle_chat(client_socket, stop_chat, session_key):
    # Thread to read messages from the server
    def read_messages():
        while not stop_chat.is_set():
            message = receive_message(client_socket, session_key)
            if not message:
                continue
            print(message)
            if message.startswith("Admin approved") or message.startswith("You were disapproved") or message.startswith("Server is shutting down"):
                stop_chat.set()
                break

    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    # Main loop to read client's input and send messages to the server
    while not stop_chat.is_set():
        if stop_chat.is_set():
            break
        try:
            message = input()
        except EOFError:
            break
        if message:
            send_message(client_socket, message, session_key)

    read_thread.join()

# Run the client
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
                print(server_message)
                exit()
            else:
                print(server_message)
                break

        session_key = hashlib.sha256((challenge + response).encode()).hexdigest()[:16]
        print(f"Client session key: {session_key}")

        handle_chat(client_socket, stop_chat, session_key)

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
