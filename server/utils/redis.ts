import { createClient, RedisClientType } from 'redis';
import { useRuntimeConfig } from '#imports';

let client: RedisClientType | null = null;

export const getRedis = async () => {
  if (client && client.isOpen) return client;

  const config = useRuntimeConfig();

  client = createClient({
    socket: {
      host: config.public.redisHost,
      port: config.public.redisPort,
    },
  });

  client.on('error', (err) => {
    console.error('REDIS ERROR:', err);
  });

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
};
