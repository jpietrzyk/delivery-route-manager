const fs = require('fs');
const orders = JSON.parse(fs.readFileSync('src/assets/orders.json', 'utf8'));
const updated = orders.map((order, index) => ({
  ...order,
  deliveryId: index < 3 ? 'DEL-001' : null
}));
fs.writeFileSync('src/assets/orders.json', JSON.stringify(updated, null, 2));
console.log('Updated', updated.length, 'orders');
console.log('Assigned to delivery:', updated.filter(o => o.deliveryId).length);
console.log('Unassigned (active, no delivery):', updated.filter(o => !o.deliveryId && o.active).length);
