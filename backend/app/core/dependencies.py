# backend/app/core/dependencies.py

import redis

redis_client = redis.Redis.from_url("redis://localhost:6379/0")
