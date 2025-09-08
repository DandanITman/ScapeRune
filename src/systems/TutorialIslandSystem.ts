import * as THREE from 'three';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  objectiveText: string;
  area: 'spawn_house' | 'blacksmith' | 'underground' | 'boat' | 'main_area';
  requiredAction?: string;
  completed: boolean;
  npcSpeaker?: string;
}

export interface TutorialArea {
  id: string;
  name: string;
  bounds: { x: number; z: number; width: number; height: number };
  buildings: TutorialBuilding[];
  npcs: TutorialNPC[];
  interactables: TutorialInteractable[];
}

export interface TutorialBuilding {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  type: 'house' | 'shop' | 'tunnel_entrance' | 'stairs' | 'boat';
  entrance?: { x: number; z: number };
}

export interface TutorialNPC {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  role: 'guide' | 'instructor' | 'merchant' | 'captain';
  dialogue: string[];
  currentDialogue: number;
}

export interface TutorialInteractable {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  type: 'anvil' | 'furnace' | 'door' | 'stairs' | 'boat' | 'chest' | 'table';
  requiredStep?: string;
  action: string;
}

export class TutorialIslandSystem {
  private scene: THREE.Scene;
  private islandMesh: THREE.Group;
  private currentStep: number = 0;
  private areas: Map<string, TutorialArea> = new Map();
  private buildingMeshes: Map<string, THREE.Mesh> = new Map();
  private npcMeshes: Map<string, THREE.Mesh> = new Map();
  private interactableMeshes: Map<string, THREE.Mesh> = new Map();
  private playerStartPosition = { x: 45, y: 2, z: -10 }; // Spawn house location
  
  private tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Tutorial Island',
      description: 'Welcome to RuneScape! This tutorial will teach you the basics.',
      objectiveText: 'Talk to the Tutorial Guide',
      area: 'spawn_house',
      completed: false,
      npcSpeaker: 'Tutorial Guide'
    },
    {
      id: 'movement',
      title: 'Moving Around',
      description: 'Use WASD keys to move around the world.',
      objectiveText: 'Walk to the blacksmith shop',
      area: 'main_area',
      requiredAction: 'move_to_blacksmith',
      completed: false
    },
    {
      id: 'smithing_basics',
      title: 'Smithing Tutorial',
      description: 'Learn to smith your first items.',
      objectiveText: 'Talk to the Smithing Instructor',
      area: 'blacksmith',
      completed: false,
      npcSpeaker: 'Smithing Instructor'
    },
    {
      id: 'make_dagger',
      title: 'Forging a Dagger',
      description: 'Use the anvil to create a bronze dagger.',
      objectiveText: 'Smith a bronze dagger',
      area: 'blacksmith',
      requiredAction: 'smith_bronze_dagger',
      completed: false
    },
    {
      id: 'underground_exploration',
      title: 'Underground Passage',
      description: 'Explore the underground tunnel system.',
      objectiveText: 'Go down the stairs to the underground',
      area: 'underground',
      requiredAction: 'enter_underground',
      completed: false
    },
    {
      id: 'final_preparations',
      title: 'Ready to Leave',
      description: 'You are ready to leave Tutorial Island.',
      objectiveText: 'Talk to the Boat Captain',
      area: 'boat',
      completed: false,
      npcSpeaker: 'Captain'
    },
    {
      id: 'departure',
      title: 'Departure',
      description: 'Board the boat to begin your adventure!',
      objectiveText: 'Board the boat to mainland',
      area: 'boat',
      requiredAction: 'board_boat',
      completed: false
    }
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.islandMesh = new THREE.Group();
    this.initializeTutorialIsland();
  }

  private initializeTutorialIsland(): void {
    this.createIslandTerrain();
    this.defineAreas();
    this.createBuildings();
    this.createNPCs();
    this.createInteractables();
    this.positionPlayer();
    this.scene.add(this.islandMesh);
  }

  private createIslandTerrain(): void {
    // Main island base
    const islandGeometry = new THREE.BoxGeometry(100, 2, 80);
    const islandMaterial = new THREE.MeshLambertMaterial({ color: 0x4a7c59 }); // Green grass
    const islandBase = new THREE.Mesh(islandGeometry, islandMaterial);
    islandBase.position.set(0, 0, 0);
    this.islandMesh.add(islandBase);

    // Water around the island
    const waterGeometry = new THREE.PlaneGeometry(200, 200);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x006994,
      transparent: true,
      opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1, 0);
    this.islandMesh.add(water);

    // Path network
    this.createPaths();
  }

  private createPaths(): void {
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8b7355 }); // Brown dirt path

    // Main path from spawn house to blacksmith
    const mainPath = new THREE.BoxGeometry(4, 0.1, 40);
    const mainPathMesh = new THREE.Mesh(mainPath, pathMaterial);
    mainPathMesh.position.set(25, 1.1, 0);
    this.islandMesh.add(mainPathMesh);

    // Path to underground entrance
    const undergroundPath = new THREE.BoxGeometry(30, 0.1, 4);
    const undergroundPathMesh = new THREE.Mesh(undergroundPath, pathMaterial);
    undergroundPathMesh.position.set(0, 1.1, -20);
    this.islandMesh.add(undergroundPathMesh);

    // Path to boat
    const boatPath = new THREE.BoxGeometry(4, 0.1, 25);
    const boatPathMesh = new THREE.Mesh(boatPath, pathMaterial);
    boatPathMesh.position.set(-35, 1.1, 15);
    this.islandMesh.add(boatPathMesh);
  }

  private defineAreas(): void {
    // Spawn House Area (Top Right)
    this.areas.set('spawn_house', {
      id: 'spawn_house',
      name: 'Spawn House',
      bounds: { x: 35, z: -15, width: 20, height: 15 },
      buildings: [],
      npcs: [],
      interactables: []
    });

    // Blacksmith Area (Middle)
    this.areas.set('blacksmith', {
      id: 'blacksmith',
      name: 'Blacksmith Shop',
      bounds: { x: 15, z: -5, width: 20, height: 15 },
      buildings: [],
      npcs: [],
      interactables: []
    });

    // Underground Area
    this.areas.set('underground', {
      id: 'underground',
      name: 'Underground Tunnels',
      bounds: { x: -20, z: -30, width: 30, height: 20 },
      buildings: [],
      npcs: [],
      interactables: []
    });

    // Boat Area (Left side)
    this.areas.set('boat', {
      id: 'boat',
      name: 'Boat Departure',
      bounds: { x: -45, z: 10, width: 20, height: 20 },
      buildings: [],
      npcs: [],
      interactables: []
    });

    // Main connecting area
    this.areas.set('main_area', {
      id: 'main_area',
      name: 'Main Area',
      bounds: { x: -10, z: -10, width: 30, height: 25 },
      buildings: [],
      npcs: [],
      interactables: []
    });
  }

  private createBuildings(): void {
    // Spawn House (Top Right)
    this.createBuilding({
      id: 'spawn_house',
      name: 'Tutorial Spawn House',
      position: { x: 45, y: 3, z: -10 },
      size: { width: 8, height: 6, depth: 8 },
      type: 'house',
      entrance: { x: 41, z: -10 }
    });

    // Blacksmith Shop (Middle)
    this.createBuilding({
      id: 'blacksmith_shop',
      name: 'Blacksmith Shop',
      position: { x: 25, y: 3, z: 5 },
      size: { width: 12, height: 6, depth: 10 },
      type: 'shop',
      entrance: { x: 19, z: 5 }
    });

    // Underground Entrance
    this.createBuilding({
      id: 'underground_entrance',
      name: 'Underground Entrance',
      position: { x: -15, y: 1.5, z: -20 },
      size: { width: 6, height: 3, depth: 6 },
      type: 'tunnel_entrance',
      entrance: { x: -15, z: -17 }
    });

    // Stairs to underground
    this.createBuilding({
      id: 'underground_stairs',
      name: 'Underground Stairs',
      position: { x: -15, y: -2, z: -25 },
      size: { width: 4, height: 1, depth: 8 },
      type: 'stairs'
    });

    // Boat
    this.createBuilding({
      id: 'departure_boat',
      name: 'Departure Boat',
      position: { x: -40, y: 1, z: 20 },
      size: { width: 8, height: 3, depth: 12 },
      type: 'boat',
      entrance: { x: -40, z: 14 }
    });
  }

  private createBuilding(building: TutorialBuilding): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (building.type) {
      case 'house':
        geometry = new THREE.BoxGeometry(building.size.width, building.size.height, building.size.depth);
        material = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown wood
        break;
      case 'shop':
        geometry = new THREE.BoxGeometry(building.size.width, building.size.height, building.size.depth);
        material = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Gray stone
        break;
      case 'tunnel_entrance':
        geometry = new THREE.CylinderGeometry(3, 3, building.size.height, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x444444 }); // Dark stone
        break;
      case 'stairs':
        geometry = new THREE.BoxGeometry(building.size.width, building.size.height, building.size.depth);
        material = new THREE.MeshLambertMaterial({ color: 0x555555 }); // Stone steps
        break;
      case 'boat':
        geometry = new THREE.ConeGeometry(4, building.size.height, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown wood
        break;
      default:
        geometry = new THREE.BoxGeometry(building.size.width, building.size.height, building.size.depth);
        material = new THREE.MeshLambertMaterial({ color: 0x888888 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(building.position.x, building.position.y, building.position.z);
    mesh.userData = { type: 'building', id: building.id, building };

    this.buildingMeshes.set(building.id, mesh);
    this.islandMesh.add(mesh);

    // Add roof for houses and shops
    if (building.type === 'house' || building.type === 'shop') {
      const roofGeometry = new THREE.ConeGeometry(
        Math.max(building.size.width, building.size.depth) * 0.7,
        building.size.height * 0.5,
        4
      );
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 }); // Dark brown roof
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(
        building.position.x,
        building.position.y + building.size.height * 0.75,
        building.position.z
      );
      roof.rotation.y = Math.PI / 4;
      this.islandMesh.add(roof);
    }
  }

  private createNPCs(): void {
    // Tutorial Guide in spawn house
    this.createNPC({
      id: 'tutorial_guide',
      name: 'Tutorial Guide',
      position: { x: 42, y: 2, z: -8 },
      role: 'guide',
      dialogue: [
        "Welcome to RuneScape! I'm here to help you get started.",
        "First, let's learn how to move around. Use WASD keys to walk.",
        "Head over to the blacksmith shop to learn about smithing!"
      ],
      currentDialogue: 0
    });

    // Smithing Instructor in blacksmith
    this.createNPC({
      id: 'smithing_instructor',
      name: 'Smithing Instructor',
      position: { x: 23, y: 2, z: 7 },
      role: 'instructor',
      dialogue: [
        "Hello there! Ready to learn smithing?",
        "Use the anvil here to create items from metal bars.",
        "Try making a bronze dagger - you'll need bronze bars!"
      ],
      currentDialogue: 0
    });

    // Boat Captain
    this.createNPC({
      id: 'boat_captain',
      name: 'Captain',
      position: { x: -38, y: 2, z: 18 },
      role: 'captain',
      dialogue: [
        "Ahoy there! Ready to leave Tutorial Island?",
        "Once you board my boat, you'll head to the mainland.",
        "Are you sure you've completed all the tutorials?"
      ],
      currentDialogue: 0
    });
  }

  private createNPC(npc: TutorialNPC): void {
    // Create simple NPC representation
    const npcGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const npcMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc }); // Blue clothing
    const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial);
    npcMesh.position.set(npc.position.x, npc.position.y, npc.position.z);
    npcMesh.userData = { type: 'npc', id: npc.id, npc };

    // Add simple face
    const faceGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const faceMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // Skin tone
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, 0.8, 0);
    npcMesh.add(face);

    this.npcMeshes.set(npc.id, npcMesh);
    this.islandMesh.add(npcMesh);
  }

  private createInteractables(): void {
    // Anvil in blacksmith
    this.createInteractable({
      id: 'anvil',
      name: 'Anvil',
      position: { x: 26, y: 2.5, z: 3 },
      type: 'anvil',
      requiredStep: 'make_dagger',
      action: 'smith_item'
    });

    // Furnace in blacksmith
    this.createInteractable({
      id: 'furnace',
      name: 'Furnace',
      position: { x: 28, y: 2.5, z: 6 },
      type: 'furnace',
      action: 'smelt_ore'
    });

    // Underground stairs
    this.createInteractable({
      id: 'stairs_down',
      name: 'Stairs',
      position: { x: -15, y: 2, z: -18 },
      type: 'stairs',
      requiredStep: 'underground_exploration',
      action: 'go_underground'
    });

    // Departure boat
    this.createInteractable({
      id: 'boat_departure',
      name: 'Boat to Mainland',
      position: { x: -40, y: 2, z: 14 },
      type: 'boat',
      requiredStep: 'departure',
      action: 'leave_tutorial'
    });
  }

  private createInteractable(interactable: TutorialInteractable): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (interactable.type) {
      case 'anvil':
        geometry = new THREE.BoxGeometry(1.5, 0.8, 1);
        material = new THREE.MeshLambertMaterial({ color: 0x444444 }); // Dark metal
        break;
      case 'furnace':
        geometry = new THREE.CylinderGeometry(1, 1.2, 2, 8);
        material = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown brick
        break;
      case 'stairs':
        geometry = new THREE.BoxGeometry(2, 0.5, 2);
        material = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Gray stone
        break;
      case 'boat':
        // This is handled by the boat building
        return;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshLambertMaterial({ color: 0x888888 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(interactable.position.x, interactable.position.y, interactable.position.z);
    mesh.userData = { type: 'interactable', id: interactable.id, interactable };

    this.interactableMeshes.set(interactable.id, mesh);
    this.islandMesh.add(mesh);
  }

  private positionPlayer(): void {
    // Set player starting position in spawn house
    console.log('Tutorial: Player should be positioned at spawn house:', this.playerStartPosition);
  }

  public getCurrentStep(): TutorialStep {
    return this.tutorialSteps[this.currentStep];
  }

  public getCurrentStepIndex(): number {
    return this.currentStep;
  }

  public getTotalSteps(): number {
    return this.tutorialSteps.length;
  }

  public completeCurrentStep(): boolean {
    if (this.currentStep < this.tutorialSteps.length) {
      this.tutorialSteps[this.currentStep].completed = true;
      this.currentStep++;
      return true;
    }
    return false;
  }

  public canInteractWith(objectId: string): boolean {
    const currentStep = this.getCurrentStep();
    const object = this.interactableMeshes.get(objectId);
    
    if (!object) return false;
    
    const interactable = object.userData.interactable as TutorialInteractable;
    
    // Check if this interaction is required for current step
    return !interactable.requiredStep || interactable.requiredStep === currentStep.id;
  }

  public handleInteraction(objectId: string): void {
    const object = this.interactableMeshes.get(objectId);
    if (!object) return;

    const interactable = object.userData.interactable as TutorialInteractable;
    const currentStep = this.getCurrentStep();

    switch (interactable.action) {
      case 'smith_item':
        if (currentStep.id === 'make_dagger') {
          this.handleSmithingTutorial();
        }
        break;
      case 'go_underground':
        if (currentStep.id === 'underground_exploration') {
          this.handleUndergroundEntry();
        }
        break;
      case 'leave_tutorial':
        if (currentStep.id === 'departure') {
          this.handleTutorialCompletion();
        }
        break;
    }
  }

  public handleNPCInteraction(npcId: string): void {
    const npcMesh = this.npcMeshes.get(npcId);
    if (!npcMesh) return;

    const npc = npcMesh.userData.npc as TutorialNPC;
    const currentStep = this.getCurrentStep();

    // Show dialogue if this NPC is part of current step
    if (currentStep.npcSpeaker === npc.name) {
      this.showDialogue(npc);
      
      // Auto-complete dialogue steps
      if (currentStep.id === 'welcome' || currentStep.id === 'smithing_basics' || currentStep.id === 'final_preparations') {
        setTimeout(() => {
          this.completeCurrentStep();
        }, 2000);
      }
    }
  }

  private showDialogue(npc: TutorialNPC): void {
    const dialogue = npc.dialogue[npc.currentDialogue];
    console.log(`${npc.name}: ${dialogue}`);
    
    // Advance dialogue
    npc.currentDialogue = Math.min(npc.currentDialogue + 1, npc.dialogue.length - 1);
  }

  private handleSmithingTutorial(): void {
    console.log('Creating bronze dagger...');
    // Add bronze dagger to inventory
    console.log('Tutorial: Bronze dagger created');
    this.completeCurrentStep();
  }

  private handleUndergroundEntry(): void {
    console.log('Entering underground tunnels...');
    // Move player to underground area
    console.log('Tutorial: Player moved to underground');
    this.completeCurrentStep();
  }

  private handleTutorialCompletion(): void {
    console.log('Tutorial completed! Departing to mainland...');
    this.completeCurrentStep();
    
    // Here you would typically load the main game world
    // For now, just show completion message
    setTimeout(() => {
      console.log('Welcome to the world of RuneScape!');
    }, 1000);
  }

  public isInArea(areaId: string, position: { x: number; z: number }): boolean {
    const area = this.areas.get(areaId);
    if (!area) return false;

    const bounds = area.bounds;
    return position.x >= bounds.x && 
           position.x <= bounds.x + bounds.width &&
           position.z >= bounds.z && 
           position.z <= bounds.z + bounds.height;
  }

  public checkStepProgression(playerPosition: { x: number; y: number; z: number }): void {
    const currentStep = this.getCurrentStep();
    
    if (currentStep.requiredAction === 'move_to_blacksmith') {
      if (this.isInArea('blacksmith', { x: playerPosition.x, z: playerPosition.z })) {
        this.completeCurrentStep();
      }
    }
  }

  public getTutorialProgress(): { current: number; total: number; percentage: number } {
    const completed = this.tutorialSteps.filter(step => step.completed).length;
    return {
      current: completed,
      total: this.tutorialSteps.length,
      percentage: Math.round((completed / this.tutorialSteps.length) * 100)
    };
  }

  public cleanup(): void {
    if (this.islandMesh) {
      this.scene.remove(this.islandMesh);
    }
    this.buildingMeshes.clear();
    this.npcMeshes.clear();
    this.interactableMeshes.clear();
  }
}
