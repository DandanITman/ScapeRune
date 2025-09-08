import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import StatsPanel from './StatsPanel';
import InventoryPanel from './InventoryPanel';
import CombatStylePanel from './CombatStylePanel';
import EquipmentPanel from './EquipmentPanel';
import SmithingPanel from './SmithingPanel';
import SpellbookPanel from './SpellbookPanel';
import RangedWeaponPanel from './RangedWeaponPanel';
import { PrayerPanel } from './PrayerPanel';
import { SpecialAttacksPanel } from './SpecialAttacksPanel';
import { QuestJournal } from './ui/QuestJournal';
import './GameInterface.css';

const GameInterface: React.FC = () => {
  const { player, currentLocation, setSelectedSpell, setSelectedRangedWeapon, setSelectedAmmo } = useGameStore();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const handleCastSpell = (spellId: string) => {
    setSelectedSpell(spellId);
    console.log(`Selected spell: ${spellId}`);
    // Close the spellbook after selecting
    setActivePanel(null);
  };

  const handleSelectRangedWeapon = (weaponId: string, ammoId: string) => {
    setSelectedRangedWeapon(weaponId);
    setSelectedAmmo(ammoId);
    console.log(`Selected ranged weapon: ${weaponId} with ammo: ${ammoId}`);
    // Close the ranged weapon panel after selecting
    setActivePanel(null);
  };

  return (
    <div className="game-interface">
      {/* Main Menu Bar */}
      <div className="menu-bar">
        <button 
          className={`menu-button ${activePanel === 'stats' ? 'active' : ''}`}
          onClick={() => togglePanel('stats')}
        >
          Stats
        </button>
        <button 
          className={`menu-button ${activePanel === 'inventory' ? 'active' : ''}`}
          onClick={() => togglePanel('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`menu-button ${activePanel === 'combat' ? 'active' : ''}`}
          onClick={() => togglePanel('combat')}
        >
          Combat
        </button>
        <button 
          className={`menu-button ${activePanel === 'equipment' ? 'active' : ''}`}
          onClick={() => togglePanel('equipment')}
        >
          Equipment
        </button>
        <button 
          className={`menu-button ${activePanel === 'smithing' ? 'active' : ''}`}
          onClick={() => togglePanel('smithing')}
        >
          Smithing
        </button>
        <button 
          className={`menu-button ${activePanel === 'spells' ? 'active' : ''}`}
          onClick={() => togglePanel('spells')}
        >
          Spells
        </button>
        <button 
          className={`menu-button ${activePanel === 'ranged' ? 'active' : ''}`}
          onClick={() => togglePanel('ranged')}
        >
          Ranged
        </button>
        <button 
          className={`menu-button ${activePanel === 'prayer' ? 'active' : ''}`}
          onClick={() => togglePanel('prayer')}
        >
          Prayer
        </button>
        <button 
          className={`menu-button ${activePanel === 'specials' ? 'active' : ''}`}
          onClick={() => togglePanel('specials')}
        >
          Special Attacks
        </button>
        <button 
          className={`menu-button ${activePanel === 'quests' ? 'active' : ''}`}
          onClick={() => togglePanel('quests')}
        >
          Quests
        </button>
        <button className="menu-button">Friends</button>
        <button className="menu-button">Options</button>
      </div>

      {/* Player Info */}
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        <div className="location">Location: {currentLocation}</div>
        <div className="combat-level">Combat Level: {player.combatLevel}</div>
        <div className="hitpoints">
          HP: {player.hitpoints}/{player.maxHitpoints}
        </div>
        <div className="prayer-points">
          Prayer: {Math.floor(player.prayerState.currentPoints)}/{player.prayerState.maxPoints}
        </div>
        <div className="special-energy">
          Special: {Math.floor(player.specialAttackEnergy.current)}%
        </div>
      </div>

      {/* Movement Controls Help */}
      <div className="controls-help">
        <p>Use WASD or Arrow Keys to move</p>
      </div>

      {/* Panels */}
      {activePanel === 'stats' && <StatsPanel />}
      {activePanel === 'inventory' && <InventoryPanel />}
      {activePanel === 'combat' && <CombatStylePanel />}
      {activePanel === 'equipment' && <EquipmentPanel />}
      {activePanel === 'smithing' && <SmithingPanel />}
      {activePanel === 'spells' && (
        <SpellbookPanel 
          isOpen={true}
          onClose={() => setActivePanel(null)}
          onCastSpell={handleCastSpell}
        />
      )}
      {activePanel === 'ranged' && (
        <RangedWeaponPanel 
          isOpen={true}
          onClose={() => setActivePanel(null)}
          onSelectWeapon={handleSelectRangedWeapon}
        />
      )}
      {activePanel === 'prayer' && (
        <PrayerPanel 
          isVisible={true}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'specials' && (
        <SpecialAttacksPanel 
          isVisible={true}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'quests' && (
        <QuestJournal 
          isOpen={true}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-messages">
          <div className="chat-message">Welcome to RuneScape Classic!</div>
          <div className="chat-message">Use the buttons above to access your stats and inventory.</div>
        </div>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Type here to chat..."
        />
      </div>
    </div>
  );
};

export default GameInterface;
