import socket
import hashlib
import threading

def send_message(sock, message):
    try:
        sock.sendall((message + '\n').encode('utf-8'))
    except Exception as e:
        print(f"Error sending message: {e}")

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
        print(f"Error receiving message: {e}")
        return ""

def handle_chat(client_socket, stop_chat):
    def read_messages():
        while not stop_chat.is_set():
            try:
                message = receive_message(client_socket)
                if not message:
                    continue
                print(message)
                if message.startswith("Admin approved") or message.startswith("You were disapproved"):
                    stop_chat.set()
                    break
            except Exception as e:
                print(f"Error reading message: {e}")
                stop_chat.set()
                break

    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    while not stop_chat.is_set():
        try:
            message = input()
            if message.strip() and not stop_chat.is_set():  # Avoid sending empty messages and check if chat should stop
                send_message(client_socket, message)
        except Exception as e:
            print(f"Error during chat: {e}")
            stop_chat.set()
            break

    read_thread.join()

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
                print("Server connection lost.")
                break
            if server_message.startswith("Enter username:"):
                print(server_message)
                username = input()
                send_message(client_socket, username)
            elif server_message.startswith("Enter password:"):
                print(server_message)
                password = input()
                send_message(client_socket, password)
            elif server_message.startswith("Username already taken. Please try again or choose a different username."):
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
                    client_socket.close()
                    return
            elif server_message.startswith("Approved. Connection established.") or server_message.startswith("Waiting for admin approval."):
                print(server_message)
                handle_chat(client_socket, stop_chat)
                return
            else:
                print(server_message)
                client_socket.close()
                return

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
