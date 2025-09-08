import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MagicSystem, type MagicSpell } from '../systems/MagicSystem';
import './SpellbookPanel.css';

interface SpellbookPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCastSpell: (spellId: string) => void;
}

const SpellbookPanel: React.FC<SpellbookPanelProps> = ({ 
  isOpen, 
  onClose, 
  onCastSpell 
}) => {
  const { player } = useGameStore();
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combat' | 'utility'>('combat');
  
  const magicSystem = new MagicSystem();
  const playerMagicLevel = player.stats.magic;
  const spellCategories = magicSystem.getSpellCategories();

  if (!isOpen) return null;

  const getInventoryCount = (itemId: string): number => {
    const item = player.inventory.find((slot) => slot.item?.id === itemId);
    return item?.item?.quantity || 0;
  };

  const canCastSpell = (spell: MagicSpell): boolean => {
    if (playerMagicLevel < spell.level) return false;
    
    for (const [runeId, amount] of Object.entries(spell.runes)) {
      if (getInventoryCount(runeId) < amount) return false;
    }
    
    return true;
  };

  const getRuneRequirementText = (spell: MagicSpell): string => {
    return Object.entries(spell.runes)
      .map(([runeId, amount]) => {
        const runeName = runeId.replace('_rune', '').replace('_', ' ');
        const hasEnough = getInventoryCount(runeId) >= amount;
        return `${amount} ${runeName} ${hasEnough ? '✓' : '✗'}`;
      })
      .join(', ');
  };

  const handleSpellClick = (spell: MagicSpell) => {
    if (canCastSpell(spell)) {
      setSelectedSpell(spell.id);
      onCastSpell(spell.id);
    }
  };

  const renderSpellList = (spells: MagicSpell[]) => {
    return spells.map(spell => {
      const castable = canCastSpell(spell);
      const isSelected = selectedSpell === spell.id;
      
      return (
        <div
          key={spell.id}
          className={`spell-item ${castable ? 'castable' : 'not-castable'} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleSpellClick(spell)}
        >
          <div className="spell-header">
            <span className="spell-name">{spell.name}</span>
            <span className="spell-level">Lvl {spell.level}</span>
          </div>
          <div className="spell-description">{spell.description}</div>
          <div className="spell-runes">
            <span className="rune-text">{getRuneRequirementText(spell)}</span>
          </div>
          {spell.type === 'combat' && spell.maxHit && (
            <div className="spell-damage">Max hit: {spell.maxHit}</div>
          )}
          <div className="spell-xp">XP: {spell.experience}</div>
        </div>
      );
    });
  };

  return (
    <div className="spellbook-overlay">
      <div className="spellbook-panel">
        <div className="spellbook-header">
          <h2>Magic Spellbook</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="magic-level">
          Magic Level: {playerMagicLevel}
        </div>

        <div className="spellbook-tabs">
          <button 
            className={`tab-button ${activeTab === 'combat' ? 'active' : ''}`}
            onClick={() => setActiveTab('combat')}
          >
            Combat Spells
          </button>
          <button 
            className={`tab-button ${activeTab === 'utility' ? 'active' : ''}`}
            onClick={() => setActiveTab('utility')}
          >
            Utility Spells
          </button>
        </div>

        <div className="spellbook-content">
          {activeTab === 'combat' && (
            <div className="spell-category">
              <h3>Combat Spells</h3>
              <div className="spell-list">
                {renderSpellList(spellCategories.combat.filter(spell => spell.level <= playerMagicLevel))}
              </div>
              {spellCategories.combat.filter(spell => spell.level > playerMagicLevel).length > 0 && (
                <>
                  <h4>Locked Spells</h4>
                  <div className="spell-list locked">
                    {renderSpellList(spellCategories.combat.filter(spell => spell.level > playerMagicLevel))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'utility' && (
            <div className="spell-category">
              <h3>Utility Spells</h3>
              <div className="spell-list">
                {renderSpellList(spellCategories.utility.filter(spell => spell.level <= playerMagicLevel))}
              </div>
              {spellCategories.utility.filter(spell => spell.level > playerMagicLevel).length > 0 && (
                <>
                  <h4>Locked Spells</h4>
                  <div className="spell-list locked">
                    {renderSpellList(spellCategories.utility.filter(spell => spell.level > playerMagicLevel))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="spellbook-instructions">
          <p>Click on a spell to select it for casting. You need the required runes and magic level.</p>
          <p>Combat spells can be cast on enemies. Utility spells have various effects.</p>
        </div>
      </div>
    </div>
  );
};

export default SpellbookPanel;
