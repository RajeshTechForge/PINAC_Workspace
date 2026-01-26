from typing import List
from fastapi import HTTPException
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from app.api.schemas import ChatRequest, ChatMessage
from app.api.logging import get_logger


logger = get_logger(__name__)


class ChatService:
    @staticmethod
    def _convert_history(history: List[ChatMessage], query: str) -> List[BaseMessage]:
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
        if request.provider == "openai":
            return ChatOpenAI(
                model=request.model,
                api_key=request.api_key,
                temperature=0.7,
                streaming=request.stream,
            )
        elif request.provider == "claude":
            return ChatAnthropic(
                model=request.model,
                api_key=request.api_key,
                temperature=0.7,
                streaming=request.stream,
            )
        elif request.provider == "gemini":
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
        logger.info(
            f"Starting stream generation for provider: {request.provider}, model: {request.model}"
        )
        try:
            llm = self._get_llm(request)
            logger.info(f"LLM initialized successfully")
            messages = self._convert_history(request.history, request.query)
            logger.info(f"Converted {len(messages)} messages")

            chunk_count = 0
            async for chunk in llm.astream(messages):
                content = chunk.content

                # Handle list content (Gemini returns list of dicts or objects)
                if isinstance(content, list):
                    text_parts = []
                    for block in content:
                        # Handle dictionary format: {'type': 'text', 'text': '...'}
                        if isinstance(block, dict):
                            if block.get("type") == "text" and block.get("text"):
                                text_parts.append(block["text"])
                        # Handle object format with .text attribute
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
            # Don't call _handle_error as it raises HTTPException which breaks the generator
            return

    async def generate_response(self, request: ChatRequest) -> str:
        try:
            llm = self._get_llm(request)
            messages = self._convert_history(request.history, request.query)

            response = await llm.ainvoke(messages)

            content = response.content
            if isinstance(content, list):
                # Anthropic sometimes returns list of content blocks
                content = "".join(
                    [block.text for block in content if hasattr(block, "text")]
                )

            return str(content)

        except HTTPException:
            raise
        except Exception as e:
            self._handle_error(e, request.provider)

    def _handle_error(self, e: Exception, provider: str):
        error_str = str(e).lower()
        logger.error(f"LLM Error ({provider}): {e}")

        # Common error pattern matching
        is_auth_error = (
            "authentication" in error_str
            or "api key" in error_str
            or "401" in error_str
            or ("invalid" in error_str and "key" in error_str)
        )
        if is_auth_error:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid {provider} API Key. Please check your credentials.",
            )

        if "rate limit" in error_str or "quota" in error_str or "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail=f"{provider} Rate Limit Exceeded. Please try again later.",
            )

        raise HTTPException(
            status_code=500,
            detail=f"Error generating response from {provider}: {str(e)}",
        )
