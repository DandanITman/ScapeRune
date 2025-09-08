import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
import { RangedSystem, type RangedWeapon, type Ammunition } from '../systems/RangedSystem';
import './RangedWeaponPanel.css';

interface RangedWeaponPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWeapon: (weaponId: string, ammoId: string) => void;
}

const RangedWeaponPanel: React.FC<RangedWeaponPanelProps> = ({ 
  isOpen, 
  onClose, 
  onSelectWeapon 
}) => {
  const { player, selectedRangedWeapon, selectedAmmo, setSelectedRangedWeapon, setSelectedAmmo } = useGameStore();
  const [activeTab, setActiveTab] = useState<'shortbow' | 'longbow' | 'crossbow'>('shortbow');
  
  const draggable = useDraggable({ 
    initialPosition: { x: 400, y: 100 } 
  });
  
  const rangedSystem = new RangedSystem();
  const playerRangedLevel = player.stats.ranged;
  const weapons = rangedSystem.getWeapons();

  if (!isOpen) return null;

  const getInventoryCount = (itemId: string): number => {
    const item = player.inventory.find((slot) => slot.item?.id === itemId);
    return item?.item?.quantity || 0;
  };

  const hasWeapon = (weaponId: string): boolean => {
    return getInventoryCount(weaponId) > 0;
  };

  const canUseWeapon = (weapon: RangedWeapon): boolean => {
    return playerRangedLevel >= weapon.level && hasWeapon(weapon.id);
  };

  const canUseAmmo = (ammo: Ammunition): boolean => {
    return getInventoryCount(ammo.id) > 0;
  };

  const getCompatibleAmmo = (weaponId: string): Ammunition[] => {
    const weapon = rangedSystem.getWeapon(weaponId);
    if (!weapon) return [];
    
    return weapon.requiredArrows
      .map(ammoId => rangedSystem.getAmmo(ammoId))
      .filter((ammo): ammo is Ammunition => ammo !== null && canUseAmmo(ammo));
  };

  const filteredWeapons = Object.values(weapons).filter(weapon => weapon.type === activeTab);

  const handleWeaponSelect = (weaponId: string) => {
    const compatibleAmmo = getCompatibleAmmo(weaponId);
    const bestAmmo = compatibleAmmo.length > 0 ? compatibleAmmo[0] : null;
    
    setSelectedRangedWeapon(weaponId);
    if (bestAmmo) {
      setSelectedAmmo(bestAmmo.id);
      onSelectWeapon(weaponId, bestAmmo.id);
    }
  };

  const handleAmmoSelect = (ammoId: string) => {
    if (selectedRangedWeapon) {
      setSelectedAmmo(ammoId);
      onSelectWeapon(selectedRangedWeapon, ammoId);
    }
  };

  const calculateMaxHit = (weaponId: string, ammoId: string): number => {
    return rangedSystem.calculateMaxHit(weaponId, ammoId, playerRangedLevel);
  };

  return (
    <div 
      ref={draggable.elementRef}
      className="ranged-weapon-panel"
      style={draggable.style}
    >
      <div 
        className="panel-header drag-handle"
        onMouseDown={draggable.handleMouseDown}
      >
        <h3>🏹 Ranged Weapons</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="weapon-tabs">
        <button 
          className={`tab ${activeTab === 'shortbow' ? 'active' : ''}`}
          onClick={() => setActiveTab('shortbow')}
        >
          Shortbows
        </button>
        <button 
          className={`tab ${activeTab === 'longbow' ? 'active' : ''}`}
          onClick={() => setActiveTab('longbow')}
        >
          Longbows
        </button>
        <button 
          className={`tab ${activeTab === 'crossbow' ? 'active' : ''}`}
          onClick={() => setActiveTab('crossbow')}
        >
          Crossbows
        </button>
      </div>

      <div className="weapon-content">
        <div className="weapons-section">
          <h4>Available Weapons</h4>
          <div className="weapons-grid">
            {filteredWeapons.map((weapon) => (
              <div
                key={weapon.id}
                className={`weapon-item ${
                  selectedRangedWeapon === weapon.id ? 'selected' : ''
                } ${canUseWeapon(weapon) ? 'available' : 'unavailable'}`}
                onClick={() => canUseWeapon(weapon) && handleWeaponSelect(weapon.id)}
              >
                <div className="weapon-icon">🏹</div>
                <div className="weapon-info">
                  <div className="weapon-name">{weapon.name}</div>
                  <div className="weapon-level">Level {weapon.level}</div>
                  <div className="weapon-bonus">+{weapon.rangedBonus} Ranged</div>
                  {!hasWeapon(weapon.id) && (
                    <div className="weapon-status">Not owned</div>
                  )}
                  {hasWeapon(weapon.id) && playerRangedLevel < weapon.level && (
                    <div className="weapon-status">Level {weapon.level} required</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRangedWeapon && (
          <div className="ammo-section">
            <h4>Compatible Ammunition</h4>
            <div className="ammo-grid">
              {getCompatibleAmmo(selectedRangedWeapon).map((ammo) => (
                <div
                  key={ammo.id}
                  className={`ammo-item ${
                    selectedAmmo === ammo.id ? 'selected' : ''
                  } ${canUseAmmo(ammo) ? 'available' : 'unavailable'}`}
                  onClick={() => handleAmmoSelect(ammo.id)}
                >
                  <div className="ammo-icon">
                    {ammo.type === 'arrow' ? '🏹' : '🎯'}
                  </div>
                  <div className="ammo-info">
                    <div className="ammo-name">{ammo.name}</div>
                    <div className="ammo-count">
                      x{getInventoryCount(ammo.id)}
                    </div>
                    <div className="ammo-strength">
                      +{ammo.rangedStrength} Str
                    </div>
                    {selectedRangedWeapon && (
                      <div className="max-hit">
                        Max hit: {calculateMaxHit(selectedRangedWeapon, ammo.id)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRangedWeapon && selectedAmmo && (
          <div className="weapon-summary">
            <h4>Selected Setup</h4>
            <div className="summary-info">
              <div>
                <strong>Weapon:</strong> {rangedSystem.getWeapon(selectedRangedWeapon)?.name}
              </div>
              <div>
                <strong>Ammunition:</strong> {rangedSystem.getAmmo(selectedAmmo)?.name}
              </div>
              <div>
                <strong>Max Hit:</strong> {calculateMaxHit(selectedRangedWeapon, selectedAmmo)}
              </div>
              <div>
                <strong>Arrows Left:</strong> {getInventoryCount(selectedAmmo)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RangedWeaponPanel;
