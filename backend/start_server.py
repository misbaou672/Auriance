"""Start AURIANCE backend server"""

import uvicorn
import uvicorn
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start AURIANCE backend server")
    parser.add_argument('--port', type=int, default=8000, help='Port to run the server on')
    args = parser.parse_args()

    uvicorn.run(
        "app.main_auriance:app",
        host="0.0.0.0",
        port=args.port,
        reload=False,
        log_level="info"
    )
