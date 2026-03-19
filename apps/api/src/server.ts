import { redis } from './config/redis';
import { prisma } from './prisma/client';
import { startServer } from './app';

const boot = async () => {
  const app = await startServer();

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Shutting down server');

    await app.close();
    await Promise.all([prisma.$disconnect(), redis.quit()]);

    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

boot().catch((error) => {
  console.error(error);
  process.exit(1);
});
