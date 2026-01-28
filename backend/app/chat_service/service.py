from typing import List
from fastapi import HTTPException
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from app.api.schemas import ChatRequest, ChatMessage
from app.api.logging import get_logger


logger = get_logger(__name__)


class ChatService:
    @staticmethod
    def _convert_history(history: List[ChatMessage], query: str) -> List[BaseMessage]:
        """Convert chat history to LangChain message format."""
        messages = []
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))
            elif msg.role == "system":
                messages.append(SystemMessage(content=msg.content))

        messages.append(HumanMessage(content=query))
        return messages

    def _get_llm(self, request: ChatRequest):
        """Initialize the appropriate LLM based on provider."""
        if request.provider == "gemini":
            return ChatGoogleGenerativeAI(
                model=request.model,
                google_api_key=request.api_key,
                temperature=0.7,
                convert_system_message_to_human=True,
                streaming=request.stream,
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Unsupported provider: {request.provider}"
            )

    async def generate_stream(self, request: ChatRequest):
        """Generate streaming response from LLM."""
        logger.info(
            f"Starting stream generation for provider: {request.provider}, model: {request.model}"
        )
        try:
            llm = self._get_llm(request)
            logger.info("LLM initialized successfully")
            messages = self._convert_history(request.history, request.query)
            logger.info(f"Converted {len(messages)} messages")

            chunk_count = 0
            async for chunk in llm.astream(messages):
                content = chunk.content

                if isinstance(content, list):
                    text_parts = []
                    for block in content:
                        if isinstance(block, dict):
                            if block.get("type") == "text" and block.get("text"):
                                text_parts.append(block["text"])
                        elif hasattr(block, "text") and block.text:
                            text_parts.append(block.text)
                    content = "".join(text_parts)

                if content:
                    chunk_count += 1
                    yield content.encode("utf-8")

            logger.info(f"Stream completed, sent {chunk_count} chunks")

        except HTTPException:
            logger.error("HTTPException in generate_stream")
            raise
        except Exception as e:
            logger.error(f"Exception in generate_stream: {type(e).__name__}: {e}")
            error_msg = f"Error: {e}"
            yield error_msg.encode("utf-8")
            return

    async def generate_response(self, request: ChatRequest) -> str:
        """Generate non-streaming response from LLM."""
        try:
            llm = self._get_llm(request)
            messages = self._convert_history(request.history, request.query)

            response = await llm.ainvoke(messages)

            content = response.content
            if isinstance(content, list):
                text_parts = []
                for block in content:
                    if isinstance(block, dict):
                        if block.get("type") == "text" and block.get("text"):
                            text_parts.append(block["text"])
                        elif "text" in block:
                            text_parts.append(str(block["text"]))
                    elif hasattr(block, "text") and block.text:
                        text_parts.append(block.text)
                    elif isinstance(block, str):
                        text_parts.append(block)
                content = "".join(text_parts)

            return str(content) if content else ""

        except HTTPException:
            raise
        except Exception as e:
            self._handle_error(e, request.provider)
            return ""

    def _handle_error(self, e: Exception, provider: str):
        logger.error(f"LLM Error ({provider}): {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response from {provider}: {str(e)}",
        )
