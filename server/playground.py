from uuid import uuid4

from server.pkg.rag import rag_chain_query

if __name__ == "__main__":
    response = rag_chain_query("How to win at Monopoly?", str(uuid4()))
    for s in response:
        if isinstance(s, str):
            print(s, end="")
        else:
            print(s)
