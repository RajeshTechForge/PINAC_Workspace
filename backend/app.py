"""
NOTE
It is under Development
"""

import os
import sys
import argparse
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict

from custom_types import ChatRequest
from utils.api_client import APIClient
from rag.functions import check_embedding_model, download_embedding_model
from rag.default_embedder import DefaultRAG
from models.defaultModel import DefaultChatModel
from models.ollamaModel import OllamaChatModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequestSchema(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    stream: Optional[bool] = False
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    top_k: Optional[int] = 40
    max_tokens: Optional[int] = 2096
    rag: Optional[bool] = False
    documents_path: Optional[str] = None
    web_search: Optional[bool] = False
    date: Optional[str] = None


# Parse command line arguments
parser = argparse.ArgumentParser(description="Python Backend API")
parser.add_argument("--port", type=int, default=5000, help="Port to run the server on")
parser.add_argument("--debug", action="store_true", help="Run in debug mode")

# Parse only known args when running as script
# and ignore arguments when running via PyInstaller
if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        args, _ = parser.parse_known_args()
    else:
        args = parser.parse_args()
else:
    args = parser.parse_args([])

port = int(os.environ.get("PORT", args.port))
debug = os.environ.get("DEBUG", "False").lower() == "true" or args.debug

# Initialize API client
api_client = APIClient()

# Initializing the chat model
default_model = DefaultChatModel()
ollama_model = OllamaChatModel()
ollama_model.ensure_ollama_running()


@app.get("/api/status")
def status():
    return {"status": "running", "port": port}


@app.get("/api/rag/default-embedder/status")
def default_embedder_status():
    status = check_embedding_model()
    return {"status": status}


@app.get("/api/rag/default-embedder/download")
def default_embedder_download():
    status = download_embedding_model()
    return status


@app.post("/api/chat/pinac-cloud/stream")
def stream_pinac_cloud(request: ChatRequestSchema):
    try:
        chat_request = ChatRequest(**request.dict())

        if chat_request.web_search:
            current_date = datetime.now().strftime("%B %d, %Y")

            search_data = {
                "messages": chat_request.messages,
                "prompt": chat_request.prompt,
                "date": current_date,
            }

            try:
                response = api_client.make_authenticated_request(
                    "https://api-gateway-r5japgvg7a-ew.a.run.app/api/search",
                    search_data,
                )
                final_prompt = response.json()
                chat_request.messages.extend(final_prompt)
            except ValueError as e:
                return JSONResponse(status_code=401, content={"error": str(e)})

            return StreamingResponse(
                default_model._generate(chat_request),
                media_type="text/event-stream",
            )

        elif chat_request.rag:
            rag = DefaultRAG()
            rag.process_pdf(chat_request.documents_path)
            context_chunk = rag.similarity_search(chat_request.prompt)
            context = "\n---\n".join(context_chunk)
            chat_request.messages.append(
                {
                    "role": "system",
                    "content": (
                        "You are an expert assistant. Use ONLY the following context to give a clear, structured, comprehensive yet concise answer. "
                        "If the answer is not present, reply: 'I couldn't find any relevant information.'\n\n"
                        f'Context:\n"""\n{context}\n"""'
                    ),
                }
            )
            chat_request.messages.append(
                {
                    "role": "user",
                    "content": chat_request.prompt,
                }
            )
            return StreamingResponse(
                default_model._generate(chat_request),
                media_type="text/event-stream",
            )

        chat_request.messages.append({"role": "user", "content": chat_request.prompt})
        return StreamingResponse(
            default_model._generate(chat_request),
            media_type="text/event-stream",
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/chat/ollama/stream")
def stream_ollama(request: ChatRequestSchema):
    try:
        chat_request = ChatRequest(**request.dict())

        if chat_request.web_search:
            current_date = datetime.now().strftime("%B %d, %Y")

            search_data = {
                "messages": chat_request.messages,
                "prompt": chat_request.prompt,
                "date": current_date,
            }

            try:
                response = api_client.make_authenticated_request(
                    "https://api-gateway-r5japgvg7a-ew.a.run.app/api/search",
                    search_data,
                )
                final_prompt = response.json()
                chat_request.messages.extend(final_prompt)
            except ValueError as e:
                return JSONResponse(status_code=401, content={"error": str(e)})

            return StreamingResponse(
                ollama_model._generate(chat_request), media_type="text/event-stream"
            )

        elif chat_request.rag:
            rag = DefaultRAG()
            rag.process_pdf(chat_request.documents_path)
            context_chunk = rag.similarity_search(chat_request.prompt)
            context = "\n---\n".join(context_chunk)
            chat_request.messages.append(
                {
                    "role": "system",
                    "content": (
                        "You are an expert assistant. Use ONLY the following context to give a clear, structured, comprehensive yet concise answer. "
                        "If the answer is not present, reply: 'I couldn't find any relevant information.'\n\n"
                        f'Context:\n"""\n{context}\n"""'
                    ),
                }
            )
            chat_request.messages.append(
                {
                    "role": "user",
                    "content": chat_request.prompt,
                }
            )
            return StreamingResponse(
                ollama_model._generate(chat_request), media_type="text/event-stream"
            )

        chat_request.messages.append({"role": "user", "content": chat_request.prompt})
        return StreamingResponse(
            ollama_model._generate(chat_request), media_type="text/event-stream"
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/ollama/models")
def list_models():
    try:
        ollama = ollama_model.list_available_models()
        models = [model.model for model in ollama.models]
        return models
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
