import os
import time
import json
import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError

logger = logging.getLogger(__name__)
T = TypeVar('T', bound=BaseModel)

class LLMError(Exception):
    """Base exception for LLM operations."""
    pass

class GeminiClient:
    """Production-ready client wrapper for Google Gemini API."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. Gemini API calls will fail.")
        else:
            genai.configure(api_key=self.api_key)
            
    def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
        max_retries: int = 3,
        backoff_factor: float = 2.0
    ) -> T:
    
        """
        Generates a structured JSON response matching the provided Pydantic schema model.
        Includes exponential backoff retry logic.
        """
        if not self.api_key:
            raise LLMError("GEMINI_API_KEY is not configured in the environment or server.")
            
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
        except Exception as e:
            raise LLMError(f"Failed to initialize GenerativeModel '{model_name}': {str(e)}")
            
        config = {
            "response_mime_type": "application/json",
            "response_schema": response_schema
        }
        
        last_exception = None
        for attempt in range(max_retries):
            try:
                logger.info(f"Invoking LLM structured call (Attempt {attempt+1}/{max_retries})...")
                response = model.generate_content(
                    prompt,
                    generation_config=config
                )
                
                
                # Check for empty response
                if not response.text:
                    raise LLMError("Gemini API returned an empty text response.")
                    
                # Validate JSON decoding
                data = json.loads(response.text)
                
                # Validate Pydantic schema parsing
                return response_schema.model_validate(data)
                
            except (GoogleAPIError, json.JSONDecodeError, Exception) as e:
                last_exception = e
                logger.warning(
                    f"LLM generation failed on attempt {attempt+1}: {type(e).__name__}: {str(e)}"
                )
                if attempt + 1 < max_retries:
                    sleep_duration = backoff_factor ** (attempt + 1)
                    logger.info(f"Retrying in {sleep_duration:.2f} seconds...")
                    time.sleep(sleep_duration)
                    
        raise LLMError(
            f"Failed to generate valid structured LLM output after {max_retries} attempts. "
            f"Last error: {type(last_exception).__name__}: {str(last_exception)}"
        )

       
