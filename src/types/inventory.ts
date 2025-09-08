// Inventory types for ScapeRune

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon?: string;
  description?: string;
  type: ItemType;
  stackable: boolean;
  value?: number;
  equipSlot?: EquipSlot;
  healAmount?: number;
  attackBonus?: number;
  defenseBonus?: number;
  strengthBonus?: number;
  magicBonus?: number;
  rangedBonus?: number;
  weaponType?: 'melee' | 'ranged' | 'magic';
  ammoType?: 'arrow' | 'bolt';
  requirements?: ItemRequirements;
}

export const ItemType = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  FOOD: 'food',
  TOOL: 'tool',
  RESOURCE: 'resource',
  RUNE: 'rune',
  POTION: 'potion',
  AMMO: 'ammo',
  MISC: 'misc'
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];

export const EquipSlot = {
  WEAPON: 'weapon',
  HELMET: 'helmet',
  BODY: 'body',
  LEGS: 'legs',
  BOOTS: 'boots',
  GLOVES: 'gloves',
  CAPE: 'cape',
  AMULET: 'amulet',
  RING: 'ring',
  SHIELD: 'shield'
} as const;

export type EquipSlot = typeof EquipSlot[keyof typeof EquipSlot];

export interface ItemRequirements {
  attack?: number;
  defense?: number;
  strength?: number;
  magic?: number;
  ranged?: number;
  prayer?: number;
  woodcutting?: number;
  mining?: number;
  fishing?: number;
  smithing?: number;
  cooking?: number;
  crafting?: number;
  fletching?: number;
}

export interface InventorySlot {
  slotIndex: number;
  item: InventoryItem | null;
}

export interface Equipment {
  weapon?: InventoryItem;
  helmet?: InventoryItem;
  body?: InventoryItem;
  legs?: InventoryItem;
  boots?: InventoryItem;
  gloves?: InventoryItem;
  cape?: InventoryItem;
  amulet?: InventoryItem;
  ring?: InventoryItem;
  shield?: InventoryItem;
}

// Item definitions
export const ITEM_DEFINITIONS: Record<string, Omit<InventoryItem, 'quantity'>> = {
  // Food items
  bread: {
    id: 'bread',
    name: 'Bread',
    icon: '🍞',
    description: 'This looks good to eat.',
    type: ItemType.FOOD,
    stackable: true,
    value: 12,
    healAmount: 5
  },
  
  // Woodcutting resources
  logs: {
    id: 'logs',
    name: 'Logs',
    icon: '🪵',
    description: 'Some wood logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1
  },
  
  oak_logs: {
    id: 'oak_logs',
    name: 'Oak logs',
    icon: '🪵',
    description: 'Some oak logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 3
  },
  
  willow_logs: {
    id: 'willow_logs',
    name: 'Willow logs',
    icon: '🪵',
    description: 'Some willow logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 7
  },
  
  maple_logs: {
    id: 'maple_logs',
    name: 'Maple logs',
    icon: '🪵',
    description: 'Some maple logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 15
  },
  
  yew_logs: {
    id: 'yew_logs',
    name: 'Yew logs',
    icon: '🪵',
    description: 'Some yew logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 40
  },
  
  magic_logs: {
    id: 'magic_logs',
    name: 'Magic logs',
    icon: '🪵',
    description: 'Some magic logs.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 100
  },
  
  // Mining resources
  clay: {
    id: 'clay',
    name: 'Clay',
    icon: '🪨',
    description: 'Soft clay for making pottery.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1
  },
  
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper ore',
    icon: '⛏️',
    description: 'Copper ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 4
  },
  
  tin_ore: {
    id: 'tin_ore',
    name: 'Tin ore',
    icon: '⛏️',
    description: 'Tin ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 4
  },
  
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron ore',
    icon: '⛏️',
    description: 'Iron ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 13
  },
  
  coal: {
    id: 'coal',
    name: 'Coal',
    icon: '⚫',
    description: 'Coal.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 30
  },
  
  gold_ore: {
    id: 'gold_ore',
    name: 'Gold ore',
    icon: '🟡',
    description: 'Gold ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 70
  },
  
  silver_ore: {
    id: 'silver_ore',
    name: 'Silver ore',
    icon: '🤍',
    description: 'Silver ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 60
  },
  
  mithril_ore: {
    id: 'mithril_ore',
    name: 'Mithril ore',
    icon: '💙',
    description: 'A lump of mithril ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 150
  },
  
  adamant_ore: {
    id: 'adamant_ore',
    name: 'Adamantite ore',
    icon: '💎',
    description: 'A lump of adamantite ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 400
  },
  
  runite_ore: {
    id: 'runite_ore',
    name: 'Runite ore',
    icon: '💎',
    description: 'A lump of runite ore.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 800
  },
  
  // Bars (for smithing)
  bronze_bar: {
    id: 'bronze_bar',
    name: 'Bronze bar',
    icon: '🟫',
    description: 'A bar of bronze.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 25
  },
  
  iron_bar: {
    id: 'iron_bar',
    name: 'Iron bar',
    icon: '⬜',
    description: 'A bar of iron.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 75
  },
  
  steel_bar: {
    id: 'steel_bar',
    name: 'Steel bar',
    icon: '⬛',
    description: 'A bar of steel.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 200
  },
  
  mithril_bar: {
    id: 'mithril_bar',
    name: 'Mithril bar',
    icon: '🟦',
    description: 'A bar of mithril.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 750
  },
  
  adamant_bar: {
    id: 'adamant_bar',
    name: 'Adamant bar',
    icon: '🟩',
    description: 'A bar of adamant.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 2000
  },
  
  rune_bar: {
    id: 'rune_bar',
    name: 'Rune bar',
    icon: '🟪',
    description: 'A bar of rune.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 12000
  },
  
  // Gems
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    icon: '💎',
    description: 'A beautiful gem.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 125
  },
  
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    icon: '💚',
    description: 'A valuable gem.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 315
  },
  
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    icon: '♦️',
    description: 'A precious gem.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 500
  },
  
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    icon: '💎',
    description: 'A very precious gem.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1000
  },
  
  // Fish
  raw_shrimp: {
    id: 'raw_shrimp',
    name: 'Raw shrimp',
    icon: '🦐',
    description: 'I should try cooking this.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1
  },
  
  raw_sardine: {
    id: 'raw_sardine',
    name: 'Raw sardine',
    icon: '🐟',
    description: 'A raw sardine.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 6
  },
  
  raw_salmon: {
    id: 'raw_salmon',
    name: 'Raw salmon',
    icon: '🐟',
    description: 'A raw salmon.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 25
  },
  
  raw_lobster: {
    id: 'raw_lobster',
    name: 'Raw lobster',
    icon: '🦞',
    description: 'A raw lobster.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 100
  },
  
  raw_pike: {
    id: 'raw_pike',
    name: 'Raw pike',
    icon: '🐟',
    description: 'A raw pike.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 30
  },
  
  raw_tuna: {
    id: 'raw_tuna',
    name: 'Raw tuna',
    icon: '🐟',
    description: 'A raw tuna.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 100
  },
  
  raw_swordfish: {
    id: 'raw_swordfish',
    name: 'Raw swordfish',
    icon: '🐟',
    description: 'A raw swordfish.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 200
  },
  
  raw_shark: {
    id: 'raw_shark',
    name: 'Raw shark',
    icon: '🦈',
    description: 'A raw shark.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 400
  },
  
  raw_herring: {
    id: 'raw_herring',
    name: 'Raw herring',
    icon: '🐟',
    description: 'A raw herring.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 7
  },
  
  raw_anchovies: {
    id: 'raw_anchovies',
    name: 'Raw anchovies',
    icon: '🐟',
    description: 'Raw anchovies.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 4
  },
  
  raw_mackerel: {
    id: 'raw_mackerel',
    name: 'Raw mackerel',
    icon: '🐟',
    description: 'A raw mackerel.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 10
  },
  
  raw_trout: {
    id: 'raw_trout',
    name: 'Raw trout',
    icon: '🐟',
    description: 'A raw trout.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 20
  },
  
  raw_cod: {
    id: 'raw_cod',
    name: 'Raw cod',
    icon: '🐟',
    description: 'A raw cod.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 18
  },
  
  // Cooked fish (for cooking skill)
  cooked_shrimp: {
    id: 'cooked_shrimp',
    name: 'Cooked shrimp',
    icon: '🍤',
    description: 'Some nicely cooked shrimp.',
    type: ItemType.FOOD,
    stackable: true,
    value: 8,
    healAmount: 3
  },
  
  cooked_sardine: {
    id: 'cooked_sardine',
    name: 'Cooked sardine',
    icon: '🐟',
    description: 'A cooked sardine.',
    type: ItemType.FOOD,
    stackable: true,
    value: 12,
    healAmount: 4
  },
  
  cooked_herring: {
    id: 'cooked_herring',
    name: 'Cooked herring',
    icon: '🐟',
    description: 'A cooked herring.',
    type: ItemType.FOOD,
    stackable: true,
    value: 14,
    healAmount: 5
  },
  
  cooked_anchovies: {
    id: 'cooked_anchovies',
    name: 'Cooked anchovies',
    icon: '🐟',
    description: 'Cooked anchovies.',
    type: ItemType.FOOD,
    stackable: true,
    value: 8,
    healAmount: 1
  },
  
  cooked_mackerel: {
    id: 'cooked_mackerel',
    name: 'Cooked mackerel',
    icon: '🐟',
    description: 'A cooked mackerel.',
    type: ItemType.FOOD,
    stackable: true,
    value: 32,
    healAmount: 6
  },
  
  cooked_trout: {
    id: 'cooked_trout',
    name: 'Cooked trout',
    icon: '🐟',
    description: 'A cooked trout.',
    type: ItemType.FOOD,
    stackable: true,
    value: 40,
    healAmount: 7
  },
  
  cooked_cod: {
    id: 'cooked_cod',
    name: 'Cooked cod',
    icon: '🐟',
    description: 'A cooked cod.',
    type: ItemType.FOOD,
    stackable: true,
    value: 36,
    healAmount: 7
  },
  
  cooked_pike: {
    id: 'cooked_pike',
    name: 'Cooked pike',
    icon: '🐟',
    description: 'A cooked pike.',
    type: ItemType.FOOD,
    stackable: true,
    value: 64,
    healAmount: 8
  },
  
  cooked_salmon: {
    id: 'cooked_salmon',
    name: 'Cooked salmon',
    icon: '🐟',
    description: 'A cooked salmon.',
    type: ItemType.FOOD,
    stackable: true,
    value: 90,
    healAmount: 9
  },
  
  cooked_tuna: {
    id: 'cooked_tuna',
    name: 'Cooked tuna',
    icon: '🐟',
    description: 'A cooked tuna.',
    type: ItemType.FOOD,
    stackable: true,
    value: 120,
    healAmount: 10
  },
  
  cooked_lobster: {
    id: 'cooked_lobster',
    name: 'Cooked lobster',
    icon: '🦞',
    description: 'A cooked lobster.',
    type: ItemType.FOOD,
    stackable: true,
    value: 240,
    healAmount: 12
  },
  
  cooked_bass: {
    id: 'cooked_bass',
    name: 'Cooked bass',
    icon: '🐟',
    description: 'A cooked bass.',
    type: ItemType.FOOD,
    stackable: true,
    value: 270,
    healAmount: 13
  },
  
  cooked_swordfish: {
    id: 'cooked_swordfish',
    name: 'Cooked swordfish',
    icon: '🐟',
    description: 'A cooked swordfish.',
    type: ItemType.FOOD,
    stackable: true,
    value: 480,
    healAmount: 14
  },
  
  cooked_shark: {
    id: 'cooked_shark',
    name: 'Cooked shark',
    icon: '🦈',
    description: 'A cooked shark.',
    type: ItemType.FOOD,
    stackable: true,
    value: 800,
    healAmount: 20
  },
  
  // Burnt food (cooking failures)
  burnt_shrimp: {
    id: 'burnt_shrimp',
    name: 'Burnt shrimp',
    icon: '🖤',
    description: 'Badly burnt shrimp.',
    type: ItemType.MISC,
    stackable: true,
    value: 1
  },
  
  burnt_fish: {
    id: 'burnt_fish',
    name: 'Burnt fish',
    icon: '🖤',
    description: 'Badly burnt fish.',
    type: ItemType.MISC,
    stackable: true,
    value: 1
  },
  
  // Gems
  uncut_sapphire: {
    id: 'uncut_sapphire',
    name: 'Uncut sapphire',
    icon: '💎',
    description: 'An uncut sapphire.',
    type: ItemType.MISC,
    stackable: true,
    value: 25
  },
  
  uncut_emerald: {
    id: 'uncut_emerald',
    name: 'Uncut emerald',
    icon: '💚',
    description: 'An uncut emerald.',
    type: ItemType.MISC,
    stackable: true,
    value: 55
  },
  
  uncut_ruby: {
    id: 'uncut_ruby',
    name: 'Uncut ruby',
    icon: '💎',
    description: 'An uncut ruby.',
    type: ItemType.MISC,
    stackable: true,
    value: 100
  },
  
  uncut_diamond: {
    id: 'uncut_diamond',
    name: 'Uncut diamond',
    icon: '💎',
    description: 'An uncut diamond.',
    type: ItemType.MISC,
    stackable: true,
    value: 200
  },
  
  // Junk items
  leather_gloves: {
    id: 'leather_gloves',
    name: 'Leather gloves',
    icon: '🧤',
    description: 'A pair of leather gloves.',
    type: ItemType.MISC,
    stackable: false,
    value: 1
  },
  
  boots: {
    id: 'boots',
    name: 'Boots',
    icon: '👢',
    description: 'A pair of boots.',
    type: ItemType.MISC,
    stackable: false,
    value: 1
  },
  
  seaweed: {
    id: 'seaweed',
    name: 'Seaweed',
    icon: '🌿',
    description: 'Wet seaweed.',
    type: ItemType.MISC,
    stackable: true,
    value: 1
  },
  
  oyster: {
    id: 'oyster',
    name: 'Oyster',
    icon: '🦪',
    description: 'An oyster.',
    type: ItemType.MISC,
    stackable: true,
    value: 4
  },
  
  casket: {
    id: 'casket',
    name: 'Casket',
    icon: '📦',
    description: 'A mysterious casket.',
    type: ItemType.MISC,
    stackable: false,
    value: 10
  },

  // Weapons
  bronze_sword: {
    id: 'bronze_sword',
    name: 'Bronze sword',
    icon: '⚔️',
    description: 'A razor sharp sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 32,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 4,
    requirements: { attack: 1 }
  },
  
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron sword',
    icon: '⚔️',
    description: 'A sharp iron sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 98,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 9,
    requirements: { attack: 1 }
  },
  
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel sword',
    icon: '⚔️',
    description: 'A fine steel sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 350,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 14,
    requirements: { attack: 5 }
  },
  
  mithril_sword: {
    id: 'mithril_sword',
    name: 'Mithril sword',
    icon: '⚔️',
    description: 'A mithril sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 1300,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 20,
    requirements: { attack: 20 }
  },
  
  adamant_sword: {
    id: 'adamant_sword',
    name: 'Adamant sword',
    icon: '⚔️',
    description: 'An adamant sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 3200,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 26,
    requirements: { attack: 30 }
  },
  
  rune_sword: {
    id: 'rune_sword',
    name: 'Rune sword',
    icon: '⚔️',
    description: 'A rune sword.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 20800,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 32,
    requirements: { attack: 40 }
  },
  
  // Armor - Helmets
  bronze_helmet: {
    id: 'bronze_helmet',
    name: 'Bronze helmet',
    icon: '⛑️',
    description: 'A bronze helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 22,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 2,
    requirements: { defense: 1 }
  },
  
  iron_helmet: {
    id: 'iron_helmet',
    name: 'Iron helmet',
    icon: '⛑️',
    description: 'An iron helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 67,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 4,
    requirements: { defense: 1 }
  },
  
  steel_helmet: {
    id: 'steel_helmet',
    name: 'Steel helmet',
    icon: '⛑️',
    description: 'A steel helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 238,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 7,
    requirements: { defense: 5 }
  },
  
  // Armor - Body
  bronze_chainmail: {
    id: 'bronze_chainmail',
    name: 'Bronze chainmail',
    icon: '🦺',
    description: 'A bronze chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 89,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 6,
    requirements: { defense: 1 }
  },
  
  iron_chainmail: {
    id: 'iron_chainmail',
    name: 'Iron chainmail',
    icon: '🦺',
    description: 'An iron chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 268,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 12,
    requirements: { defense: 1 }
  },
  
  steel_chainmail: {
    id: 'steel_chainmail',
    name: 'Steel chainmail',
    icon: '🦺',
    description: 'A steel chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 950,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 18,
    requirements: { defense: 5 }
  },
  
  // Armor - Legs
  bronze_platelegs: {
    id: 'bronze_platelegs',
    name: 'Bronze platelegs',
    icon: '👖',
    description: 'Bronze platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 67,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 4,
    requirements: { defense: 1 }
  },
  
  iron_platelegs: {
    id: 'iron_platelegs',
    name: 'Iron platelegs',
    icon: '👖',
    description: 'Iron platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 201,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 9,
    requirements: { defense: 1 }
  },
  
  steel_platelegs: {
    id: 'steel_platelegs',
    name: 'Steel platelegs',
    icon: '👖',
    description: 'Steel platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 713,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 13,
    requirements: { defense: 5 }
  },
  
  // Shields
  bronze_shield: {
    id: 'bronze_shield',
    name: 'Bronze shield',
    icon: '🛡️',
    description: 'A bronze shield.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 45,
    equipSlot: EquipSlot.SHIELD,
    defenseBonus: 3,
    requirements: { defense: 1 }
  },
  
  iron_shield: {
    id: 'iron_shield',
    name: 'Iron shield',
    icon: '🛡️',
    description: 'An iron shield.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 134,
    equipSlot: EquipSlot.SHIELD,
    defenseBonus: 6,
    requirements: { defense: 1 }
  },
  
  steel_shield: {
    id: 'steel_shield',
    name: 'Steel shield',
    icon: '🛡️',
    description: 'A steel shield.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 475,
    equipSlot: EquipSlot.SHIELD,
    defenseBonus: 9,
    requirements: { defense: 5 }
  },
  
  // Tools
  bronze_axe: {
    id: 'bronze_axe',
    name: 'Bronze axe',
    icon: '🪓',
    description: 'An axe for cutting trees.',
    type: ItemType.TOOL,
    stackable: false,
    value: 16,
    requirements: { woodcutting: 1 }
  },
  
  bronze_pickaxe: {
    id: 'bronze_pickaxe',
    name: 'Bronze pickaxe',
    icon: '⛏️',
    description: 'Used for mining.',
    type: ItemType.TOOL,
    stackable: false,
    value: 32,
    requirements: { mining: 1 }
  },
  
  small_fishing_net: {
    id: 'small_fishing_net',
    name: 'Small fishing net',
    icon: '🕸️',
    description: 'A small net for catching fish.',
    type: ItemType.TOOL,
    stackable: false,
    value: 5,
    requirements: { fishing: 1 }
  },

  // Additional weapon types - Daggers
  bronze_dagger: {
    id: 'bronze_dagger',
    name: 'Bronze dagger',
    icon: '🗡️',
    description: 'A sharp bronze dagger.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 25,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 2,
    strengthBonus: 1,
    requirements: { attack: 1 }
  },

  iron_dagger: {
    id: 'iron_dagger',
    name: 'Iron dagger',
    icon: '🗡️',
    description: 'A sharp iron dagger.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 75,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 6,
    strengthBonus: 3,
    requirements: { attack: 1 }
  },

  // Battleaxes
  bronze_battleaxe: {
    id: 'bronze_battleaxe',
    name: 'Bronze battleaxe',
    icon: '🪓',
    description: 'A large bronze battleaxe.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 80,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 2,
    strengthBonus: 6,
    requirements: { attack: 10 }
  },

  iron_battleaxe: {
    id: 'iron_battleaxe',
    name: 'Iron battleaxe',
    icon: '🪓',
    description: 'A large iron battleaxe.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 182,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 6,
    strengthBonus: 11,
    requirements: { attack: 10 }
  },

  // Maces
  bronze_mace: {
    id: 'bronze_mace',
    name: 'Bronze mace',
    icon: '🔨',
    description: 'A bronze mace.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 37,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 3,
    strengthBonus: 2,
    requirements: { attack: 1 }
  },

  iron_mace: {
    id: 'iron_mace',
    name: 'Iron mace',
    icon: '🔨',
    description: 'An iron mace.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 112,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 7,
    strengthBonus: 5,
    requirements: { attack: 1 }
  },

  // Complete armor sets for higher tier metals
  mithril_helmet: {
    id: 'mithril_helmet',
    name: 'Mithril helmet',
    icon: '⛑️',
    description: 'A mithril helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 875,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 10,
    requirements: { defense: 20 }
  },

  mithril_chainmail: {
    id: 'mithril_chainmail',
    name: 'Mithril chainmail',
    icon: '🦺',
    description: 'A mithril chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 3500,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 28,
    requirements: { defense: 20 }
  },

  mithril_platelegs: {
    id: 'mithril_platelegs',
    name: 'Mithril platelegs',
    icon: '👖',
    description: 'Mithril platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 2625,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 20,
    requirements: { defense: 20 }
  },

  // Adamant armor
  adamant_helmet: {
    id: 'adamant_helmet',
    name: 'Adamant helmet',
    icon: '⛑️',
    description: 'An adamant helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 2156,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 13,
    requirements: { defense: 30 }
  },

  adamant_chainmail: {
    id: 'adamant_chainmail',
    name: 'Adamant chainmail',
    icon: '🦺',
    description: 'An adamant chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 8625,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 35,
    requirements: { defense: 30 }
  },

  adamant_platelegs: {
    id: 'adamant_platelegs',
    name: 'Adamant platelegs',
    icon: '👖',
    description: 'Adamant platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 6468,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 25,
    requirements: { defense: 30 }
  },

  // Rune armor
  rune_helmet: {
    id: 'rune_helmet',
    name: 'Rune helmet',
    icon: '⛑️',
    description: 'A rune helmet.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 14000,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 16,
    requirements: { defense: 40 }
  },

  rune_chainmail: {
    id: 'rune_chainmail',
    name: 'Rune chainmail',
    icon: '🦺',
    description: 'A rune chainmail.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 56000,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 42,
    requirements: { defense: 40 }
  },

  rune_platelegs: {
    id: 'rune_platelegs',
    name: 'Rune platelegs',
    icon: '👖',
    description: 'Rune platelegs.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 42000,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 30,
    requirements: { defense: 40 }
  },

  // Magic Runes
  air_rune: {
    id: 'air_rune',
    name: 'Air rune',
    icon: '💨',
    description: 'An elemental rune used for air spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 4
  },

  water_rune: {
    id: 'water_rune',
    name: 'Water rune',
    icon: '💧',
    description: 'An elemental rune used for water spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 4
  },

  earth_rune: {
    id: 'earth_rune',
    name: 'Earth rune',
    icon: '🌍',
    description: 'An elemental rune used for earth spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 4
  },

  fire_rune: {
    id: 'fire_rune',
    name: 'Fire rune',
    icon: '🔥',
    description: 'An elemental rune used for fire spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 4
  },

  mind_rune: {
    id: 'mind_rune',
    name: 'Mind rune',
    icon: '🧠',
    description: 'A catalytic rune used for basic spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 3
  },

  chaos_rune: {
    id: 'chaos_rune',
    name: 'Chaos rune',
    icon: '⚡',
    description: 'A catalytic rune used for bolt spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 12
  },

  death_rune: {
    id: 'death_rune',
    name: 'Death rune',
    icon: '☠️',
    description: 'A catalytic rune used for blast spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 180
  },

  law_rune: {
    id: 'law_rune',
    name: 'Law rune',
    icon: '⚖️',
    description: 'A catalytic rune used for teleport spells.',
    type: ItemType.RUNE,
    stackable: true,
    value: 300
  },

  // Magic Weapons
  staff: {
    id: 'staff',
    name: 'Staff',
    icon: '🪄',
    description: 'A basic magical staff.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 200,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 2,
    magicBonus: 3,
    requirements: { magic: 1 }
  },

  battle_staff: {
    id: 'battle_staff',
    name: 'Battle staff',
    icon: '🔮',
    description: 'A staff designed for magical combat.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 7000,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 12,
    magicBonus: 15,
    requirements: { magic: 30, attack: 30 }
  },

  // Magic Armor
  wizard_hat: {
    id: 'wizard_hat',
    name: 'Wizard hat',
    icon: '🎩',
    description: 'A hat worn by wizards.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 800,
    equipSlot: EquipSlot.HELMET,
    defenseBonus: 2,
    magicBonus: 5,
    requirements: { magic: 10 }
  },

  wizard_robe_top: {
    id: 'wizard_robe_top',
    name: 'Wizard robe (top)',
    icon: '👘',
    description: 'A robe worn by wizards.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 1200,
    equipSlot: EquipSlot.BODY,
    defenseBonus: 6,
    magicBonus: 8,
    requirements: { magic: 15 }
  },

  wizard_robe_bottom: {
    id: 'wizard_robe_bottom',
    name: 'Wizard robe (bottom)',
    icon: '👗',
    description: 'Wizard robe bottoms.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 900,
    equipSlot: EquipSlot.LEGS,
    defenseBonus: 4,
    magicBonus: 6,
    requirements: { magic: 12 }
  },

  // Ranged Weapons - Shortbows
  shortbow: {
    id: 'shortbow',
    name: 'Shortbow',
    icon: '🏹',
    description: 'A short wooden bow.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 50,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 1 },
    rangedBonus: 8
  },

  oak_shortbow: {
    id: 'oak_shortbow',
    name: 'Oak shortbow',
    icon: '🏹',
    description: 'A shortbow made from oak.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 120,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 5 },
    rangedBonus: 12
  },

  willow_shortbow: {
    id: 'willow_shortbow',
    name: 'Willow shortbow',
    icon: '🏹',
    description: 'A shortbow made from willow.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 300,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 15 },
    rangedBonus: 20
  },

  maple_shortbow: {
    id: 'maple_shortbow',
    name: 'Maple shortbow',
    icon: '🏹',
    description: 'A shortbow made from maple.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 750,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 25 },
    rangedBonus: 29
  },

  yew_shortbow: {
    id: 'yew_shortbow',
    name: 'Yew shortbow',
    icon: '🏹',
    description: 'A shortbow made from yew.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 2000,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 35 },
    rangedBonus: 47
  },

  magic_shortbow: {
    id: 'magic_shortbow',
    name: 'Magic shortbow',
    icon: '🏹',
    description: 'A shortbow made from magic wood.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 5000,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 45 },
    rangedBonus: 69
  },

  // Ranged Weapons - Longbows
  longbow: {
    id: 'longbow',
    name: 'Longbow',
    icon: '🏹',
    description: 'A long wooden bow.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 80,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 1 },
    rangedBonus: 10
  },

  oak_longbow: {
    id: 'oak_longbow',
    name: 'Oak longbow',
    icon: '🏹',
    description: 'A longbow made from oak.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 180,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 10 },
    rangedBonus: 15
  },

  willow_longbow: {
    id: 'willow_longbow',
    name: 'Willow longbow',
    icon: '🏹',
    description: 'A longbow made from willow.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 450,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 20 },
    rangedBonus: 25
  },

  maple_longbow: {
    id: 'maple_longbow',
    name: 'Maple longbow',
    icon: '🏹',
    description: 'A longbow made from maple.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 1200,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 30 },
    rangedBonus: 37
  },

  yew_longbow: {
    id: 'yew_longbow',
    name: 'Yew longbow',
    icon: '🏹',
    description: 'A longbow made from yew.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 3500,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 40 },
    rangedBonus: 56
  },

  magic_longbow: {
    id: 'magic_longbow',
    name: 'Magic longbow',
    icon: '🏹',
    description: 'A longbow made from magic wood.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 8000,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 50 },
    rangedBonus: 78
  },

  // Ranged Weapons - Crossbows
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    icon: '🏹',
    description: 'A wooden crossbow.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 200,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 1 },
    rangedBonus: 14
  },

  phoenix_crossbow: {
    id: 'phoenix_crossbow',
    name: 'Phoenix crossbow',
    icon: '🏹',
    description: 'A magical crossbow from the Shield of Arrav quest.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 500,
    equipSlot: EquipSlot.WEAPON,
    weaponType: 'ranged',
    requirements: { ranged: 1 },
    rangedBonus: 14
  },

  // Arrows
  bronze_arrow: {
    id: 'bronze_arrow',
    name: 'Bronze arrow',
    icon: '🏹',
    description: 'An arrow with a bronze tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 2,
    ammoType: 'arrow'
  },

  iron_arrow: {
    id: 'iron_arrow',
    name: 'Iron arrow',
    icon: '🏹',
    description: 'An arrow with an iron tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 4,
    ammoType: 'arrow'
  },

  steel_arrow: {
    id: 'steel_arrow',
    name: 'Steel arrow',
    icon: '🏹',
    description: 'An arrow with a steel tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 8,
    ammoType: 'arrow'
  },

  mithril_arrow: {
    id: 'mithril_arrow',
    name: 'Mithril arrow',
    icon: '🏹',
    description: 'An arrow with a mithril tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 15,
    ammoType: 'arrow'
  },

  adamant_arrow: {
    id: 'adamant_arrow',
    name: 'Adamant arrow',
    icon: '🏹',
    description: 'An arrow with an adamant tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 30,
    ammoType: 'arrow'
  },

  rune_arrow: {
    id: 'rune_arrow',
    name: 'Rune arrow',
    icon: '🏹',
    description: 'An arrow with a rune tip.',
    type: ItemType.AMMO,
    stackable: true,
    value: 80,
    ammoType: 'arrow'
  },

  ice_arrow: {
    id: 'ice_arrow',
    name: 'Ice arrow',
    icon: '❄️',
    description: 'A magical ice arrow.',
    type: ItemType.AMMO,
    stackable: true,
    value: 60,
    ammoType: 'arrow'
  },

  lit_arrow: {
    id: 'lit_arrow',
    name: 'Lit arrow',
    icon: '🔥',
    description: 'An arrow with a lit tip, used for special purposes.',
    type: ItemType.AMMO,
    stackable: true,
    value: 5,
    ammoType: 'arrow'
  },

  // Crossbow Bolts
  crossbow_bolt: {
    id: 'crossbow_bolt',
    name: 'Crossbow bolt',
    icon: '🏹',
    description: 'A standard crossbow bolt.',
    type: ItemType.AMMO,
    stackable: true,
    value: 12,
    ammoType: 'bolt'
  },

  oyster_pearl_bolt: {
    id: 'oyster_pearl_bolt',
    name: 'Oyster pearl bolt',
    icon: '🏹',
    description: 'A crossbow bolt tipped with oyster pearl.',
    type: ItemType.AMMO,
    stackable: true,
    value: 20,
    ammoType: 'bolt'
  },

  // Prayer Items - Bones
  bones: {
    id: 'bones',
    name: 'Bones',
    icon: '🦴',
    description: 'Bury for Prayer experience.',
    type: ItemType.MISC,
    stackable: true,
    value: 1
  },

  bat_bones: {
    id: 'bat_bones',
    name: 'Bat bones',
    icon: '🦴',
    description: 'Bones from a bat. Bury for Prayer experience.',
    type: ItemType.MISC,
    stackable: true,
    value: 2
  },

  big_bones: {
    id: 'big_bones',
    name: 'Big bones',
    icon: '🦴',
    description: 'Big bones from a large creature. Bury for Prayer experience.',
    type: ItemType.MISC,
    stackable: true,
    value: 5
  },

  dragon_bones: {
    id: 'dragon_bones',
    name: 'Dragon bones',
    icon: '🦴',
    description: 'Bones from a mighty dragon. Bury for Prayer experience.',
    type: ItemType.MISC,
    stackable: true,
    value: 30
  },

  // Monster Drops - Raw meat and materials
  raw_rat_meat: {
    id: 'raw_rat_meat',
    name: 'Raw rat meat',
    icon: '🥩',
    description: 'Raw meat from a rat. Can be cooked.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1
  },

  raw_beef: {
    id: 'raw_beef',
    name: 'Raw beef',
    icon: '🥩',
    description: 'Raw beef from a cow. Can be cooked.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 5
  },

  raw_chicken: {
    id: 'raw_chicken',
    name: 'Raw chicken',
    icon: '🥩',
    description: 'Raw chicken meat. Can be cooked.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 3
  },

  cowhide: {
    id: 'cowhide',
    name: 'Cowhide',
    icon: '🐮',
    description: 'Hide from a cow. Used for crafting.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 2
  },

  feather: {
    id: 'feather',
    name: 'Feather',
    icon: '🪶',
    description: 'A feather from a bird. Used for fletching arrows.',
    type: ItemType.RESOURCE,
    stackable: true,
    value: 1
  },

  // Quest items and rare drops
  loop_half_of_key: {
    id: 'loop_half_of_key',
    name: 'Loop half of key',
    icon: '🗝️',
    description: 'Half of a mysterious key.',
    type: ItemType.MISC,
    stackable: false,
    value: 1000
  },

  tooth_half_of_key: {
    id: 'tooth_half_of_key',
    name: 'Tooth half of key',
    icon: '🗝️',
    description: 'Half of a mysterious key.',
    type: ItemType.MISC,
    stackable: false,
    value: 1000
  },

  left_half_dragon_square_shield: {
    id: 'left_half_dragon_square_shield',
    name: 'Left half dragon square shield',
    icon: '🛡️',
    description: 'Left half of a dragon square shield.',
    type: ItemType.MISC,
    stackable: false,
    value: 50000
  },

  right_half_dragon_square_shield: {
    id: 'right_half_dragon_square_shield',
    name: 'Right half dragon square shield',
    icon: '🛡️',
    description: 'Right half of a dragon square shield.',
    type: ItemType.MISC,
    stackable: false,
    value: 50000
  },

  // Alcohol items (goblin drops)
  beer: {
    id: 'beer',
    name: 'Beer',
    icon: '🍺',
    description: 'A frothy mug of beer.',
    type: ItemType.FOOD,
    stackable: true,
    value: 2,
    healAmount: 1
  },

  // Weapon drops (bronze tier)
  bronze_spear: {
    id: 'bronze_spear',
    name: 'Bronze spear',
    icon: '🔱',
    description: 'A bronze spear.',
    type: ItemType.WEAPON,
    stackable: false,
    value: 37,
    equipSlot: EquipSlot.WEAPON,
    attackBonus: 3,
    strengthBonus: 2,
    requirements: { attack: 1 }
  },

  bronze_square_shield: {
    id: 'bronze_square_shield',
    name: 'Bronze square shield',
    icon: '🛡️',
    description: 'A bronze square shield.',
    type: ItemType.ARMOR,
    stackable: false,
    value: 56,
    equipSlot: EquipSlot.SHIELD,
    defenseBonus: 4,
    requirements: { defense: 1 }
  },

  // Tools
  hammer: {
    id: 'hammer',
    name: 'Hammer',
    icon: '🔨',
    description: 'A hammer used for smithing.',
    type: ItemType.TOOL,
    stackable: false,
    value: 1
  },

  // Coins (special handling for variable quantities)
  coins: {
    id: 'coins',
    name: 'Coins',
    icon: '🪙',
    description: 'Gold coins.',
    type: ItemType.MISC,
    stackable: true,
    value: 1
  }
};
