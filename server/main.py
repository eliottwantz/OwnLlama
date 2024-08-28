from server.loader import load_pdf
from server.rag import (
    add_to_vector_store,
    retrieve_from_vector_store,
    split_documents,
)

if __name__ == "__main__":
    print("Let's get started! 🚀")

    print("Loading pdf...")
    pdf = load_pdf("./server/data/uploads/ticket_to_ride.pdf")
    print("PDF loaded")

    print("Creating chunks...")
    chunks = split_documents(pdf)
    print("Chunks created")

    print("Adding to chromadb...")
    add_to_vector_store(chunks)
    print("Added to chromadb")

    # print("Querying...")
    # query = "How many people can play the game?"
    # similar_docs = retrieve_from_vector_store(query)
    # print(similar_docs)

    print("Done!")
