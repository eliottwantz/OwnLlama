from typing import List

from config import DATABASE_URL
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.messages import BaseMessage


def get_session_history(session_id: str) -> SQLChatMessageHistory:
    return SQLChatMessageHistory(session_id=session_id, connection=DATABASE_URL)


def get_message_history(session_id: str) -> List[BaseMessage]:
    return get_session_history(session_id=session_id).messages
