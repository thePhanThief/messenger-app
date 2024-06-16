import socket
import hashlib
import threading
import time
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

# Handle chat messages and keep-alive signals from the admin
def handle_chat(admin_socket, stop_event, session_key):
    # Thread to read messages from the server
    def read_messages():
        while not stop_event.is_set():
            message = receive_message(admin_socket, session_key)
            if not message:
                continue
            print(message)

    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    # Thread to send keep-alive messages to the server
    def send_keep_alive():
        while not stop_event.is_set():
            send_message(admin_socket, "", session_key)
            time.sleep(5)

    keep_alive_thread = threading.Thread(target=send_keep_alive)
    keep_alive_thread.start()

    # Main loop to read admin's input and send messages to the server
    try:
        while True:
            message = input().strip()
            if message == "/logoff" or message == "/shutdown":
                send_message(admin_socket, message, session_key)
                break
            if message:
                send_message(admin_socket, message, session_key)
    except Exception as e:
        stop_event.set()
        send_message(admin_socket, "/logoff", session_key)
        print(f"Error detected, logging off...\nError code: {e}")
    
    stop_event.set()
    read_thread.join()
    keep_alive_thread.join()

# Run the admin client
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

        username = input()
        send_message(admin_socket, username)

        server_message = receive_message(admin_socket)
        print(server_message)

        password = input()
        send_message(admin_socket, password)

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

        session_key = hashlib.sha256((challenge + response).encode()).hexdigest()[:16]

        handle_chat(admin_socket, stop_event, session_key)

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
