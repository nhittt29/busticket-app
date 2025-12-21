import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from deepface.api.src.app import create_app

if __name__ == '__main__':
    print("Starting DeepFace API on port 5000...")
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=False)
