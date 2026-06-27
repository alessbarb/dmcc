import json
import re
import os

def clean_text(text):
    # Remove page header/footer noise
    lines = text.split("\n")
    cleaned = []
    for l in lines:
        s = l.strip()
        if s == "System Reference Document 5.2.1":
            continue
        if s.isdigit():
            continue
        # Also clean empty/duplicate line breaks
        cleaned.append(l)
    
    text = "\n".join(cleaned)
    # Replace multiple empty lines with a single empty line
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def main():
    raw_path = "/home/alessbarb/.gemini/antigravity-cli/brain/19bf22db-3c60-408c-a1c2-79fa03c638bc/scratch/srd_raw.txt"
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} not found.")
        return
        
    with open(raw_path, "r") as f:
        content = f.read()
        
    pages = content.split("\x0c")
    print(f"Loaded {len(pages)} pages.")
    
    rules = []
    
    # --- 1. PARSE SPELLS (Pages 104-175 -> index 103-174) ---
    spell_names = []
    spell_pages = {}
    for idx in range(103, 175):
        if idx >= len(pages): break
        lines = pages[idx].split("\n")
        for i in range(len(lines) - 1):
            line = lines[i].strip()
            next_line = lines[i+1].strip()
            if not line or len(line) > 50: continue
            if next_line.startswith("Level ") or "Cantrip (" in next_line:
                if line not in ["Spell", "Spell Descriptions", "Level 8 Wizard Spells", "Level 9 Wizard Spells"]:
                    spell_names.append(line)
                    spell_pages[line] = idx
                    
    # Unique and preserve order
    seen = set()
    spell_names_ordered = []
    for s in spell_names:
        if s not in seen:
            seen.add(s)
            spell_names_ordered.append(s)
            
    # Extract spell bodies
    spells_content = "\n".join(pages[103:175])
    for idx, spell in enumerate(spell_names_ordered):
        escaped = re.escape(spell)
        # Find position of spell name
        start_pattern = rf"^\s*{escaped}\s*$"
        match = re.search(start_pattern, spells_content, re.MULTILINE)
        if not match: continue
        
        start_pos = match.start()
        
        # End is the start of the next spell, or end of spells content
        end_pos = len(spells_content)
        if idx + 1 < len(spell_names_ordered):
            next_escaped = re.escape(spell_names_ordered[idx + 1])
            next_match = re.search(rf"^\s*{next_escaped}\s*$", spells_content[start_pos + 10:], re.MULTILINE)
            if next_match:
                end_pos = start_pos + 10 + next_match.start()
                
        spell_body = spells_content[start_pos:end_pos].strip()
        lines = spell_body.split("\n")
        subtitle = lines[1].strip() if len(lines) > 1 else ""
        body = "\n".join(lines[2:]) if len(lines) > 2 else ""
        
        rules.append({
            "id": f"spell_{spell.lower().replace(' ', '_').replace(',', '').replace('/', '_')}",
            "title": spell,
            "category": "Conjuros",
            "subtitle": subtitle,
            "content": clean_text(body)
        })
        
    print(f"Parsed {len(spell_names_ordered)} Spells.")
    
    # --- 2. PARSE MONSTERS (Pages 254-343 -> index 253-342) ---
    monster_names = []
    sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]
    for idx in range(253, 343):
        if idx >= len(pages): break
        lines = pages[idx].split("\n")
        for i in range(len(lines) - 1):
            line = lines[i].strip()
            next_line = lines[i+1].strip()
            if not line or len(line) > 50: continue
            is_monster = False
            for sz in sizes:
                if next_line.startswith(sz) and (sz + " " in next_line or next_line == sz):
                    if any(t in next_line for t in ["Aberration", "Beast", "Celestial", "Construct", "Dragon", "Elemental", "Fey", "Fiend", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead"]):
                        is_monster = True
                        break
            if is_monster and "Size" not in line and "Hit Die" not in line:
                monster_names.append(line)
                
    seen = set()
    monster_names_ordered = []
    for m in monster_names:
        if m not in seen:
            seen.add(m)
            monster_names_ordered.append(m)
            
    monsters_content = "\n".join(pages[253:343])
    for idx, monster in enumerate(monster_names_ordered):
        escaped = re.escape(monster)
        match = re.search(rf"^\s*{escaped}\s*$", monsters_content, re.MULTILINE)
        if not match: continue
        
        start_pos = match.start()
        end_pos = len(monsters_content)
        if idx + 1 < len(monster_names_ordered):
            next_escaped = re.escape(monster_names_ordered[idx + 1])
            next_match = re.search(rf"^\s*{next_escaped}\s*$", monsters_content[start_pos + 10:], re.MULTILINE)
            if next_match:
                end_pos = start_pos + 10 + next_match.start()
                
        monster_body = monsters_content[start_pos:end_pos].strip()
        lines = monster_body.split("\n")
        subtitle = lines[1].strip() if len(lines) > 1 else ""
        body = "\n".join(lines[2:]) if len(lines) > 2 else ""
        
        rules.append({
            "id": f"monster_{monster.lower().replace(' ', '_').replace(',', '').replace('/', '_')}",
            "title": monster,
            "category": "Monstruos",
            "subtitle": subtitle,
            "content": clean_text(body)
        })
        
    print(f"Parsed {len(monster_names_ordered)} Monsters.")
    
    # --- 3. PARSE MAGIC ITEMS (Pages 209-253 -> index 208-252) ---
    item_names = []
    rarities = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"]
    for idx in range(208, 253):
        if idx >= len(pages): break
        lines = pages[idx].split("\n")
        for i in range(len(lines) - 1):
            line = lines[i].strip()
            next_line = lines[i+1].strip()
            if not line or len(line) > 55: continue
            is_item = False
            for r in rarities:
                if r in next_line:
                    if any(t in next_line for t in ["Armor", "Potion", "Ring", "Rod", "Staff", "Wand", "Weapon", "Wondrous", "Scroll", "Ammunition", "Deck", "Figurine", "Horn", "Instrument", "Orb"]):
                        is_item = True
                        break
            if is_item:
                item_names.append(line)
                
    # Clean noise like "and Location"
    seen = set()
    item_names_ordered = []
    for item in item_names:
        if item in ["and Location", "Rarity Value* Rarity Value*", "tions and Scrolls, have Resistance to all damage."]:
            continue
        if item not in seen:
            seen.add(item)
            item_names_ordered.append(item)
            
    items_content = "\n".join(pages[208:253])
    for idx, item in enumerate(item_names_ordered):
        escaped = re.escape(item)
        match = re.search(rf"^\s*{escaped}\s*$", items_content, re.MULTILINE)
        if not match: continue
        
        start_pos = match.start()
        end_pos = len(items_content)
        if idx + 1 < len(item_names_ordered):
            next_escaped = re.escape(item_names_ordered[idx + 1])
            next_match = re.search(rf"^\s*{next_escaped}\s*$", items_content[start_pos + 10:], re.MULTILINE)
            if next_match:
                end_pos = start_pos + 10 + next_match.start()
                
        item_body = items_content[start_pos:end_pos].strip()
        lines = item_body.split("\n")
        subtitle = lines[1].strip() if len(lines) > 1 else ""
        body = "\n".join(lines[2:]) if len(lines) > 2 else ""
        
        rules.append({
            "id": f"item_{item.lower().replace(' ', '_').replace(',', '').replace('/', '_')}",
            "title": item,
            "category": "Objetos Mágicos",
            "subtitle": subtitle,
            "content": clean_text(body)
        })
        
    print(f"Parsed {len(item_names_ordered)} Magic Items.")
    
    # --- 4. PARSE RULES GLOSSARY (Pages 177-191 -> index 176-190) ---
    glossary_names = []
    for idx in range(176, 191):
        if idx >= len(pages): break
        lines = pages[idx].split("\n")
        for i in range(len(lines) - 1):
            line = lines[i].strip()
            next_line = lines[i+1].strip()
            if not line or len(line) > 40: continue
            if re.match(r"^[A-Z][a-zA-Z0-9\s’'\[\]\-]+$", line) and not line.endswith("."):
                if line in ["System Reference Document 5.2.1", "Rules Glossary", "Abbreviations", "AC", "M", "C", "CE", "N", "CG", "NE", "NG", "CN", "NPC", "Con", "CP", "CR", "DC", "Dex", "Sphere", "Line", "Cube", "Size Fragile Resilient"]:
                    continue
                if next_line and re.match(r"^[A-Z]", next_line) and len(next_line) > 30:
                    glossary_names.append(line)
                    
    seen = set()
    glossary_names_ordered = []
    for term in glossary_names:
        if term not in seen:
            seen.add(term)
            glossary_names_ordered.append(term)
            
    glossary_content = "\n".join(pages[176:191])
    for idx, term in enumerate(glossary_names_ordered):
        escaped = re.escape(term)
        match = re.search(rf"^\s*{escaped}\s*$", glossary_content, re.MULTILINE)
        if not match: continue
        
        start_pos = match.start()
        end_pos = len(glossary_content)
        if idx + 1 < len(glossary_names_ordered):
            next_escaped = re.escape(glossary_names_ordered[idx + 1])
            next_match = re.search(rf"^\s*{next_escaped}\s*$", glossary_content[start_pos + 10:], re.MULTILINE)
            if next_match:
                end_pos = start_pos + 10 + next_match.start()
                
        term_body = glossary_content[start_pos:end_pos].strip()
        lines = term_body.split("\n")
        body = "\n".join(lines[1:]) if len(lines) > 1 else ""
        
        rules.append({
            "id": f"glossary_{term.lower().replace(' ', '_').replace('[', '').replace(']', '').replace(',', '')}",
            "title": term,
            "category": "Glosario de Reglas",
            "subtitle": "Término del Glosario",
            "content": clean_text(body)
        })
        
    print(f"Parsed {len(glossary_names_ordered)} Glossary Terms.")
    
    # --- 5. PARSE GENERAL CHAPTERS ---
    sections = [
        ("Playing the Game", 4, 18, "Reglas de Juego"),
        ("Character Creation", 18, 27, "Creación de Personajes"),
        ("Classes", 27, 82, "Clases"),
        ("Character Origins", 82, 86, "Orígenes de Personajes"),
        ("Feats", 86, 88, "Dotes"),
        ("Equipment", 88, 101, "Equipo"),
        ("Spellcasting", 101, 103, "Casteo de Conjuros"),
        ("Gameplay Toolbox", 191, 203, "Caja de Herramientas de Juego"),
        ("Animals", 343, 364, "Animales y Bestias")
    ]
    
    for title, s_idx, e_idx, category in sections:
        sec_text = "\n".join(pages[s_idx:e_idx])
        
        subsections = []
        if title == "Playing the Game":
            subsections = ["Rhythm of Play", "The Six Abilities", "D20 Tests", "Ability Checks", "Saving Throws", "Attack Rolls", "Advantage/Disadvantage", "Proficiency", "Actions", "Bonus Actions", "Reactions", "Social Interaction", "Exploration", "Combat", "Damage and Healing"]
        elif title == "Character Creation":
            subsections = ["Choose a Character Sheet", "Create Your Character", "Level Advancement", "Starting at Higher Levels", "Multiclassing", "Trinkets"]
        elif title == "Classes":
            subsections = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
        elif title == "Character Origins":
            subsections = ["Character Backgrounds", "Acolyte", "Criminal", "Sage", "Soldier", "Character Species", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"]
        elif title == "Feats":
            subsections = ["Feats", "Feat Descriptions", "Origin Feats", "General Feats", "Fighting Style Feats", "Epic Boon Feats"]
        elif title == "Equipment":
            subsections = ["Coins", "Weapons", "Armor", "Tools", "Adventuring Gear", "Mounts and Vehicles", "Lifestyle Expenses", "Food, Drink, and Lodging", "Hirelings"]
        elif title == "Spellcasting":
            subsections = ["Spellcasting", "Gaining Spells", "Casting Spells"]
        elif title == "Gameplay Toolbox":
            subsections = ["Travel Pace", "Creating a Background", "Curses and Magical Contagions", "Environmental Effects", "Fear and Mental Stress", "Poison", "Traps", "Combat Encounters"]
        elif title == "Animals":
            subsections = ["Stat Block Overview", "Running a Monster", "Animals"]
            
        if not subsections:
            subsections = [title]
            
        for i, sub in enumerate(subsections):
            escaped = re.escape(sub)
            match = re.search(rf"^\s*{escaped}\s*$", sec_text, re.MULTILINE)
            if not match:
                match = re.search(escaped, sec_text)
                if not match: continue
                
            start_pos = match.start()
            end_pos = len(sec_text)
            
            if i + 1 < len(subsections):
                next_escaped = re.escape(subsections[i + 1])
                next_match = re.search(rf"^\s*{next_escaped}\s*$", sec_text[start_pos + 5:], re.MULTILINE)
                if next_match:
                    end_pos = start_pos + 5 + next_match.start()
                else:
                    next_match = re.search(next_escaped, sec_text[start_pos + 5:])
                    if next_match:
                        end_pos = start_pos + 5 + next_match.start()
                        
            sub_body = sec_text[start_pos:end_pos].strip()
            lines = sub_body.split("\n")
            body = "\n".join(lines[1:]) if len(lines) > 1 else ""
            
            rules.append({
                "id": f"rule_{sub.lower().replace(' ', '_').replace(',', '').replace('/', '_')}",
                "title": sub,
                "category": category,
                "subtitle": f"Sección de {category}",
                "content": clean_text(body)
            })
            
    print(f"Parsed {len(sections)} Chapters with subsections.")
    
    # Save the output
    out_dir = "/home/alessbarb/workspace/repos/incubating/dmcc/src/domain/rules/data"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "srd_rules.json")
    
    with open(out_path, "w") as f:
        json.dump(rules, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {len(rules)} total rule entries to {out_path}.")

if __name__ == "__main__":
    main()
