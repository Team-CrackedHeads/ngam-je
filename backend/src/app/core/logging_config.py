"""
Logging configuration using dictConfig for FastAPI application.

This module provides centralized logging configuration that works with
both Uvicorn in development and production environments.
"""

import logging
import logging.config
import sys
from pathlib import Path


def configure_logging(log_level: str = "INFO", log_to_file: bool = False):
    """
    Configure logging using dictConfig.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to log to file in addition to console
    """

    # Create logs directory if logging to file
    if log_to_file:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

    # Logging configuration dictionary
    config = {
        "version": 1,
        "disable_existing_loggers": False,

        # ========================================
        # Formatters
        # ========================================
        "formatters": {
            "default": {
                "format": "%(levelname)s:     %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "access": {
                "format": '%(levelname)s:     %(client_addr)s - "%(request_line)s" %(status_code)s',
            },
        },

        # ========================================
        # Handlers
        # ========================================
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "default",
                "stream": "ext://sys.stdout",
            },
            "console_detailed": {
                "class": "logging.StreamHandler",
                "level": "DEBUG",
                "formatter": "detailed",
                "stream": "ext://sys.stdout",
            },
        },

        # ========================================
        # Loggers
        # ========================================
        "loggers": {
            # Root logger
            "": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },

            # Uvicorn loggers
            "uvicorn": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },

            # Application loggers
            "app": {
                "level": log_level,
                "handlers": ["console_detailed"],
                "propagate": False,
            },
            "app.api": {
                "level": log_level,
                "handlers": ["console_detailed"],
                "propagate": False,
            },
            "app.services": {
                "level": log_level,
                "handlers": ["console_detailed"],
                "propagate": False,
            },
            "app.services.ai": {
                "level": log_level,
                "handlers": ["console_detailed"],
                "propagate": False,
            },

            # Third-party library loggers (suppress verbose output)
            "httpx": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "httpcore": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }

    # Add file handlers if enabled
    if log_to_file:
        config["formatters"]["json"] = {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        }

        config["handlers"]["file_rotating"] = {
            "class": "logging.handlers.TimedRotatingFileHandler",
            "level": log_level,
            "formatter": "detailed",
            "filename": "logs/app.log",
            "when": "midnight",
            "interval": 1,
            "backupCount": 7,  # Keep 7 days of logs
        }

        config["handlers"]["file_error"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "ERROR",
            "formatter": "detailed",
            "filename": "logs/errors.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        }

        # Add file handlers to loggers
        for logger_name in ["", "app", "app.api", "app.services", "app.services.ai"]:
            if logger_name in config["loggers"]:
                config["loggers"][logger_name]["handlers"].extend(
                    ["file_rotating", "file_error"]
                )

    # Apply configuration
    logging.config.dictConfig(config)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.

    Usage:
        from src.app.core.logging_config import get_logger

        logger = get_logger(__name__)
        logger.info("This is an info message")
        logger.error("This is an error message")

    Args:
        name: Logger name (typically __name__ of the module)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
