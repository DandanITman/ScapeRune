import React from 'react';
import './TutorialPanel.css';

interface TutorialPanelProps {
  tutorialSystem: {
    getCurrentStep: () => TutorialStep;
    getTutorialProgress: () => { current: number; total: number; percentage: number };
  };
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  objectiveText: string;
  area: string;
  completed: boolean;
  npcSpeaker?: string;
}

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ tutorialSystem }) => {
  const [currentStep, setCurrentStep] = React.useState<TutorialStep | null>(null);
  const [progress, setProgress] = React.useState({ current: 0, total: 7, percentage: 0 });
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (tutorialSystem) {
      const updateTutorial = () => {
        setCurrentStep(tutorialSystem.getCurrentStep());
        setProgress(tutorialSystem.getTutorialProgress());
      };
      
      updateTutorial();
      const interval = setInterval(updateTutorial, 1000);
      return () => clearInterval(interval);
    }
  }, [tutorialSystem]);

  if (!isVisible || !currentStep) {
    return (
      <div className="tutorial-toggle">
        <button onClick={() => setIsVisible(true)} className="tutorial-show-btn">
          📚 Show Tutorial
        </button>
      </div>
    );
  }

  const getAreaDisplayName = (area: string): string => {
    switch (area) {
      case 'spawn_house': return '🏠 Spawn House';
      case 'blacksmith': return '⚒️ Blacksmith Shop';
      case 'underground': return '🕳️ Underground';
      case 'boat': return '⛵ Boat Dock';
      case 'main_area': return '🌍 Main Area';
      default: return area;
    }
  };

  const getStepIcon = (stepId: string): string => {
    switch (stepId) {
      case 'welcome': return '👋';
      case 'movement': return '🚶';
      case 'smithing_basics': return '⚒️';
      case 'make_dagger': return '🗡️';
      case 'underground_exploration': return '🕳️';
      case 'final_preparations': return '📋';
      case 'departure': return '⛵';
      default: return '📋';
    }
  };

  return (
    <div className="tutorial-panel">
      <div className="tutorial-header">
        <div className="tutorial-title">
          <span className="tutorial-icon">🎓</span>
          Tutorial Island
        </div>
        <button 
          className="tutorial-hide-btn"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>

      <div className="tutorial-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {progress.current + 1} of {progress.total} ({progress.percentage}%)
        </div>
      </div>

      <div className="current-step">
        <div className="step-header">
          <span className="step-icon">{getStepIcon(currentStep.id)}</span>
          <h3 className="step-title">{currentStep.title}</h3>
        </div>
        
        <div className="step-description">
          {currentStep.description}
        </div>

        <div className="step-objective">
          <div className="objective-label">Objective:</div>
          <div className="objective-text">{currentStep.objectiveText}</div>
        </div>

        <div className="step-location">
          <div className="location-label">Location:</div>
          <div className="location-text">{getAreaDisplayName(currentStep.area)}</div>
        </div>

        {currentStep.npcSpeaker && (
          <div className="step-npc">
            <div className="npc-label">Talk to:</div>
            <div className="npc-text">💬 {currentStep.npcSpeaker}</div>
          </div>
        )}
      </div>

      <div className="tutorial-tips">
        <div className="tips-header">💡 Tips</div>
        <div className="tips-content">
          {currentStep.id === 'movement' && (
            <div>Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> keys to move around</div>
          )}
          {currentStep.id === 'smithing_basics' && (
            <div>Click on NPCs to talk to them</div>
          )}
          {currentStep.id === 'make_dagger' && (
            <div>Click on the anvil to start smithing</div>
          )}
          {currentStep.id === 'underground_exploration' && (
            <div>Click on the stairs to go underground</div>
          )}
          {currentStep.id === 'departure' && (
            <div>Click on the boat when you're ready to leave</div>
          )}
        </div>
      </div>

      <div className="tutorial-controls">
        <button 
          className="tutorial-btn tutorial-btn-secondary"
          onClick={() => {
            // Skip tutorial functionality
            console.log('Skipping tutorial...');
          }}
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
};
