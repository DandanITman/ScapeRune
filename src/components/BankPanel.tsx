import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { BankingSystem } from '../systems/BankingSystem';
import type { BankSlot } from '../systems/BankingSystem';
import './BankPanel.css';

interface BankPanelProps {
  onClose: () => void;
}

export const BankPanel: React.FC<BankPanelProps> = ({ onClose }) => {
  const { player, removeItemFromInventory, addItemToInventory } = useGameStore();
  const [bankingSystem] = useState(() => new BankingSystem());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [withdrawQuantity, setWithdrawQuantity] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [bankSlots, setBankSlots] = useState<BankSlot[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Load bank slots for current tab
    setBankSlots(bankingSystem.getCurrentTabSlots());
  }, [currentTab, bankingSystem]);

  const handleDeposit = (slotIndex: number) => {
    const inventorySlot = player.inventory[slotIndex];
    if (!inventorySlot.item) return;

    const result = bankingSystem.depositItem(inventorySlot.item, inventorySlot.item.quantity);
    
    if (result.success) {
      // Remove from inventory
      removeItemFromInventory(slotIndex, inventorySlot.item.quantity);
      // Refresh bank display
      setBankSlots([...bankingSystem.getCurrentTabSlots()]);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  const handleWithdraw = (bankSlotIndex: number, quantity?: number) => {
    const withdrawAmount = quantity || parseInt(withdrawQuantity) || 1;
    const result = bankingSystem.withdrawItem(bankSlotIndex, withdrawAmount);
    
    if (result.success && result.item) {
      // Try to add to inventory
      if (addItemToInventory(result.item.id, result.item.quantity)) {
        // Refresh bank display
        setBankSlots([...bankingSystem.getCurrentTabSlots()]);
        setMessage(result.message);
      } else {
        // If inventory is full, put item back in bank
        bankingSystem.depositItem(result.item, result.item.quantity);
        setMessage('Your inventory is full!');
      }
    } else {
      setMessage(result.message);
    }
  };

  const handleDepositAll = () => {
    let totalDeposited = 0;
    
    // Deposit all items from inventory
    for (let i = player.inventory.length - 1; i >= 0; i--) {
      const slot = player.inventory[i];
      if (slot.item) {
        const result = bankingSystem.depositItem(slot.item, slot.item.quantity);
        if (result.success) {
          removeItemFromInventory(i, slot.item.quantity);
          totalDeposited++;
        }
      }
    }
    
    setBankSlots([...bankingSystem.getCurrentTabSlots()]);
    setMessage(`Deposited ${totalDeposited} items into your bank.`);
  };

  const handleTabSwitch = (tabIndex: number) => {
    if (bankingSystem.switchTab(tabIndex)) {
      setCurrentTab(tabIndex);
      setBankSlots(bankingSystem.getCurrentTabSlots());
      setSelectedSlot(null);
    }
  };

  const handleOrganize = () => {
    bankingSystem.organizeBank();
    setBankSlots([...bankingSystem.getCurrentTabSlots()]);
    setMessage('Bank organized!');
  };

  const filteredSlots = searchTerm 
    ? bankSlots.filter(slot => 
        slot.item && slot.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : bankSlots;

  const bankInfo = bankingSystem.getBankInfo();

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bank-panel">
      <div className="bank-header">
        <span className="bank-title">Bank of Lumbridge</span>
        <button className="bank-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="bank-info">
        <span>Used: {bankInfo.usedSlots}/{bankInfo.totalSlots} ({bankInfo.usedPercentage}%)</span>
        <span>Total Items: {bankingSystem.getTotalItems()}</span>
        {message && <span style={{ color: '#ffff00' }}>{message}</span>}
      </div>

      <div className="bank-tabs">
        {bankingSystem.getTabs().map((tab, index) => (
          <button
            key={tab.id}
            className={`bank-tab ${index === currentTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(index)}
          >
            {index === 0 ? 'All' : `Tab ${index + 1}`}
          </button>
        ))}
      </div>

      <div className="bank-content">
        <div className="bank-grid">
          {(searchTerm ? filteredSlots : bankSlots).map((slot, index) => (
            <div
              key={slot.id}
              className={`bank-slot ${slot.item ? 'has-item' : ''} ${selectedSlot === index ? 'selected' : ''}`}
              onClick={() => {
                if (slot.item) {
                  setSelectedSlot(selectedSlot === index ? null : index);
                }
              }}
              onDoubleClick={() => {
                if (slot.item) {
                  handleWithdraw(index, 1);
                }
              }}
            >
              {slot.item && (
                <>
                  <div className="bank-item-name">{slot.item.name}</div>
                  {slot.item.quantity > 1 && (
                    <div className="bank-item-quantity">{slot.item.quantity}</div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="bank-actions">
          <div className="bank-action-group">
            <div className="bank-action-title">Search</div>
            <input
              type="text"
              className="bank-search"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedSlot !== null && bankSlots[selectedSlot]?.item && (
            <div className="bank-action-group">
              <div className="bank-action-title">Selected Item</div>
              <div className="bank-selected-item">
                <div className="bank-selected-item-name">
                  {bankSlots[selectedSlot].item!.name}
                </div>
                <div className="bank-selected-item-quantity">
                  Quantity: {bankSlots[selectedSlot].item!.quantity}
                </div>
              </div>
              
              <input
                type="number"
                className="bank-quantity-input"
                placeholder="Quantity"
                value={withdrawQuantity}
                onChange={(e) => setWithdrawQuantity(e.target.value)}
                min="1"
                max={bankSlots[selectedSlot].item!.quantity}
              />
              
              <button
                className="bank-btn"
                onClick={() => handleWithdraw(selectedSlot)}
              >
                Withdraw
              </button>
              
              <button
                className="bank-btn"
                onClick={() => handleWithdraw(selectedSlot, bankSlots[selectedSlot].item!.quantity)}
              >
                Withdraw All
              </button>
            </div>
          )}

          <div className="bank-action-group">
            <div className="bank-action-title">Quick Actions</div>
            
            <button className="bank-btn" onClick={handleDepositAll}>
              Deposit All
            </button>
            
            <button className="bank-btn" onClick={handleOrganize}>
              Organize Bank
            </button>
          </div>

          <div className="bank-action-group">
            <div className="bank-action-title">Inventory</div>
            
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {player.inventory.map((slot, index) => (
                slot.item && (
                  <div
                    key={index}
                    style={{
                      padding: '4px',
                      border: '1px solid #555',
                      margin: '2px 0',
                      cursor: 'pointer',
                      fontSize: '10px',
                      background: '#4a4a4a',
                      borderRadius: '2px'
                    }}
                    onClick={() => handleDeposit(index)}
                  >
                    {slot.item.name} ({slot.item.quantity})
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
