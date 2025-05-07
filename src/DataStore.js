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
        obj[k] = Array.isArray(obj[k]) ? obj[k].map(normalize) : normalize(obj[k])
        break;
      default:
        // console.log(k, obj[k], typeof obj[k]);
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

  constructor() {
    if (instance) {
      throw new Error("New instance cannot be created!!");
    }
    super();

    instance = this;
  }

  #loadRecordsFromJson(json) {
    const records = JSON.parse(json);
    records.forEach((item, index) => {
      // normalize (add expected fields for records that don't already have them)
      if (!item.id) {
        records[index].id = v4WithTimestamp();
      }
    });
    return records;
  }

  // if we eventually allow other storage besides local (i.e. DB, cloud, etc), this will need to be more robust;
  // for now, just load the records from localStorage or set it up if not yet set
  async init() {
    let savedRostersJson = window.localStorage.getItem("rosters");
    if (!savedRostersJson) {
      savedRostersJson = "[]";
      window.localStorage.setItem("rosters", savedRostersJson);
    }
    this.#rosters = normalize(this.#loadRecordsFromJson(savedRostersJson));
    this.#reindex();

    setTimeout(() => {
      this.#emitChangeEvent("init", ["*"]);
    }, 0);
  }

  #saveData() {
    window.localStorage.setItem("rosters", JSON.stringify(this.#rosters));

    for (let [id, units] of this.#unitsById.entries()) {
      window.localStorage.setItem(`units:${id}`, JSON.stringify(units));
    }
  }

  #removeStorageForRoster(id) {
    window.localStorage.removeItem(`units:${id}`);
  }

  #emitChangeEvent(changeType, affectedRecords) {
    const changeEvent = new CustomEvent("change", {
      detail: {
        rosters: this.#rosters,
        changeType,
        affectedRecords
      },
    });
    this.dispatchEvent(changeEvent);
  }

  #reindex() {
    this.#rostersById = new Map();
    this.#rosters.forEach(roster => {
      this.#rostersById.set(roster.id, roster);
    });
    this.#saveData();
  }

  get rosters() {
    return this.#rosters;
  };

  getRosterById(id) {
    const r = this.#rostersById.get(id);
    if (r) {
      const unitsJson = window.localStorage.getItem(`units:${r.id}`) ?? '[]';
      r.units = JSON.parse(unitsJson);
      this.#unitsById.set(id, r.units);
    }
    return r;
  }

  addRoster(record) {
    const id = v4WithTimestamp();
    const recToSave = {
      id,
      unitCount: record.units.length,
      ...record
    };
    delete recToSave.units;
    this.#unitsById.set(id, record.units);
    this.#rosters.push(recToSave);
    this.#reindex();
    this.#emitChangeEvent("add", recToSave);
  }

  updateRoster(record) {
    const index = this.#rosters.findIndex(rec => rec.id === record.id);
    if (index > -1) {
      this.#rosters[index] = record;
      this.#reindex();
      this.#emitChangeEvent("update", record);
    }
  }

  deleteRoster(id) {
    if (this.#rostersById.has(id)) {
      this.#removeStorageForRoster(id);
      this.#rosters = this.#rosters.filter(r => r.id !== id);
      this.#unitsById.delete(id);
      this.#reindex();
      this.#emitChangeEvent("delete", [id]);
    }
  }

  addUnitToRoster(unit, rosterId) {
    const r = this.#rostersById.get(rosterId);
    if (r) {
      const unitsJson = window.localStorage.getItem(`units:${r.id}`) ?? '[]';
      r.units = [...JSON.parse(unitsJson), unit];
      r.unitCount = r.units.length;
      this.updateRoster(r);

    } else {
      throw new Error(`Unit '${rosterId}' not found`);
    }
  }

  // TODO (maybe): swap unit index for uuids
  updateUnitInRoster(unitIndex, unit, rosterId) {
    const r = this.#rostersById.get(rosterId);
    if (r) {
      r.units[unitIndex] = unit;
      this.updateRoster(r);

    } else {
      throw new Error(`Unit '${rosterId}' not found`);
    }
  }

  // TODO (maybe): swap unit index for uuids
  deleteUnitFromRoster(unitIndex, rosterId) {
    const r = this.#rostersById.get(rosterId);
    if (r) {
      r.units.splice(unitIndex, 1);
      r.unitCount = r.units.length;
      this.updateRoster(r);

    } else {
      throw new Error(`Unit '${rosterId}' not found`);
    }
  }
}

const singleton = Object.freeze(new DataStore());

export default singleton;