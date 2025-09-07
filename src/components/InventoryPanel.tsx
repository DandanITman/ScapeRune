import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { InventoryItem } from '../types/inventory';
import './InventoryPanel.css';

const InventoryPanel: React.FC = () => {
  const player = useGameStore(state => state.player);
  const activateItem = useGameStore(state => state.useItem);
  const equipItem = useGameStore(state => state.equipItem);
  
  const handleItemClick = (slotIndex: number, item: InventoryItem) => {
    return (e: React.MouseEvent) => {
      if (e.button === 2 || e.ctrlKey) { // Right click or ctrl+click
        e.preventDefault();
        activateItem(slotIndex);
      } else {
        // Left click to equip if it's equippable
        if (item.equipSlot) {
          equipItem(slotIndex);
        } else {
          // Otherwise use the item
          activateItem(slotIndex);
        }
      }
    };
  };

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h3>Inventory</h3>
        <p>Items: {player.inventory.filter(slot => slot.item).length}/30</p>
      </div>
      
      <div className="inventory-grid">
        {player.inventory.map((slot) => (
          <div key={slot.slotIndex} className="inventory-slot">
            {slot.item ? (
              <div 
                className="inventory-item"
                onClick={handleItemClick(slot.slotIndex, slot.item)}
                onContextMenu={handleItemClick(slot.slotIndex, slot.item)}
                title={`${slot.item.name}${slot.item.description ? ' - ' + slot.item.description : ''}`}
              >
                <div className="item-icon">
                  {slot.item.icon || '📦'}
                </div>
                <div className="item-name">{slot.item.name}</div>
                {slot.item.quantity > 1 && (
                  <div className="item-quantity">{slot.item.quantity}</div>
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
