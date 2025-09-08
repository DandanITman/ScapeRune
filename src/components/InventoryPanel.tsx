import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import type { InventoryItem } from '../types/inventory';
import './InventoryPanel.css';

interface InventoryPanelProps {
  onClose?: () => void;
  onDropItem?: (slotIndex: number, quantity: number) => void;
  addFloatingText?: (text: string, type: 'damage' | 'miss' | 'xp' | 'heal', screenX: number, screenY: number) => void;
  getScreenPosition?: (worldPosition: { x: number; y: number; z: number }) => { x: number; y: number };
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose, onDropItem, addFloatingText, getScreenPosition }) => {
  const player = useGameStore(state => state.player);
  const activateItem = useGameStore(state => state.useItem);
  const equipItem = useGameStore(state => state.equipItem);
  const dropItem = useGameStore(state => state.dropItem);
  const buryBones = useGameStore(state => state.buryBones);
  const addChatMessage = useGameStore(state => state.addChatMessage);
  const moveItemToSlot = useGameStore(state => state.moveItemToSlot);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, show: boolean, slotIndex?: number, item?: InventoryItem}>({x: 0, y: 0, show: false});
  const [draggedItem, setDraggedItem] = useState<{slotIndex: number, item: InventoryItem} | null>(null);
  
  const draggable = useDraggable({ 
    initialPosition: { x: window.innerWidth - 280, y: 120 } // Right side, below player info
  });
  
  const handleItemClick = (slotIndex: number, item: InventoryItem) => {
    return (e: React.MouseEvent) => {
      if (e.button === 2 || e.ctrlKey) { // Right click or ctrl+click
        e.preventDefault();
        e.stopPropagation();
        
        // Show context menu for right-click
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          show: true,
          slotIndex,
          item
        });
      } else {
        // Left click - check if it's bones first
        const boneItems = ['bones', 'bat_bones', 'big_bones', 'dragon_bones'];
        if (boneItems.includes(item.id)) {
          // Bury bones
          const result = buryBones(slotIndex);
          if (result.success) {
            addChatMessage(result.message);
            
            // Show floating XP text if we have the needed functions
            if (addFloatingText && getScreenPosition && result.xp) {
              // Use player position from the store
              const playerPos = player.position;
              const playerScreenPos = getScreenPosition(playerPos);
              addFloatingText(`+${result.xp} Prayer XP`, 'xp', playerScreenPos.x, playerScreenPos.y - 30);
            }
          }
        } else if (item.equipSlot) {
          // Equip if it's equippable
          equipItem(slotIndex);
        } else {
          // Otherwise use the item
          activateItem(slotIndex);
        }
      }
    };
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, slotIndex: number, item: InventoryItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ slotIndex, item }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ slotIndex, item });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSlotIndex: number) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const fromSlot = dragData.slotIndex;
      
      if (fromSlot !== targetSlotIndex) {
        moveItemToSlot(fromSlot, targetSlotIndex);
      }
    } catch (error) {
      console.error('Error handling item drop:', error);
    }
    
    setDraggedItem(null);
  };

  const handleContextAction = (action: string) => {
    console.log(`Context action: ${action}, slot: ${contextMenu.slotIndex}, item: ${contextMenu.item?.name}`);
    
    if (contextMenu.slotIndex === undefined || !contextMenu.item) return;
    
    const slotIndex = contextMenu.slotIndex;
    const item = contextMenu.item;
    
    // Close context menu first
    setContextMenu({x: 0, y: 0, show: false});
    
    switch (action) {
      case 'use':
        console.log(`Using item ${item.name} at slot ${slotIndex}`);
        activateItem(slotIndex);
        break;
      case 'equip':
        if (item.equipSlot) {
          console.log(`Equipping item ${item.name} at slot ${slotIndex}`);
          equipItem(slotIndex);
        }
        break;
      case 'drop':
        console.log(`Dropping item ${item.name} at slot ${slotIndex}`);
        if (onDropItem) {
          onDropItem(slotIndex, 1);
        } else {
          dropItem(slotIndex, 1);
        }
        addChatMessage(`You drop the ${item.name}.`);
        break;
      case 'examine':
        console.log(`Examining item ${item.name} at slot ${slotIndex}`);
        addChatMessage(`${item.name}: ${item.description || 'No description available.'}`);
        break;
    }
  };

  // Handle context menu clicks with proper event stopping
  const handleContextMenuClick = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    console.log(`Context menu action triggered: ${action}`);
    handleContextAction(action);
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Don't close if clicking inside the context menu
      const target = event.target as HTMLElement;
      if (target.closest('.context-menu')) {
        return;
      }
      setContextMenu({x: 0, y: 0, show: false});
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleDocumentClick);
      return () => document.removeEventListener('click', handleDocumentClick);
    }
  }, [contextMenu.show]);

  return (
    <>
      <div 
        ref={draggable.elementRef}
        className="inventory-panel"
        style={draggable.style}
      >
        <div 
          className="inventory-header drag-handle"
          onMouseDown={draggable.handleMouseDown}
        >
          <h3>Inventory ({player.inventory.filter(slot => slot.item).length}/30)</h3>
          {onClose && <button className="close-button" onClick={onClose}>×</button>}
        </div>
        
        <div className="inventory-grid">
          {player.inventory.map((slot) => (
            <div 
              key={slot.slotIndex} 
              className="inventory-slot"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot.slotIndex)}
            >
              {slot.item ? (
                <div 
                  className={`inventory-item ${draggedItem?.slotIndex === slot.slotIndex ? 'dragging' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, slot.slotIndex, slot.item!)}
                  onDragEnd={handleDragEnd}
                  onClick={handleItemClick(slot.slotIndex, slot.item)}
                  onContextMenu={handleItemClick(slot.slotIndex, slot.item)}
                  title={`${slot.item.name}${slot.item.description ? ' - ' + slot.item.description : ''}`}
                >
                  <div className="item-icon">
                    {slot.item.icon && slot.item.icon.startsWith('/') ? (
                      <img 
                        src={slot.item.icon} 
                        alt={slot.item.name}
                        style={{ width: '18px', height: '18px' }}
                      />
                    ) : (
                      slot.item.icon || '📦'
                    )}
                  </div>
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

      {/* Context Menu */}
      {contextMenu.show && contextMenu.item && (
        <div 
          className="context-menu"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <div 
            className="context-menu-item"
            onMouseDown={(e) => handleContextMenuClick(e, 'use')}
            onClick={(e) => e.stopPropagation()}
          >
            Use {contextMenu.item.name}
          </div>
          
          {contextMenu.item.equipSlot && (
            <div 
              className="context-menu-item"
              onMouseDown={(e) => handleContextMenuClick(e, 'equip')}
              onClick={(e) => e.stopPropagation()}
            >
              Wield {contextMenu.item.name}
            </div>
          )}
          
          <div 
            className="context-menu-item"
            onMouseDown={(e) => handleContextMenuClick(e, 'drop')}
            onClick={(e) => e.stopPropagation()}
          >
            Drop {contextMenu.item.name}
          </div>
          
          <div 
            className="context-menu-item"
            onMouseDown={(e) => handleContextMenuClick(e, 'examine')}
            onClick={(e) => e.stopPropagation()}
          >
            Examine {contextMenu.item.name}
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryPanel;
