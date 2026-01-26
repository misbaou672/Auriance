import socket

def get_ip_address():
    try:
        # Connect to a public DNS server to determine the most appropriate local IP
        # This doesn't actually send data, just determines the route
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

print(f"Detected IP: {get_ip_address()}")
