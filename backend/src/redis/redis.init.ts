import { exec } from 'child_process';
import * as path from 'path';

export function startRedis() {
  const redisPath = path.join(__dirname, '../../redis/redis-server.exe');

  exec(`"${redisPath}"`, (err) => {
    if (err) console.error(`Redis start error: ${err.message}`);
  });

  console.log('✅ Redis server is running automatically...');
}
