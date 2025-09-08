import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDraggable } from '../hooks/useDraggable';
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
  
  const draggable = useDraggable({ 
    initialPosition: { x: 400, y: 150 } // Center-left position
  });
  
  const magicSystem = new MagicSystem();
  const playerMagicLevel = player.stats.magic;
  const spellCategories = magicSystem.getSpellCategories();
  
  console.log('SpellbookPanel - Player magic level:', playerMagicLevel);
  console.log('SpellbookPanel - Combat spells:', spellCategories.combat.length);
  console.log('SpellbookPanel - Utility spells:', spellCategories.utility.length);
  console.log('SpellbookPanel - All combat spells:', spellCategories.combat);

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
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (canCastSpell(spell)) {
        setSelectedSpell(spell.id);
        onCastSpell(spell.id);
      }
    };
  };

  const renderSpellGrid = (spells: MagicSpell[]) => {
    console.log('Rendering spells:', spells.length, 'Player magic level:', playerMagicLevel);
    
    return spells.map(spell => {
      const castable = canCastSpell(spell);
      const isSelected = selectedSpell === spell.id;
      
      console.log(`Spell ${spell.name}: level ${spell.level}, castable: ${castable}`);
      
      return (
        <div
          key={spell.id}
          className={`spell-slot ${castable ? 'castable' : 'not-castable'} ${isSelected ? 'selected' : ''}`}
          onClick={handleSpellClick(spell)}
          title={`${spell.name} (Lvl ${spell.level})\n${spell.description}\n${getRuneRequirementText(spell)}`}
        >
          <div className="spell-icon">{spell.name.charAt(0)}</div>
          <div className="spell-level">{spell.level}</div>
        </div>
      );
    });
  };

  return (
    <div 
      className="spellbook-panel compact"
      style={{
        position: 'absolute',
        left: `${draggable.position.x}px`,
        top: `${draggable.position.y}px`,
        zIndex: 1000
      }}
    >
      <div 
        className="spellbook-header"
        onMouseDown={draggable.handleMouseDown}
      >
        <span className="spellbook-title">Magic ({playerMagicLevel})</span>
        <button 
          className="close-button" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </div>
      
      <div className="spellbook-tabs">
        <button 
          className={`tab-button ${activeTab === 'combat' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('combat');
          }}
        >
          Combat
        </button>
        <button 
          className={`tab-button ${activeTab === 'utility' ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('utility');
          }}
        >
          Utility
        </button>
      </div>

      <div className="spellbook-content">
        <div className="spell-grid">
          {activeTab === 'combat' && renderSpellGrid(spellCategories.combat)}
          {activeTab === 'utility' && renderSpellGrid(spellCategories.utility)}
        </div>
        
        {/* Debug info */}
        <div style={{ color: '#FFD700', fontSize: '10px', marginTop: '8px', padding: '4px' }}>
          Combat: {spellCategories.combat.length} | Utility: {spellCategories.utility.length} | 
          Lvl: {playerMagicLevel} | Tab: {activeTab}
        </div>
      </div>
    </div>
  );
};

export default SpellbookPanel;
