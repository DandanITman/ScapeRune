import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { EquipSlot, type InventoryItem } from '../types/inventory';
import './InventoryPanel.css';
import './EquipmentPanel.css';

const slotOrder: EquipSlot[] = [
  EquipSlot.HELMET,
  EquipSlot.CAPE,
  EquipSlot.AMULET,
  EquipSlot.WEAPON,
  EquipSlot.BODY,
  EquipSlot.SHIELD,
  EquipSlot.LEGS,
  EquipSlot.BOOTS,
  EquipSlot.GLOVES,
  EquipSlot.RING
];

const EquipmentPanel: React.FC = () => {
  const equipment = useGameStore(state => state.player.equipment);
  const unequipItem = useGameStore(state => state.unequipItem);
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (item: InventoryItem, event: React.MouseEvent) => {
    setHoveredItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const renderTooltip = (item: InventoryItem) => {
    const stats = [];
    if (item.attackBonus) stats.push(`Attack: +${item.attackBonus}`);
    if (item.strengthBonus) stats.push(`Strength: +${item.strengthBonus}`);
    if (item.defenseBonus) stats.push(`Defense: +${item.defenseBonus}`);
    if (item.value) stats.push(`Value: ${item.value} gp`);

    return (
      <div 
        className="item-tooltip"
        style={{
          position: 'fixed',
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          zIndex: 1000,
        }}
      >
        <div className="tooltip-header">{item.name}</div>
        {item.description && <div className="tooltip-description">{item.description}</div>}
        {stats.length > 0 && (
          <div className="tooltip-stats">
            {stats.map((stat, index) => (
              <div key={index} className="tooltip-stat">{stat}</div>
            ))}
          </div>
        )}
        {item.requirements && (
          <div className="tooltip-requirements">
            Requirements:
            {Object.entries(item.requirements).map(([skill, level]) => (
              <div key={skill} className="tooltip-requirement">
                {skill.charAt(0).toUpperCase() + skill.slice(1)}: {level}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inventory-panel equipment-panel">
      <div className="inventory-header">
        <h3>Equipment</h3>
      </div>
      <div className="equipment-grid">
        {slotOrder.map((slot) => (
          <div key={slot} className={`equipment-slot ${slot}-slot`}>
            {equipment[slot] ? (
              <div 
                className="inventory-item equipped-item" 
                onClick={() => unequipItem(slot)}
                onMouseEnter={(e) => handleMouseEnter(equipment[slot]!, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              >
                <div className="item-icon">{equipment[slot]?.icon || '📦'}</div>
                <div className="item-name">{equipment[slot]?.name}</div>
              </div>
            ) : (
              <div className="empty-slot">
                <div className="slot-label">{slot}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Render tooltip if item is hovered */}
      {hoveredItem && renderTooltip(hoveredItem)}
    </div>
  );
};

export default EquipmentPanel;
