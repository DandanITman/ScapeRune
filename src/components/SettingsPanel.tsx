import React, { useState, useRef } from 'react';
import { SaveLoadSystem } from '../systems/SaveLoadSystem';
import { useSettingsStore } from '../store/settingsStore';
import { useDraggable } from '../hooks/useDraggable';
import './SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'game' | 'graphics' | 'audio' | 'saves'>('game');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [saveInfo, setSaveInfo] = useState(() => SaveLoadSystem.getSaveInfo());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings store
  const {
    graphics,
    audio,
    game,
    updateGraphics,
    updateAudio,
    updateGame,
    resetToDefaults
  } = useSettingsStore();
  
  // Draggable functionality
  const { elementRef, handleMouseDown, style } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 }
  });

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleSaveGame = () => {
    const success = SaveLoadSystem.saveGame();
    if (success) {
      setSaveInfo(SaveLoadSystem.getSaveInfo());
      alert('Game saved successfully!');
    } else {
      alert('Failed to save game');
    }
  };

  const handleLoadGame = () => {
    const saveData = SaveLoadSystem.loadGame();
    if (saveData) {
      SaveLoadSystem.applySaveData(saveData);
      alert('Game loaded successfully!');
      onClose();
      // Refresh the page to apply loaded data
      window.location.reload();
    } else {
      alert('No save data found or failed to load');
    }
  };

  const handleDeleteSave = () => {
    if (showConfirmDelete) {
      const success = SaveLoadSystem.deleteSave();
      if (success) {
        setSaveInfo(null);
        setShowConfirmDelete(false);
        alert('Save data deleted');
      } else {
        alert('Failed to delete save data');
      }
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleExportSave = () => {
    SaveLoadSystem.exportSave();
  };

  const handleImportSave = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await SaveLoadSystem.importSave(file);
      if (success) {
        setSaveInfo(SaveLoadSystem.getSaveInfo());
        alert('Save data imported successfully!');
      }
    }
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewGame = () => {
    const confirmed = window.confirm('This will delete your current save data. Are you sure?');
    if (confirmed) {
      SaveLoadSystem.deleteSave();
      const newSave = SaveLoadSystem.createNewSave();
      SaveLoadSystem.applySaveData(newSave);
      SaveLoadSystem.saveGame();
      setSaveInfo(SaveLoadSystem.getSaveInfo());
      alert('New game started!');
      onClose();
      window.location.reload();
    }
  };

  return (
    <div ref={elementRef} className="settings-panel" style={style}>
      <div className="settings-header" onMouseDown={handleMouseDown}>
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          Game
        </button>
        <button 
          className={`tab-btn ${activeTab === 'graphics' ? 'active' : ''}`}
          onClick={() => setActiveTab('graphics')}
        >
          Graphics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          Audio
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saves' ? 'active' : ''}`}
          onClick={() => setActiveTab('saves')}
        >
          Save/Load
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'game' && (
          <div className="settings-section">
            <h3>🎮 Game Settings</h3>
            
            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={game.showTutorialHints}
                  onChange={(e) => updateGame({ showTutorialHints: e.target.checked })}
                />
                Show Tutorial Hints
              </label>
              <p className="setting-description">Display helpful tips and tutorials for new players</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={game.autoSave}
                  onChange={(e) => updateGame({ autoSave: e.target.checked })}
                />
                Auto-Save
              </label>
              <p className="setting-description">Automatically save your progress every 5 minutes</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={game.confirmActions}
                  onChange={(e) => updateGame({ confirmActions: e.target.checked })}
                />
                Confirm Actions
              </label>
              <p className="setting-description">Ask for confirmation before important actions</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={game.showExperienceDrops}
                  onChange={(e) => updateGame({ showExperienceDrops: e.target.checked })}
                />
                Show Experience Drops
              </label>
              <p className="setting-description">Display floating XP notifications when gaining experience</p>
            </div>
            
            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={game.showDamageNumbers}
                  onChange={(e) => updateGame({ showDamageNumbers: e.target.checked })}
                />
                Show Damage Numbers
              </label>
              <p className="setting-description">Display damage numbers during combat</p>
            </div>
          </div>
        )}

        {activeTab === 'graphics' && (
          <div className="settings-section">
            <h3>🎨 Graphics Settings</h3>
            
            <div className="setting-group">
              <label>Graphics Quality:</label>
              <select 
                value={graphics.quality}
                onChange={(e) => updateGraphics({ quality: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low (Better Performance)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Better Quality)</option>
              </select>
              <p className="setting-description">Adjust visual quality vs performance</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={graphics.shadows}
                  onChange={(e) => updateGraphics({ shadows: e.target.checked })}
                />
                Enable Shadows
              </label>
              <p className="setting-description">Render shadows for better visual depth</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={graphics.smoothCamera}
                  onChange={(e) => updateGraphics({ smoothCamera: e.target.checked })}
                />
                Smooth Camera
              </label>
              <p className="setting-description">Enable smooth camera transitions</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={graphics.vsync}
                  onChange={(e) => updateGraphics({ vsync: e.target.checked })}
                />
                V-Sync
              </label>
              <p className="setting-description">Synchronize frame rate with display</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={graphics.particles}
                  onChange={(e) => updateGraphics({ particles: e.target.checked })}
                />
                Particle Effects
              </label>
              <p className="setting-description">Enable visual particle effects</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={graphics.antiAliasing}
                  onChange={(e) => updateGraphics({ antiAliasing: e.target.checked })}
                />
                Anti-Aliasing
              </label>
              <p className="setting-description">Smooth jagged edges for better visual quality</p>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="settings-section">
            <h3>🔊 Audio Settings</h3>
            
            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={audio.enabled}
                  onChange={(e) => updateAudio({ enabled: e.target.checked })}
                />
                Enable Sound
              </label>
              <p className="setting-description">Turn all game audio on/off</p>
            </div>

            <div className="setting-group">
              <label>Music Volume:</label>
              <div className="volume-control">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={audio.musicVolume}
                  onChange={(e) => updateAudio({ musicVolume: parseInt(e.target.value) })}
                />
                <span>{audio.musicVolume}%</span>
              </div>
              <p className="setting-description">Background music volume</p>
            </div>

            <div className="setting-group">
              <label>Sound Effects:</label>
              <div className="volume-control">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={audio.soundEffectsVolume}
                  onChange={(e) => updateAudio({ soundEffectsVolume: parseInt(e.target.value) })}
                />
                <span>{audio.soundEffectsVolume}%</span>
              </div>
              <p className="setting-description">Game sound effects volume</p>
            </div>

            <div className="setting-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={audio.muteWhenUnfocused}
                  onChange={(e) => updateAudio({ muteWhenUnfocused: e.target.checked })}
                />
                Mute When Unfocused
              </label>
              <p className="setting-description">Mute audio when game window is not active</p>
            </div>

            <div className="setting-group">
              <button 
                className="reset-btn secondary"
                onClick={() => updateAudio({ musicVolume: 50, soundEffectsVolume: 75 })}
              >
                Reset Audio to Defaults
              </button>
            </div>
          </div>
        )}

        {activeTab === 'saves' && (
          <div className="settings-section">
            <h3>💾 Save & Load</h3>
            
            <div className="save-info">
              {saveInfo ? (
                <div>
                  <p><strong>Last Saved:</strong> {formatTimestamp(saveInfo.timestamp)}</p>
                  <p><strong>Version:</strong> {saveInfo.version}</p>
                </div>
              ) : (
                <p>No save data found</p>
              )}
            </div>

            <div className="save-actions">
              <div className="action-group">
                <button className="save-btn primary" onClick={handleSaveGame}>
                  💾 Save Game
                </button>
                <p className="action-description">Save your current progress</p>
              </div>

              <div className="action-group">
                <button 
                  className="load-btn secondary" 
                  onClick={handleLoadGame}
                  disabled={!saveInfo}
                >
                  📁 Load Game
                </button>
                <p className="action-description">Load your saved progress</p>
              </div>

              <div className="action-group">
                <button className="new-game-btn secondary" onClick={handleNewGame}>
                  🆕 New Game
                </button>
                <p className="action-description">Start a completely new game</p>
              </div>

              <hr />

              <div className="action-group">
                <button className="export-btn secondary" onClick={handleExportSave}>
                  📤 Export Save
                </button>
                <p className="action-description">Download save file to your computer</p>
              </div>

              <div className="action-group">
                <button className="import-btn secondary" onClick={handleImportSave}>
                  📥 Import Save
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <p className="action-description">Load save file from your computer</p>
              </div>

              <div className="action-group">
                <button 
                  className={`delete-btn ${showConfirmDelete ? 'danger confirm' : 'danger'}`}
                  onClick={handleDeleteSave}
                  disabled={!saveInfo}
                >
                  {showConfirmDelete ? '⚠️ Confirm Delete' : '🗑️ Delete Save'}
                </button>
                <p className="action-description">
                  {showConfirmDelete ? 'Click again to confirm deletion' : 'Permanently delete save data'}
                </p>
                {showConfirmDelete && (
                  <button 
                    className="cancel-btn" 
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Global Reset Button */}
      <div className="settings-footer">
        <button 
          className="reset-all-btn danger"
          onClick={() => {
            if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
              resetToDefaults();
            }
          }}
        >
          🔄 Reset All Settings
        </button>
      </div>
    </div>
  );
};
