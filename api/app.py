from flask import Flask
from flask_cors import CORS
from routes import api_blueprint
import os
from config import DEV

# Get the parent and grandparent directory names
def get_api_prefix():

    if DEV:
        return ""

    path = os.path.dirname(__file__)
    parent = os.path.basename(os.path.dirname(path)) 
    current = os.path.basename(path)
    return f"/{parent}/{current}"

app = Flask(__name__)

app.secret_key = os.getenv("SSO_COOKIE_SECRET_KEY", "dev-secret-key")

# Allow CORS on specific origins
CORS(
    app, 
    supports_credentials=True, 
    origins=["https://trusted.mtc-hub.com", "http://localhost:*"], #"https://192.168.137.1:5173"
    allow_headers=["Authorization", "Content-Type"]
)

# Register the blueprint
app.register_blueprint(api_blueprint, url_prefix=get_api_prefix())


if __name__ == "__main__":
    app.run(debug=DEV)