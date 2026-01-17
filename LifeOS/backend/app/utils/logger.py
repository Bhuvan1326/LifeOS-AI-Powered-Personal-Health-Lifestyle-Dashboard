import logging
import sys
from datetime import datetime

def setup_logger(name: str = "lifeos"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    
    return logger

logger = setup_logger()

def log_request(method: str, path: str, user_id: int = None):
    logger.info(f"Request: {method} {path} - User: {user_id or 'anonymous'}")

def log_error(error: Exception, context: str = None):
    logger.error(f"Error: {str(error)} - Context: {context or 'unknown'}")

def log_ai_calculation(calculation_type: str, user_id: int, result: dict):
    logger.info(f"AI Calculation: {calculation_type} - User: {user_id} - Result: {result}")
