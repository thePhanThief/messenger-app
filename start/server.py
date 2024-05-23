import socket
import threading
import os
import time
import hashlib
import subprocess


def run_npm_dev():
    # Set the environment variable to pass the security check
    env = os.environ.copy()
    env['SECURITY_PASSED'] = 'true'
    
    # Start 'npm run dev' with the modified environment
    subprocess.Popen(["npm", "run", "dev"], env=env, shell=True)


def is_server_running(host='127.0.0.1', port=3000):
    """Check if there is a server running on the specified host and port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.connect((host, port))
            return True
        except ConnectionError:
            return False

def generate_challenge():
    """Generates a random challenge to be sent to the client."""
    return os.urandom(16).hex()

def handle_client(client_socket, address):
    print(f"[NEW CONNECTION] {address} connected.")
    
    try:
        # Server sends a challenge
        challenge = generate_challenge()
        client_socket.send(f"CHALLENGE:{challenge}".encode('utf-8'))

        # Server expects a hashed response of the challenge
        client_hash = client_socket.recv(1024).decode('utf-8').strip()
        expected_hash = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
        if client_hash != expected_hash:
            client_socket.send("Failed security check. Connection will be terminated.".encode('utf-8'))
            return
        
        # Server sends its own hash of the challenge back for client to verify
        server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
        client_socket.send(f"VERIFY:{server_hash}".encode('utf-8'))

        # Get client's verification response
        verification = client_socket.recv(1024).decode('utf-8').strip()
        if verification != "VERIFIED":
            client_socket.send("Verification failed. Connection will be terminated.".encode('utf-8'))
            return

        client_socket.send("Connection established.".encode('utf-8'))
        name = client_socket.recv(1024).decode('utf-8').strip()
        if name:
            print(f"[{address}] Client name received: {name}")
            client_socket.send(f"Hello, {name}! Checking if the server is running...".encode('utf-8'))
            
            if is_server_running() == False:
                # Start 'npm run dev' in a separate thread to avoid blocking
                threading.Thread(target=run_npm_dev).start()
                
                # Allow some time for the server to start
                time.sleep(10)  # Adjust based on your server startup time
                
                if is_server_running():
                    client_socket.send("Server is running on localhost:3000".encode('utf-8'))
                else:
                    client_socket.send("Server failed to start on localhost:3000".encode('utf-8'))

            else:
                client_socket.send("Server is running on localhost:3000".encode('utf-8'))

    except ConnectionResetError:
        print(f"[DISCONNECTED] {address} has disconnected unexpectedly.")
    finally:
        client_socket.close()

def start_server(host='127.0.0.1', port=65432):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen()
    print(f"[LISTENING] Server is listening on {host}:{port}")
    
    try:
        while True:
            client_socket, address = server_socket.accept()
            thread = threading.Thread(target=handle_client, args=(client_socket, address))
            thread.start()
            print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}")
    except KeyboardInterrupt:
        print("[SHUTDOWN] Server is shutting down.")
    finally:
        server_socket.close()

if __name__ == '__main__':
    start_server()
