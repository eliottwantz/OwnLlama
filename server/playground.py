from rag import rag_chain_query

if __name__ == "__main__":
    answers = rag_chain_query("How does the game end?")

    print(answers)
