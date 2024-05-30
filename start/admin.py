import socket
import threading

def send_message(sock, message):
    try:
        sock.sendall((message + '\n').encode('utf-8'))
        print(f"Sent: {message}")
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
        print(f"Received: {message}")
        return message
    except Exception as e:
        print(f"Error receiving message: {e}")
        return ""

def handle_chat(admin_socket):
    def read_messages():
        while True:
            message = receive_message(admin_socket)
            if not message:
                break
            print(message)

    read_thread = threading.Thread(target=read_messages)
    read_thread.start()

    while True:
        message = input()
        if message.strip():  # Avoid sending empty messages
            send_message(admin_socket, message)

    read_thread.join()

def run_admin(server_host='127.0.0.1', admin_port=65433):
    admin_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        admin_socket.connect((server_host, admin_port))
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return

    try:
        print(receive_message(admin_socket))
        username = input()
        send_message(admin_socket, username)
        
        print(receive_message(admin_socket))
        password = input()
        send_message(admin_socket, password)
        
        print(receive_message(admin_socket))
        handle_chat(admin_socket)
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
