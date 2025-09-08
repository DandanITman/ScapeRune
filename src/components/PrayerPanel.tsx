import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PrayerSystem } from '../systems/PrayerSystem';
import type { PrayerData } from '../systems/PrayerSystem';
import './PrayerPanel.css';

interface PrayerPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PrayerPanel: React.FC<PrayerPanelProps> = ({ isVisible, onClose }) => {
  const { player, activatePrayer, deactivatePrayer, restoreAtAltar } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<'prayers' | 'bones'>('prayers');
  
  const prayerSystem = new PrayerSystem();
  const prayers = prayerSystem.getPrayerCategories();
  const bones = prayerSystem.getBones();

  if (!isVisible) return null;

  const handlePrayerToggle = (prayerId: string) => {
    const isActive = player.prayerState.activePrayers.has(prayerId);
    
    if (isActive) {
      deactivatePrayer(prayerId);
    } else {
      activatePrayer(prayerId);
    }
  };

  const handleBuryAll = (boneId: string) => {
    // Find all bones of this type and bury them
    for (let i = 0; i < player.inventory.length; i++) {
      const item = player.inventory[i]?.item;
      if (item && item.id === boneId) {
        // Use the bury bones action from the store
        useGameStore.getState().buryBones(i);
      }
    }
  };

  const getBoneCount = (boneId: string): number => {
    return player.inventory.reduce((count, slot) => {
      if (slot.item && slot.item.id === boneId) {
        return count + slot.item.quantity;
      }
      return count;
    }, 0);
  };

  const getAvailablePrayers = () => {
    return prayerSystem.getAvailablePrayers(player.stats.prayer);
  };

  const canActivatePrayer = (prayer: PrayerData) => {
    return prayerSystem.canActivatePrayer(
      prayer.id,
      player.stats.prayer,
      player.prayerState.currentPoints,
      player.prayerState.activePrayers
    );
  };

  const getPrayerDrainTime = () => {
    return prayerSystem.getDrainTimeEstimate(player.prayerState);
  };

  const formatTime = (seconds: number): string => {
    if (seconds === Infinity) return '∞';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="prayer-panel">
      <div className="prayer-header">
        <h2>Prayer</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="prayer-stats">
        <div className="prayer-points">
          <span className="current-points">{Math.floor(player.prayerState.currentPoints)}</span>
          <span className="max-points">/{player.prayerState.maxPoints}</span>
        </div>
        <div className="prayer-level">
          Level {player.stats.prayer}
        </div>
        {player.prayerState.activePrayers.size > 0 && (
          <div className="drain-time">
            Time remaining: {formatTime(getPrayerDrainTime())}
          </div>
        )}
      </div>

      <div className="prayer-tabs">
        <button 
          className={`tab ${selectedTab === 'prayers' ? 'active' : ''}`}
          onClick={() => setSelectedTab('prayers')}
        >
          Prayers
        </button>
        <button 
          className={`tab ${selectedTab === 'bones' ? 'active' : ''}`}
          onClick={() => setSelectedTab('bones')}
        >
          Bones
        </button>
      </div>

      <div className="prayer-content">
        {selectedTab === 'prayers' && (
          <div className="prayers-tab">
            <div className="altar-section">
              <button 
                className="altar-button"
                onClick={() => restoreAtAltar('normal')}
                title="Restore all prayer points"
              >
                🛐 Pray at Altar
              </button>
            </div>

            <div className="prayer-categories">
              <div className="prayer-category">
                <h3>Combat Prayers</h3>
                <div className="prayer-grid">
                  {prayers.combat.map(prayer => {
                    const available = getAvailablePrayers().find(p => p.id === prayer.id);
                    const isActive = player.prayerState.activePrayers.has(prayer.id);
                    const canActivate = canActivatePrayer(prayer);
                    
                    return (
                      <div 
                        key={prayer.id}
                        className={`prayer-item ${isActive ? 'active' : ''} ${!available ? 'locked' : ''} ${!canActivate.canActivate && available ? 'disabled' : ''}`}
                        onClick={() => available && handlePrayerToggle(prayer.id)}
                        title={available ? prayer.description : `Requires level ${prayer.level} Prayer`}
                      >
                        <div className="prayer-name">{prayer.name}</div>
                        <div className="prayer-level">Lv. {prayer.level}</div>
                        {isActive && <div className="prayer-active-indicator">●</div>}
                        {!canActivate.canActivate && available && (
                          <div className="prayer-error" title={canActivate.reason}>⚠</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="prayer-category">
                <h3>Utility Prayers</h3>
                <div className="prayer-grid">
                  {prayers.utility.map(prayer => {
                    const available = getAvailablePrayers().find(p => p.id === prayer.id);
                    const isActive = player.prayerState.activePrayers.has(prayer.id);
                    const canActivate = canActivatePrayer(prayer);
                    
                    return (
                      <div 
                        key={prayer.id}
                        className={`prayer-item ${isActive ? 'active' : ''} ${!available ? 'locked' : ''} ${!canActivate.canActivate && available ? 'disabled' : ''}`}
                        onClick={() => available && handlePrayerToggle(prayer.id)}
                        title={available ? prayer.description : `Requires level ${prayer.level} Prayer`}
                      >
                        <div className="prayer-name">{prayer.name}</div>
                        <div className="prayer-level">Lv. {prayer.level}</div>
                        {isActive && <div className="prayer-active-indicator">●</div>}
                        {!canActivate.canActivate && available && (
                          <div className="prayer-error" title={canActivate.reason}>⚠</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'bones' && (
          <div className="bones-tab">
            <div className="bones-info">
              <p>Bury bones to gain Prayer experience:</p>
            </div>
            
            <div className="bones-list">
              {Object.values(bones).map(bone => {
                const count = getBoneCount(bone.id);
                
                return (
                  <div key={bone.id} className={`bone-item ${count === 0 ? 'disabled' : ''}`}>
                    <div className="bone-info">
                      <div className="bone-name">🦴 {bone.name}</div>
                      <div className="bone-details">
                        <span className="bone-xp">{bone.experience} XP</span>
                        <span className="bone-count">x{count}</span>
                      </div>
                    </div>
                    
                    {count > 0 && (
                      <div className="bone-actions">
                        <button 
                          className="bury-button"
                          onClick={() => {
                            // Find the first slot with this bone type and bury one
                            const slotIndex = player.inventory.findIndex(slot => 
                              slot.item && slot.item.id === bone.id
                            );
                            if (slotIndex !== -1) {
                              useGameStore.getState().buryBones(slotIndex);
                            }
                          }}
                          title={`Bury one ${bone.name}`}
                        >
                          Bury
                        </button>
                        {count > 1 && (
                          <button 
                            className="bury-all-button"
                            onClick={() => handleBuryAll(bone.id)}
                            title={`Bury all ${count} ${bone.name}`}
                          >
                            Bury All
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
