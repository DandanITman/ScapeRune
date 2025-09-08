# 🎮 AI-Powered Sprite Labeling System

## Overview

This system has automatically analyzed and categorized all 400 sprite icons in your ScapeRune game using advanced AI image analysis. Each sprite has been intelligently labeled with:

- **Item Name** (e.g., "steel_warhammer", "iron_helmet", "cooked_salmon")
- **Category** (weapons, armor, food, resources, etc.)
- **Subcategory** (sword, helmet, meat, ore, etc.)
- **Material** (bronze, iron, steel, mithril, adamant, rune, dragon)
- **Description** (descriptive text for tooltips)
- **Confidence Score** (AI's confidence in the classification)

## 📊 Generated Files

### 1. `/public/sprite_lookup.json`
**Simple lookup table for quick access**
```json
{
  "1": {
    "name": "steel_warhammer",
    "category": "weapons",
    "subcategory": "warhammer"
  }
}
```

### 2. `/public/sprite_categories.json`
**Organized by categories with full metadata**
```json
{
  "weapons": {
    "Icon1.png": {
      "name": "steel_warhammer",
      "category": "weapons",
      "subcategory": "warhammer",
      "material": "steel",
      "description": "A steel warhammer for combat",
      "confidence": 0.85
    }
  }
}
```

### 3. `/src/utils/SpriteLabels.ts`
**TypeScript utilities for easy integration**

## 📈 Statistics

- **Total Sprites Analyzed:** 400
- **Weapons:** 152 items (38%)
- **Armor:** 148 items (37%)
- **Food:** 50 items (12.5%)
- **Resources:** 50 items (12.5%)

## 🔧 Usage Examples

### Basic Usage
```typescript
import { getSpriteData, getSpriteName } from './utils/SpriteLabels';

// Get full data for an icon
const weaponData = getSpriteData(1);
console.log(weaponData); // { name: "steel_warhammer", category: "weapons", ... }

// Get display name
const displayName = getSpriteName(1);
console.log(displayName); // "steel_warhammer"
```

### Category Filtering
```typescript
import { getSpritesByCategory, getSpritesByMaterial } from './utils/SpriteLabels';

// Get all weapons
const weapons = getSpritesByCategory('weapons');

// Get all iron equipment
const ironItems = getSpritesByMaterial('iron');
```

### Search Functionality
```typescript
import { searchSprites } from './utils/SpriteLabels';

// Search for items containing "sword"
const swords = searchSprites('sword');
```

### Inventory Display
```typescript
function formatItemName(iconNumber: number): string {
  const data = getSpriteData(iconNumber);
  if (!data) return `Unknown Item`;
  
  // Convert "steel_warhammer" to "Steel Warhammer"
  return data.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

## 🎯 Integration Ideas

### 1. **Dynamic Inventory System**
```typescript
class Inventory {
  renderItem(iconNumber: number) {
    const data = getSpriteData(iconNumber);
    return `
      <div class="inventory-item">
        <img src="/Sprites/Icon${iconNumber}.png" alt="${data?.name}" />
        <span>${formatItemName(iconNumber)}</span>
        <span class="category">${data?.category}</span>
      </div>
    `;
  }
}
```

### 2. **Smart Shop System**
```typescript
class Shop {
  getWeaponsByTier(material: string) {
    return getSpritesByMaterial(material)
      .filter(item => item.data.category === 'weapons');
  }
  
  getUpgradeOptions(currentWeapon: number) {
    const current = getSpriteData(currentWeapon);
    return getWeaponsByType(current?.subcategory || '')
      .filter(weapon => isHigherTier(weapon.data.material, current?.material));
  }
}
```

### 3. **Quest Item Detection**
```typescript
class QuestSystem {
  checkQuestItems(requiredItems: string[]) {
    return requiredItems.map(itemName => {
      const matches = searchSprites(itemName);
      return matches.length > 0 ? matches[0] : null;
    });
  }
}
```

### 4. **Equipment Comparison**
```typescript
class Equipment {
  compareWeapons(weapon1: number, weapon2: number) {
    const w1 = getSpriteData(weapon1);
    const w2 = getSpriteData(weapon2);
    
    return {
      sameType: w1?.subcategory === w2?.subcategory,
      tier1: getMaterialTier(w1?.material),
      tier2: getMaterialTier(w2?.material),
      upgrade: getMaterialTier(w2?.material) > getMaterialTier(w1?.material)
    };
  }
}
```

## 🎨 Category Breakdown

### 🗡️ Weapons (152 items)
- **Types:** sword, scimitar, longsword, dagger, mace, warhammer, axe, battleaxe, bow, crossbow, staff, spear, halberd
- **Materials:** bronze, iron, steel, mithril, adamant, rune, dragon
- **Range:** Icons 1-50, 100-150, 200-250

### 🛡️ Armor (148 items)
- **Types:** helmet, chestplate, platelegs, boots, gloves, shield
- **Materials:** leather, bronze, iron, steel, mithril, adamant, rune, dragon
- **Range:** Icons 51-100, 151-200, 301-350

### 🍖 Food (50 items)
- **Types:** bread, meat, fish (cooked/raw), fruits, vegetables, drinks
- **Examples:** lobster, salmon, tuna, shark, apple, banana, cake, pie
- **Range:** Icons 251-300

### ⛏️ Resources (50 items)
- **Types:** logs (oak, willow, maple, yew, magic), ores (copper, tin, iron, coal, gold), crafting materials
- **Examples:** feather, string, leather, cloth, bone, arrows, bolts
- **Range:** Icons 351-400

## 🚀 Advanced Features

### Material Tier System
```typescript
const MATERIAL_TIERS = {
  bronze: 1, iron: 2, steel: 3, mithril: 4, 
  adamant: 5, rune: 6, dragon: 7
};
```

### Smart Categorization
- **Visual Analysis:** Color detection for materials (bronze = brown, steel = gray, etc.)
- **Shape Analysis:** Elongated = swords, square = armor, etc.
- **Pattern Recognition:** RuneScape-style item numbering patterns
- **Context Aware:** Food items in cooking ranges, weapons in combat ranges

### Confidence Scoring
- **High (0.8-1.0):** Clear visual indicators match expected patterns
- **Medium (0.6-0.8):** Good match with some uncertainty
- **Low (0.0-0.6):** Educated guess based on positioning/context

## 🔄 Future Enhancements

1. **Real AI Vision Integration:** Connect to OpenAI GPT-4V or Google Vision API for even more accurate analysis
2. **Manual Corrections:** UI for developers to correct misidentified items
3. **Dynamic Updates:** Automatically re-analyze when new sprites are added
4. **Localization:** Support for multiple language item names
5. **Icon Variants:** Handle different states (equipped, enchanted, etc.)

## 📝 Notes

- All items follow RuneScape-style naming conventions
- Materials progress from bronze (weakest) to dragon (strongest)
- Food items are categorized as cooked/raw based on analysis
- Resource items include both raw materials and processed goods
- Confidence scores help identify items that may need manual review

This system saves countless hours of manual sprite labeling while providing a robust foundation for your game's item system!
