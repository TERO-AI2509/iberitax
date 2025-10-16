// Smoke call to /health via the typed client
import { IberitaxClient } from '../packages/clients/dist/api.js';

async function main() {
  const client = new IberitaxClient({ baseUrl: 'http://localhost:4000' });
  try {
    const health = await client.health();
    console.log('✅ /health ok');
    console.dir(health, { depth: 5 });
  } catch (e) {
    console.error('❌ /health failed');
    if (e && typeof e === 'object') console.error(e);
    process.exitCode = 1;
  }
}

main();
