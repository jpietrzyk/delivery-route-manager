import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { readFileSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const filePath = join(process.cwd(), 'public', 'orders.json');
    const data = readFileSync(filePath, 'utf8');
    const orders = JSON.parse(data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orders),
    };
  } catch (error) {
    console.error('Error loading orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load orders' }),
    };
  }
};
