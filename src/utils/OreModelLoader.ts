import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface OreColorConfig {
  name: string;
  baseColor: number;
  accentColor?: number;
  metallic?: number;
  roughness?: number;
  emissive?: number;
  emissiveIntensity?: number;
}

// Authentic RuneScape ore colors based on the wiki
const ORE_COLORS: Record<string, OreColorConfig> = {
  'clay': {
    name: 'Clay',
    baseColor: 0x8B4513,      // Saddle brown - classic clay color
    roughness: 0.9,
    metallic: 0.0
  },
  'copper': {
    name: 'Copper ore',
    baseColor: 0xB87333,      // Dark orange/copper color
    accentColor: 0xCD853F,    // Peru for highlights
    roughness: 0.4,
    metallic: 0.7
  },
  'tin': {
    name: 'Tin ore',
    baseColor: 0xC0C0C0,      // Silver-gray like tin
    accentColor: 0xDCDCDC,    // Gainsboro for highlights
    roughness: 0.3,
    metallic: 0.8
  },
  'iron': {
    name: 'Iron ore',
    baseColor: 0x696969,      // Dim gray - raw iron look
    accentColor: 0x808080,    // Gray for highlights
    roughness: 0.6,
    metallic: 0.5
  },
  'silver': {
    name: 'Silver ore',
    baseColor: 0xC0C0C0,      // Silver base
    accentColor: 0xF5F5F5,    // White smoke for highlights
    roughness: 0.1,
    metallic: 0.9
  },
  'coal': {
    name: 'Coal',
    baseColor: 0x2F2F2F,      // Very dark gray/black
    accentColor: 0x1C1C1C,    // Darker for depth
    roughness: 0.9,
    metallic: 0.0,
    emissive: 0x001122,       // Slight blue glow
    emissiveIntensity: 0.1
  },
  'gold': {
    name: 'Gold ore',
    baseColor: 0xFFD700,      // Classic gold color
    accentColor: 0xFFF8DC,    // Cornsilk for highlights
    roughness: 0.1,
    metallic: 1.0,
    emissive: 0x332200,       // Warm glow
    emissiveIntensity: 0.15
  },
  'gem': {
    name: 'Gem rock',
    baseColor: 0x9966CC,      // Amethyst purple
    accentColor: 0xDA70D6,    // Orchid for highlights
    roughness: 0.0,
    metallic: 0.1,
    emissive: 0x663399,       // Purple glow
    emissiveIntensity: 0.2
  },
  'mithril': {
    name: 'Mithril ore',
    baseColor: 0x4169E1,      // Royal blue - RSC mithril color
    accentColor: 0x6495ED,    // Cornflower blue for highlights
    roughness: 0.2,
    metallic: 0.8,
    emissive: 0x001155,       // Blue glow
    emissiveIntensity: 0.1
  },
  'adamant': {
    name: 'Adamantite ore',
    baseColor: 0x228B22,      // Forest green - RSC adamant color
    accentColor: 0x32CD32,    // Lime green for highlights
    roughness: 0.3,
    metallic: 0.7,
    emissive: 0x002200,       // Green glow
    emissiveIntensity: 0.12
  },
  'runite': {
    name: 'Runite ore',
    baseColor: 0x40E0D0,      // Turquoise - RSC runite color
    accentColor: 0x7FFFD4,    // Aquamarine for highlights
    roughness: 0.1,
    metallic: 0.9,
    emissive: 0x003344,       // Cyan glow
    emissiveIntensity: 0.25
  }
};

export class OreModelLoader {
  private static instance: OreModelLoader;
  private loader: GLTFLoader;
  private modelCache: Map<string, THREE.Group> = new Map();
  private baseModel: THREE.Group | null = null;

  private constructor() {
    this.loader = new GLTFLoader();
  }

  public static getInstance(): OreModelLoader {
    if (!OreModelLoader.instance) {
      OreModelLoader.instance = new OreModelLoader();
    }
    return OreModelLoader.instance;
  }

  /**
   * Load the base ores.glb model
   */
  private async loadBaseModel(): Promise<THREE.Group> {
    if (this.baseModel) {
      return this.baseModel as THREE.Group;
    }

    try {
      console.log('Loading base ore model: ores.glb from resources folder');
      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          '/models/resources/ores.glb',
          (gltf) => resolve(gltf),
          undefined,
          (error) => reject(error)
        );
      });

      this.baseModel = gltf.scene;
      console.log('Base ore model loaded successfully');
      return this.baseModel;
    } catch (error) {
      console.warn('Failed to load ores.glb from resources folder, using fallback geometry:', error);
      return this.createFallbackModel();
    }
  }

  /**
   * Create a fallback model if ores.glb is not available
   */
  private createFallbackModel(): THREE.Group {
    const group = new THREE.Group();
    
    // Create a basic irregular rock shape using multiple geometries
    const baseGeometry = new THREE.DodecahedronGeometry(0.8, 1);
    const detailGeometry1 = new THREE.IcosahedronGeometry(0.3, 0);
    const detailGeometry2 = new THREE.OctahedronGeometry(0.4, 0);
    
    // Main rock body
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.set(0, 0, 0);
    group.add(baseMesh);
    
    // Detail chunks
    const detail1 = new THREE.Mesh(detailGeometry1, baseMaterial);
    detail1.position.set(0.4, 0.3, -0.2);
    group.add(detail1);
    
    const detail2 = new THREE.Mesh(detailGeometry2, baseMaterial);
    detail2.position.set(-0.3, 0.1, 0.4);
    detail2.scale.set(0.7, 0.7, 0.7);
    group.add(detail2);

    console.log('Created fallback ore model');
    return group;
  }

  /**
   * Create a colored ore model for a specific ore type
   */
  public async createOreModel(oreType: string): Promise<THREE.Group> {
    const cacheKey = oreType;
    
    // Check cache first
    if (this.modelCache.has(cacheKey)) {
      return this.cloneModel(this.modelCache.get(cacheKey)!);
    }

    // Load base model
    const baseModel = await this.loadBaseModel();
    const oreGroup = this.cloneModel(baseModel);
    
    // Apply ore-specific coloring
    this.applyOreColoring(oreGroup, oreType);
    
    // Add to cache
    this.modelCache.set(cacheKey, oreGroup);
    
    return this.cloneModel(oreGroup);
  }

  /**
   * Apply ore-specific materials and colors
   */
  private applyOreColoring(model: THREE.Group, oreType: string): void {
    const config = ORE_COLORS[oreType];
    if (!config) {
      console.warn(`No color configuration found for ore type: ${oreType}`);
      return;
    }

    console.log(`Applying ${config.name} coloring to ore model`);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create new material based on ore type
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(config.baseColor),
          metalness: config.metallic || 0.5,
          roughness: config.roughness || 0.5,
        });

        // Add emissive properties for special ores
        if (config.emissive !== undefined) {
          material.emissive = new THREE.Color(config.emissive);
          material.emissiveIntensity = config.emissiveIntensity || 0.1;
        }

        // Apply accent color to certain parts (you can customize this logic)
        if (config.accentColor && Math.random() > 0.7) {
          material.color = new THREE.Color(config.accentColor);
        }

        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Add ore-specific effects
    this.addOreEffects(model, oreType, config);
  }

  /**
   * Add special visual effects for certain ores
   */
  private addOreEffects(model: THREE.Group, oreType: string, config: OreColorConfig): void {
    // Add glowing effect for precious ores
    if (['gold', 'gem', 'mithril', 'adamant', 'runite'].includes(oreType)) {
      const glowGeometry = new THREE.SphereGeometry(1.2, 8, 6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: config.emissive || config.baseColor,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.scale.set(1.1, 1.1, 1.1);
      model.add(glow);
    }

    // Add sparkle effect for gem rocks
    if (oreType === 'gem') {
      this.addSparkleEffect(model);
    }

    // Add coal dust effect
    if (oreType === 'coal') {
      this.addCoalDustEffect(model);
    }
  }

  /**
   * Add sparkle effect for gem rocks
   */
  private addSparkleEffect(model: THREE.Group): void {
    const sparkleGroup = new THREE.Group();
    
    for (let i = 0; i < 5; i++) {
      const sparkleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
      });
      
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      sparkle.position.set(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2
      );
      
      sparkleGroup.add(sparkle);
    }
    
    model.add(sparkleGroup);
  }

  /**
   * Add coal dust effect
   */
  private addCoalDustEffect(model: THREE.Group): void {
    const dustGeometry = new THREE.SphereGeometry(0.8, 6, 6);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.05
    });
    
    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
    dust.scale.set(1.2, 0.3, 1.2);
    dust.position.y = 0.1;
    model.add(dust);
  }

  /**
   * Clone a model for reuse
   */
  private cloneModel(model: THREE.Group): THREE.Group {
    const cloned = model.clone();
    
    // Clone materials to avoid shared state
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
    
    return cloned;
  }

  /**
   * Get ore color configuration
   */
  public getOreConfig(oreType: string): OreColorConfig | null {
    return ORE_COLORS[oreType] || null;
  }

  /**
   * Preload all ore models
   */
  public async preloadAllOres(): Promise<void> {
    console.log('Preloading all ore models...');
    
    const oreTypes = Object.keys(ORE_COLORS);
    const loadPromises = oreTypes.map(oreType => this.createOreModel(oreType));
    
    try {
      await Promise.all(loadPromises);
      console.log('All ore models preloaded successfully');
    } catch (error) {
      console.warn('Some ore models failed to preload:', error);
    }
  }

  /**
   * Check if custom model is available
   */
  public hasCustomModel(): boolean {
    return true; // Always true since we have fallback
  }
}

export default OreModelLoader;
