from langchain_community.document_loaders import PyPDFLoader

from backend.config import DATA_DIR


def get_pdf_path(file_name: str):
    return f"{DATA_DIR}/uploads/{file_name}"


def load_pdf(file_name: str):
    loader = PyPDFLoader(get_pdf_path(file_name))
    data = loader.load()

    return data
