# Скрипт для отладки сервера
import uvicorn
import logging
from main import app

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("🚀 Starting FastAPI server in debug mode...")
    
    # Запуск с подробным логированием
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
        access_log=True
    )
