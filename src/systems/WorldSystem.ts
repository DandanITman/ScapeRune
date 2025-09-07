import * as THREE from 'three';

// Town/Area interfaces
export interface Building {
  id: string;
  name: string;
  type: 'bank' | 'shop' | 'house' | 'castle' | 'church' | 'other';
  position: THREE.Vector3;
  size: THREE.Vector3;
  color: number;
  interactable: boolean;
  shopType?: 'general' | 'weapon' | 'armor' | 'magic' | 'food';
}

export interface Town {
  id: string;
  name: string;
  buildings: Building[];
  npcs: any[]; // Will be populated with NPCs
  centerPosition: THREE.Vector3;
  boundaries: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export class WorldSystem {
  private towns: Map<string, Town> = new Map();
  private currentTown: string | null = null;
  private scene: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeTowns();
  }

  /**
   * Initialize all towns and their buildings
   */
  private initializeTowns(): void {
    // Create Lumbridge
    const lumbridge: Town = {
      id: 'lumbridge',
      name: 'Lumbridge',
      buildings: [
        {
          id: 'lumbridge_bank',
          name: 'Lumbridge Bank',
          type: 'bank',
          position: new THREE.Vector3(-15, 0, -5),
          size: new THREE.Vector3(6, 4, 4),
          color: 0x8B4513,
          interactable: true
        },
        {
          id: 'lumbridge_general_store',
          name: 'Lumbridge General Store',
          type: 'shop',
          position: new THREE.Vector3(-8, 0, -5),
          size: new THREE.Vector3(5, 4, 4),
          color: 0x654321,
          interactable: true,
          shopType: 'general'
        },
        {
          id: 'lumbridge_castle',
          name: 'Lumbridge Castle',
          type: 'castle',
          position: new THREE.Vector3(0, 0, -15),
          size: new THREE.Vector3(12, 8, 12),
          color: 0x696969,
          interactable: true
        },
        {
          id: 'lumbridge_church',
          name: 'Lumbridge Church',
          type: 'church',
          position: new THREE.Vector3(15, 0, -5),
          size: new THREE.Vector3(6, 6, 8),
          color: 0x8B4513,
          interactable: true
        },
        {
          id: 'lumbridge_house1',
          name: 'House',
          type: 'house',
          position: new THREE.Vector3(-20, 0, 5),
          size: new THREE.Vector3(4, 3, 4),
          color: 0x8B4513,
          interactable: false
        },
        {
          id: 'lumbridge_house2',
          name: 'House',
          type: 'house',
          position: new THREE.Vector3(-12, 0, 5),
          size: new THREE.Vector3(4, 3, 4),
          color: 0x8B4513,
          interactable: false
        },
        {
          id: 'lumbridge_house3',
          name: 'House',
          type: 'house',
          position: new THREE.Vector3(10, 0, 5),
          size: new THREE.Vector3(4, 3, 4),
          color: 0x8B4513,
          interactable: false
        }
      ],
      npcs: [], // Will be populated later
      centerPosition: new THREE.Vector3(0, 0, 0),
      boundaries: {
        minX: -30,
        maxX: 30,
        minZ: -25,
        maxZ: 15
      }
    };

    this.towns.set('lumbridge', lumbridge);
  }

  /**
   * Create a building mesh based on building data
   */
  public createBuildingMesh(building: Building): THREE.Group {
    const buildingGroup = new THREE.Group();
    
    // Main building structure
    const geometry = new THREE.BoxGeometry(building.size.x, building.size.y, building.size.z);
    const material = new THREE.MeshLambertMaterial({ color: building.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = building.size.y / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    buildingGroup.add(mesh);

    // Add roof
    const roofGeometry = new THREE.ConeGeometry(
      Math.max(building.size.x, building.size.z) * 0.7, 
      building.size.y * 0.4, 
      4
    );
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = building.size.y + (building.size.y * 0.2);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Add door for interactable buildings
    if (building.interactable) {
      const doorGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(0, 1, building.size.z / 2 + 0.05);
      buildingGroup.add(door);

      // Add sign
      const signGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
      const signMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(0, 3, building.size.z / 2 + 0.1);
      buildingGroup.add(sign);
    }

    // Store building data
    buildingGroup.userData = {
      type: 'building',
      buildingType: building.type,
      buildingId: building.id,
      name: building.name,
      interactable: building.interactable,
      shopType: building.shopType
    };

    buildingGroup.position.copy(building.position);
    return buildingGroup;
  }

  /**
   * Load a town into the scene
   */
  public loadTown(townId: string): boolean {
    const town = this.towns.get(townId);
    if (!town) {
      console.error(`Town ${townId} not found`);
      return false;
    }

    // Clear existing town if any
    this.clearCurrentTown();

    // Add all buildings to scene
    town.buildings.forEach(building => {
      const buildingMesh = this.createBuildingMesh(building);
      this.scene.add(buildingMesh);
    });

    this.currentTown = townId;
    return true;
  }

  /**
   * Clear current town from scene
   */
  public clearCurrentTown(): void {
    if (!this.currentTown) return;

    // Remove all building meshes from scene
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((object) => {
      if (object.userData.type === 'building') {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach(object => {
      this.scene.remove(object);
    });

    this.currentTown = null;
  }

  /**
   * Get current town data
   */
  public getCurrentTown(): Town | null {
    if (!this.currentTown) return null;
    return this.towns.get(this.currentTown) || null;
  }

  /**
   * Get building by ID
   */
  public getBuilding(buildingId: string): Building | null {
    for (const town of this.towns.values()) {
      const building = town.buildings.find(b => b.id === buildingId);
      if (building) return building;
    }
    return null;
  }

  /**
   * Check if player is near a building
   */
  public getNearbyBuilding(playerPosition: THREE.Vector3, maxDistance: number = 3): Building | null {
    if (!this.currentTown) return null;
    
    const town = this.towns.get(this.currentTown);
    if (!town) return null;

    for (const building of town.buildings) {
      const distance = playerPosition.distanceTo(building.position);
      if (distance <= maxDistance && building.interactable) {
        return building;
      }
    }

    return null;
  }

  /**
   * Get all towns
   */
  public getTowns(): Map<string, Town> {
    return this.towns;
  }

  /**
   * Add roads/paths between buildings
   */
  public createTownPaths(townId: string): void {
    const town = this.towns.get(townId);
    if (!town) return;

    // Create simple paths connecting main buildings
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    
    // Main road through town center
    const mainRoadGeometry = new THREE.BoxGeometry(40, 0.1, 3);
    const mainRoad = new THREE.Mesh(mainRoadGeometry, pathMaterial);
    mainRoad.position.set(0, 0.05, 0);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Cross road
    const crossRoadGeometry = new THREE.BoxGeometry(3, 0.1, 30);
    const crossRoad = new THREE.Mesh(crossRoadGeometry, pathMaterial);
    crossRoad.position.set(0, 0.05, -5);
    crossRoad.receiveShadow = true;
    this.scene.add(crossRoad);
  }
}
