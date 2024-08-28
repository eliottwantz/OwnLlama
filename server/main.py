from server.rag import (
    rag_chain_query,
)

if __name__ == "__main__":
    print("Let's get started! 🚀")

    chat_history = []
    while True:
        question = input("Question: ")
        if question == "exit":
            break
        response = rag_chain_query(question, chat_history)
        print(response["answer"])

    print("Done!")
