import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  smoothCamera: boolean;
  vsync: boolean;
  particles: boolean;
  antiAliasing: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
  muteWhenUnfocused: boolean;
}

export interface GameSettings {
  showTutorialHints: boolean;
  autoSave: boolean;
  confirmActions: boolean;
  showExperienceDrops: boolean;
  showDamageNumbers: boolean;
  chatFilter: boolean;
}

export interface SettingsState {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  game: GameSettings;
  
  // Actions
  updateGraphics: (settings: Partial<GraphicsSettings>) => void;
  updateAudio: (settings: Partial<AudioSettings>) => void;
  updateGame: (settings: Partial<GameSettings>) => void;
  resetToDefaults: () => void;
}

const defaultGraphicsSettings: GraphicsSettings = {
  quality: 'medium',
  shadows: true,
  smoothCamera: true,
  vsync: false,
  particles: true,
  antiAliasing: true,
};

const defaultAudioSettings: AudioSettings = {
  enabled: true,
  musicVolume: 50,
  soundEffectsVolume: 75,
  muteWhenUnfocused: false,
};

const defaultGameSettings: GameSettings = {
  showTutorialHints: true,
  autoSave: true,
  confirmActions: false,
  showExperienceDrops: true,
  showDamageNumbers: true,
  chatFilter: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      graphics: defaultGraphicsSettings,
      audio: defaultAudioSettings,
      game: defaultGameSettings,

      updateGraphics: (newSettings) => {
        set((state) => ({
          graphics: { ...state.graphics, ...newSettings }
        }));
        
        // Apply graphics settings to the game
        const settings = { ...get().graphics, ...newSettings };
        applyGraphicsSettings(settings);
      },

      updateAudio: (newSettings) => {
        set((state) => ({
          audio: { ...state.audio, ...newSettings }
        }));
        
        // Apply audio settings to the game
        const settings = { ...get().audio, ...newSettings };
        applyAudioSettings(settings);
      },

      updateGame: (newSettings) => {
        set((state) => ({
          game: { ...state.game, ...newSettings }
        }));
      },

      resetToDefaults: () => {
        set({
          graphics: defaultGraphicsSettings,
          audio: defaultAudioSettings,
          game: defaultGameSettings,
        });
        
        applyGraphicsSettings(defaultGraphicsSettings);
        applyAudioSettings(defaultAudioSettings);
      },
    }),
    {
      name: 'scaperune-settings',
      version: 1,
    }
  )
);

// Apply graphics settings to the game
function applyGraphicsSettings(settings: GraphicsSettings) {
  const root = document.documentElement;
  
  // Quality settings
  root.style.setProperty('--graphics-quality', settings.quality);
  
  // Shadow settings
  if (settings.shadows) {
    root.style.setProperty('--enable-shadows', '1');
    root.style.setProperty('--box-shadow-intensity', '1');
  } else {
    root.style.setProperty('--enable-shadows', '0');
    root.style.setProperty('--box-shadow-intensity', '0');
  }
  
  // Performance optimizations based on quality
  switch (settings.quality) {
    case 'low':
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--blur-intensity', '0px');
      root.style.setProperty('--gradient-complexity', 'none');
      break;
    case 'medium':
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--blur-intensity', '2px');
      root.style.setProperty('--gradient-complexity', 'linear-gradient');
      break;
    case 'high':
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--blur-intensity', '4px');
      root.style.setProperty('--gradient-complexity', 'radial-gradient');
      break;
  }
  
  // Particle effects
  root.style.setProperty('--particles-enabled', settings.particles ? '1' : '0');
  
  // Anti-aliasing
  root.style.setProperty('--antialiasing', settings.antiAliasing ? 'auto' : 'none');
}

// Apply audio settings to the game
function applyAudioSettings(settings: AudioSettings) {
  // Get all audio elements
  const audioElements = document.querySelectorAll('audio');
  const videoElements = document.querySelectorAll('video');
  
  // Apply master volume and mute
  [...audioElements, ...videoElements].forEach((element) => {
    if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
      element.muted = !settings.enabled;
      
      // Apply volume based on type
      if (element.classList.contains('music')) {
        element.volume = settings.musicVolume / 100;
      } else {
        element.volume = settings.soundEffectsVolume / 100;
      }
    }
  });
  
  // Store settings for future audio elements
  (window as any).audioSettings = settings;
  
  // Handle window focus/blur for mute when unfocused
  if (settings.muteWhenUnfocused) {
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
  } else {
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
  }
}

function handleWindowBlur() {
  const audioElements = document.querySelectorAll('audio, video');
  audioElements.forEach((element) => {
    if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
      element.muted = true;
    }
  });
}

function handleWindowFocus() {
  const settings = (window as any).audioSettings;
  if (settings?.enabled) {
    const audioElements = document.querySelectorAll('audio, video');
    audioElements.forEach((element) => {
      if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
        element.muted = false;
      }
    });
  }
}

// Initialize settings on page load
export function initializeSettings() {
  const store = useSettingsStore.getState();
  applyGraphicsSettings(store.graphics);
  applyAudioSettings(store.audio);
}
