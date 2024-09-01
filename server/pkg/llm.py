from langchain_core.messages import BaseMessage
from langchain_ollama import ChatOllama

from server.config import DEFAULT_MODEL


def get_ollama_llm(model: str = DEFAULT_MODEL):
    return ChatOllama(model=DEFAULT_MODEL)


def prompt_llm(prompt: str, model: str = DEFAULT_MODEL) -> BaseMessage:
    llm = get_ollama_llm()
    response_message = llm.invoke(prompt)

    return response_message
