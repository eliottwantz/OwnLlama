import os
from pathlib import Path

SERVER_DIR = Path(__file__).parent
BASE_DIR = SERVER_DIR.parent

DATA_DIR = Path(SERVER_DIR / "data").resolve()

FRONTEND_URL = os.environ.get("WEBUI_URL", "http://localhost:3000")

DEFAULT_MODEL = os.environ.get("MODEL", "llama3.1")
DEFAULT_EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "nomic-embed-text")
DEFAULT_COLLECTION_NAME = os.environ.get("COLLECTION_NAME", "uploaded_documents")
