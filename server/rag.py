from typing import Iterable, List

from config import DATA_DIR, DEFAULT_COLLECTION_NAME, DEFAULT_EMBEDDING_MODEL
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_chroma.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from llm import get_ollama_llm


def split_documents(doc: Iterable[Document]):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=40)

    return text_splitter.split_documents(documents=doc)


def get_embedding_function():
    return OllamaEmbeddings(model=DEFAULT_EMBEDDING_MODEL)


def get_vector_store():
    db = Chroma(
        DEFAULT_COLLECTION_NAME,
        get_embedding_function(),
        persist_directory=f"{DATA_DIR}/chroma_storage",
    )

    return db


def add_to_vector_store(documents: list[Document]):
    # uuids = [str(uuid4()) for _ in range(len(documents))]

    db = get_vector_store()
    db.add_documents(documents=documents)
    # db.add_documents(documents=documents, ids=uuids)


def retrieve_from_vector_store(query: str):
    db = get_vector_store()

    similar_documents = db.similarity_search(query)

    return similar_documents


# Convert loaded documents into strings by concatenating their content
# and ignoring metadata
def format_docs(docs: List[Document]):
    return "\n\n".join(doc.page_content for doc in docs)


# RAG_TEMPLATE = """
# You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

# <context>
# {context}
# </context>

# Answer the following question:

# {question}"""

# def rag_chain_query(question: str):
#     # rag_prompt = ChatPromptTemplate.from_template(RAG_TEMPLATE)
#     rag_prompt = ChatPromptTemplate.from_messages(
#         [
#             ("system", system_prompt),
#             ("human", "{question}"),
#         ]
#     )
#     retriever = get_vector_store().as_retriever()

#     qa_chain = (
#         {"context": retriever | format_docs, "question": RunnablePassthrough()}
#         | rag_prompt
#         | get_ollama_llm()
#         | StrOutputParser()
#     )

#     qa_chain.invoke(question)


def rag_chain_query(question: str):
    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    llm = get_ollama_llm()
    retriever = get_vector_store().as_retriever()

    question_answer_chain = create_stuff_documents_chain(llm=llm, prompt=prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    response = rag_chain.invoke({"input": question})

    return response
