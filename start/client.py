import socket
import hashlib

def run_client(server_host='127.0.0.1', server_port=65432):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((server_host, server_port))

    try:
        # Receive and respond to challenge
        challenge_msg = client_socket.recv(1024).decode('utf-8')
        challenge = challenge_msg.split(':')[1]
        response = hashlib.sha256(challenge.encode('utf-8')).hexdigest()
        client_socket.send(response.encode('utf-8'))

        # Receive server verification and verify
        verify_msg = client_socket.recv(1024).decode('utf-8')
        server_hash = verify_msg.split(':')[1]
        expected_server_hash = hashlib.sha256((challenge + "server").encode('utf-8')).hexdigest()
        if server_hash == expected_server_hash:
            client_socket.send("VERIFIED".encode('utf-8'))
        else:
            client_socket.send("Verification failed.".encode('utf-8'))
            return

        # Continue with usual communication
        greeting = client_socket.recv(1024).decode('utf-8')
        print(greeting)

        name = input("Enter your name: ")
        client_socket.send(name.encode('utf-8'))
        
        while True:
            response = client_socket.recv(1024).decode('utf-8')
            if response:
                print(response)
            else:
                break
    finally:
        client_socket.close()

if __name__ == '__main__':
    run_client()
