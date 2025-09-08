/**
 * Example usage of the AI-generated sprite labeling system
 */

import { 
  getSpriteData, 
  getSpriteName, 
  getSpritesByCategory, 
  getSpritesByMaterial,
  searchSprites,
  getWeaponsByType,
  getArmorByType,
  SPRITE_CATEGORIES_LIST,
  MATERIALS,
  WEAPON_TYPES,
  ARMOR_TYPES
} from './SpriteLabels';

// Example: Get data for a specific icon
console.log('Icon 1 data:', getSpriteData(1));
// Output: { name: "steel_warhammer", category: "weapons", subcategory: "warhammer", material: "steel", ... }

// Example: Get user-friendly name for display
console.log('Icon 1 name:', getSpriteName(1));
// Output: "steel_warhammer"

// Example: Get all weapons
const allWeapons = getSpritesByCategory(SPRITE_CATEGORIES_LIST.WEAPONS);
console.log(`Found ${allWeapons.length} weapons`);

// Example: Get all iron equipment
const ironItems = getSpritesByMaterial(MATERIALS.IRON);
console.log(`Found ${ironItems.length} iron items`);

// Example: Search for specific items
const swordItems = searchSprites('sword');
console.log(`Found ${swordItems.length} sword-related items`);

// Example: Get all warhammers
const warhammers = getWeaponsByType(WEAPON_TYPES.WARHAMMER);
console.log(`Found ${warhammers.length} warhammers`);

// Example: Get all helmets
const helmets = getArmorByType(ARMOR_TYPES.HELMET);
console.log(`Found ${helmets.length} helmets`);

// Example: Create an item inventory display
function displayInventoryItem(iconNumber: number): string {
  const data = getSpriteData(iconNumber);
  if (!data) return `Unknown item (Icon${iconNumber})`;
  
  const material = data.material ? `${data.material} ` : '';
  const name = data.subcategory.replace('_', ' ');
  
  return `${material}${name}`.replace(/\b\w/g, l => l.toUpperCase());
}

// Example usage in inventory
console.log('Inventory display examples:');
console.log(displayInventoryItem(1));   // "Steel Warhammer"
console.log(displayInventoryItem(51));  // "Steel Boots"
console.log(displayInventoryItem(251)); // "Bread"
console.log(displayInventoryItem(351)); // "Feather"

/**
 * Example: Create a shop system using sprite categories
 */
class GameShop {
  getWeaponShop() {
    return getSpritesByCategory('weapons').slice(0, 20); // First 20 weapons
  }
  
  getArmorShop() {
    return getSpritesByCategory('armor').slice(0, 20); // First 20 armor pieces
  }
  
  getFoodShop() {
    return getSpritesByCategory('food').slice(0, 10); // First 10 food items
  }
  
  searchShopItems(searchTerm: string) {
    return searchSprites(searchTerm);
  }
}

/**
 * Example: Equipment upgrade system
 */
class EquipmentUpgrader {
  getMaterialTier(material: string): number {
    const tiers = {
      [MATERIALS.BRONZE]: 1,
      [MATERIALS.IRON]: 2,
      [MATERIALS.STEEL]: 3,
      [MATERIALS.MITHRIL]: 4,
      [MATERIALS.ADAMANT]: 5,
      [MATERIALS.RUNE]: 6,
      [MATERIALS.DRAGON]: 7
    };
    return tiers[material as keyof typeof tiers] || 0;
  }
  
  canUpgrade(currentItemIcon: number, targetItemIcon: number): boolean {
    const current = getSpriteData(currentItemIcon);
    const target = getSpriteData(targetItemIcon);
    
    if (!current || !target) return false;
    if (current.subcategory !== target.subcategory) return false; // Same item type
    
    const currentTier = this.getMaterialTier(current.material || '');
    const targetTier = this.getMaterialTier(target.material || '');
    
    return targetTier > currentTier;
  }
}

export { GameShop, EquipmentUpgrader, displayInventoryItem };
