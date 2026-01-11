import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { readFile } from 'fs/promises';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  try {
    const filePath = join(process.cwd(), 'public', 'orders.json');
    const data = await readFile(filePath, 'utf8');
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
