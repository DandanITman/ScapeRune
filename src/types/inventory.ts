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
  }
};
