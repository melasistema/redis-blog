/**
 * Copyright (c) 2025 Luca Visciola
 * SPDX-License-Identifier: MIT
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
