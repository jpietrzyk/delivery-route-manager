import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { readFile } from 'fs/promises';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  try {
    // Try multiple possible paths to handle both dev and production environments
    const possiblePaths = [
      // Production: Netlify deployment - orders.json copied to functions dir
      join('/var/task/netlify/functions', 'orders.json'),
      // Alternative production path
      join('/var/task', 'netlify/functions', 'orders.json'),
      // Development: local development
      join(process.cwd(), 'public', 'orders.json'),
    ];

    let data;
    let lastError;

    for (const filePath of possiblePaths) {
      try {
        data = await readFile(filePath, 'utf8');
        console.log(`Successfully loaded orders from: ${filePath}`);
        break;
      } catch (err) {
        lastError = err;
        console.log(`Tried path ${filePath}, continuing...`);
      }
    }

    if (!data) {
      throw lastError || new Error('Could not find orders.json in any expected location');
    }

    const orders = JSON.parse(data);

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
