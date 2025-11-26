// lib/redisCache.js - Fixed for Cloud Run serverless environment
import { createClient } from 'redis';

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionPromise = null;
    this.lastConnectionAttempt = 0;
    this.connectionRetryDelay = 5000; // 5 seconds between retries
  }

  async connect() {
  // If already connected, return immediately
  if (this.isConnected && this.client) {
    return this.client;
  }
  
  // If connection in progress, wait for it
  if (this.connectionPromise) {
    return this.connectionPromise;
  }

  // Rate limit only FAILED connection attempts
  const now = Date.now();
  if (!this.isConnected && now - this.lastConnectionAttempt < this.connectionRetryDelay) {
    console.log('Skipping Redis connection (rate limited after failure)');
    if (this.client instanceof InMemoryCache) {
      return this.client;
    }
    throw new Error('Redis connection rate limited after failure');
  }

  // Mark connection attempt time
  this.lastConnectionAttempt = now;
  
  // Start connection and store promise
  this.connectionPromise = this._connect();
  return this.connectionPromise;
}

  async _connect() {
  try {
    const hasRedisUrl = process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '';
    const hasRedisHost = process.env.REDIS_HOST && process.env.REDIS_HOST.trim() !== '';
    
    if (!hasRedisUrl && !hasRedisHost) {
      console.log('⚠️ Redis not configured, using in-memory fallback');
      this.client = new InMemoryCache();
      this.isConnected = true;
      this.connectionPromise = null;
      return this.client;
    }

    let redisUrl;
    if (hasRedisUrl) {
      redisUrl = process.env.REDIS_URL;
    } else {
      const host = process.env.REDIS_HOST;
      const port = process.env.REDIS_PORT || 6379;
      const password = process.env.REDIS_PASSWORD;
      
      if (password) {
        redisUrl = `redis://:${password}@${host}:${port}`;
      } else {
        redisUrl = `redis://${host}:${port}`;
      }
    }

    console.log('Attempting Redis connection...');

    this.client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        keepAlive: 30000,
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            console.error('❌ Redis connection failed after 2 retries');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 500, 2000);
        }
      },
      disableOfflineQueue: true
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis client ready');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      console.log('📴 Redis connection closed');
      this.isConnected = false;
    });

    // CRITICAL: Await the connection
    await this.client.connect();
    
    // CRITICAL: Set connected flag AFTER successful connect
    this.isConnected = true;
    this.connectionPromise = null;
    
    console.log('✅ Redis fully connected and ready');
    return this.client;

  } catch (error) {
    console.error('Redis connection error:', error.message);
    this.connectionPromise = null;
    this.isConnected = false;
    
    // Fallback to in-memory
    console.log('⚠️ Falling back to in-memory cache');
    this.client = new InMemoryCache();
    this.isConnected = true;
    return this.client;
  }
}

  // Wrapper for safe Redis operations
  async safeOperation(operation, fallbackValue = null) {
    try {
      await this.connect();
      return await operation();
    } catch (error) {
      console.warn('Redis operation failed:', error.message);
      return fallbackValue;
    }
  }

  // ====================
  // TRANSLATION CACHING
  // ====================

  async cacheTranslation(documentId, language, translatedData) {
    return this.safeOperation(async () => {
      const key = `translation:${documentId}:${language}`;
      const value = JSON.stringify({
        data: translatedData,
        cachedAt: new Date().toISOString(),
        language: language
      });

      await this.client.setEx(key, 86400, value); // 24 hours
      console.log(`âœ… Cached translation: ${documentId} -> ${language}`);
      return true;
    }, false);
  }

  async getTranslation(documentId, language) {
    return this.safeOperation(async () => {
      const key = `translation:${documentId}:${language}`;
      const cached = await this.client.get(key);

      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`âœ… Cache HIT: ${documentId} -> ${language}`);
        return parsed.data;
      }

      console.log(`âš ï¸ Cache MISS: ${documentId} -> ${language}`);
      return null;
    }, null);
  }

  async getAvailableTranslations(documentId) {
    return this.safeOperation(async () => {
      const pattern = `translation:${documentId}:*`;
      const keys = await this.client.keys(pattern);

      const languages = keys.map(key => {
        const parts = key.split(':');
        return parts[parts.length - 1];
      });

      return languages;
    }, []);
  }

  // ====================
  // DOCUMENT PROCESSING CACHE
  // ====================

  async cacheDocument(documentId, documentData) {
    return this.safeOperation(async () => {
      const key = `document:${documentId}`;
      const value = JSON.stringify({
        data: documentData,
        processedAt: new Date().toISOString()
      });

      await this.client.setEx(key, 3600, value); // 1 hour
      console.log(`âœ… Cached document: ${documentId}`);
      return true;
    }, false);
  }

  async getDocument(documentId) {
    return this.safeOperation(async () => {
      const key = `document:${documentId}`;
      const cached = await this.client.get(key);

      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`âœ… Cache HIT: document ${documentId}`);
        return parsed.data;
      }

      console.log(`âš ï¸ Cache MISS: document ${documentId}`);
      return null;
    }, null);
  }

  // ====================
  // RATE LIMITING
  // ====================

  async checkRateLimit(identifier, limit = 10, windowSeconds = 60) {
    return this.safeOperation(async () => {
      const key = `ratelimit:${identifier}`;
      
      const current = await this.client.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= limit) {
        return { allowed: false, remaining: 0 };
      }

      const newCount = await this.client.incr(key);
      
      if (newCount === 1) {
        await this.client.expire(key, windowSeconds);
      }

      return { 
        allowed: true, 
        remaining: Math.max(0, limit - newCount),
        resetIn: windowSeconds
      };
    }, { allowed: true, remaining: limit }); // Allow if Redis fails
  }

  // ====================
  // SESSION MANAGEMENT
  // ====================

  async setSession(sessionId, data) {
    return this.safeOperation(async () => {
      const key = `session:${sessionId}`;
      await this.client.setEx(key, 3600, JSON.stringify(data));
      return true;
    }, false);
  }

  async getSession(sessionId) {
    return this.safeOperation(async () => {
      const key = `session:${sessionId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    }, null);
  }

  // ====================
  // UTILITY METHODS
  // ====================

  async clearDocument(documentId) {
    return this.safeOperation(async () => {
      const pattern = `*:${documentId}*`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`âœ… Cleared ${keys.length} cache entries for ${documentId}`);
      }
      
      return true;
    }, false);
  }

  async getCacheStats() {
    return this.safeOperation(async () => {
      const info = await this.client.info('stats');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        stats: info,
        keyspace: keyspace
      };
    }, { connected: false });
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected && !(this.client instanceof InMemoryCache)) {
        await this.client.quit();
        this.isConnected = false;
        console.log('ðŸ"Œ Redis disconnected');
      }
    } catch (error) {
      console.error('Redis disconnect error:', error.message);
    }
  }

  // Cloud Run health check
  async healthCheck() {
    try {
      if (this.client instanceof InMemoryCache) {
        return { status: 'in-memory', healthy: true };
      }

      await this.connect();
      await this.client.ping();
      return { status: 'connected', healthy: true };
    } catch (error) {
      return { status: 'error', healthy: false, error: error.message };
    }
  }
}

// ====================
// IN-MEMORY FALLBACK
// ====================

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.expirations = new Map();
    console.log('âš ï¸ Using in-memory cache fallback');
  }

  async setEx(key, ttl, value) {
    this.cache.set(key, value);
    this.expirations.set(key, Date.now() + (ttl * 1000));
    return 'OK';
  }

  async get(key) {
    const expiry = this.expirations.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  async incr(key) {
    const current = parseInt(this.cache.get(key) || '0');
    const newValue = current + 1;
    this.cache.set(key, String(newValue));
    return newValue;
  }

  async expire(key, seconds) {
    this.expirations.set(key, Date.now() + (seconds * 1000));
    return 1;
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async del(keys) {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => {
      this.cache.delete(key);
      this.expirations.delete(key);
    });
    return keysArray.length;
  }

  async info() {
    return `In-memory cache with ${this.cache.size} keys`;
  }

  async connect() {
    return this;
  }

  async quit() {
    this.cache.clear();
    this.expirations.clear();
  }

  async ping() {
    return 'PONG';
  }
}

// Singleton instance
let cacheInstance = null;

export function getRedisCache() {
  if (!cacheInstance) {
    cacheInstance = new RedisCache();
  }
  return cacheInstance;
}

export default RedisCache;