import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { readFile } from 'fs/promises';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  try {
    let orders;
    let loadedFrom = '';

    // Try to load from file (development)
    const possiblePaths = [
      // Development: local development
      join(process.cwd(), 'public', 'orders.json'),
    ];

    for (const filePath of possiblePaths) {
      try {
        const data = await readFile(filePath, 'utf8');
        orders = JSON.parse(data);
        loadedFrom = filePath;
        console.log(`Successfully loaded orders from file: ${filePath}`);
        break;
      } catch (err) {
        console.log(`Could not load from ${filePath}, will try importing as module...`);
      }
    }

    // Fallback: Try importing orders as a module (works in production)
    if (!orders) {
      try {
        const ordersModule = await import('../../public/orders.json', { assert: { type: 'json' } });
        orders = ordersModule.default;
        loadedFrom = 'imported as module';
        console.log('Successfully loaded orders as imported module');
      } catch (err) {
        console.log('Failed to import as module, trying dynamic import...');
      }
    }

    if (!orders) {
      throw new Error('Could not load orders from any source');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(orders),
    };
  } catch (error: unknown) {
    console.error('Error loading orders:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Failed to load orders' }),
    };
  }
};
