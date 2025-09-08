# Models for ScapeRune

## resources/ores.glb

This file contains a base 3D model for ore rocks that will be procedurally colored by the OreModelLoader system.

### Model Requirements:
- **Format**: GLTF 2.0 Binary (.glb)
- **Geometry**: Irregular rock shape with multiple faces for realistic lighting
- **Size**: Approximately 1-2 units in size (will be scaled at runtime)
- **Materials**: Should use a standard PBR material that can be replaced
- **Origin**: Centered at origin (0,0,0) with base at ground level
- **Triangles**: Moderate poly count (~200-500 triangles) for performance

### Recommended Rock Shape Features:
- Irregular, angular surfaces typical of ore rocks
- Multiple protrusions and indentations
- Some flat areas for ore veins/coloring
- Natural rock-like appearance

### Model Creation Tips:
- Can be created in Blender, Maya, or other 3D software
- Export as GLTF with embedded textures
- Keep materials simple as they will be replaced programmatically
- Test that materials accept color changes properly

### Backup Models:
If resources/ores.glb is not available, the system will automatically generate fallback geometry using Three.js primitives with appropriate colors.

### Colors Applied by System:
- **Clay**: Brown (#8B4513)
- **Copper**: Copper orange (#B87333) 
- **Tin**: Silver-gray (#C0C0C0)
- **Iron**: Dark gray (#696969)
- **Silver**: Light silver (#E5E5E5)
- **Coal**: Very dark gray (#2F2F2F) with blue glow
- **Gold**: Gold yellow (#FFD700) with warm glow
- **Gem Rock**: Purple (#9966CC) with purple glow and sparkles
- **Mithril**: Royal blue (#4169E1) with blue glow
- **Adamant**: Forest green (#228B22) with green glow  
- **Runite**: Turquoise (#40E0D0) with cyan glow

The ores.glb file is located in the resources subdirectory to enable custom ore models throughout the game.
