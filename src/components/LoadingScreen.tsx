import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';
import type { LoadingProgress } from '../systems/LoadingSystem';

interface LoadingScreenProps {
  progress: LoadingProgress;
  onComplete?: () => void;
  showTips?: boolean;
}

const LOADING_TIPS = [
  "💡 Click and hold the mouse button to move your character around the world.",
  "🎒 Right-click items in your inventory to use, equip, or examine them.",
  "⚔️ Combat is turn-based - time your attacks and blocks carefully.",
  "🌳 Different trees and rocks require different skill levels to harvest.",
  "🎯 Level up your skills by using them - practice makes perfect!",
  "💰 Visit shops to buy and sell items, or use banks to store your treasures.",
  "🏃 The Agility skill allows you to take shortcuts and move faster.",
  "🗡️ Equipment has level requirements - check before trying to equip items.",
  "📜 Talk to NPCs with yellow dots above their heads for quests.",
  "🔮 Magic spells require runes as ammunition - stock up before adventuring!",
  "🏹 Ranged combat lets you attack from a distance, but you need arrows or bolts.",
  "🙏 Prayer provides temporary bonuses and protection in combat.",
  "⚗️ Herblore allows you to create powerful potions with various effects.",
  "🔥 Firemaking provides light and is required for some activities.",
  "👤 Thieving lets you pickpocket NPCs and steal from stalls and chests.",
  "🏰 Explore different areas to find new resources and opportunities."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  onComplete,
  showTips = true
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Rotate tips every 4 seconds
  useEffect(() => {
    if (!showTips) return;
    
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showTips]);

  // Handle completion
  useEffect(() => {
    if (progress.percentage >= 100 && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }, 1000);
    }
  }, [progress.percentage, isComplete, onComplete]);

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'initializing': return '🚀';
      case 'loading critical assets': return '📦';
      case 'loading all assets': return '🎨';
      case 'loading assets': return '⚡';
      case 'complete': return '✅';
      default: return '⏳';
    }
  };

  const formatCurrentItem = (item: string) => {
    if (!item) return '';
    
    // Extract filename from path and make it readable
    const filename = item.split('/').pop() || item;
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ') // Replace underscores and dashes with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  return (
    <div className={`loading-screen ${isComplete ? 'loading-complete' : ''} ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          ScapeRune
        </div>
        
        <div className="loading-subtitle">
          A Classic RuneScape Inspired Adventure
        </div>

        <div className="loading-progress">
          <div className="progress-text">
            {getStageIcon(progress.stage)} {progress.stage}
          </div>
          
          <div className="progress-percentage">
            {progress.percentage}%
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          {progress.currentItem && (
            <div className="progress-item">
              Loading: {formatCurrentItem(progress.currentItem)}
            </div>
          )}
          
          <div className="progress-stage">
            {progress.loaded} / {progress.total} assets loaded
          </div>
        </div>

        {showTips && !isComplete && (
          <div className="loading-tips">
            <div className="loading-tip" key={currentTip}>
              {LOADING_TIPS[currentTip]}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="loading-tips">
            <div className="loading-tip">
              🎉 Welcome to ScapeRune! Your adventure awaits...
            </div>
          </div>
        )}
      </div>

      <div className="loading-credits">
        <div>Inspired by RuneScape Classic</div>
        <div>Built with Three.js & React</div>
      </div>

      <div className="loading-version">
        v1.0.0-alpha
      </div>
    </div>
  );
};
