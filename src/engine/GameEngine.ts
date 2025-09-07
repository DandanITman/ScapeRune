import * as THREE from 'three';
import { CombatSystem } from '../systems/CombatSystem';
import type { Combatant, CombatStyle } from '../systems/CombatSystem';
import { WoodcuttingSystem } from '../systems/WoodcuttingSystem';
import { MiningSystem } from '../systems/MiningSystem';
import { FishingSystem } from '../systems/FishingSystem';
import { SmithingSystem } from '../systems/SmithingSystem';
import { useGameStore } from '../store/gameStore';
import type { Equipment } from '../types/inventory';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private isRunning = false;
  private frameCount = 0;
  private lastTime = 0;

  // Game objects
  private player: THREE.Mesh | null = null;
  private terrain: THREE.Mesh | null = null;
  private npcs: THREE.Mesh[] = [];
  private trees: THREE.Group[] = [];
  
  // Skill systems
  private combatSystem = new CombatSystem();
  private woodcuttingSystem = new WoodcuttingSystem();
  private miningSystem = new MiningSystem();
  private fishingSystem = new FishingSystem();
  private smithingSystem = new SmithingSystem();
  private playerCombatStyle: CombatStyle = 'controlled';
  
  // Combat state
  private inCombat = false;
  private combatTarget: THREE.Mesh | null = null;
  private combatInterval: number | null = null;
  private combatCallback: ((result: any) => void) | null = null;
  
  // Movement system
  private targetPosition: THREE.Vector3 | null = null;
  private isMoving = false;
  private movementSpeed = 2.0; // units per second

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
    this.createNPCs();
    console.log('NPCs created');
    
    console.log('Creating skill resources...');
    this.createSkillResources();
    console.log('Skill resources created');
    
    // Position camera in isometric view
    console.log('Setting up camera...');
    this.camera.position.set(10, 10, 10); // Further back for better view
    this.camera.lookAt(0, 0, 0); // Look at center where objects are
    console.log('Camera positioned at:', this.camera.position);
    console.log('Camera looking at:', { x: 0, y: 0, z: 0 });
    
    // Update camera to follow player
    this.updateCamera();
    console.log('Camera setup complete, final position:', this.camera.position);

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('GameEngine setup complete');
  }

  private setupLighting(): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
  }

  private createTerrain(): void {
    try {
      // Create a proper grass terrain plane
      const geometry = new THREE.PlaneGeometry(100, 100);
      const material = new THREE.MeshLambertMaterial({ color: 0x7CFC00 }); // Lawn green
      this.terrain = new THREE.Mesh(geometry, material);
      this.terrain.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      this.terrain.receiveShadow = true;
      this.scene.add(this.terrain);
      console.log('Grass terrain plane created successfully');

      // Trees will be created by createSkillResources()
    } catch (error) {
      console.error('Failed to create terrain:', error);
      throw error;
    }
  }

  private createPlayer(): void {
    // Create a proper player character (cylinder body + sphere head)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066CC }); // Blue
    this.player = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.player.position.y = 1;
    this.player.castShadow = true;
    this.scene.add(this.player);

    // Add a head
    const headGeometry = new THREE.SphereGeometry(0.3);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB0 }); // Skin color
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2; // Top of cylinder
    this.player.add(head);
    
    console.log('Player character created at position:', this.player.position);
  }

  private createNPCs(): void {
    // Create some basic NPCs around the world
    const npcData = [
      { name: 'Goblin', color: 0x228B22, position: { x: 5, z: 5 } },
      { name: 'Cow', color: 0xDEB887, position: { x: -8, z: 3 } },
      { name: 'Chicken', color: 0xFFFFFF, position: { x: 2, z: -7 } },
      { name: 'Rat', color: 0x696969, position: { x: -3, z: -2 } }
    ];

    npcData.forEach(data => {
      const npc = this.createNPC(data.name, data.color);
      npc.position.set(data.position.x, 1, data.position.z);
      this.scene.add(npc);
      this.npcs.push(npc);
    });
  }

  private createNPC(name: string, color: number): THREE.Mesh {
    // Create NPC body (smaller than player)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const npc = new THREE.Mesh(bodyGeometry, bodyMaterial);
    npc.castShadow = true;
    
    // Add combat stats to NPC
    const combatStats = CombatSystem.getNPCStats(name);
    
    // Store NPC data including combat info
    npc.userData = { 
      name, 
      type: 'npc',
      stats: combatStats,
      equipment: CombatSystem.getNPCEquipment(),
      style: 'controlled' as CombatStyle,
      maxHits: combatStats.hits,
      currentHits: combatStats.currentHits
    };
    
    return npc;
  }

  private createSkillResources(): void {
    // Create trees for woodcutting
    this.createTrees();
    
    // Create rocks for mining
    this.createRocks();
    
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

  private createRocks(): void {
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

    rockData.forEach(data => {
      const position = new THREE.Vector3(data.position.x, 0, data.position.z);
      const rockMesh = this.miningSystem.createRockMesh(data.type);
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
      this.targetPosition.y = this.player.position.y; // Keep same height
      this.isMoving = true;
    }
  }
  
  private updateMovement(deltaTime: number): void {
    if (!this.player || !this.targetPosition || !this.isMoving) return;
    
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.player.position);
    const distance = direction.length();
    
    if (distance < 0.1) {
      // Reached destination
      this.player.position.copy(this.targetPosition);
      this.isMoving = false;
      this.targetPosition = null;
    } else {
      // Move towards target
      direction.normalize();
      const moveDistance = this.movementSpeed * deltaTime;
      
      if (moveDistance >= distance) {
        // Will reach target this frame
        this.player.position.copy(this.targetPosition);
        this.isMoving = false;
        this.targetPosition = null;
      } else {
        // Move part of the way
        this.player.position.add(direction.multiplyScalar(moveDistance));
      }
    }
  }

  private updateSkillResources(): void {
    // Update tree respawns
    this.woodcuttingSystem.updateTrees();
    
    // Update rock respawns
    this.miningSystem.updateRocks();
    
    // Note: Fishing spots don't need respawning as they're always available
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

  public getClickedNPC(mouseX: number, mouseY: number, containerWidth: number, containerHeight: number): THREE.Mesh | null {
    // Convert mouse coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (mouseX / containerWidth) * 2 - 1;
    mouse.y = -(mouseY / containerHeight) * 2 + 1;

    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Check intersection with NPCs
    const intersects = raycaster.intersectObjects(this.npcs);
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

  public attackNPC(npc: THREE.Mesh, playerStats?: any, combatStyle?: string): { success: boolean, damage: number, xp: any, npcDead: boolean } {
    if (!this.player) return { success: false, damage: 0, xp: {}, npcDead: false };

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
      // Remove NPC from scene
      this.scene.remove(npc);
      const npcIndex = this.npcs.indexOf(npc);
      if (npcIndex > -1) {
        this.npcs.splice(npcIndex, 1);
      }
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
  public startCombat(npc: THREE.Mesh, playerStats: any, combatStyle: string, callback: (result: any) => void): void {
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

  // Perform a single combat round (player attacks, then NPC attacks back)
  private performCombatRound(playerStats: any, combatStyle: string): void {
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
  private npcAttackPlayer(npc: THREE.Mesh, playerStats: any): { success: boolean, damage: number, playerDead: boolean } {
    if (!this.player) return { success: false, damage: 0, playerDead: false };

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

    // Update player health
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
  public getCombatTarget(): THREE.Mesh | null {
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
