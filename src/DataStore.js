// singleton class to manage the user's data

import { v4WithTimestamp } from "./uuid.js";

const normalize = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(normalize);
  }

  if (!obj.id) {
    obj.id = v4WithTimestamp();
  }

  for (let k of Object.keys(obj)) {
    switch (typeof obj[k]) {
      case "object":
        obj[k] = Array.isArray(obj[k]) ? obj[k].map(normalize) : normalize(obj[k]);
        break;
      default:
        break;
    }
  }
  return obj;
};

let instance;

class DataStore extends EventTarget {
  #rosters = [];
  #rostersById = new Map(); // map from uuid to index in the #rosters array
  #unitsById = new Map(); // map from uuid to array of unit objects for that unit
  #battles = [];
  #battlesById = new Map();
  #db = null;

  constructor() {
    if (instance) {
      throw new Error("New instance cannot be created!!");
    }
    super();
    instance = this;
    this.#initDB();
  }

  // Initialize IndexedDB
  async #initDB() {
    const request = indexedDB.open("CrusaderDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const rosterStore = db.createObjectStore("rosters", { keyPath: "id" });
      const unitsStore = db.createObjectStore("units", { keyPath: "id" });
      const battlesStore = db.createObjectStore("battles", { keyPath: "id" });
      // Create an index on rosterId in the units object store
      unitsStore.createIndex("rosterId", "rosterId", { unique: false });
    };

    request.onsuccess = (event) => {
      this.#db = event.target.result;
      this.loadData();
    };

    request.onerror = (event) => {
      console.error("Database error: " + event.target.errorCode);
    };
  }

  #emit(eventName, recordType, affectedRecords) {
    const changeEvent = new CustomEvent(eventName, {
      detail: {
        recordType,
        affectedRecords,
      },
    });
    this.dispatchEvent(changeEvent);
  }

  async loadData() {
    const transaction = this.#db.transaction(["rosters", "battles"], "readonly");
    const rosterStore = transaction.objectStore("rosters");
    const battleStore = transaction.objectStore("battles");
    const getRosters = rosterStore.getAll();
    const getBattles = battleStore.getAll();

    getRosters.onsuccess = (event) => {
      this.#rosters = event.target.result;
      this.#indexRosters();
      this.#emit("init", "rosters", ["*"]);
    };
    getBattles.onsuccess = (event) => {
      this.#battles = event.target.result;
      this.#indexBattles();
      this.#emit("init", "battles", ["*"]);
    };
  }

  async #saveRoster(record) {
    const transaction = this.#db.transaction(["rosters", "units"], "readwrite");

    const rosterStore = transaction.objectStore("rosters");
    const unitsStore = transaction.objectStore("units");

    const recToSave = {
      id: record.id ?? v4WithTimestamp(),
      unitCount: record?.units?.length ?? 0,
      ...record,
    };
    delete recToSave.units;
    this.#unitsById.set(record.id, record.units);
    if (record.id) {
      // updating existing
      this.#rosters.forEach((rec, idx) => {
        if (rec.id === record.id) {
          this.#rosters[idx] = record;
        }
      });
    } else {
      this.#rosters.push(recToSave);
    }
    this.#rostersById.set(record.id, record);

    // Store the roster data, less the units
    await rosterStore.put(recToSave);

    // Store each unit in the units object store
    const unitPromises = record.units.map(unit => {
      const unitData = {
        id: unit.id || v4WithTimestamp(), // Ensure each unit has an id
        ...unit,
        rosterId: recToSave.id, // Link unit to the roster
      };
      return unitsStore.put(unitData);
    });
    await Promise.all(unitPromises);

    // Handle transaction completion
    transaction.oncomplete = () => {
      const eventType = record.id ? "update" : "add";
      this.#emit(eventType, "roster", {
        ...recToSave,
        units: record.units,
      });
      console.log("Record and units saved successfully");
    };

    transaction.onerror = (event) => {
      console.error("Transaction failed: ", event.target.error);
    };
  }

  async #saveUnit(unit, rosterId) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(["units"], "readwrite");
      const unitsStore = transaction.objectStore("units");

      const unitData = {
        id: unit.id || v4WithTimestamp(), // Ensure each unit has an id
        rosterId,
        ...unit,
      };
      unitsStore.put(unitData);

      // Handle transaction completion
      transaction.oncomplete = () => {
        resolve(unit);
      };

      transaction.onerror = (event) => {
        reject("Transaction failed: ", event.target.error);
      };
    });
  }

  async #deleteUnit(unitId) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(["units"], "readwrite");
      const unitsStore = transaction.objectStore("units");

      unitsStore.delete(unitId);

      // Handle transaction completion
      transaction.oncomplete = () => {
        resolve(unitId);
      };

      transaction.onerror = (event) => {
        reject("Transaction failed: ", event.target.error);
      };
    });
  }

  async #removeStorageForRoster(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(["rosters", "units"], "readwrite");
      const recordStore = transaction.objectStore("rosters");
      const unitsStore = transaction.objectStore("units");
  
      // Delete the roster record
      recordStore.delete(id);
  
      // Delete associated units
      const index = unitsStore.index("rosterId");
      const unitsRequest = index.getAll(id);
  
      unitsRequest.onsuccess = async (event) => {
        const units = event.target.result;
        const deletePromises = units.map(unit => unitsStore.delete(unit.id));
        try {
          await Promise.all(deletePromises); // Wait for all deletions to complete
        } catch (error) {
          reject("Failed to delete one or more units: ", error);
        }
      };
  
      transaction.oncomplete = () => {
        resolve();
      };
  
      transaction.onerror = (event) => {
        reject("Error removing roster and units: ", event.target.error);
      };
    });
  }

  #indexRosters() {
    this.#rostersById = new Map();
    this.#rosters.forEach(roster => {
      this.#rostersById.set(roster.id, roster);
    });
  }
  
  #indexBattles() {
    this.#battlesById = new Map();
    this.#battles.forEach(battle => {
      this.#battlesById.set(battle.id, battle);
    });
  }

  get rosters() {
    return this.#rosters;
  }

  get battles() {
    return this.#battles;
  }

  async startNewBattle(battleData) {
    const { date, mission, attackerId, defenderId } = battleData;
    const attacker = this.#rostersById.get(attackerId);
    const defender = this.#rostersById.get(defenderId);
    const newBattle = {
      date,
      mission,
      location: battleData.location ?? "TBD",
      teams: battleData.teams ?? [
        {
          ...attacker,
          player: "",
          score: -1,
        },
        {
          ...defender,
          player: "",
          score: -1,
        },
      ],
      attacker: 0,
      rounds: battleData.rounds ?? [],
      scars: battleData.scars ?? []
    };
    await this.#saveBattle(newBattle);
  }

  async deleteBattle(id) {
    if (this.#battlesById.has(id)) {
      const transaction = this.#db.transaction(["battles"], "readwrite");
      const battleStore = transaction.objectStore("battles");
  
      // Delete the battle record
      battleStore.delete(id);
  
      transaction.oncomplete = () => {
        this.#battles = this.#battles.filter((r) => r.id !== id);
        this.#battlesById.delete(id);

        this.#emit("delete", "battle", { id });
      };
  
      transaction.onerror = (event) => {
        throw new Error("Error removing battle: ", event.target.error);
      };
    }
  }

  async #saveBattle(battle) {
    const transaction = this.#db.transaction("battles", "readwrite");
    const battleStore = transaction.objectStore("battles");

    const toSave = battle.id ? battle : {
      id: v4WithTimestamp(),
      ...battle
    };
    if (battle.id) {
      // updating existing
      this.#battles.forEach((rec, idx) => {
        if (rec.id === battle.id) {
          this.#battles[idx] = battle;
        }
      });
    } else {
      this.#battles.push(toSave);
    }
    this.#battlesById.set(toSave.id, toSave);

    await battleStore.put(toSave);

    // Handle transaction completion
    transaction.oncomplete = () => {
      const eventType = battle.id ? "update" : "add";
      this.#emit(eventType, "battle", toSave);
    };

    transaction.onerror = (event) => {
      console.error("Transaction failed: ", event.target.error);
    };
  }

  async getBattleById(id) {
    return new Promise((resolve, reject) => {
      const battle = this.#battlesById.get(id);
      if (battle) {
        resolve(battle);
      } else {
        reject(`Battle '${id}' not found`);
      }
    });
  }

  async getRosterById(id) {
    return new Promise((resolve, reject) => {
      const roster = this.#rostersById.get(id);
      if (roster) {
        const transaction = this.#db.transaction("units", "readonly");
        const unitsStore = transaction.objectStore("units");
        const index = unitsStore.index("rosterId");
        const request = index.getAll(id);

        request.onsuccess = (event) => {
          roster.units = event.target.result || [];
          this.#unitsById.set(id, roster.units);
          resolve(roster);
        };

        request.onerror = (event) => {
          reject("Error retrieving units: " + event.target.error);
        };
      } else {
        reject(`Roster '${id}' not found`);
      }
    });
  }

  async addRoster(rosterData) {
    await this.#saveRoster(rosterData);
  }

  async updateRoster(record) {
    await this.#saveRoster(record);
  }

  async deleteRoster(id) {
    if (this.#rostersById.has(id)) {
      this.#removeStorageForRoster(id)
        .then(() => {
          this.#rosters = this.#rosters.filter((r) => r.id !== id);
          this.#unitsById.delete(id);

          this.#emit("delete", "roster", { id });
        }).catch(e => {
          throw new Error("Failed to delete roster: " + e);
        });
    }
  }

  async addUnitToRoster(unit, rosterId) {
    const roster = this.#rostersById.get(rosterId);
    if (roster) {
      if (!roster.units) {
        roster.units = [];
      }
      if (!unit.id) {
        unit.id = v4WithTimestamp();
      }
      if (!roster.units.some(u => u.id === unit.id)) {
        roster.units.push(unit);
      } else {
        console.warn("Attempted to add duplicate unit:", unit);
      }
      roster.unitCount = roster.units.length;
      await this.updateRoster(roster);
    } else {
      throw new Error(`Roster '${rosterId}' not found`);
    }
  }

  async updateUnitInRoster(unitId, unit, rosterId) {
    const roster = this.#rostersById.get(rosterId);
    if (roster) {
      const unitToSave = {
        ...unit,
        id: unitId,
        rosterId
      };
      this.#saveUnit(unitToSave, rosterId).then(savedUnit => {
        roster.units.forEach((u, idx, array) => {
          if (u.id === unitId) {
            array[idx] = savedUnit;
          }
        });
        this.#saveRoster(roster);
      }).catch(err => {
        throw new Error(err);
      });
    } else {
      throw new Error(`Roster '${rosterId}' not found`);
    }
  }

  async deleteUnitFromRoster(unitId, rosterId) {
    const roster = this.#rostersById.get(rosterId);
    if (roster) {
      roster.units = roster.units.filter(u => u.id !== unitId);
      roster.unitCount = roster.units.length;
      this.#deleteUnit(unitId)
        .then(() => {
          // const recToSave = { ...roster };
          // delete recToSave.units;
          this.#saveRoster(roster);
        })
        .catch(err => {
          throw new Error(err);
        });
    } else {
      throw new Error(`Roster '${rosterId}' not found`);
    }
  }
}

const singleton = Object.freeze(new DataStore());

export default singleton;