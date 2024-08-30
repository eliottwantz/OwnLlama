from langchain_community.document_loaders import PyPDFLoader

from backend.db import get_session_history
from backend.rag import add_pdf_to_vector_store

if __name__ == "__main__":
    # history = get_session_history(session_id="ee7f2829-29b8-4041-a72f-8943224aae6c")

    # for msg in history.messages:
    #     parsed_msg = msg.dict()
    #     print(f"{parsed_msg['type']}: {parsed_msg['content']}")

    #     print("--------")
    # add_pdf_to_vector_store("monopoly.pdf")
    add_pdf_to_vector_store("ticket_to_ride.pdf")
