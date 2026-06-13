import sys
import subprocess
import os
import time
import webbrowser

def install_dependencies():
    print("Checking dependencies...")
    requirements_path = os.path.join(os.path.dirname(__file__), "backend", "requirements.txt")
    if not os.path.exists(requirements_path):
        print(f"Error: requirements.txt not found at {requirements_path}")
        return False
        
    try:
        print("Installing dependencies from backend/requirements.txt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_path])
        print("Dependencies installed successfully!\n")
        return True
    except Exception as e:
        print(f"Failed to install dependencies: {e}")
        return False

def check_imports():
    try:
        import fastapi
        import uvicorn
        import pypdf
        import docx
        import sklearn
        import google.generativeai
        return True
    except ImportError as e:
        print(f"Missing dependency: {e.name}")
        return False

def main():
    # Change directory to the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    if not check_imports():
        success = install_dependencies()
        if not success:
            print("Could not verify or install dependencies. Please run 'pip install -r backend/requirements.txt' manually.")
            sys.exit(1)
            
    print("Starting Resume Screener AI application...")
    print("Web interface loading at: http://127.0.0.1:8000/")
    print("API swagger docs: http://127.0.0.1:8000/docs")
    
    # Auto-open browser after a short delay
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:8000/")
        
    import threading
    threading.Thread(target=open_browser, daemon=True).start()
    
    import uvicorn
    # Run the uvicorn server
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
