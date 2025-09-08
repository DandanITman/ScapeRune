import React, { useState, useRef } from 'react';
import { SaveLoadSystem } from '../systems/SaveLoadSystem';
import './SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'game' | 'graphics' | 'audio' | 'saves'>('game');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [saveInfo, setSaveInfo] = useState(() => SaveLoadSystem.getSaveInfo());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="settings-panel">
      <div className="settings-header">
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
                <input type="checkbox" defaultChecked />
                Show Tutorial Hints
              </label>
              <p className="setting-description">Display helpful tips and tutorials for new players</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-Save
              </label>
              <p className="setting-description">Automatically save your progress every 5 minutes</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" />
                Confirm Actions
              </label>
              <p className="setting-description">Ask for confirmation before important actions</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" defaultChecked />
                Show Experience Drops
              </label>
              <p className="setting-description">Display floating XP notifications when gaining experience</p>
            </div>
          </div>
        )}

        {activeTab === 'graphics' && (
          <div className="settings-section">
            <h3>🎨 Graphics Settings</h3>
            
            <div className="setting-group">
              <label>Graphics Quality:</label>
              <select defaultValue="medium">
                <option value="low">Low (Better Performance)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Better Quality)</option>
              </select>
              <p className="setting-description">Adjust visual quality vs performance</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" defaultChecked />
                Enable Shadows
              </label>
              <p className="setting-description">Render shadows for better visual depth</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" defaultChecked />
                Smooth Camera
              </label>
              <p className="setting-description">Enable smooth camera transitions</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" />
                V-Sync
              </label>
              <p className="setting-description">Synchronize frame rate with display</p>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="settings-section">
            <h3>🔊 Audio Settings</h3>
            
            <div className="setting-group">
              <label>
                <input type="checkbox" defaultChecked />
                Enable Sound
              </label>
              <p className="setting-description">Turn all game audio on/off</p>
            </div>

            <div className="setting-group">
              <label>Music Volume:</label>
              <input type="range" min="0" max="100" defaultValue="50" />
              <span>50%</span>
              <p className="setting-description">Background music volume</p>
            </div>

            <div className="setting-group">
              <label>Sound Effects:</label>
              <input type="range" min="0" max="100" defaultValue="75" />
              <span>75%</span>
              <p className="setting-description">Game sound effects volume</p>
            </div>

            <div className="setting-group">
              <label>
                <input type="checkbox" />
                Mute When Unfocused
              </label>
              <p className="setting-description">Mute audio when game window is not active</p>
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
    </div>
  );
};
