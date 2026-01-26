"""Redis Cache Service (optional)

Allows the API to start even if `redis` is not installed or running.
Caching operations become no-ops when Redis is unavailable.
"""
try:
    import redis  # optional
except ImportError:
    redis = None
import json
import logging
from typing import Optional, Any
from app.core.config import os

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default


class RedisCache:
    """Redis caching service for AURIANCE"""
    
    def __init__(self):
        """Initialize Redis connection"""
        self.enabled = False
        try:
            if redis is None:
                raise ImportError("redis package not installed")
            self.client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                decode_responses=True
            )
            # Test connection
            self.client.ping()
            logger.info("✅ Redis connected successfully")
            self.enabled = True
        except Exception as e:
            logger.warning(f"⚠️ Redis not available: {e}. Caching disabled.")
            self.client = None
            self.enabled = False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"❌ Redis GET failed: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = CACHE_TTL):
        """Set value in cache with TTL"""
        if not self.enabled:
            return False
        
        try:
            self.client.setex(
                key,
                ttl,
                json.dumps(value)
            )
            return True
        except Exception as e:
            logger.error(f"❌ Redis SET failed: {e}")
            return False
    
    def delete(self, key: str):
        """Delete key from cache"""
        if not self.enabled:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"❌ Redis DELETE failed: {e}")
            return False
    
    def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        if not self.enabled:
            return False
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"❌ Redis CLEAR failed: {e}")
            return False
    
    def cache_transcription(self, transcription_id: int, data: dict, ttl: int = CACHE_TTL):
        """Cache transcription data"""
        key = f"transcription:{transcription_id}"
        return self.set(key, data, ttl)
    
    def get_cached_transcription(self, transcription_id: int) -> Optional[dict]:
        """Get cached transcription"""
        key = f"transcription:{transcription_id}"
        return self.get(key)
    
    def cache_extraction(self, extraction_id: int, data: dict, ttl: int = CACHE_TTL):
        """Cache extraction data"""
        key = f"extraction:{extraction_id}"
        return self.set(key, data, ttl)
    
    def get_cached_extraction(self, extraction_id: int) -> Optional[dict]:
        """Get cached extraction"""
        key = f"extraction:{extraction_id}"
        return self.get(key)


# Singleton instance
cache = RedisCache()
