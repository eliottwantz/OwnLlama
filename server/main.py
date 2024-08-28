from typing import List
from uuid import uuid4

from langchain_core.documents import Document

from server.rag import (
    rag_chain_query,
)

if __name__ == "__main__":
    print("Let's get started! 🚀")

    session_id = str(uuid4())
    print(f"Session ID: {session_id}")

    while True:
        question = input("Question: ")
        if question == "exit":
            break
        response = rag_chain_query(question, session_id)
        print(response["answer"])
        print(response["context"])
        sources: List[Document] = []
        for doc in response["context"]:
            if doc.metadata not in sources:
                sources.append(doc)

        for doc in sources:
            print(f"Document: {doc.metadata['source']}, page {doc.metadata['page']}")

    print("Done!")
