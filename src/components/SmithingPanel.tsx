import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SmithingSystem } from '../systems/SmithingSystem';
import type { SmeltingRecipe, SmithingRecipe } from '../systems/SmithingSystem';
import './InventoryPanel.css';
import './SmithingPanel.css';

const SmithingPanel: React.FC = () => {
  const { player } = useGameStore();
  const smeltOre = useGameStore(state => state.smeltOre);
  const smithItem = useGameStore(state => state.smithItem);
  const [activeTab, setActiveTab] = useState<'smelting' | 'smithing'>('smelting');
  const [message, setMessage] = useState<string>('');

  const smithingSystem = new SmithingSystem();
  const smithingLevel = player.stats.smithing;

  const handleSmelt = (recipe: SmeltingRecipe) => {
    const result = smeltOre(recipe.id);
    setMessage(result.message);
    if (result.success && result.xp) {
      setTimeout(() => setMessage(`+${result.xp} Smithing XP`), 1000);
    }
  };

  const handleSmith = (recipe: SmithingRecipe) => {
    const result = smithItem(recipe.id);
    setMessage(result.message);
    if (result.success && result.xp) {
      setTimeout(() => setMessage(`+${result.xp} Smithing XP`), 1000);
    }
  };

  const canPlayerSmelt = (recipe: SmeltingRecipe): boolean => {
    return smithingLevel >= recipe.requiredLevel && 
           smithingSystem.canSmelt(recipe, player.inventory);
  };

  const canPlayerSmith = (recipe: SmithingRecipe): boolean => {
    return smithingLevel >= recipe.requiredLevel && 
           smithingSystem.canSmith(recipe, player.inventory);
  };

  const formatMaterials = (materials: { itemId: string; quantity: number }[]): string => {
    return materials.map(mat => `${mat.quantity}x ${mat.itemId.replace('_', ' ')}`).join(', ');
  };

  const formatBars = (bars: { itemId: string; quantity: number }[]): string => {
    return bars.map(bar => `${bar.quantity}x ${bar.itemId.replace('_', ' ')}`).join(', ');
  };

  const availableSmeltingRecipes = smithingSystem.getAvailableSmeltingRecipes(99); // Show all recipes
  const availableSmithingRecipes = smithingSystem.getAvailableSmithingRecipes(99); // Show all recipes

  return (
    <div className="inventory-panel smithing-panel">
      <div className="inventory-header">
        <h3>Smithing</h3>
        <p>Level: {smithingLevel}</p>
      </div>

      {/* Tab Navigation */}
      <div className="smithing-tabs">
        <button 
          className={`tab-button ${activeTab === 'smelting' ? 'active' : ''}`}
          onClick={() => setActiveTab('smelting')}
        >
          Smelting
        </button>
        <button 
          className={`tab-button ${activeTab === 'smithing' ? 'active' : ''}`}
          onClick={() => setActiveTab('smithing')}
        >
          Smithing
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className="smithing-message">
          {message}
        </div>
      )}

      {/* Smelting Tab */}
      {activeTab === 'smelting' && (
        <div className="smithing-content">
          <h4>Ore Smelting</h4>
          <div className="recipe-list">
            {availableSmeltingRecipes.map(recipe => (
              <div 
                key={recipe.id} 
                className={`recipe-item ${canPlayerSmelt(recipe) ? 'available' : 'unavailable'}`}
              >
                <div className="recipe-header">
                  <span className="recipe-name">{recipe.name}</span>
                  <span className="recipe-level">Lvl {recipe.requiredLevel}</span>
                </div>
                <div className="recipe-materials">
                  Materials: {formatMaterials(recipe.materials)}
                </div>
                <div className="recipe-result">
                  Result: {recipe.result.quantity}x {recipe.result.itemId.replace('_', ' ')}
                </div>
                <div className="recipe-xp">
                  XP: {recipe.experience}
                </div>
                <button 
                  className="recipe-button"
                  onClick={() => handleSmelt(recipe)}
                  disabled={!canPlayerSmelt(recipe)}
                >
                  Smelt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smithing Tab */}
      {activeTab === 'smithing' && (
        <div className="smithing-content">
          <h4>Item Smithing</h4>
          <div className="recipe-list">
            {availableSmithingRecipes.map(recipe => (
              <div 
                key={recipe.id} 
                className={`recipe-item ${canPlayerSmith(recipe) ? 'available' : 'unavailable'}`}
              >
                <div className="recipe-header">
                  <span className="recipe-name">{recipe.name}</span>
                  <span className="recipe-level">Lvl {recipe.requiredLevel}</span>
                </div>
                <div className="recipe-materials">
                  Bars: {formatBars(recipe.bars)}
                </div>
                <div className="recipe-result">
                  Result: {recipe.result.quantity}x {recipe.result.itemId.replace('_', ' ')}
                </div>
                <div className="recipe-xp">
                  XP: {recipe.experience}
                </div>
                <button 
                  className="recipe-button"
                  onClick={() => handleSmith(recipe)}
                  disabled={!canPlayerSmith(recipe)}
                >
                  Smith
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmithingPanel;
