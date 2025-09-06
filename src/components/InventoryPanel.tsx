import React from 'react';
import './InventoryPanel.css';

// Temporary placeholder for inventory items
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon?: string;
}

const InventoryPanel: React.FC = () => {
  // Placeholder inventory items
  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'Bronze Sword', quantity: 1 },
    { id: '2', name: 'Bread', quantity: 5 },
    { id: '3', name: 'Logs', quantity: 10 },
    { id: '4', name: 'Copper Ore', quantity: 3 },
  ];

  // Create 30 inventory slots (6x5 grid like classic RS)
  const inventorySlots = Array.from({ length: 30 }, (_, index) => {
    const item = inventoryItems.find((_, itemIndex) => itemIndex === index);
    return { slotIndex: index, item: item || null };
  });

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h3>Inventory</h3>
        <p>Items: {inventoryItems.length}/30</p>
      </div>
      
      <div className="inventory-grid">
        {inventorySlots.map(({ slotIndex, item }) => (
          <div key={slotIndex} className="inventory-slot">
            {item ? (
              <div className="inventory-item">
                <div className="item-icon">
                  {/* Placeholder icon - will be replaced with actual icons later */}
                  📦
                </div>
                <div className="item-name">{item.name}</div>
                {item.quantity > 1 && (
                  <div className="item-quantity">{item.quantity}</div>
                )}
              </div>
            ) : (
              <div className="empty-slot"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPanel;
