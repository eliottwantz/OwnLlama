from dataclasses import dataclass
from typing import Annotated, Dict, Iterable, List, Set, TypedDict

from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain_chroma.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from server.config import DATA_DIR, DEFAULT_COLLECTION_NAME, DEFAULT_EMBEDDING_MODEL
from server.pkg.db import get_session_history
from server.pkg.llm import get_ollama_llm
from server.pkg.loader import load_pdf
from server.pkg.log import logger


def split_documents(doc: Iterable[Document]):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

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


def add_to_vector_store(documents: List[Document]):
    db = get_vector_store()
    db.add_documents(documents=documents)

    logger.info(f"Added {len(documents)} documents to vector store")


def retrieve_from_vector_store(query: str):
    db = get_vector_store()

    similar_documents = db.similarity_search(query)

    return similar_documents


def add_pdf_to_vector_store(file_name: str):
    pdf = load_pdf(file_name)
    chunks = split_documents(pdf)
    add_to_vector_store(chunks)

    logger.info(f"Added {file_name} to vector store")


def rag_chain_query(question: str, session_id: str):
    contextualize_query_system_prompt = (
        "Given a chat history and the latest user question "
        "which might reference context in the chat history, "
        "formulate a standalone question which can be understood "
        "without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )

    contextualize_query_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_query_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )

    llm = get_ollama_llm()
    retriever = get_vector_store().as_retriever()
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_query_prompt
    )

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
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    question_answer_chain = create_stuff_documents_chain(llm=llm, prompt=prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )
    stream = conversational_rag_chain.stream(
        {"input": question},
        config={"configurable": {"session_id": session_id}},
    )

    response = AnswerWithSources(
        input=question, chat_history=[], context=[], answer="", sources={}
    )

    for chunk in stream:
        if "context" in chunk:
            response.context = chunk["context"]
            for doc in chunk["context"]:
                filename = doc.metadata["source"].split("/")[-1]
                page_number = doc.metadata["page"]

                if filename not in response.sources:
                    response.sources[filename] = set()

                response.sources[filename].add(page_number)
            yield response.sources
        if "chat_history" in chunk:
            response.chat_history = chunk["chat_history"]
        if "answer" in chunk:
            response.answer += chunk["answer"]
            yield chunk["answer"]


@dataclass
class AnswerWithSources:
    input: str
    chat_history: List[BaseMessage]
    context: List[Document]
    answer: str
    sources: Dict[str, Set[int]]
