import { FACTION_NAMES_TO_CODES, FACTION_NAMES } from "./factions.js";

const nameAndPointsRE = /^([^(]+)\(([0-9]+).*\)$/im;

const parseUnitDef = (unitDef) => {
  const lines = unitDef.split("\n");
  const unitNameAndPoints = nameAndPointsRE.exec(lines[0]);
  return {
    name: unitNameAndPoints[1].trim(),
    points: unitNameAndPoints[2],
    wargear: lines.slice(1).map(l => l.trim()).join('\n')
  }
}

// parses an army list from the official 40k app, BattleForge

export const parseArmyList = (exported) => {
  const lines = exported.split("\n");
  const armyNameAndPoints = nameAndPointsRE.exec(lines[0]);
  if (!armyNameAndPoints) return null;
  let unitDefs = {
    characters: [],
    battleline: [],
    transports: [],
    otherUnits: [],
  };
  let currentSection = null;
  let currentUnitDef = "";

  for (let line = 5; line < lines.length; line++) {
    switch (lines[line].trim()) {
      case "CHARACTERS":
        currentSection = "characters";
        break;
      case "BATTLELINE":
        currentSection = "battleline";
        break;
      case "DEDICATED TRANSPORTS":
        currentSection = "transports";
        break;
      case "OTHER DATASHEETS":
        currentSection = "otherUnits";
        break;
      case "":  // empty lines indicate the end of the current unit definition
        if (unitDefs[currentSection] && currentUnitDef.length) {
          unitDefs[currentSection].push(parseUnitDef(currentUnitDef.trim()));
        }
        currentUnitDef = "";
        break;
      default:
        if (lines[line].startsWith("Exported with App Version")) {
          // EOF
          break;
        }
        currentUnitDef += lines[line].trimRight() + '\n';
        // if (unitDefs[currentSection]) {
        //   unitDefs[currentSection].push(lines[line]);
        // }
    }
  }

  return {
    armyName: armyNameAndPoints[1].trim(),
    points: armyNameAndPoints[2].trim(),
    faction: FACTION_NAMES_TO_CODES[lines[2].trim()],
    detachment: lines[3].trim(),  // might be lines[4] --- my two exported files have it differently
    units: [...unitDefs.characters, ...unitDefs.battleline, ...unitDefs.transports, ...unitDefs.otherUnits]
  };
};

export const exportArmyList = (armyData) => {
  const lines = [];
  const { armyName, points, faction, detachment, units } = armyData;
  const actualPoints = points || units.reduce(
    (acc, curr) => acc + parseInt(curr.points, 10),
    0,
  );

  // armyName: armyNameAndPoints[1].trim(),
  // points: armyNameAndPoints[2].trim(),
  // faction: FACTION_NAMES_TO_CODES[lines[2].trim()],
  // detachment: lines[3].trim(),  // might be lines[4] --- my two exported files have it differently
  // units: [...unitDefs.characters, ...unitDefs.battleline, ...unitDefs.transports, ...unitDefs.otherUnits]
  lines.push(`${armyName} (${actualPoints} Points)\n`);
  lines.push(`${FACTION_NAMES[faction]}\n${detachment}\n\n`);

  return lines.join("\n");
}