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

    async def generate_response(self, request: ChatRequest) -> str:
        try:
            if request.provider == "openai":
                llm = ChatOpenAI(
                    model=request.model, api_key=request.api_key, temperature=0.7
                )
            elif request.provider == "claude":
                llm = ChatAnthropic(
                    model=request.model, api_key=request.api_key, temperature=0.7
                )
            elif request.provider == "gemini":
                llm = ChatGoogleGenerativeAI(
                    model=request.model,
                    google_api_key=request.api_key,
                    temperature=0.7,
                    convert_system_message_to_human=True,  # Known issue with Gemini sometimes
                )
            else:
                raise HTTPException(
                    status_code=400, detail=f"Unsupported provider: {request.provider}"
                )

            messages = self._convert_history(request.history, request.query)

            # ainvoke invokes the chain asynchronously
            response = await llm.ainvoke(messages)

            # Handled content extraction safely
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
            error_str = str(e).lower()
            logger.error(f"LLM Error ({request.provider}): {str(e)}")

            # Common Error Pattern matching
            if (
                "authentication" in error_str
                or "api key" in error_str
                or "401" in error_str
                or "invalid" in error_str
                and "key" in error_str
            ):
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid {request.provider} API Key. Please check your credentials.",
                )

            if "rate limit" in error_str or "quota" in error_str or "429" in error_str:
                raise HTTPException(
                    status_code=429,
                    detail=f"{request.provider} Rate Limit Exceeded. Please try again later.",
                )

            raise HTTPException(
                status_code=500,
                detail=f"Error generating response from {request.provider}: {str(e)}",
            )
