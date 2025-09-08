import { OreModelLoader } from '../utils/OreModelLoader';

/**
 * Test script to demonstrate the enhanced ore model system
 * This can be run in the browser console to test ore model loading
 */

export class OreModelTester {
  public static async testAllOreModels(): Promise<void> {
    console.log('🎨 Testing Enhanced Ore Model System');
    console.log('=====================================');
    
    const oreModelLoader = OreModelLoader.getInstance();
    
    // Test ore types with their expected colors
    const oreTypes = [
      'clay', 'copper', 'tin', 'iron', 'silver', 
      'coal', 'gold', 'gem', 'mithril', 'adamant', 'runite'
    ];
    
    console.log('📋 Available Ore Types:');
    oreTypes.forEach(ore => {
      const config = oreModelLoader.getOreConfig(ore);
      if (config) {
        const colorHex = `#${config.baseColor.toString(16).padStart(6, '0').toUpperCase()}`;
        console.log(`  • ${config.name}: ${colorHex} (${ore})`);
      }
    });
    
    console.log('\n🏗️ Testing Model Creation:');
    
    for (const oreType of oreTypes) {
      try {
        console.log(`  Loading ${oreType} model...`);
        const model = await oreModelLoader.createOreModel(oreType);
        const config = oreModelLoader.getOreConfig(oreType);
        
        if (config) {
          console.log(`    ✅ ${config.name} loaded successfully`);
          console.log(`       Color: #${config.baseColor.toString(16).padStart(6, '0').toUpperCase()}`);
          console.log(`       Metallic: ${config.metallic || 0.5}`);
          console.log(`       Roughness: ${config.roughness || 0.5}`);
          
          if (config.emissive) {
            console.log(`       Emissive: #${config.emissive.toString(16).padStart(6, '0').toUpperCase()}`);
            console.log(`       Glow Intensity: ${config.emissiveIntensity || 0.1}`);
          }
        }
        
        // Clean up the model
        model.clear();
        
      } catch (error) {
        console.warn(`    ⚠️ Failed to load ${oreType}:`, error);
      }
    }
    
    console.log('\n🎯 Testing Custom Model Detection:');
    console.log(`Custom model available: ${oreModelLoader.hasCustomModel()}`);
    
    console.log('\n✨ Enhanced Ore Features:');
    console.log('  • Authentic RuneScape Classic ore colors');
    console.log('  • PBR materials with metallic/roughness properties');
    console.log('  • Emissive glow effects for precious ores');
    console.log('  • Sparkle effects for gem rocks');
    console.log('  • Coal dust effects');
    console.log('  • Automatic fallback to geometry if resources/ores.glb missing');
    console.log('  • Async loading with caching');
    console.log('  • Proper respawn with custom models');
    
    console.log('\n🎮 In-Game Usage:');
    console.log('  1. Mine any ore rock to see it disappear');
    console.log('  2. Wait for respawn timer to see it reappear');
    console.log('  3. Notice authentic RSC colors for each ore type');
    console.log('  4. Observe special effects on precious ores');
    
    console.log('\n📁 Model Files:');
    console.log('  • Place ores.glb in public/models/resources/ for custom 3D models');
    console.log('  • System falls back to procedural geometry if missing');
    console.log('  • Colors applied programmatically based on ore type');
  }
  
  public static logOreColors(): void {
    console.log('🎨 RuneScape Classic Ore Color Reference:');
    console.log('==========================================');
    
    const oreModelLoader = OreModelLoader.getInstance();
    const oreTypes = [
      'clay', 'copper', 'tin', 'iron', 'silver', 
      'coal', 'gold', 'gem', 'mithril', 'adamant', 'runite'
    ];
    
    oreTypes.forEach(ore => {
      const config = oreModelLoader.getOreConfig(ore);
      if (config) {
        const baseColor = `#${config.baseColor.toString(16).padStart(6, '0').toUpperCase()}`;
        const accentColor = config.accentColor ? 
          `#${config.accentColor.toString(16).padStart(6, '0').toUpperCase()}` : 'None';
        const emissiveColor = config.emissive ? 
          `#${config.emissive.toString(16).padStart(6, '0').toUpperCase()}` : 'None';
        
        console.log(`${config.name}:`);
        console.log(`  Base: ${baseColor}`);
        console.log(`  Accent: ${accentColor}`);
        console.log(`  Emissive: ${emissiveColor}`);
        console.log(`  Metallic: ${config.metallic || 0.5}`);
        console.log(`  Roughness: ${config.roughness || 0.5}`);
        console.log('');
      }
    });
  }
}

// Make available globally for browser console testing
declare global {
  interface Window {
    OreModelTester: typeof OreModelTester;
  }
}

(window as Window).OreModelTester = OreModelTester;

console.log('🔧 Ore Model Tester loaded! Use OreModelTester.testAllOreModels() to test the system.');
