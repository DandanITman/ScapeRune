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
import { AgilityPanel } from './AgilityPanel';
import { ThievingPanel } from './ThievingPanel';
import { HerblorePanel } from './HerblorePanel';
import { FiremakingPanel } from './FiremakingPanel';
import { QuestJournal } from './ui/QuestJournal';
import { SettingsPanel } from './SettingsPanel';
import './GameInterface.css';

interface GameInterfaceProps {
  onDropItem?: (slotIndex: number, quantity: number) => void;
  addFloatingText?: (text: string, type: 'damage' | 'miss' | 'xp' | 'heal', screenX: number, screenY: number) => void;
  getScreenPosition?: (worldPosition: { x: number; y: number; z: number }) => { x: number; y: number };
}

const GameInterface: React.FC<GameInterfaceProps> = ({ onDropItem, addFloatingText, getScreenPosition }) => {
  const { player, currentLocation, chatMessages, setSelectedSpell, setSelectedRangedWeapon, setSelectedAmmo } = useGameStore();
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

  const handleSkillClick = (skillName: string) => {
    // Map skill names to their panel names
    const skillPanelMap: Record<string, string> = {
      'firemaking': 'firemaking',
      'herblaw': 'herblore',
      'agility': 'agility',
      'thieving': 'thieving',
      'smithing': 'smithing',
      'ranged': 'ranged'
    };
    
    const panelName = skillPanelMap[skillName];
    if (panelName) {
      setActivePanel(panelName);
    }
  };

  return (
    <div className="game-interface">
      {/* Main Menu Bar */}
      <div className="menu-bar">
        <button 
          className={`menu-button ${activePanel === 'stats' ? 'active' : ''}`}
          onClick={() => togglePanel('stats')}
          title="Stats"
        >
          📊
        </button>
        <button 
          className={`menu-button ${activePanel === 'inventory' ? 'active' : ''}`}
          onClick={() => togglePanel('inventory')}
          title="Inventory"
        >
          🎒
        </button>
        <button 
          className={`menu-button ${activePanel === 'combat' ? 'active' : ''}`}
          onClick={() => togglePanel('combat')}
          title="Combat"
        >
          ⚔️
        </button>
        <button 
          className={`menu-button ${activePanel === 'equipment' ? 'active' : ''}`}
          onClick={() => togglePanel('equipment')}
          title="Equipment"
        >
          👕
        </button>
        <button 
          className={`menu-button ${activePanel === 'spells' ? 'active' : ''}`}
          onClick={() => togglePanel('spells')}
          title="Spells"
        >
          ✨
        </button>
        <button 
          className={`menu-button ${activePanel === 'prayer' ? 'active' : ''}`}
          onClick={() => togglePanel('prayer')}
          title="Prayer"
        >
          🙏
        </button>
        <button 
          className={`menu-button ${activePanel === 'specials' ? 'active' : ''}`}
          onClick={() => togglePanel('specials')}
          title="Special Attacks"
        >
          💥
        </button>
        <button 
          className={`menu-button ${activePanel === 'quests' ? 'active' : ''}`}
          onClick={() => togglePanel('quests')}
          title="Quests"
        >
          📜
        </button>
        <button className="menu-button" title="Friends">👥</button>
        <button 
          className={`menu-button ${activePanel === 'settings' ? 'active' : ''}`}
          onClick={() => togglePanel('settings')}
          title="Options"
        >
          ⚙️
        </button>
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

      {/* Panels */}
      {activePanel === 'stats' && <StatsPanel onSkillClick={handleSkillClick} onClose={() => setActivePanel(null)} />}
      {activePanel === 'inventory' && <InventoryPanel onClose={() => setActivePanel(null)} onDropItem={onDropItem} addFloatingText={addFloatingText} getScreenPosition={getScreenPosition} />}
      {activePanel === 'combat' && <CombatStylePanel onClose={() => setActivePanel(null)} />}
      {activePanel === 'equipment' && <EquipmentPanel onClose={() => setActivePanel(null)} />}
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
      {activePanel === 'agility' && (
        <AgilityPanel 
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'thieving' && (
        <ThievingPanel 
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'herblore' && (
        <HerblorePanel 
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'firemaking' && (
        <FiremakingPanel 
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'settings' && (
        <SettingsPanel
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-messages">
          {chatMessages.map((message) => (
            <div key={message.id} className="chat-message">
              {message.text}
            </div>
          ))}
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
