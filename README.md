# RuneScape Classic Recreation

A modern browser-based recreation of the classic RuneScape game, built with TypeScript, Three.js, React, and Vite.

## 🎮 Project Overview

This project aims to recreate the nostalgic experience of RuneScape Classic as a single-player browser game using modern web technologies. The game features a 3D isometric world, comprehensive skill system, combat mechanics, and all the beloved features that made the original game special.

## 🚀 Current Features (MVP)

### ✅ Implemented
- **3D Game World**: Isometric view with Three.js rendering
- **Player Character**: Basic 3D player model with movement
- **Movement Controls**: WASD/Arrow key movement
- **User Interface**: Classic RuneScape-style interface with panels
- **Stats System**: Complete 18-skill system with experience tracking
- **Game State Management**: Persistent game state using Zustand
- **Inventory System**: 30-slot inventory grid (placeholder items)
- **World Environment**: Basic terrain with trees and lighting

### 🎯 Core Systems Framework
- Experience calculation and level progression
- Combat level calculation
- Skill level requirements
- Basic item framework
- UI panel system (Stats, Inventory, Chat)

## 🛠️ Tech Stack

- **Frontend**: React with TypeScript
- **3D Engine**: Three.js for 3D rendering
- **Build Tool**: Vite for fast development
- **State Management**: Zustand for game state
- **Styling**: CSS with RuneScape Classic theme

## 📦 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: Navigate to `http://localhost:5173/`

## 🎮 How to Play

### Controls
- **Movement**: WASD keys or Arrow keys
- **Interface**: Click the buttons at the top to open panels
  - **Stats**: View skill levels and experience
  - **Inventory**: View items (placeholder items currently)
  - **Spells/Prayer/Friends/Options**: Coming soon

### Current Gameplay
- Move around the 3D world
- View your character stats and progression
- Explore the basic environment with trees and terrain

## 🗺️ Development Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Setup TypeScript + Vite project structure
- [x] Install and configure Three.js for 3D rendering
- [x] Setup React for UI overlays
- [x] Install Zustand for state management
- [x] Create basic project structure and file organization
- [x] Create basic game loop and rendering system
- [x] Implement camera controls (isometric 3D view)
- [x] Create simple 3D terrain system
- [x] Implement basic player character model
- [x] Add player movement controls (WASD/click-to-move)
- [x] Design and implement main game interface
- [x] Create inventory system UI
- [x] Implement stats/skills panel
- [x] Create experience/leveling system
- [x] Implement basic skill framework

### Phase 2: Combat & Skills (Next)
- [ ] Implement melee combat mechanics
- [ ] Add basic monster AI
- [ ] Create damage calculation system
- [ ] Add combat animations
- [ ] Implement Woodcutting skill
- [ ] Add trees and chopping mechanics
- [ ] Create Mining skill with rocks/ores
- [ ] Add Fishing skill with fishing spots

### Phase 3: Items & Equipment
- [ ] Create item system framework
- [ ] Implement equipment slots system
- [ ] Add basic weapons and armor
- [ ] Create item stats and bonuses
- [ ] Implement equipment requirements

### Phase 4: Crafting & Production
- [ ] Implement Smithing skill
- [ ] Add Cooking skill mechanics
- [ ] Create Fletching system
- [ ] Add Crafting skill
- [ ] Implement recipe system

### Phase 5: World Building
- [ ] Create basic town/city areas
- [ ] Add NPC system
- [ ] Implement basic shops
- [ ] Add banks and banking system
- [ ] Create travel/teleportation

### Phase 6: Advanced Features
- [ ] Implement Magic skill and spellbook
- [ ] Add Ranged combat
- [ ] Implement Prayer skill
- [ ] Create quest framework
- [ ] Add remaining skills (Agility, Thieving, etc.)

## 🏗️ Architecture

### Game Engine (`/src/engine/`)
- **GameEngine.ts**: Core Three.js game engine with rendering loop
- Handles 3D scene management, lighting, camera controls
- Player and world object management

### State Management (`/src/store/`)
- **gameStore.ts**: Zustand store for game state
- Player stats, experience, position tracking
- Game settings and UI state

### Components (`/src/components/`)
- **Game.tsx**: Main game component wrapper
- **GameInterface.tsx**: UI overlay with classic RS styling
- **StatsPanel.tsx**: Character statistics panel
- **InventoryPanel.tsx**: Inventory management interface

### Styling
- Classic RuneScape color scheme and UI design
- Responsive layout with authentic feel
- Custom CSS for game interface elements

## 🎯 Skills System

The game implements all 18 original RuneScape Classic skills:

**Combat Skills**:
- Attack, Defense, Strength, Hits (HP), Ranged, Prayer, Magic

**Gathering Skills**:
- Mining, Fishing, Woodcutting

**Artisan Skills**:
- Herblaw, Crafting, Fletching, Smithing, Cooking, Firemaking

**Support Skills**:
- Agility, Thieving

Each skill follows the authentic experience curve with level 99 as the maximum.

## 🤝 Contributing

This is a recreation project built for educational and nostalgic purposes. Contributions are welcome!

## 📝 License

This project is for educational and nostalgic purposes only. RuneScape and RuneScape Classic are trademarks of Jagex Limited.

## 🎮 Original Game Reference

All game mechanics, skill systems, and design elements are based on the original RuneScape Classic (2001-2018). Reference material sourced from the [RuneScape Classic Wiki](https://classic.runescape.wiki/).

---

**Current Status**: MVP Complete - Foundation systems implemented and ready for gameplay feature development!
