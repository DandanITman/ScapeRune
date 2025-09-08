import json

# Load the sprite lookup data
with open(r'C:\Users\Daniel\Documents\Vibecode\SR\ScapeRune\public\sprite_lookup.json', 'r') as f:
    data = json.load(f)

print("🗡️ SAMPLE WEAPONS:")
weapons = [(k, v) for k, v in data.items() if v['category'] == 'weapons'][:10]
for k, v in weapons:
    print(f"  Icon{k}: {v['name']}")

print("\n🛡️ SAMPLE ARMOR:")
armor = [(k, v) for k, v in data.items() if v['category'] == 'armor'][:10]
for k, v in armor:
    print(f"  Icon{k}: {v['name']}")

print("\n🍖 SAMPLE FOOD:")
food = [(k, v) for k, v in data.items() if v['category'] == 'food'][:10]
for k, v in food:
    print(f"  Icon{k}: {v['name']}")

print("\n⛏️ SAMPLE RESOURCES:")
resources = [(k, v) for k, v in data.items() if v['category'] == 'resources'][:10]
for k, v in resources:
    print(f"  Icon{k}: {v['name']}")

# Show category distribution
categories = {}
for v in data.values():
    cat = v['category']
    categories[cat] = categories.get(cat, 0) + 1

print(f"\n📊 CATEGORY SUMMARY:")
for category, count in sorted(categories.items()):
    print(f"  {category}: {count} items")
