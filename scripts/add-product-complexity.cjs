// This script adds a random productComplexity (1-3) to each item in every 'items' array in ordes-example.json
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/assets/ordes-example.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function addProductComplexity(order) {
  if (Array.isArray(order.items)) {
    order.items = order.items.map(item => ({
      ...item,
      productComplexity: Math.floor(Math.random() * 3) + 1
    }));
  }
  return order;
}

const updated = Array.isArray(data) ? data.map(addProductComplexity) : data;

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
console.log('Added productComplexity to all items in ordes-example.json');
