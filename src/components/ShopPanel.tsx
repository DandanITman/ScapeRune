import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ShopSystem } from '../systems/ShopSystem';
import type { ShopItem } from '../systems/NPCSystem';
import './ShopPanel.css';

interface ShopPanelProps {
  shopItems: ShopItem[];
  shopName: string;
  onClose: () => void;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({ shopItems, shopName, onClose }) => {
  const { player, addItemToInventory, removeItemFromInventory } = useGameStore();
  const [shopSystem] = useState(() => new ShopSystem());
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState<string>('');
  const [selectedInventorySlot, setSelectedInventorySlot] = useState<number | null>(null);

  // Initialize shop system with player's gold
  useEffect(() => {
    // This would be connected to the actual game store's gold system
    shopSystem.setPlayerGold(1000); // Default starting gold
  }, [shopSystem]);

  const handleBuyItem = () => {
    if (!selectedItem) return;

    const result = shopSystem.buyItem(
      shopItems,
      selectedItem.itemId,
      quantity,
      (itemId: string, qty: number) => addItemToInventory(itemId, qty)
    );

    setMessage(result.message);
    
    if (result.success) {
      // Reset selection and quantity
      setQuantity(1);
      // Force re-render to show updated stock
      setSelectedItem({ ...selectedItem });
    }
  };

  const handleSellItem = () => {
    if (selectedInventorySlot === null) return;

    const result = shopSystem.sellItem(
      shopItems,
      player.inventory,
      selectedInventorySlot,
      quantity,
      (slotIndex: number, qty: number) => {
        removeItemFromInventory(slotIndex, qty);
        return true;
      }
    );

    setMessage(result.message);
    
    if (result.success) {
      setQuantity(1);
      setSelectedInventorySlot(null);
    }
  };

  const getStockColor = (stock: number, maxStock: number): string => {
    const percentage = (stock / maxStock) * 100;
    if (percentage > 60) return 'shop-stock-high';
    if (percentage > 20) return 'shop-stock-medium';
    return 'shop-stock-low';
  };

  const canAfford = (item: ShopItem, qty: number): boolean => {
    return shopSystem.getPlayerGold() >= (item.buyPrice * qty);
  };

  const getInventoryItemValue = (itemId: string): number | null => {
    return shopSystem.getSellPrice(shopItems, itemId);
  };

  const sellableInventoryItems = player.inventory.filter(slot => 
    slot.item && shopSystem.canSellToShop(shopItems, slot.item.id)
  );

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="shop-panel">
      <div className="shop-header">
        <span className="shop-title">{shopName}</span>
        <button className="shop-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="shop-info">
        <div>
          <span>Mode: </span>
          <button
            className={`shop-btn ${mode === 'buy' ? 'buy' : ''}`}
            style={{ width: 'auto', padding: '2px 8px', marginRight: '8px' }}
            onClick={() => {
              setMode('buy');
              setSelectedInventorySlot(null);
              setSelectedItem(null);
              setQuantity(1);
            }}
          >
            Buy
          </button>
          <button
            className={`shop-btn ${mode === 'sell' ? 'sell' : ''}`}
            style={{ width: 'auto', padding: '2px 8px' }}
            onClick={() => {
              setMode('sell');
              setSelectedItem(null);
              setSelectedInventorySlot(null);
              setQuantity(1);
            }}
          >
            Sell
          </button>
        </div>
        <span className="shop-gold">Gold: {shopSystem.getPlayerGold()}</span>
      </div>

      <div className="shop-content">
        {mode === 'buy' ? (
          <div className="shop-items">
            <div className="shop-items-title">Shop Items</div>
            <div className="shop-items-grid">
              {shopItems.map((item, index) => (
                <div
                  key={`${item.itemId}_${index}`}
                  className={`shop-item ${selectedItem?.itemId === item.itemId ? 'selected' : ''} ${item.stock === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => {
                    if (item.stock > 0) {
                      setSelectedItem(item);
                      setQuantity(1);
                    }
                  }}
                >
                  <div className="shop-item-name">{item.name}</div>
                  <div className="shop-item-prices">
                    <span className="shop-buy-price">Buy: {item.buyPrice}gp</span>
                    <span className="shop-sell-price">Sell: {item.sellPrice}gp</span>
                  </div>
                  <div className={`shop-item-stock ${getStockColor(item.stock, item.maxStock)}`}>
                    Stock: {item.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="shop-items">
            <div className="shop-items-title">Your Sellable Items</div>
            <div className="shop-inventory">
              {sellableInventoryItems.map((slot) => {
                const actualIndex = player.inventory.indexOf(slot);
                const value = getInventoryItemValue(slot.item!.id);
                
                return (
                  <div
                    key={actualIndex}
                    className={`shop-inventory-item sellable ${selectedInventorySlot === actualIndex ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInventorySlot(actualIndex);
                      setQuantity(1);
                    }}
                  >
                    <span className="shop-inventory-item-name">{slot.item!.name}</span>
                    <span className="shop-inventory-item-qty">({slot.item!.quantity})</span>
                    <span className="shop-inventory-item-value">{value}gp each</span>
                  </div>
                );
              })}
              
              {sellableInventoryItems.length === 0 && (
                <div style={{ color: '#aaa', textAlign: 'center', padding: '20px', fontSize: '12px' }}>
                  No sellable items in inventory
                </div>
              )}
            </div>
          </div>
        )}

        <div className="shop-actions">
          {mode === 'buy' && selectedItem && (
            <div className="shop-section">
              <div className="shop-section-title">Buy Item</div>
              
              <div className="shop-selected-item">
                <div className="shop-selected-name">{selectedItem.name}</div>
                <div className="shop-selected-info">
                  Price: {selectedItem.buyPrice} gold each<br/>
                  Stock: {selectedItem.stock} available
                </div>
              </div>

              <div className="shop-quantity-controls">
                <button
                  className="shop-quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                
                <input
                  type="number"
                  className="shop-quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedItem.stock, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={selectedItem.stock}
                />
                
                <button
                  className="shop-quantity-btn"
                  onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))}
                  disabled={quantity >= selectedItem.stock}
                >
                  +
                </button>
                
                <button
                  className="shop-quantity-btn"
                  onClick={() => setQuantity(selectedItem.stock)}
                  disabled={selectedItem.stock === 0}
                >
                  Max
                </button>
              </div>

              <div className="shop-total-cost">
                <div className="shop-cost-label">Total Cost:</div>
                <div className="shop-cost-amount">{selectedItem.buyPrice * quantity} gold</div>
              </div>

              <button
                className="shop-btn buy"
                onClick={handleBuyItem}
                disabled={!canAfford(selectedItem, quantity) || selectedItem.stock < quantity}
              >
                {!canAfford(selectedItem, quantity) ? 'Cannot Afford' : 
                 selectedItem.stock < quantity ? 'Not Enough Stock' : 
                 `Buy ${quantity}x`}
              </button>
            </div>
          )}

          {mode === 'sell' && selectedInventorySlot !== null && player.inventory[selectedInventorySlot]?.item && (
            <div className="shop-section">
              <div className="shop-section-title">Sell Item</div>
              
              {(() => {
                const item = player.inventory[selectedInventorySlot].item!;
                const sellPrice = getInventoryItemValue(item.id) || 0;
                
                return (
                  <>
                    <div className="shop-selected-item">
                      <div className="shop-selected-name">{item.name}</div>
                      <div className="shop-selected-info">
                        Sell price: {sellPrice} gold each<br/>
                        You have: {item.quantity}
                      </div>
                    </div>

                    <div className="shop-quantity-controls">
                      <button
                        className="shop-quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      
                      <input
                        type="number"
                        className="shop-quantity-input"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(item.quantity, parseInt(e.target.value) || 1)))}
                        min="1"
                        max={item.quantity}
                      />
                      
                      <button
                        className="shop-quantity-btn"
                        onClick={() => setQuantity(Math.min(item.quantity, quantity + 1))}
                        disabled={quantity >= item.quantity}
                      >
                        +
                      </button>
                      
                      <button
                        className="shop-quantity-btn"
                        onClick={() => setQuantity(item.quantity)}
                      >
                        All
                      </button>
                    </div>

                    <div className="shop-total-cost">
                      <div className="shop-cost-label">Total Value:</div>
                      <div className="shop-cost-amount">{sellPrice * quantity} gold</div>
                    </div>

                    <button
                      className="shop-btn sell"
                      onClick={handleSellItem}
                    >
                      Sell {quantity}x
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          <div className="shop-section">
            <div className="shop-section-title">Quick Actions</div>
            
            {mode === 'buy' && (
              <button 
                className="shop-btn" 
                onClick={() => {
                  // Buy one of each affordable item
                  shopItems.forEach(item => {
                    if (item.stock > 0 && canAfford(item, 1)) {
                      shopSystem.buyItem(shopItems, item.itemId, 1, addItemToInventory);
                    }
                  });
                  setMessage('Bought one of each affordable item!');
                }}
              >
                Buy One of Each
              </button>
            )}
            
            {mode === 'sell' && (
              <button 
                className="shop-btn"
                onClick={() => {
                  // Sell all sellable items
                  let totalSold = 0;
                  sellableInventoryItems.forEach((slot) => {
                    const actualIndex = player.inventory.indexOf(slot);
                    const result = shopSystem.sellItem(
                      shopItems,
                      player.inventory,
                      actualIndex,
                      slot.item!.quantity,
                      (slotIndex: number, qty: number) => {
                        removeItemFromInventory(slotIndex, qty);
                        return true;
                      }
                    );
                    if (result.success) totalSold++;
                  });
                  setMessage(`Sold ${totalSold} different items!`);
                }}
              >
                Sell All
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="shop-message">
          {message}
        </div>
      )}
    </div>
  );
};
