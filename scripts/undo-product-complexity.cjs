// Undo productComplexity in items, add 'complexity' to each order
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/assets/ordes-example.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function cleanOrder(order) {
  // Remove productComplexity from items if present
  if (Array.isArray(order.items)) {
    order.items = order.items.map(({ productComplexity, ...rest }) => rest);
  }
  // Add 'complexity' to order (random 1-3)
  order.complexity = Math.floor(Math.random() * 3) + 1;
  return order;
}

const updated = Array.isArray(data) ? data.map(cleanOrder) : data;

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
console.log('Removed productComplexity from items and added complexity to each order.');
