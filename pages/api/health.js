// pages/api/health.js - Health check endpoint for Cloud Run
import { getRedisCache } from '../../lib/redisCache';

export default async function handler(req, res) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {}
  };

  try {
    // Check Redis connection
    const cache = getRedisCache();
    try {
      await cache.connect();
      const stats = await cache.getCacheStats();
      healthCheck.services.redis = {
        status: 'connected',
        connected: stats.connected
      };
    } catch (redisError) {
      healthCheck.services.redis = {
        status: 'disconnected',
        error: redisError.message,
        fallback: 'using in-memory cache'
      };
      // Not a critical error - we have fallback
    }

    // Check Google Cloud services
    healthCheck.services.googleCloud = {
      configured: !!(process.env.GOOGLE_CLOUD_PROJECT_ID &&
        (process.env.GOOGLE_CLOUD_PRIVATE_KEY ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'not configured'
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();
    healthCheck.memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    };

    // Overall health determination
    const allServicesHealthy = Object.values(healthCheck.services)
      .every(service => service.status !== 'error');

    healthCheck.status = allServicesHealthy ? 'healthy' : 'degraded';

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}