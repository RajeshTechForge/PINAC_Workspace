import httpx
from fastapi import HTTPException
from app.api.schemas import SearchRequest, SearchResponse, SearchResult
from app.api.logging import get_logger

logger = get_logger(__name__)


class TavilySearch:
    BASE_URL = "https://api.tavily.com/search"

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def search(self, request: SearchRequest) -> SearchResponse:
        payload = {
            "api_key": request.api_key,
            "query": request.query,
            "search_depth": request.search_depth,
            "include_answer": request.include_answer,
        }

        try:
            response = await self.client.post(self.BASE_URL, json=payload)

            if response.status_code in (401, 403):
                logger.warning(f"Tavily API Auth Error: {response.text}")
                raise HTTPException(
                    status_code=401,
                    detail="Incorrect Tavily API Key provided. Please check your key and try again.",
                )

            if response.status_code == 429:
                logger.warning(f"Tavily Rate Limit Reached: {response.text}")
                raise HTTPException(
                    status_code=429,
                    detail="Tavily API rate limit exceeded. Please try again later or check your quota.",
                )

            response.raise_for_status()
            data = response.json()

            # Transform to Markdown
            results = []
            markdown_context = f"# Search Results for '{request.query}'\n\n"

            if data.get("answer"):
                markdown_context += f"## Answer\n{data['answer']}\n\n"

            markdown_context += "## Sources\n"

            for res in data.get("results", []):
                search_result = SearchResult(
                    title=res.get("title", "No Title"),
                    url=res.get("url", "#"),
                    content=res.get("content", ""),
                    score=res.get("score", 0.0),
                )
                results.append(search_result)
                markdown_context += (
                    f"### [{search_result.title}]({search_result.url})\n"
                )
                markdown_context += f"{search_result.content}\n\n"

            return SearchResponse(
                query=request.query,
                results=results,
                answer=data.get("answer"),
                context=markdown_context,
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"Tavily API HTTP Error: {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Tavily Search failed: {e.response.text}",
            )

        except httpx.RequestError as e:
            logger.error(f"Tavily Connection Error: {str(e)}")
            raise HTTPException(
                status_code=503, detail="Failed to connect to Tavily search service."
            )

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            logger.error(f"Unexpected error during search: {e}")
            raise HTTPException(
                status_code=500, detail="Internal server error during search."
            )
