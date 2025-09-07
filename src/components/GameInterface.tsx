import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import StatsPanel from './StatsPanel';
import InventoryPanel from './InventoryPanel';
import CombatStylePanel from './CombatStylePanel';
import EquipmentPanel from './EquipmentPanel';
import SmithingPanel from './SmithingPanel';
import './GameInterface.css';

const GameInterface: React.FC = () => {
  const { player, currentLocation } = useGameStore();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
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
        <button className="menu-button">Spells</button>
        <button className="menu-button">Prayer</button>
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
