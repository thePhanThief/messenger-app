import socket
import hashlib
import threading
import time

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

def handle_chat(admin_socket):
    def read_messages():
        while True:
            message = receive_message(admin_socket)
            if not message:
                print("Disconnected from server.")
                break
            print(message)

    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    def send_keep_alive():
        while True:
            send_message(admin_socket, "")
            time.sleep(5)

    keep_alive_thread = threading.Thread(target=send_keep_alive)
    keep_alive_thread.start()

    while True:
        message = input()
        if message.strip():
            send_message(admin_socket, message)

    read_thread.join()
    keep_alive_thread.join()

def run_admin(server_host='127.0.0.1', admin_port=65433):
    admin_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        admin_socket.connect((server_host, admin_port))
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    try:
        challenge = None
        print(receive_message(admin_socket))
        username = input()
        send_message(admin_socket, username)
        
        print(receive_message(admin_socket))
        password = input()
        send_message(admin_socket, password)
        
        while True:
            server_message = receive_message(admin_socket)
            if not server_message:
                print("Server connection lost.")
                break
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
        
        handle_chat(admin_socket)

    except Exception as e:
        print("Error:", e)
    finally:
        try:
            admin_socket.shutdown(socket.SHUT_RDWR)
        except Exception as e:
            print(f"Error during shutdown: {e}")
        try:
            admin_socket.close()
        except Exception as e:
            print(f"Error closing admin socket: {e}")
        print("Disconnected from server.")

if __name__ == '__main__':
    run_admin()
