import * as THREE from 'three';
import { CombatSystem } from '../systems/CombatSystem';
import type { Combatant, CombatStyle } from '../systems/CombatSystem';
import { WoodcuttingSystem } from '../systems/WoodcuttingSystem';
import { MiningSystem } from '../systems/MiningSystem';
import { FishingSystem } from '../systems/FishingSystem';
import { SmithingSystem } from '../systems/SmithingSystem';
import { AgilitySystem } from '../systems/AgilitySystem';
import { ThievingSystem } from '../systems/ThievingSystem';
import { HerbloreSystem } from '../systems/HerbloreSystem';
import { FiremakingSystem } from '../systems/FiremakingSystem';
import { DropSystem } from '../systems/DropSystem';
import { GraphicsSystem } from '../systems/GraphicsSystem';
import { GraphicsEnhancementSystem } from '../systems/GraphicsEnhancementSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { PerformanceSystem } from '../systems/PerformanceSystem';
import { PerformanceOptimizationSystem } from '../systems/PerformanceOptimizationSystem';
import { LoadingSystem } from '../systems/LoadingSystem';
import { MagicSystem } from '../systems/MagicSystem';
import type { SpellCastResult } from '../systems/MagicSystem';
import type { DroppedItem } from '../systems/DropSystem';
import { ModelLoader } from '../utils/ModelLoader';
import { useGameStore } from '../store/gameStore';
import type { Equipment, InventorySlot } from '../types/inventory';
import { createHumanCharacterModel, animateWalking, stopWalking } from '../utils/CharacterModelUtils';

// Define combat-related interfaces for better type safety
interface PlayerCombatStats {
  attack: number;
  strength: number;
  defense: number;
  hits: number;
  currentHits: number;
}

interface CombatExperience {
  attack: number;
  strength: number;
  defense: number;
  hits: number;
}

interface CombatResult {
  success: boolean;
  damage: number;
  xp: CombatExperience;
  npcDead: boolean;
}

interface CombatEvent {
  type: 'player_attack' | 'npc_attack';
  result: CombatResult | { success: boolean; damage: number; playerDead: boolean };
  npc: THREE.Object3D;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private isRunning = false;
  private frameCount = 0;
  private lastTime = 0;

  // Game objects
  private player: THREE.Group | null = null;
  private terrain: THREE.Mesh | null = null;
  private npcs: THREE.Object3D[] = [];
  private trees: THREE.Group[] = [];
  private droppedItemMeshes: THREE.Mesh[] = [];
  
  // Skill systems
  private combatSystem = new CombatSystem();
  private woodcuttingSystem = new WoodcuttingSystem();
  private miningSystem = new MiningSystem();
  private fishingSystem = new FishingSystem();
  private smithingSystem = new SmithingSystem();
  private agilitySystem!: AgilitySystem;
  private thievingSystem = new ThievingSystem();
  private herbloreSystem = new HerbloreSystem();
  private firemakingSystem!: FiremakingSystem;
  private magicSystem = new MagicSystem();
  private dropSystem = new DropSystem();
  private modelLoader = new ModelLoader();
  
  // Phase 10 systems
  private graphicsSystem: GraphicsSystem | null = null;
  private graphicsEnhancementSystem: GraphicsEnhancementSystem | null = null;
  private audioSystem = new AudioSystem();
  private performanceSystem: PerformanceSystem | null = null;
  private performanceOptimizationSystem: PerformanceOptimizationSystem | null = null;
  private loadingSystem = new LoadingSystem();
  
  // Combat state
  private inCombat = false;
  private combatTarget: THREE.Object3D | null = null;
  private combatInterval: number | null = null;
  private combatCallback: ((result: CombatEvent) => void) | null = null;
  
  // NPC AI and animation properties
  private npcUpdateInterval: number | null = null;
  private npcAnimations = new Map<string, { 
    startTime: number, 
    type: 'bounce' | 'idle' | 'combat_jump', 
    targetY: number,
    originalPosition?: THREE.Vector3,
    targetPosition?: THREE.Vector3
  }>();
  private lastNpcMovementTime = 0;
  private droppedItemAnimations = new Map<string, { baseY: number, startTime: number }>();
  
  // Movement system
  private targetPosition: THREE.Vector3 | null = null;
  private isMoving = false;
  private movementSpeed = 2.0; // units per second
  
  // Animation system
  private isWalking = false;
  private walkingStartTime = 0;
  private lastDirection = new THREE.Vector3(0, 0, 1); // Default facing forward

  // Chat bubble system
  private activeChatBubbles: Map<THREE.Object3D, THREE.Group> = new Map();
  private chatBubbleTimeout: Map<THREE.Object3D, number> = new Map();

  // Camera controls
  private cameraOffset = new THREE.Vector3(10, 10, 10);
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private cameraAngle = 0; // Horizontal rotation around player

  constructor(container: HTMLElement) {
    console.log('Initializing GameEngine...', container);
    
    try {
      // Initialize Three.js scene
      console.log('Creating Three.js scene...');
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
      console.log('Scene created successfully');

      // Setup camera for isometric view
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      console.log('Container dimensions:', width, 'x', height);
      
      this.camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
      );
      console.log('Camera created successfully');
      
      // Setup renderer with error handling
      console.log('Creating WebGL renderer...');
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: false
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = true;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;
      
      console.log('WebGL Renderer created successfully');
      container.appendChild(this.renderer.domElement);
      console.log('Canvas appended to container');
    } catch (error) {
      console.error('Failed to initialize WebGL renderer:', error);
      throw new Error(`WebGL initialization failed: ${error}`);
    }

    // Setup lighting
    console.log('Setting up lighting...');
    this.setupLighting();
    console.log('Lighting setup complete');
    
    // Create initial game world
    console.log('Creating terrain...');
    this.createTerrain();
    console.log('Terrain created');
    
    console.log('Creating player...');
    this.createPlayer();
    console.log('Player created');
    
    console.log('Creating NPCs...');
    // NPCs will be created asynchronously after initialization
    this.initializeAsyncComponents();
    console.log('NPCs will be loaded asynchronously...');
    
    console.log('Creating skill resources...');
    // Make skill resources creation async to handle custom ore models
    this.createSkillResources().then(() => {
      console.log('Skill resources created with custom models');
    }).catch((error) => {
      console.warn('Some skill resources failed to load custom models:', error);
    });
    console.log('Skill resources loading started...');
    
    // Position camera in isometric view
    console.log('Setting up camera...');
    this.camera.position.set(10, 10, 10); // Further back for better view
    this.camera.lookAt(0, 0, 0); // Look at center where objects are
    console.log('Camera positioned at:', this.camera.position);
    console.log('Camera looking at:', { x: 0, y: 0, z: 0 });
    
    // Update camera to follow player
    this.updateCamera();
    console.log('Camera setup complete, final position:', this.camera.position);

    // Initialize Phase 10 systems
    console.log('Initializing Phase 10 systems...');
    this.initializePhase10Systems();
    console.log('Phase 10 systems initialized');

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('GameEngine setup complete');
  }

  private async initializeAsyncComponents(): Promise<void> {
    try {
      console.log('Preloading ore models...');
      const { OreModelLoader } = await import('../utils/OreModelLoader');
      await OreModelLoader.getInstance().preloadAllOres();
      console.log('Ore models preloaded successfully');
      
      console.log('Loading NPCs with custom models...');
      await this.createNPCs();
      console.log('NPCs created successfully');
    } catch (error) {
      console.error('Error loading async components:', error);
    }
  }

  private initializePhase10Systems(): void {
    try {
      // Initialize systems that require scene to be ready
      this.agilitySystem = new AgilitySystem(this.scene);
      this.firemakingSystem = new FiremakingSystem(this.scene);
      console.log('Late-initialized skill systems created');
      
      // Initialize Graphics System
      this.graphicsSystem = new GraphicsSystem(this.renderer, this.scene);
      console.log('Graphics System initialized');

      // Initialize Performance System
      this.performanceSystem = new PerformanceSystem(this.scene, this.camera, this.renderer);
      console.log('Performance System initialized');

      // Initialize Audio System
      this.audioSystem.initialize().then(() => {
        console.log('Audio System initialized');
      }).catch((error) => {
        console.warn('Audio System initialization failed:', error);
      });

      // Initialize Loading System
      this.loadingSystem.loadCriticalAssets().then(() => {
        console.log('Critical assets loaded');
      }).catch((error) => {
        console.warn('Some critical assets failed to load:', error);
      });

      // Setup system configurations
      this.configurePhase10Systems();
      
    } catch (error) {
      console.error('Failed to initialize Phase 10 systems:', error);
    }
  }

  private configurePhase10Systems(): void {
    // Configure Graphics System
    if (this.graphicsSystem) {
      this.graphicsSystem.updateSettings({
        quality: 'medium',
        enableShadows: true,
        smoothCamera: true,
        enableVSync: false,
        enableFog: true,
        antialias: true
      });
    }

    // Configure Performance System  
    if (this.performanceSystem) {
      this.performanceSystem.updateSettings({
        enableLOD: true,
        enableFrustumCulling: true,
        enableOcclusionCulling: false,
        maxDrawCalls: 1000,
        targetFPS: 60,
        enableObjectPooling: true
      });
    }
  }

  private setupLighting(): void {
    // Ambient light for general illumination - slightly warmer and brighter
    const ambientLight = new THREE.AmbientLight(0x606080, 0.4);
    this.scene.add(ambientLight);

    // Main directional light for shadows (sun) - warmer daylight
    const directionalLight = new THREE.DirectionalLight(0xFFE4B5, 1.0);
    directionalLight.position.set(30, 40, 20);
    directionalLight.castShadow = true;
    
    // Improved shadow settings for better quality
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
    directionalLight.shadow.normalBias = 0.02; // Reduce peter panning
    
    this.scene.add(directionalLight);

    // Add a secondary fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-20, 30, -10);
    fillLight.castShadow = false; // No shadows for fill light
    this.scene.add(fillLight);

    // Add atmospheric hemisphere light for realistic sky lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.2);
    this.scene.add(hemisphereLight);
  }

  private createTerrain(): void {
    try {
      // Create a proper grass terrain plane with texture
      const geometry = new THREE.PlaneGeometry(100, 100);
      
      // Create grass texture using canvas for procedural generation
      const grassTexture = this.createGrassTexture();
      grassTexture.wrapS = THREE.RepeatWrapping;
      grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(20, 20); // Repeat the texture for tiling
      
      const material = new THREE.MeshLambertMaterial({ 
        map: grassTexture,
        color: 0x9FD96F // Tint the grass slightly lighter
      });
      
      this.terrain = new THREE.Mesh(geometry, material);
      this.terrain.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      this.terrain.receiveShadow = true;
      this.terrain.userData.type = 'terrain';
      this.terrain.userData.walkable = true;
      this.terrain.name = 'terrain';
      this.scene.add(this.terrain);
      console.log('Grass terrain plane created successfully');

      // Create a cobblestone road/path with texture
      const roadGeometry = new THREE.PlaneGeometry(5, 50);
      
      // Create cobblestone texture
      const cobblestoneTexture = this.createCobblestoneTexture();
      cobblestoneTexture.wrapS = THREE.RepeatWrapping;
      cobblestoneTexture.wrapT = THREE.RepeatWrapping;
      cobblestoneTexture.repeat.set(3, 30); // Repeat for tiling
      
      const roadMaterial = new THREE.MeshLambertMaterial({ 
        map: cobblestoneTexture,
        color: 0xB0B0B0 // Slightly darker tint
      });
      
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(10, 0.01, 0); // Slightly above terrain
      road.userData.type = 'road';
      road.userData.walkable = true;
      road.name = 'road';
      road.receiveShadow = true;
      this.scene.add(road);
      console.log('Cobblestone road created successfully');

      // Trees will be created by createSkillResources()
    } catch (error) {
      console.error('Failed to create terrain:', error);
      throw error;
    }
  }

  private createGrassTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Base grass color
    ctx.fillStyle = '#7CFC00';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add grass blade details
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const length = 3 + Math.random() * 5;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y - length);
      ctx.stroke();
    }
    
    // Add some darker spots for variation
    ctx.fillStyle = '#6B8E23';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = 2 + Math.random() * 4;
      ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    return texture;
  }

  private createCobblestoneTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Base stone color
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    
    // Draw cobblestones
    const stoneSize = 16;
    for (let x = 0; x < 128; x += stoneSize) {
      for (let y = 0; y < 128; y += stoneSize) {
        // Add some randomness to stone positions
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;
        
        // Stone color variation
        const grayValue = 100 + Math.random() * 60;
        ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        
        // Draw rounded rectangle for stone
        const stoneX = x + offsetX;
        const stoneY = y + offsetY;
        const stoneW = stoneSize - 2;
        const stoneH = stoneSize - 2;
        
        ctx.beginPath();
        ctx.roundRect(stoneX, stoneY, stoneW, stoneH, 2);
        ctx.fill();
        
        // Add darker edge for depth
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    return texture;
  }

  private createPlayer(): void {
    // Create a proper human character model
    this.player = createHumanCharacterModel({
      bodyColor: 0x0066CC, // Blue shirt
      skinColor: 0xFFDBC4, // Skin color
      scale: 1,
      clothing: {
        shirt: { color: 0x0066CC },
        pants: { color: 0x8B4513 }
      }
    });
    
    if (this.player) {
      // Set proper initial position with terrain height (terrain should already be created)
      const initialHeight = this.terrain ? this.getTerrainHeight(0, 0) + 0.05 : 0.05;
      this.player.position.set(0, initialHeight, 0);
      this.scene.add(this.player);
      console.log('Player character created at position:', this.player.position);
    }
  }

  private async createNPCs(): Promise<void> {
    // Create some basic NPCs around the world
    const npcData = [
      { name: 'Goblin', color: 0x228B22, position: { x: 5, z: 5 }, height: 1 },
      { name: 'Cow', color: 0xDEB887, position: { x: -8, z: 3 }, height: 0.5 },
      { name: 'Chicken', color: 0xFFFFFF, position: { x: 2, z: -7 }, height: 0 },
      { name: 'Rat', color: 0x696969, position: { x: -3, z: -2 }, height: 0 }
    ];

    for (const data of npcData) {
      try {
        const npc = await this.createNPC(data.name, data.color);
        // Position NPC with proper terrain height
        const terrainHeight = this.getTerrainHeight(data.position.x, data.position.z);
        npc.position.set(data.position.x, terrainHeight + 0.05, data.position.z);
        npc.userData.height = 2.0; // Store height for chat bubbles
        this.scene.add(npc);
        this.npcs.push(npc);
      } catch (error) {
        console.error(`Failed to create NPC ${data.name}:`, error);
        // Create fallback NPC
        const fallbackNpc = this.createFallbackNPC(data.name, data.color);
        const terrainHeight = this.getTerrainHeight(data.position.x, data.position.z);
        fallbackNpc.position.set(data.position.x, terrainHeight + 0.05, data.position.z);
        fallbackNpc.userData.height = 2.0; // Store height for chat bubbles
        this.scene.add(fallbackNpc);
        this.npcs.push(fallbackNpc);
      }
    }
  }

  private async createNPC(name: string, color: number): Promise<THREE.Object3D> {
    // Try to load custom model first
    if (this.modelLoader.hasCustomModel(name)) {
      try {
        console.log(`Loading custom model for ${name}...`);
        const model = await this.modelLoader.loadMonsterModel(name, {
          scale: 1,
          castShadow: true,
          receiveShadow: false
        });
        
        // Add combat stats and user data to the model
        const combatStats = CombatSystem.getNPCStats(name);
        model.userData = { 
          name, 
          type: 'npc',
          color, // Store the color for respawning
          stats: combatStats,
          equipment: CombatSystem.getNPCEquipment(),
          style: 'controlled' as CombatStyle,
          maxHits: combatStats.hits,
          currentHits: combatStats.currentHits
        };
        
        console.log(`Successfully loaded custom model for ${name}`);
        return model;
      } catch (error) {
        console.warn(`Failed to load custom model for ${name}, falling back to default:`, error);
      }
    }
    
    // Fall back to creating default geometry NPC
    return this.createFallbackNPC(name, color);
  }

  private createFallbackNPC(name: string, color: number): THREE.Object3D {
    // Check if this is a humanoid NPC or a monster
    const humanoidNPCs = ['goblin', 'guard', 'knight', 'wizard', 'archer'];
    
    // First try to get enhanced animal models
    const enhancedModel = this.modelLoader.getEnhancedMonsterModel(name);
    if (enhancedModel) {
      // Add combat stats to enhanced animal model
      const combatStats = CombatSystem.getNPCStats(name);
      
      enhancedModel.userData = { 
        name, 
        type: 'npc',
        color, // Store the color for respawning
        stats: combatStats,
        equipment: CombatSystem.getNPCEquipment(),
        style: 'controlled' as CombatStyle,
        maxHits: combatStats.hits,
        currentHits: combatStats.currentHits
      };
      
      return enhancedModel;
    }
    
    if (humanoidNPCs.includes(name.toLowerCase())) {
      // Create human-like character for humanoid NPCs
      const npc = createHumanCharacterModel({
        bodyColor: color,
        skinColor: 0xFFDBC4,
        scale: 0.9,
        clothing: {
          shirt: { color: color },
          pants: { color: 0x8B4513 }
        }
      });
      
      // Add combat stats to NPC
      const combatStats = CombatSystem.getNPCStats(name);
      
      // Store NPC data including combat info
      npc.userData = { 
        name, 
        type: 'npc',
        color, // Store the color for respawning
        stats: combatStats,
        equipment: CombatSystem.getNPCEquipment(),
        style: 'controlled' as CombatStyle,
        maxHits: combatStats.hits,
        currentHits: combatStats.currentHits
      };
      
      return npc;
    } else {
      // Create monster using appropriate geometry for non-humanoid creatures
      const bodyGeometry = this.modelLoader.getDefaultMonsterGeometry(name);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color });
      const npc = new THREE.Mesh(bodyGeometry, bodyMaterial);
      npc.castShadow = true;
      
      // Add combat stats to NPC
      const combatStats = CombatSystem.getNPCStats(name);
      
      // Store NPC data including combat info
      npc.userData = { 
        name, 
        type: 'npc',
        color, // Store the color for respawning
        stats: combatStats,
        equipment: CombatSystem.getNPCEquipment(),
        style: 'controlled' as CombatStyle,
        maxHits: combatStats.hits,
        currentHits: combatStats.currentHits
      };
      
      return npc;
    }
  }

  private async createSkillResources(): Promise<void> {
    // Create trees for woodcutting
    this.createTrees();
    
    // Create rocks for mining (now async for custom models)
    await this.createRocks();
    
    // Create fishing spots
    this.createFishingSpots();
    
    // Create smithing structures
    this.createSmithingStructures();
  }

  private createTrees(): void {
    const treeData = [
      { type: 'normal', position: { x: -10, z: -10 } },
      { type: 'normal', position: { x: -12, z: -8 } },
      { type: 'oak', position: { x: 8, z: -12 } },
      { type: 'willow', position: { x: 15, z: 5 } },
      { type: 'maple', position: { x: -15, z: 8 } },
      { type: 'yew', position: { x: 20, z: -5 } },
      { type: 'magic', position: { x: -18, z: 15 } }
    ];

    treeData.forEach(data => {
      const position = new THREE.Vector3(data.position.x, 0, data.position.z);
      const treeMesh = this.woodcuttingSystem.createTreeMesh(data.type);
      treeMesh.position.copy(position);
      this.scene.add(treeMesh);
      this.trees.push(treeMesh);

      // Add tree to woodcutting system
      this.woodcuttingSystem.addTree({
        type: data.type as 'normal' | 'oak' | 'willow' | 'maple' | 'yew' | 'magic',
        position,
        mesh: treeMesh,
        respawnTime: 0,
        isChopped: false
      });
    });
  }

  private async createRocks(): Promise<void> {
    const rockData = [
      { type: 'clay', position: { x: 12, z: 8 } },
      { type: 'copper', position: { x: 10, z: 10 } },
      { type: 'tin', position: { x: 8, z: 12 } },
      { type: 'iron', position: { x: -5, z: 12 } },
      { type: 'coal', position: { x: -8, z: 15 } },
      { type: 'gold', position: { x: 18, z: 10 } },
      { type: 'mithril', position: { x: -20, z: -8 } },
      { type: 'adamant', position: { x: 25, z: -10 } },
      { type: 'runite', position: { x: -25, z: 20 } }
    ];

    // Create rocks with custom models
    const rockPromises = rockData.map(async (data) => {
      const position = new THREE.Vector3(data.position.x, 0, data.position.z);
      const rockMesh = await this.miningSystem.createRockMesh(data.type);
      rockMesh.position.copy(position);
      this.scene.add(rockMesh);

      // Add rock to mining system
      this.miningSystem.addRock({
        type: data.type as 'clay' | 'copper' | 'tin' | 'iron' | 'silver' | 'coal' | 'gold' | 'gem' | 'mithril' | 'adamant' | 'runite',
        position,
        mesh: rockMesh,
        respawnTime: 0,
        isMined: false
      });
    });

    // Wait for all rocks to be created
    await Promise.all(rockPromises);
    console.log('All ore rocks created with custom models');
  }

  private createFishingSpots(): void {
    const fishingData = [
      { 
        type: 'net_bait', 
        position: { x: 5, z: 20 },
        fishTypes: ['shrimp', 'sardine', 'herring', 'anchovies'],
        equipment: ['net', 'rod']
      },
      { 
        type: 'lure_bait', 
        position: { x: -10, z: 25 },
        fishTypes: ['trout', 'pike', 'salmon'],
        equipment: ['fly_rod', 'rod']
      },
      { 
        type: 'harpoon_cage', 
        position: { x: 15, z: 25 },
        fishTypes: ['tuna', 'lobster', 'swordfish'],
        equipment: ['harpoon', 'lobster_pot']
      },
      { 
        type: 'big_net_harpoon', 
        position: { x: 0, z: 30 },
        fishTypes: ['mackerel', 'cod', 'bass', 'shark'],
        equipment: ['big_net', 'harpoon']
      }
    ];

    fishingData.forEach(data => {
      const position = new THREE.Vector3(data.position.x, 0, data.position.z);
      const spotMesh = this.fishingSystem.createFishingSpotMesh(data.type);
      spotMesh.position.copy(position);
      this.scene.add(spotMesh);

      // Add fishing spot to fishing system
      this.fishingSystem.addFishingSpot({
        type: data.type as 'net_bait' | 'lure_bait' | 'harpoon_cage' | 'cage_harpoon' | 'big_net_harpoon' | 'special',
        position,
        mesh: spotMesh,
        fishTypes: data.fishTypes,
        equipment: data.equipment
      });
    });
  }

  private createSmithingStructures(): void {
    // Create furnaces for smelting
    const furnacePositions = [
      { x: -5, z: 10 },
      { x: 5, z: 10 }
    ];

    furnacePositions.forEach(pos => {
      const position = new THREE.Vector3(pos.x, 0, pos.z);
      this.smithingSystem.addFurnace(this.scene, position);
    });

    // Create anvils for smithing
    const anvilPositions = [
      { x: -3, z: 12 },
      { x: 3, z: 12 }
    ];

    anvilPositions.forEach(pos => {
      const position = new THREE.Vector3(pos.x, 0, pos.z);
      const anvil = this.smithingSystem.createAnvilMesh();
      anvil.position.copy(position);
      this.scene.add(anvil);
    });
  }

  private updateCamera(): void {
    if (this.player) {
      this.cameraTarget.copy(this.player.position);
      
      // Calculate camera position based on angle and offset
      const distance = this.cameraOffset.length();
      const x = Math.sin(this.cameraAngle) * distance;
      const z = Math.cos(this.cameraAngle) * distance;
      
      this.camera.position.set(
        this.cameraTarget.x + x,
        this.cameraTarget.y + this.cameraOffset.y,
        this.cameraTarget.z + z
      );
      this.camera.lookAt(this.cameraTarget);
    }
  }

  public rotateCamera(deltaAngle: number): void {
    this.cameraAngle += deltaAngle;
    this.updateCamera();
  }

  public movePlayerTo(position: THREE.Vector3): void {
    if (this.player) {
      this.targetPosition = position.clone();
      // Adjust height to terrain level + minimal character height offset (feet touching ground)
      this.targetPosition.y = this.getTerrainHeight(position.x, position.z) + 0.05;
      this.isMoving = true;
      
      // Start walking animation
      if (!this.isWalking) {
        this.isWalking = true;
        this.walkingStartTime = performance.now();
      }
    }
  }
  
  private getTerrainHeight(x: number, z: number): number {
    // Cast a ray downward from high up to find the terrain height
    const raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0));
    
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    // Filter for terrain and road objects
    for (const intersect of intersects) {
      const obj = intersect.object;
      // Check if it's terrain, road, or walkable surface
      if (obj.userData.type === 'terrain' || 
          obj.userData.type === 'road' || 
          obj.userData.walkable === true ||
          obj.name.includes('terrain') ||
          obj.name.includes('road') ||
          obj.name.includes('floor')) {
        return intersect.point.y;
      }
    }
    
    // Default height if no terrain found
    return 0;
  }
  
  private updateMovement(deltaTime: number): void {
    // Disable movement during combat
    if (this.inCombat) {
      // Stop any current movement and walking animation
      if (this.isMoving && this.player) {
        this.isMoving = false;
        this.targetPosition = null;
        if (this.isWalking) {
          this.isWalking = false;
          stopWalking(this.player);
        }
      }
      return;
    }
    
    if (!this.player || !this.targetPosition || !this.isMoving) {
      // Stop walking animation if not moving
      if (this.isWalking && this.player) {
        this.isWalking = false;
        stopWalking(this.player);
      }
      return;
    }
    
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.player.position);
    const distance = direction.length();
    
    if (distance < 0.1) {
      // Reached destination
      this.player.position.copy(this.targetPosition);
      this.isMoving = false;
      this.targetPosition = null;
      
      // Stop walking animation
      if (this.isWalking) {
        this.isWalking = false;
        stopWalking(this.player);
      }
    } else {
      // Move towards target
      direction.normalize();
      
      // Make character face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      this.player.rotation.y = angle;
      this.lastDirection.copy(direction);
      
      // Apply walking animation
      if (this.isWalking) {
        const currentTime = (performance.now() - this.walkingStartTime) * 0.001; // Convert to seconds
        animateWalking(this.player, currentTime, 1.5); // Slightly faster walking animation
      }
      
      const moveDistance = this.movementSpeed * deltaTime;
      
      if (moveDistance >= distance) {
        // Will reach target this frame
        this.player.position.copy(this.targetPosition);
        this.isMoving = false;
        this.targetPosition = null;
        
        // Stop walking animation
        if (this.isWalking) {
          this.isWalking = false;
          stopWalking(this.player);
        }
      } else {
        // Move part of the way
        const newPosition = this.player.position.clone().add(direction.multiplyScalar(moveDistance));
        
        // Adjust height to terrain level (feet touching ground)
        newPosition.y = this.getTerrainHeight(newPosition.x, newPosition.z) + 0.05;
        
        this.player.position.copy(newPosition);
      }
    }
  }

  private updateSkillResources(): void {
    // Update tree respawns
    this.woodcuttingSystem.updateTrees();
    
    // Update rock respawns (pass scene for recreating custom models)
    this.miningSystem.updateRocks(this.scene);
    
    // Note: Fishing spots don't need respawning as they're always available
  }

  private updateChatBubbles(): void {
    // Update chat bubbles to always face the camera
    this.activeChatBubbles.forEach((bubble) => {
      const bubbleMesh = bubble.children[0];
      if (bubbleMesh) {
        // Calculate direction from bubble to camera
        const direction = new THREE.Vector3();
        direction.subVectors(this.camera.position, bubble.getWorldPosition(new THREE.Vector3()));
        direction.y = 0; // Keep bubble horizontal
        direction.normalize();
        
        // Make bubble face camera
        bubble.lookAt(bubble.position.clone().add(direction));
      }
    });
  }

  private updateNPCs(currentTime: number, deltaTime: number): void {
    // Random movement every 5 seconds for idle NPCs
    if (currentTime - this.lastNpcMovementTime > 5000) {
      this.lastNpcMovementTime = currentTime;
      this.updateNPCRandomMovement();
    }

    // Update NPC animations and behaviors
    this.npcs.forEach((npc) => {
      const npcId = `npc_${npc.id}`;
      
      // Combat behavior - face and follow player if in combat
      if (this.inCombat && this.combatTarget === npc && this.player) {
        this.updateNPCCombatBehavior(npc, deltaTime);
      }
      
      // Update animations (bouncing effects)
      this.updateNPCAnimations(npc, npcId, currentTime);
    });

    // Update player animations too
    if (this.player) {
      this.updateNPCAnimations(this.player, 'player', currentTime);
    }

    // Update dropped item floating animations
    this.updateDroppedItemAnimations(currentTime);
  }

  private updateDroppedItemAnimations(currentTime: number): void {
    this.droppedItemMeshes.forEach((itemMesh) => {
      const animationId = itemMesh.userData.animationId;
      if (animationId) {
        const animation = this.droppedItemAnimations.get(animationId);
        if (animation) {
          const elapsed = currentTime - animation.startTime;
          const floatOffset = Math.sin(elapsed * 0.003) * 0.1; // Slow floating up and down
          itemMesh.position.y = animation.baseY + floatOffset;
        }
      }
    });
  }

  private updateNPCRandomMovement(): void {
    this.npcs.forEach((npc) => {
      // Skip NPCs that are in combat
      if (this.inCombat && this.combatTarget === npc) {
        return;
      }

      // 30% chance for each NPC to move
      if (Math.random() < 0.3) {
        const currentPos = npc.position.clone();
        
        // Move within a small radius (1-2 units)
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.5 + Math.random() * 1.5;
        
        const newX = currentPos.x + Math.cos(angle) * distance;
        const newZ = currentPos.z + Math.sin(angle) * distance;
        
        // Get terrain height for new position
        const terrainHeight = this.getTerrainHeight(newX, newZ);
        
        // Smooth movement to new position
        const targetPos = new THREE.Vector3(newX, terrainHeight + 0.05, newZ);
        this.animateNPCMovement(npc, targetPos);
      }
    });
  }

  private updateNPCCombatBehavior(npc: THREE.Object3D, deltaTime: number): void {
    if (!this.player) return;

    const playerPos = this.player.position;
    const npcPos = npc.position;
    
    // Face the player
    const direction = new THREE.Vector3();
    direction.subVectors(playerPos, npcPos);
    direction.y = 0; // Keep horizontal
    direction.normalize();
    
    if (direction.length() > 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      npc.rotation.y = targetRotation;
    }

    // Follow player if too far (stay within 3 units)
    const distance = npcPos.distanceTo(playerPos);
    if (distance > 3) {
      const followDirection = direction.clone().multiplyScalar(deltaTime * 1.5);
      const newPos = npcPos.clone().add(followDirection);
      const terrainHeight = this.getTerrainHeight(newPos.x, newPos.z);
      npc.position.set(newPos.x, terrainHeight + 0.05, newPos.z);
    }
  }

  private updateNPCAnimations(npc: THREE.Object3D, npcId: string, currentTime: number): void {
    const animation = this.npcAnimations.get(npcId);
    
    if (animation) {
      const elapsed = currentTime - animation.startTime;
      
      if (animation.type === 'bounce') {
        // Bounce animation for combat
        const bounceProgress = elapsed / 300; // 300ms bounce
        
        if (bounceProgress <= 1) {
          // Create bounce effect (sine wave)
          const bounceHeight = Math.sin(bounceProgress * Math.PI) * 0.3;
          npc.position.y = animation.targetY + bounceHeight;
        } else {
          // Animation complete
          npc.position.y = animation.targetY;
          this.npcAnimations.delete(npcId);
        }
      } else if (animation.type === 'combat_jump') {
        // Combat jump animation - jump toward enemy and back
        const jumpDuration = 600; // 600ms total animation
        const jumpProgress = elapsed / jumpDuration;
        
        if (jumpProgress <= 1 && animation.originalPosition && animation.targetPosition) {
          // First half: jump toward enemy, second half: return to original position
          let currentTarget;
          let localProgress;
          
          if (jumpProgress <= 0.5) {
            // Jump toward enemy
            localProgress = jumpProgress * 2; // 0 to 1 in first half
            currentTarget = animation.targetPosition;
          } else {
            // Return to original position
            localProgress = (jumpProgress - 0.5) * 2; // 0 to 1 in second half
            currentTarget = animation.originalPosition;
            // Start from target position for return journey
            const startPos = animation.targetPosition;
            npc.position.lerpVectors(startPos, animation.originalPosition, localProgress);
          }
          
          if (jumpProgress <= 0.5) {
            // Moving toward enemy
            npc.position.lerpVectors(animation.originalPosition, currentTarget, localProgress);
          }
          
          // Add bounce height throughout the animation
          const bounceHeight = Math.sin(jumpProgress * Math.PI * 2) * 0.4; // Two bounces
          npc.position.y = animation.targetY + bounceHeight;
        } else {
          // Animation complete - return to original position
          if (animation.originalPosition) {
            npc.position.copy(animation.originalPosition);
            npc.position.y = animation.targetY;
          }
          this.npcAnimations.delete(npcId);
        }
      }
    }
  }

  private animateNPCMovement(npc: THREE.Object3D, targetPosition: THREE.Vector3): void {
    // Simple lerp movement over 1 second
    const startPos = npc.position.clone();
    const startTime = Date.now();
    
    // Calculate direction to face
    const direction = new THREE.Vector3().subVectors(targetPosition, startPos).normalize();
    const targetRotation = Math.atan2(direction.x, direction.z);
    
    const animateStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 1000, 1); // 1 second animation
      
      if (progress < 1) {
        npc.position.lerpVectors(startPos, targetPosition, progress);
        // Smoothly rotate to face movement direction
        npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, targetRotation, progress * 3);
        requestAnimationFrame(animateStep);
      } else {
        npc.position.copy(targetPosition);
        npc.rotation.y = targetRotation;
      }
    };
    
    animateStep();
  }

  private triggerNPCBounceAnimation(npc: THREE.Object3D): void {
    const npcId = `npc_${npc.id}`;
    this.npcAnimations.set(npcId, {
      startTime: Date.now(),
      type: 'bounce',
      targetY: npc.position.y
    });
  }

  private triggerPlayerBounceAnimation(): void {
    if (!this.player || !this.combatTarget) return;
    
    const playerId = 'player';
    const originalPos = this.player.position.clone();
    
    // Calculate position to jump toward (halfway to enemy)
    const enemyPos = this.combatTarget.position.clone();
    const direction = new THREE.Vector3().subVectors(enemyPos, originalPos).normalize();
    const jumpDistance = 0.8; // Jump 80% of the way toward enemy
    const targetPos = originalPos.clone().add(direction.multiplyScalar(jumpDistance));
    
    this.npcAnimations.set(playerId, {
      startTime: Date.now(),
      type: 'combat_jump',
      targetY: this.player.position.y,
      originalPosition: originalPos,
      targetPosition: targetPos
    });
  }

  private updatePhase10Systems(_deltaTime: number): void {
    // Suppress unused parameter warning - deltaTime may be used in future for system updates
    void _deltaTime;
    try {
      // Update Performance System (runs first for performance metrics)
      if (this.performanceSystem) {
        this.performanceSystem.update();
      }

      // Update Graphics System
      if (this.graphicsSystem) {
        // Graphics system doesn't need continuous updates for now
        // Updates are triggered by settings changes
      }

      // Audio system update is handled by user interactions
      // No continuous update needed for audio system

    } catch (error) {
      console.warn('Error updating Phase 10 systems:', error);
    }
  }

  public getGroundPosition(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Vector3 | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with terrain
    if (this.terrain) {
      const intersects = raycaster.intersectObject(this.terrain);
      if (intersects.length > 0) {
        return intersects[0].point;
      }
    }

    return null;
  }

  public getClickedNPC(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Object3D | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with NPCs (need to check children for .glb models)
    const intersects = raycaster.intersectObjects(this.npcs, true); // recursive = true for children
    if (intersects.length > 0) {
      // Find the top-level NPC object by traversing up the hierarchy
      let object = intersects[0].object;
      while (object.parent && !this.npcs.includes(object)) {
        object = object.parent;
      }
      return this.npcs.includes(object) ? object : null;
    }

    return null;
  }

  /**
   * Show a chat bubble above an NPC or player
   */
  public showChatBubble(character: THREE.Object3D, message: string, duration: number = 3000): void {
    // Remove existing chat bubble if any
    this.removeChatBubble(character);

    // Create chat bubble
    const bubble = this.createChatBubble(message);
    
    // Position bubble above character
    const characterHeight = character.userData.height || 2.0;
    bubble.position.set(0, characterHeight + 0.5, 0);
    
    // Add to character
    character.add(bubble);
    this.activeChatBubbles.set(character, bubble);

    // Set timeout to remove bubble
    const timeoutId = window.setTimeout(() => {
      this.removeChatBubble(character);
    }, duration);
    
    this.chatBubbleTimeout.set(character, timeoutId);
  }

  /**
   * Remove chat bubble from character
   */
  public removeChatBubble(character: THREE.Object3D): void {
    const existingBubble = this.activeChatBubbles.get(character);
    if (existingBubble) {
      character.remove(existingBubble);
      this.activeChatBubbles.delete(character);
    }

    const timeoutId = this.chatBubbleTimeout.get(character);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.chatBubbleTimeout.delete(character);
    }
  }

  /**
   * Create a 3D chat bubble with text
   */
  private createChatBubble(message: string): THREE.Group {
    const bubbleGroup = new THREE.Group();

    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = 512;
    canvas.height = 128;
    
    // Configure text style
    context.font = 'bold 24px Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw bubble background
    context.fillStyle = '#FFFFFF';
    context.strokeStyle = '#000000';
    context.lineWidth = 3;
    
    // Calculate text metrics
    const textMetrics = context.measureText(message);
    const textWidth = textMetrics.width + 40; // padding
    const bubbleWidth = Math.min(textWidth, canvas.width - 20);
    const bubbleHeight = 60;
    
    // Draw rounded rectangle bubble
    const x = (canvas.width - bubbleWidth) / 2;
    const y = (canvas.height - bubbleHeight) / 2;
    const radius = 15;
    
    // Manual rounded rectangle drawing for compatibility
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + bubbleWidth - radius, y);
    context.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + radius);
    context.lineTo(x + bubbleWidth, y + bubbleHeight - radius);
    context.quadraticCurveTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - radius, y + bubbleHeight);
    context.lineTo(x + radius, y + bubbleHeight);
    context.quadraticCurveTo(x, y + bubbleHeight, x, y + bubbleHeight - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw text
    context.fillStyle = '#000000';
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    
    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const bubbleMesh = new THREE.Mesh(geometry, material);
    
    // Make bubble always face camera
    bubbleMesh.lookAt(this.camera.position);
    
    bubbleGroup.add(bubbleMesh);
    return bubbleGroup;
  }

  /**
   * Handle NPC interaction with chat bubbles
   */
  public interactWithNPC(npc: THREE.Object3D): void {
    const npcName = npc.userData.name || 'NPC';
    
    // NPC-specific dialogue
    let message = "Hello there, adventurer!";
    
    if (npcName === 'Goblin') message = "Grrr! What you want?";
    else if (npcName === 'Cow') message = "Moo! *chews grass peacefully*";
    else if (npcName === 'Chicken') message = "Bawk bawk! *pecks at ground*";
    else if (npcName === 'Rat') message = "*squeaks and scurries*";
    else if (npcName.toLowerCase().includes('guard')) message = "Halt! State your business.";
    else if (npcName.toLowerCase().includes('wizard')) message = "Ah, a fellow seeker of knowledge!";
    else if (npcName.toLowerCase().includes('knight')) message = "For honor and glory!";
    
    this.showChatBubble(npc, message, 4000);
  }

  public getClickedDroppedItem(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Mesh | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with dropped items
    const intersects = raycaster.intersectObjects(this.droppedItemMeshes);
    if (intersects.length > 0) {
      return intersects[0].object as THREE.Mesh;
    }

    return null;
  }

  public getClickedTree(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Group | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with trees
    for (const tree of this.trees) {
      const intersects = raycaster.intersectObject(tree, true); // recursive for tree children
      if (intersects.length > 0) {
        return tree;
      }
    }

    return null;
  }

  public getClickedRock(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Group | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with rocks
    const rocks = this.miningSystem.getRocks();
    for (const rock of rocks) {
      if (rock.mesh) {
        const intersects = raycaster.intersectObject(rock.mesh, true); // recursive for rock children
        if (intersects.length > 0) {
          return rock.mesh;
        }
      }
    }

    return null;
  }

  public getClickedFishingSpot(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Group | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with fishing spots
    const fishingSpots = this.fishingSystem.getFishingSpots();
    for (const spot of fishingSpots) {
      if (spot.mesh) {
        const intersects = raycaster.intersectObject(spot.mesh, true); // recursive for spot children
        if (intersects.length > 0) {
          return spot.mesh;
        }
      }
    }

    return null;
  }

  /**
   * Calculate equipment bonuses from currently equipped items
   */
  private calculateEquipmentBonuses(equipment: Equipment): { weaponAim: number, weaponPower: number, armour: number } {
    let weaponAim = 0;
    let weaponPower = 0;
    let armour = 0;

    // Calculate bonuses from each equipped item
    Object.values(equipment).forEach(item => {
      if (item) {
        // Weapon bonuses affect both aim and power
        if (item.attackBonus) {
          weaponAim += item.attackBonus;
          weaponPower += item.attackBonus;
        }
        // Strength bonus affects weapon power
        if (item.strengthBonus) {
          weaponPower += item.strengthBonus;
        }
        // Defense bonus affects armour
        if (item.defenseBonus) {
          armour += item.defenseBonus;
        }
      }
    });

    return { weaponAim, weaponPower, armour };
  }

  public attackNPC(npc: THREE.Object3D, playerStats?: PlayerCombatStats, combatStyle?: string): CombatResult {
    if (!this.player) return { 
      success: false, 
      damage: 0, 
      xp: { attack: 0, strength: 0, defense: 0, hits: 0 }, 
      npcDead: false 
    };

    // Use provided player stats or defaults
    const stats = playerStats || {
      attack: 10,
      defense: 10,
      strength: 10,
      hits: 10,
      currentHits: 10
    };

    // Use provided combat style or default
    const style = combatStyle || 'accurate';

    // Get current equipment and calculate bonuses
    const currentEquipment = useGameStore.getState().player.equipment;
    const equipmentBonuses = this.calculateEquipmentBonuses(currentEquipment);

    // Create combatant objects
    const playerCombatant: Combatant = {
      stats: stats,
      equipment: equipmentBonuses,
      style: style as 'accurate' | 'aggressive' | 'defensive' | 'controlled',
      isPlayer: true,
      position: this.player.position,
      name: 'Player'
    };

    const npcCombatant: Combatant = {
      stats: npc.userData.stats,
      equipment: npc.userData.equipment,
      style: npc.userData.style,
      isPlayer: false,
      position: npc.position,
      name: npc.userData.name
    };

    // Perform attack
    const result = this.combatSystem.performAttack(playerCombatant, npcCombatant);

    // Update NPC health
    npc.userData.currentHits = npcCombatant.stats.currentHits;
    
    // Check if NPC is dead
    const npcDead = npcCombatant.stats.currentHits <= 0;
    
    if (npcDead) {
      // Generate drops for the killed monster
      const drops = this.dropSystem.generateDrops(npc.userData.name, {
        x: npc.position.x,
        y: npc.position.y + 0.1, // Slightly above ground
        z: npc.position.z
      });

      // Create visual representations for dropped items
      drops.forEach((drop, index) => {
        const dropMesh = this.createDroppedItemMesh(drop, index);
        this.scene.add(dropMesh);
      });

      // Store NPC data for respawning
      const npcData = {
        name: npc.userData.name,
        color: npc.userData.color || 0x666666, // Use stored color or default
        position: { x: npc.position.x, z: npc.position.z },
        height: npc.userData.height || 0
      };

      // Remove NPC from scene
      this.scene.remove(npc);
      const npcIndex = this.npcs.indexOf(npc);
      if (npcIndex > -1) {
        this.npcs.splice(npcIndex, 1);
      }

      // Schedule NPC respawn (30-60 seconds)
      const respawnTime = 30000 + Math.random() * 30000; // 30-60 seconds
      setTimeout(async () => {
        try {
          console.log(`Respawning ${npcData.name}...`);
          const newNpc = await this.createNPC(npcData.name, npcData.color);
          const terrainHeight = this.getTerrainHeight(npcData.position.x, npcData.position.z);
          newNpc.position.set(npcData.position.x, terrainHeight + 0.05, npcData.position.z);
          newNpc.userData.height = npcData.height;
          this.scene.add(newNpc);
          this.npcs.push(newNpc);
          console.log(`${npcData.name} respawned successfully`);
        } catch (error) {
          console.error(`Failed to respawn ${npcData.name}:`, error);
        }
      }, respawnTime);
    }

    return {
      success: result.hit,
      damage: result.damage,
      xp: {
        attack: result.attackXp,
        strength: result.strengthXp,
        defense: result.defenseXp,
        hits: result.hitsXp
      },
      npcDead
    };
  }

  // Start continuous combat with an NPC
  public startCombat(npc: THREE.Object3D, playerStats: PlayerCombatStats, combatStyle: string, callback: (result: CombatEvent) => void): void {
    if (this.inCombat) {
      this.stopCombat();
    }

    this.inCombat = true;
    this.combatTarget = npc;
    this.combatCallback = callback;

    // Start combat rounds every 4 seconds (RuneScape Classic speed)
    this.combatInterval = window.setInterval(() => {
      this.performCombatRound(playerStats, combatStyle);
    }, 4000);

    // Perform first attack immediately
    this.performCombatRound(playerStats, combatStyle);
  }

  // Stop continuous combat
  public stopCombat(): void {
    if (this.combatInterval) {
      clearInterval(this.combatInterval);
      this.combatInterval = null;
    }
    
    this.inCombat = false;
    this.combatTarget = null;
    this.combatCallback = null;
  }

  // Cast a spell on target NPC
  public castSpellOnTarget(spellId: string, target: THREE.Object3D, playerStats: { magic: number }, inventory: InventorySlot[]): boolean {
    if (!target || !target.userData || target.userData.type !== 'npc' || !this.player) {
      return false;
    }

    // Convert inventory to format expected by magic system
    const inventoryMap: { [itemId: string]: number } = {};
    inventory.forEach(slot => {
      if (slot.item) {
        inventoryMap[slot.item.id] = (inventoryMap[slot.item.id] || 0) + slot.item.quantity;
      }
    });

    // Check if spell can be cast (has required runes)
    const canCast = this.magicSystem.canCastSpell(spellId, playerStats.magic, inventoryMap);
    if (!canCast.canCast) {
      console.log('Cannot cast spell:', canCast.reason);
      return false;
    }

    // Create caster object for magic system
    const caster = {
      level: playerStats.magic,
      position: this.player.position
    };

    // Cast the spell
    const result: SpellCastResult = this.magicSystem.castSpell(spellId, caster);
    
    if (result.success && result.damage) {
      // Apply spell damage to target
      const npcData = target.userData;
      if (npcData.currentHits !== undefined) {
        npcData.currentHits = Math.max(0, npcData.currentHits - result.damage);
        
        // Show damage as chat bubble above target
        this.showChatBubble(target, `${result.damage}`, 2000);
        
        // If NPC dies, handle death (reuse existing logic from attackNPC)
        if (npcData.currentHits <= 0) {
          // Generate drops
          const drops = this.dropSystem.generateDrops(npcData.name, {
            x: target.position.x,
            y: target.position.y + 0.1,
            z: target.position.z
          });

          // Create visual drops
          drops.forEach((drop, index) => {
            const dropMesh = this.createDroppedItemMesh(drop, index);
            this.scene.add(dropMesh);
          });

          // Store NPC data for respawning
          const npcRespawnData = {
            name: npcData.name,
            color: npcData.color || 0x666666,
            position: { x: target.position.x, z: target.position.z },
            height: npcData.height || 0
          };

          // Remove NPC from scene
          this.scene.remove(target);
          const npcIndex = this.npcs.indexOf(target);
          if (npcIndex > -1) {
            this.npcs.splice(npcIndex, 1);
          }

          // Schedule respawn
          const respawnTime = 30000 + Math.random() * 30000;
          setTimeout(async () => {
            try {
              const newNpc = await this.createNPC(npcRespawnData.name, npcRespawnData.color);
              const terrainHeight = this.getTerrainHeight(npcRespawnData.position.x, npcRespawnData.position.z);
              newNpc.position.set(npcRespawnData.position.x, terrainHeight + 0.05, npcRespawnData.position.z);
              newNpc.userData.height = npcRespawnData.height;
              this.scene.add(newNpc);
              this.npcs.push(newNpc);
            } catch (error) {
              console.error(`Failed to respawn ${npcRespawnData.name}:`, error);
            }
          }, respawnTime);
        }
      }

      // TODO: Consume runes from inventory (implement later)
      
      return true;
    }

    return false;
  }

  // Perform a single combat round (player attacks, then NPC attacks back)
  private performCombatRound(playerStats: PlayerCombatStats, combatStyle: string): void {
    if (!this.combatTarget || !this.combatCallback || !this.inCombat) {
      this.stopCombat();
      return;
    }

    // Check if NPC still exists
    if (!this.npcs.includes(this.combatTarget)) {
      this.stopCombat();
      return;
    }

    // Player attacks first
    const playerAttackResult = this.attackNPC(this.combatTarget, playerStats, combatStyle);
    
    // Trigger player bounce animation for attack
    this.triggerPlayerBounceAnimation();
    
    this.combatCallback({
      type: 'player_attack',
      result: playerAttackResult,
      npc: this.combatTarget
    });

    // If NPC died, stop combat
    if (playerAttackResult.npcDead) {
      this.stopCombat();
      return;
    }

    // NPC attacks back after a short delay
    setTimeout(() => {
      if (!this.inCombat || !this.combatTarget || !this.combatCallback) return;

      const npcAttackResult = this.npcAttackPlayer(this.combatTarget, playerStats);
      
      // Trigger NPC bounce animation for attack
      this.triggerNPCBounceAnimation(this.combatTarget);
      
      this.combatCallback({
        type: 'npc_attack',
        result: npcAttackResult,
        npc: this.combatTarget
      });

      // If player died, stop combat
      if (npcAttackResult.playerDead) {
        this.stopCombat();
      }
    }, 2000);
  }

  // NPC attacks the player
  private npcAttackPlayer(npc: THREE.Object3D, playerStats: PlayerCombatStats): { success: boolean, damage: number, playerDead: boolean } {
    if (!this.player) return { success: false, damage: 0, playerDead: false };

    console.log('NPC attacking player!', npc.userData.name);

    // Create combatant objects (NPC attacking player)
    const npcCombatant: Combatant = {
      stats: npc.userData.stats,
      equipment: npc.userData.equipment,
      style: npc.userData.style || 'accurate',
      isPlayer: false,
      position: npc.position,
      name: npc.userData.name
    };

    // Get current equipment and calculate bonuses
    const currentEquipment = useGameStore.getState().player.equipment;
    const equipmentBonuses = this.calculateEquipmentBonuses(currentEquipment);

    const playerCombatant: Combatant = {
      stats: playerStats,
      equipment: equipmentBonuses,
      style: 'defensive', // Player is defending
      isPlayer: true,
      position: this.player.position,
      name: 'Player'
    };

    // Perform NPC attack on player
    const result = this.combatSystem.performAttack(npcCombatant, playerCombatant);
    
    console.log(`NPC attack result: hit=${result.hit}, damage=${result.damage}`);

    // Update player health in the game store using the existing method
    if (result.hit && result.damage > 0) {
      console.log(`Applying ${result.damage} damage to player`);
      useGameStore.getState().updateCurrentHits(result.damage);
    }
    
    // Update local playerStats reference as well for return value calculation
    playerStats.currentHits = Math.max(0, playerStats.currentHits - (result.hit ? result.damage : 0));
    
    // Check if player is dead
    const playerDead = playerStats.currentHits <= 0;

    return {
      success: result.hit,
      damage: result.damage,
      playerDead
    };
  }

  // Check if currently in combat
  public isInCombat(): boolean {
    return this.inCombat;
  }

  // Get current combat target
  public getCombatTarget(): THREE.Object3D | null {
    return this.combatTarget;
  }

  public getPlayerPosition(): THREE.Vector3 {
    return this.player ? this.player.position.clone() : new THREE.Vector3();
  }

  private handleResize(): void {
    const container = this.renderer.domElement.parentElement;
    if (container) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }

  private gameLoop = (currentTime: number = 0): void => {
    if (!this.isRunning) return;

    try {
      this.frameCount++;
      
      // Calculate delta time
      const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
      this.lastTime = currentTime;
      
      // Log first 10 frames to verify loop is running
      if (this.frameCount <= 10) {
        console.log(`Game loop frame ${this.frameCount}, deltaTime: ${deltaTime.toFixed(3)}s`);
      }
      
      // Update game logic
      this.updateMovement(deltaTime);
      this.updateCamera();
      this.updateSkillResources();
      this.updateChatBubbles();
      this.updateNPCs(currentTime, deltaTime);

      // Update Phase 10 systems
      this.updatePhase10Systems(deltaTime);

      // Render the scene
      this.renderer.render(this.scene, this.camera);

      this.animationId = requestAnimationFrame(this.gameLoop);
    } catch (error) {
      console.error('Error in game loop:', error);
      this.stop();
    }
  };

  public start(): void {
    console.log('Starting game engine...');
    if (!this.isRunning) {
      this.isRunning = true;
      console.log('Starting game loop...');
      console.log('Scene children count:', this.scene.children.length);
      console.log('Camera position:', this.camera.position);
      console.log('Player position:', this.player?.position);
      this.gameLoop();
      console.log('Game engine started successfully');
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Getter methods for combat UI
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public setNPCOutline(npc: THREE.Object3D, enabled: boolean): void {
    // Remove existing outline material if any
    npc.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (enabled) {
          // Store original material if not already stored
          if (!child.userData.originalMaterial) {
            child.userData.originalMaterial = child.material;
          }
          
          // Create red outline material
          const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4040,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.3
          });
          
          // Create outline mesh
          const outlineGeometry = child.geometry.clone();
          const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
          outlineMesh.position.copy(child.position);
          outlineMesh.rotation.copy(child.rotation);
          outlineMesh.scale.copy(child.scale);
          outlineMesh.scale.multiplyScalar(1.05); // Slightly larger for outline effect
          
          // Add outline as child
          outlineMesh.name = 'outline';
          npc.add(outlineMesh);
        } else {
          // Remove outline
          const outlineChild = npc.getObjectByName('outline');
          if (outlineChild) {
            npc.remove(outlineChild);
          }
        }
      }
    });
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  // Skill system getters
  public getWoodcuttingSystem(): WoodcuttingSystem {
    return this.woodcuttingSystem;
  }

  public getMiningSystem(): MiningSystem {
    return this.miningSystem;
  }

  public getFishingSystem(): FishingSystem {
    return this.fishingSystem;
  }

  public getAgilitySystem(): AgilitySystem {
    return this.agilitySystem;
  }

  public getThievingSystem(): ThievingSystem {
    return this.thievingSystem;
  }

  public getHerbloreSystem(): HerbloreSystem {
    return this.herbloreSystem;
  }

  public getFiremakingSystem(): FiremakingSystem {
    return this.firemakingSystem;
  }

  public getGraphicsEnhancementSystem(): GraphicsEnhancementSystem | null {
    return this.graphicsEnhancementSystem;
  }

  public getPerformanceOptimizationSystem(): PerformanceOptimizationSystem | null {
    return this.performanceOptimizationSystem;
  }

  public getAudioSystem(): AudioSystem {
    return this.audioSystem;
  }

  public getLoadingSystem(): LoadingSystem {
    return this.loadingSystem;
  }

  /**
   * Create a visual representation of a dropped item using 2D sprites
   */
  public createDroppedItemMesh(drop: DroppedItem, index: number): THREE.Mesh {
    // Get sprite path for the item
    const spritePath = this.getItemSpritePath(drop.itemId);
    
    // Create a plane geometry for the 2D sprite
    const geometry = new THREE.PlaneGeometry(0.8, 0.8);
    
    // Load the texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load(spritePath);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    // Create material with transparency support
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    });
    
    const itemMesh = new THREE.Mesh(geometry, material);
    
    // Position the item with slight spacing if multiple items
    const offsetX = (index % 3 - 1) * 0.6; // Spread items horizontally
    const offsetZ = Math.floor(index / 3) * 0.6; // Spread in rows
    
    const baseY = drop.position.y + 0.3; // Float higher above ground
    
    itemMesh.position.set(
      drop.position.x + offsetX,
      baseY,
      drop.position.z + offsetZ
    );
    
    // Set up floating animation
    const itemId = `drop_${Date.now()}_${index}`;
    this.droppedItemAnimations.set(itemId, {
      baseY: baseY,
      startTime: Date.now()
    });
    
    // Make the sprite always face the camera
    itemMesh.lookAt(this.camera.position);
    
    // Store drop data in userData for pickup functionality
    itemMesh.userData = {
      type: 'dropped_item',
      dropData: drop,
      dropIndex: this.dropSystem.getDroppedItems().length - (index + 1),
      animationId: itemId
    };
    
    // Add to tracking array
    this.droppedItemMeshes.push(itemMesh);
    
    return itemMesh;
  }

  /**
   * Get the sprite path for an item
   */
  private getItemSpritePath(itemId: string): string {
    // Mapping of item IDs to sprite file names
    const itemSpriteMap: Record<string, string> = {
      // Food items
      'bread': 'cf12.png',
      'cooked_shrimp': 'cf1.png',
      'cooked_chicken': 'cf2.png',
      'cooked_meat': 'cf3.png',
      'raw_chicken': 'cf4.png',
      'raw_beef': 'cf5.png',
      
      // Bones and materials
      'bones': 'cf10.png',
      'cowhide': 'cf11.png',
      'feather': 'cf13.png',
      
      // Coins and valuables
      'coins': 'cf14.png',
      
      // Weapons and equipment
      'bronze_dagger': 'cf15.png',
      'bronze_sword': 'cf16.png',
      'bronze_shield': 'cf17.png',
      
      // Default fallback based on item number
      'raw_rat_meat': 'cf6.png',
      'air_rune': 'cf18.png',
      'water_rune': 'cf19.png',
      'earth_rune': 'cf20.png',
      'fire_rune': 'cf21.png'
    };
    
    // Check if we have a specific mapping
    if (itemSpriteMap[itemId]) {
      return `/Sprites/${itemSpriteMap[itemId]}`;
    }
    
    // Fallback to a default sprite if no mapping found
    return `/Sprites/cf1.png`;
  }

  /**
   * Handle picking up dropped items
   */
  public pickupDroppedItem(itemMesh: THREE.Mesh): boolean {
    const dropData = itemMesh.userData.dropData as DroppedItem;
    const dropIndex = itemMesh.userData.dropIndex as number;
    
    if (!dropData) return false;
    
    // Try to add item to player inventory
    const addItemToInventory = useGameStore.getState().addItemToInventory;
    const success = addItemToInventory(dropData.itemId, dropData.quantity);
    
    if (success) {
      // Remove from drop system
      this.dropSystem.pickupItem(dropIndex);
      
      // Clean up animation
      const animationId = itemMesh.userData.animationId;
      if (animationId) {
        this.droppedItemAnimations.delete(animationId);
      }
      
      // Remove visual representation
      this.scene.remove(itemMesh);
      const meshIndex = this.droppedItemMeshes.indexOf(itemMesh);
      if (meshIndex > -1) {
        this.droppedItemMeshes.splice(meshIndex, 1);
      }
      
      return true;
    }
    
    return false; // Inventory full
  }

  /**
   * Get the drop system instance
   */
  public getDropSystem(): DropSystem {
    return this.dropSystem;
  }

  /**
   * Add a dropped item to the world (e.g., when player drops from inventory)
   */
  public addDroppedItem(droppedItem: DroppedItem): void {
    // Add to drop system
    this.dropSystem.addDroppedItem(droppedItem);
    
    // Get the index of the newly added item
    const droppedItems = this.dropSystem.getDroppedItems();
    const index = droppedItems.length - 1;
    
    // Create visual representation in the scene
    const mesh = this.createDroppedItemMesh(droppedItem, index);
    mesh.position.set(droppedItem.position.x, droppedItem.position.y, droppedItem.position.z);
    this.scene.add(mesh);
  }

  public dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Clean up Three.js resources
    this.scene.clear();
    this.renderer.dispose();
    
    // Remove canvas from DOM
    const canvas = this.renderer.domElement;
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }
}
