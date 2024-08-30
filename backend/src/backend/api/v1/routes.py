from robyn import Request, SubRouter

from backend.loader import get_pdf_path
from backend.rag import add_pdf_to_vector_store

api = SubRouter(__name__, prefix="/api/v1")


@api.get("/")
async def index():
    return "Hello /v1/api!"


@api.post("/upload")
async def upload_pdf(request: Request):
    files = request.files

    if not files:
        return "No files uploaded"

    for name, file in files.items():
        file = bytearray(file)

        try:
            file_path = get_pdf_path(name)
            with open(file_path, "wb") as f:
                f.write(file)
            add_pdf_to_vector_store(name)
        except Exception as e:
            print(e)
            return {"error": "Failed to save file"}

    return {"message": "Files uploaded"}
