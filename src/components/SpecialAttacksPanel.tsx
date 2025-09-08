import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SpecialAttacksSystem } from '../systems/SpecialAttacksSystem';
import type { SpecialAttack } from '../systems/SpecialAttacksSystem';
import './SpecialAttacksPanel.css';

interface SpecialAttacksPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SpecialAttacksPanel: React.FC<SpecialAttacksPanelProps> = ({ isVisible, onClose }) => {
  const { 
    player, 
    canUseSpecialAttack, 
    performSpecialAttack, 
    getAvailableSpecialAttacks
  } = useGameStore();
  
  const [selectedTab, setSelectedTab] = useState<'weapon' | 'all'>('weapon');
  
  const specialAttacksSystem = new SpecialAttacksSystem();
  const categories = specialAttacksSystem.getSpecialAttackCategories();
  const availableAttackIds = getAvailableSpecialAttacks();

  if (!isVisible) return null;

  const handleSpecialAttack = (attackId: string) => {
    const result = performSpecialAttack(attackId);
    // You could show a message here or trigger animations
    console.log(result.message);
  };

  const getEnergyBarColor = () => {
    const percentage = player.specialAttackEnergy.current;
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 50) return '#FF9800'; // Orange
    if (percentage >= 25) return '#FF5722'; // Red-Orange
    return '#F44336'; // Red
  };

  const renderSpecialAttack = (attack: SpecialAttack, available: boolean = true) => {
    const canUseResult = available ? canUseSpecialAttack(attack.id) : { canUse: false, reason: 'Not available' };
    const isDisabled = !canUseResult.canUse;

    return (
      <div
        key={attack.id}
        className={`special-attack-item ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && handleSpecialAttack(attack.id)}
        title={isDisabled ? canUseResult.reason : attack.description}
      >
        <div className="special-attack-header">
          <span className="special-attack-name">{attack.name}</span>
          <span className="special-attack-cost">{attack.energyCost}%</span>
        </div>
        <div className="special-attack-description">{attack.description}</div>
        <div className="special-attack-stats">
          {attack.damageMultiplier !== 1.0 && (
            <span className="stat-modifier damage">
              {attack.damageMultiplier > 1 ? '+' : ''}{Math.round((attack.damageMultiplier - 1) * 100)}% Damage
            </span>
          )}
          {attack.accuracy !== 1.0 && (
            <span className="stat-modifier accuracy">
              {attack.accuracy > 1 ? '+' : ''}{Math.round((attack.accuracy - 1) * 100)}% Accuracy
            </span>
          )}
          {attack.effect && (
            <span className="stat-modifier effect">{attack.effect.type}</span>
          )}
        </div>
      </div>
    );
  };

  const renderWeaponSpecials = () => {
    const equippedWeapon = player.equipment.weapon;
    
    if (!equippedWeapon) {
      return (
        <div className="no-weapon-message">
          <p>No weapon equipped!</p>
          <p>Equip a weapon to use special attacks.</p>
        </div>
      );
    }

    const weaponType = specialAttacksSystem.getWeaponType(equippedWeapon.id);
    if (!weaponType) {
      return (
        <div className="no-specials-message">
          <p>This weapon has no special attacks.</p>
        </div>
      );
    }

    const weaponSpecials = specialAttacksSystem.getWeaponSpecials(weaponType);
    
    if (weaponSpecials.length === 0) {
      return (
        <div className="no-specials-message">
          <p>This weapon type has no special attacks.</p>
        </div>
      );
    }

    return (
      <div className="special-attacks-list">
        <div className="weapon-info">
          <h3>Special Attacks for {equippedWeapon.name}</h3>
          <p>Weapon Type: {weaponType}</p>
        </div>
        {weaponSpecials.map(attack => renderSpecialAttack(attack, true))}
      </div>
    );
  };

  const renderAllSpecials = () => {
    return (
      <div className="all-specials-container">
        <div className="special-category">
          <h3>Offensive Attacks</h3>
          <div className="special-attacks-list">
            {categories.offensive.map(attack => 
              renderSpecialAttack(attack, availableAttackIds.includes(attack.id))
            )}
          </div>
        </div>

        <div className="special-category">
          <h3>Defensive Abilities</h3>
          <div className="special-attacks-list">
            {categories.defensive.map(attack => 
              renderSpecialAttack(attack, availableAttackIds.includes(attack.id))
            )}
          </div>
        </div>

        <div className="special-category">
          <h3>Utility Abilities</h3>
          <div className="special-attacks-list">
            {categories.utility.map(attack => 
              renderSpecialAttack(attack, availableAttackIds.includes(attack.id))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="special-attacks-panel">
      <div className="panel-header">
        <h2>Special Attacks</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Special Attack Energy Bar */}
      <div className="energy-section">
        <div className="energy-label">
          Special Attack Energy: {Math.floor(player.specialAttackEnergy.current)}%
        </div>
        <div className="energy-bar-container">
          <div 
            className="energy-bar-fill"
            style={{
              width: `${player.specialAttackEnergy.current}%`,
              backgroundColor: getEnergyBarColor()
            }}
          />
        </div>
        <div className="energy-regen-info">
          Regenerates {Math.round(player.specialAttackEnergy.regenRate * 100)}% per second
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${selectedTab === 'weapon' ? 'active' : ''}`}
          onClick={() => setSelectedTab('weapon')}
        >
          Current Weapon
        </button>
        <button
          className={`tab-button ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          All Specials
        </button>
      </div>

      {/* Content Area */}
      <div className="panel-content">
        {selectedTab === 'weapon' ? renderWeaponSpecials() : renderAllSpecials()}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="help-text">
          <h4>How Special Attacks Work:</h4>
          <ul>
            <li>Each weapon type has unique special attacks</li>
            <li>Special attacks consume energy (0-100%)</li>
            <li>Energy regenerates automatically over time</li>
            <li>Higher combat levels regenerate energy faster</li>
            <li>Special attacks can provide damage bonuses, effects, or utility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
