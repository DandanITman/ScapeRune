export interface AudioSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  soundEffectsVolume: number; // 0-1
  ambientVolume: number; // 0-1
  muteAll: boolean;
  muteMusic: boolean;
  muteSoundEffects: boolean;
  muteAmbient: boolean;
  enableSound: boolean; // Legacy compatibility
  effectVolume: number; // Legacy compatibility (0-100)
}

export interface SoundEffect {
  id: string;
  url: string;
  volume?: number;
  loop?: boolean;
  category: 'effect' | 'music' | 'ambient';
}

export class AudioSystem {
  private settings: AudioSettings;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private currentMusic?: HTMLAudioElement;
  private soundLibrary: SoundEffect[] = [];
  private initialized = false;

  constructor() {
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.6,
      soundEffectsVolume: 0.8,
      ambientVolume: 0.4,
      muteAll: false,
      muteMusic: false,
      muteSoundEffects: false,
      muteAmbient: false,
      enableSound: true, // Legacy compatibility
      effectVolume: 50, // Legacy compatibility
    };

    this.initializeSoundLibrary();
  }

  private initializeSoundLibrary() {
    // Define sound effects library (URLs would be actual audio files)
    this.soundLibrary = [
      // UI Sounds
      { id: 'ui_click', url: '/sounds/ui/click.ogg', category: 'effect' },
      { id: 'ui_hover', url: '/sounds/ui/hover.ogg', category: 'effect' },
      { id: 'ui_error', url: '/sounds/ui/error.ogg', category: 'effect' },
      
      // Combat Sounds
      { id: 'combat_hit', url: '/sounds/combat/hit.ogg', category: 'effect' },
      { id: 'combat_miss', url: '/sounds/combat/miss.ogg', category: 'effect' },
      { id: 'combat_block', url: '/sounds/combat/block.ogg', category: 'effect' },
      { id: 'combat_death', url: '/sounds/combat/death.ogg', category: 'effect' },
      
      // Skill Sounds
      { id: 'skill_woodcutting', url: '/sounds/skills/woodcutting.ogg', category: 'effect' },
      { id: 'skill_mining', url: '/sounds/skills/mining.ogg', category: 'effect' },
      { id: 'skill_fishing', url: '/sounds/skills/fishing.ogg', category: 'effect' },
      { id: 'skill_cooking', url: '/sounds/skills/cooking.ogg', category: 'effect' },
      { id: 'skill_smithing', url: '/sounds/skills/smithing.ogg', category: 'effect' },
      { id: 'skill_levelup', url: '/sounds/skills/levelup.ogg', category: 'effect' },
      
      // Magic Sounds
      { id: 'magic_cast', url: '/sounds/magic/cast.ogg', category: 'effect' },
      { id: 'magic_teleport', url: '/sounds/magic/teleport.ogg', category: 'effect' },
      { id: 'magic_heal', url: '/sounds/magic/heal.ogg', category: 'effect' },
      
      // Prayer Sounds
      { id: 'prayer_activate', url: '/sounds/prayer/activate.ogg', category: 'effect' },
      { id: 'prayer_deactivate', url: '/sounds/prayer/deactivate.ogg', category: 'effect' },
      { id: 'prayer_bones', url: '/sounds/prayer/bones.ogg', category: 'effect' },
      
      // Item Sounds
      { id: 'item_pickup', url: '/sounds/items/pickup.ogg', category: 'effect' },
      { id: 'item_drop', url: '/sounds/items/drop.ogg', category: 'effect' },
      { id: 'item_equip', url: '/sounds/items/equip.ogg', category: 'effect' },
      { id: 'item_eat', url: '/sounds/items/eat.ogg', category: 'effect' },
      { id: 'item_drink', url: '/sounds/items/drink.ogg', category: 'effect' },
      
      // Background Music
      { id: 'music_scape_main', url: '/sounds/music/scape_main.ogg', category: 'music', loop: true },
      { id: 'music_harmony', url: '/sounds/music/harmony.ogg', category: 'music', loop: true },
      { id: 'music_medieval', url: '/sounds/music/medieval.ogg', category: 'music', loop: true },
      { id: 'music_adventure', url: '/sounds/music/adventure.ogg', category: 'music', loop: true },
      
      // Ambient Sounds
      { id: 'ambient_forest', url: '/sounds/ambient/forest.ogg', category: 'ambient', loop: true },
      { id: 'ambient_town', url: '/sounds/ambient/town.ogg', category: 'ambient', loop: true },
      { id: 'ambient_dungeon', url: '/sounds/ambient/dungeon.ogg', category: 'ambient', loop: true },
      { id: 'ambient_water', url: '/sounds/ambient/water.ogg', category: 'ambient', loop: true }
    ];
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create a user gesture handler for browsers that require it
      await this.createUserGestureHandler();
      this.initialized = true;
      console.log('Audio system initialized');
    } catch (error) {
      console.warn('Audio system initialization failed:', error);
    }
  }

  private async createUserGestureHandler() {
    return new Promise<void>((resolve) => {
      const handleUserGesture = () => {
        // Create a silent audio context to enable audio
        const silentAudio = new Audio();
        silentAudio.volume = 0;
        silentAudio.play().catch(() => {});
        
        document.removeEventListener('click', handleUserGesture);
        document.removeEventListener('keydown', handleUserGesture);
        resolve();
      };

      document.addEventListener('click', handleUserGesture);
      document.addEventListener('keydown', handleUserGesture);
      
      // Resolve immediately if already interacted
      setTimeout(() => {
        handleUserGesture();
      }, 100);
    });
  }

  private async loadSound(soundId: string): Promise<HTMLAudioElement | null> {
    const soundDef = this.soundLibrary.find(s => s.id === soundId);
    if (!soundDef) {
      console.warn(`Sound definition not found: ${soundId}`);
      return null;
    }

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = soundDef.loop || false;
      
      // For now, we'll create silent placeholder audio since we don't have actual files
      // In a real implementation, you would use: audio.src = soundDef.url;
      
      this.sounds.set(soundId, audio);
      return audio;
    } catch (error) {
      console.warn(`Failed to load sound: ${soundId}`, error);
      return null;
    }
  }

  async playSound(soundId: string, volume?: number): Promise<void> {
    if (!this.settings.enableSound) return;

    let audio = this.sounds.get(soundId);
    if (!audio) {
      const loadedAudio = await this.loadSound(soundId);
      if (!loadedAudio) return;
      audio = loadedAudio;
    }

    const soundDef = this.soundLibrary.find(s => s.id === soundId);
    if (!soundDef) return;

    // Calculate volume based on category and settings
    let finalVolume = volume || soundDef.volume || 1;
    
    switch (soundDef.category) {
      case 'effect':
        finalVolume *= (this.settings.effectVolume / 100);
        break;
      case 'music':
        finalVolume *= (this.settings.musicVolume / 100);
        break;
      case 'ambient':
        finalVolume *= (this.settings.ambientVolume / 100);
        break;
    }

    audio.volume = Math.max(0, Math.min(1, finalVolume));

    try {
      audio.currentTime = 0; // Reset to beginning
      await audio.play();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundId}`, error);
    }
  }

  async playMusic(musicId: string): Promise<void> {
    if (!this.settings.enableSound) return;

    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    const music = await this.loadSound(musicId);
    if (!music) return;

    this.currentMusic = music;
    music.volume = this.settings.musicVolume / 100;
    
    try {
      await music.play();
    } catch (error) {
      console.warn(`Failed to play music: ${musicId}`, error);
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = undefined;
    }
  }

  stopSound(soundId: string) {
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  stopAllSounds() {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.stopMusic();
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update current music volume
    if (this.currentMusic) {
      this.currentMusic.volume = this.settings.musicVolume / 100;
    }

    // Update all playing sounds
    this.sounds.forEach((audio, soundId) => {
      if (!audio.paused) {
        const soundDef = this.soundLibrary.find(s => s.id === soundId);
        if (soundDef) {
          let volume = 1;
          switch (soundDef.category) {
            case 'effect':
              volume = this.settings.effectVolume / 100;
              break;
            case 'music':
              volume = this.settings.musicVolume / 100;
              break;
            case 'ambient':
              volume = this.settings.ambientVolume / 100;
              break;
          }
          audio.volume = volume;
        }
      }
    });
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Convenience methods for common game events
  playUIClick() { this.playSound('ui_click'); }
  playUIHover() { this.playSound('ui_hover'); }
  playUIError() { this.playSound('ui_error'); }
  
  playCombatHit() { this.playSound('combat_hit'); }
  playCombatMiss() { this.playSound('combat_miss'); }
  playCombatBlock() { this.playSound('combat_block'); }
  
  playSkillAction(skill: string) {
    this.playSound(`skill_${skill.toLowerCase()}`);
  }
  
  playLevelUp() { this.playSound('skill_levelup'); }
  
  playItemPickup() { this.playSound('item_pickup'); }
  playItemDrop() { this.playSound('item_drop'); }
  playItemEquip() { this.playSound('item_equip'); }
  playItemEat() { this.playSound('item_eat'); }
  
  playMagicCast() { this.playSound('magic_cast'); }
  playMagicTeleport() { this.playSound('magic_teleport'); }
  
  playPrayerActivate() { this.playSound('prayer_activate'); }
  playPrayerDeactivate() { this.playSound('prayer_deactivate'); }
  playBoneBury() { this.playSound('prayer_bones'); }

  // Background music control
  startMainTheme() { this.playMusic('music_scape_main'); }
  startHarmony() { this.playMusic('music_harmony'); }
  startMedieval() { this.playMusic('music_medieval'); }
  startAdventure() { this.playMusic('music_adventure'); }

  // Get available sounds for debugging
  getAvailableSounds(): string[] {
    return this.soundLibrary.map(s => s.id);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
