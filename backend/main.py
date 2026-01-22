import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.api.app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
