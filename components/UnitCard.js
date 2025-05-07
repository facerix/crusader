import { h } from "../src/domUtils.js";
import { MUNITORIUM } from "../src/munitorium.js";

const CSS = `
unit-card form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* <select> doesn't have a native readOnly so we do this instead of disabling it */
.u-readonly {
  pointer-events: none;
}

.unit-xp {
  background-image: url(/images/unit-xp.png);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top left;
  align-items: center;

  [name=xp] {
    border: 0;
    background: transparent;
    font-size: larger;
    padding-left: 1rem;
    margin-left: 2rem;
    margin-bottom: 0.5em;
    width: 4rem;
  }

  .rankCheckmarks {
    align-self: flex-end;
    display: flex;
    gap: 2.35rem;
    margin-left: 1.9rem;
    margin-bottom: 0.275rem;
    
    input {
      font-size: xx-large;
      accent-color: darkred;
      height: 1.25rem;
      width: 1.25rem;
    }
  }
}

/* more util classes, some of them "borrowed" from Tailwind ;} */
.u-flex--column {
  flex-direction: column;
}

.u-flex--stretch {
  flex: 1;
}

.u-flex--11 {
  flex-basis: 11%;
  max-width: 11%;
}
.u-flex--20 {
  flex-basis: 20%;
}
.u-flex--25 {
  flex-basis: 25%;
}
.u-flex--65 {
  flex-basis: 65%;
}
.u-flex--75 {
  flex-basis: 75%;
}

.gap-2 {
  gap: 0.5rem;
}

.p-1 {
  padding: 0.25rem;
}

.p-l-2 {
  padding-left: 0.5rem;
}

.h-10 {
  height: 2.5rem;
}

.h-30 {
  height: 7.5rem;
}

.h-40 {
  height: 10rem;
}

.w-full {
  width: 100%;
  width: -webkit-fill-available;
}

.h-full {
  height: 100%;
  height: -webkit-fill-available;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-lg {
  font-size: large;
}

.text-xl {
  font-size: x-large;
}

.text-center {
  text-align: center;
}

.bg-black {
  background-color: black;
}

.items-center {
  align-items: center;
}

.row-header {
  background-color: black;
  color: white;
  font-variant: common-ligatures small-caps;
  font-weight: bold;
}

.u-text--block {
  font-variant: common-ligatures small-caps;
  font-weight: bold;
}

.resize-none {
  resize: none;
}

.grid {
    display: grid;
}

.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
}

.border-top-none {
  border-top: none;
}

.ranks {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  height: -webkit-fill-available;
  margin-top: 1rem;

  .rank {
    display: flex;
    flex-direction: column;
    height: 100%;

    img {
      margin: auto;
    }

    .range {
      display: flex;
      align-items: center;
      background-color: black;
      color: white;

      span {
        font-size: x-small;
        font-variant: common-ligatures small-caps;
        font-weight: bold;
        padding: 0 0.5rem;
      }

      input {
        font-size: xx-large;
        accent-color: white;
        height: 1.25rem;
        width: 1.25rem;
      }
    }
  }
}
`;

const TEMPLATE = `
<!-- top row: Unit type/name/count, points -->
<div class="u-flex gap-2">
  <div class="u-flex--65 u-flex u-flex--column gap-2">
    <div class="u-flex gap-2 items-center bg-black">
      <div class="u-flex--20 row-header p-l-2">UNIT NAME</div>
      <input name="unitName" type="text" class="u-flex--stretch p-1 h-10 text-lg" placeholder="Enter unit name">
    </div>
    <div class="u-flex gap-2 items-center bg-black">
      <div class="u-flex--20 row-header p-l-2">UNIT TYPE</div>
      <select name="unitType" class="u-flex--stretch p-1 h-10 text-lg" required>
        <option value="" hidden default selected>Enter unit type</option>
      </select>
    </div>
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">No. of Models</div>
    <!--input name="modelCount" type="number" class="u-flex--stretch p-1 text-center text-xl"-->
    <select name="modelCount" class="u-flex--stretch p-1 text-center text-xl">
      <option value="1">1</option>
    </select>
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Points Cost</div>
    <input name="pointsCost" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Crusade Points</div>
    <input name="crusadePoints" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
</div>

<!-- Wargear / battle honors + scars -->
<div class="u-flex gap-2 h-40">
  <div class="u-flex--25 u-flex u-flex--column">
      <div class="row-header p-1 text-center">WARGEAR</div>
      <textarea name="wargear" class="p-1 w-full resize-none u-flex--stretch" placeholder="List wargear here"></textarea>
  </div>
  
  <div class="u-flex--75">
    <div class="grid grid-cols-2 gap-2 h-full">
      <!-- 4 honors/scars in a 2x2 grid -->
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2" />
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
    </div>
  </div>
</div>

<!-- Enhancements / battle honors + scars -->
<div class="u-flex gap-2 h-40">
  <div class="u-flex--25 u-flex u-flex--column">
      <div class="row-header p-1 text-center">ENHANCEMENTS</div>
      <textarea name="enhancements" class="p-1 w-full resize-none u-flex--stretch" placeholder="List enhancements here"></textarea>
  </div>
  
  <div class="u-flex--75">
    <div class="grid grid-cols-2 gap-2 h-full">
      <!-- 4 honors/scars in a 2x2 grid -->
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2" />
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
      
      <div class="u-flex u-flex--column">
          <input type="text" class="w-full mb-2">
          <textarea class="p-1 resize-none u-flex--stretch border-top-none"></textarea>
      </div>
    </div>
  </div>
</div>

<!-- bottom row: battle tally, experience -->
<div class="u-flex gap-2 h-30">
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Battles<br/>Played</div>
    <input name="battlesPlayed" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Battles<br/>Survived</div>
    <input name="battlesSurvived" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Enemy Units Destroyed</div>
    <input name="unitsKilled" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>

  <div class="u-flex--65 u-flex gap-2 unit-xp">
    <input name="xp" type="number" value="0" min="0" />
    <div class="ranks">
      <div class="rank">
          <img src="/images/Rank_Blooded.png">
          <div class="range">
            <span>6-15</span>
            <input id="rank1" type="checkbox">
          </div>
      </div>
      <div class="rank">
          <img src="/images/Rank_BattleHardened.png">
          <div class="range">
            <span>16-30</span>
            <input id="rank2" type="checkbox">
          </div>
      </div>
      <div class="rank">
          <img src="/images/Rank_Heroic.png">
          <div class="range">
            <span>31-50</span>
            <input id="rank3" type="checkbox">
          </div>
      </div>
      <div class="rank">
          <img src="/images/Rank_Legendary.png">
          <div class="range">
            <span>51+</span>
            <input id="rank4" type="checkbox">
          </div>
      </div>
    </div>
  </div>
</div>`

class UnitCard extends HTMLElement {
	#data = null;
  #form = null;
  #faction = null;
  #possibleUnits = null;
  #possibleUnitSizes = {};
  #possibleEnhancements = null;

  #init() {
    this.#form = this.querySelector("form");
    this.querySelector("select[name=unitType]").addEventListener("change", this.#onTypeChange.bind(this));
    this.querySelector("[name=modelCount]").addEventListener("change", this.#onCountChange.bind(this));
  }

  #onTypeChange(evt) {
    const countSelect = this.querySelector("[name=modelCount]");
    const costInput = this.querySelector("[name=pointsCost]");
    const countAndPoints = this.#possibleUnits[evt.target.value];
    countSelect.innerHTML = "";

    // model count is 1 unless countAndPoints says otherwise
    if (typeof countAndPoints === "number") {
      this.#possibleUnitSizes = 1;
      countSelect.append(h("option", { value: 1, innerText: "1" }));
      costInput.value = countAndPoints;
    } else {
      this.#possibleUnitSizes = countAndPoints;
      const firstCountKey = Object.keys(countAndPoints)[0];

      for (let countKey in countAndPoints) {
        let value = parseInt(countKey, 10);
        countSelect.append(h("option", { value, innerText: value }));
      }
      countSelect.value = parseInt(firstCountKey);
      costInput.value = countAndPoints[firstCountKey];
    }
  }

  #onCountChange(evt) {
    const selectedCount = evt.target.value;
    const selectedCountCost = this.#possibleUnitSizes[`${selectedCount}x`] ?? 0;
    this.querySelector("[name=pointsCost]").value = selectedCountCost;
  }

  set faction(name) {
    if (this.#faction !== name && MUNITORIUM[name]) {
      this.#possibleUnits = MUNITORIUM[name].models;
      this.#possibleEnhancements = MUNITORIUM[name].enhancements;

      // populate unit type picker
      const unitType = this.querySelector("select[name=unitType]");

      Object.keys(this.#possibleUnits).forEach(unitName => {
        unitType.append(h("option", { innerText: unitName, value: unitName }));
      });
    } else {
      this.#possibleUnits = null;
      this.#possibleEnhancements = null;
    }
  }

	set unit(data) {
		this.#data = data;
    this.hydrate();
	}

  get unit() {
    const data = new FormData(this.#form);
    return {
      alias: data.get("unitName"),
      name: data.get("unitType"),
      points: data.get("pointsCost"),
      crusadePoints: data.get("crusadePoints"),
      wargear: data.get("wargear"),
      enhancements: data.get("enhancements"),
      xp: data.get("xp"),
    };
	}

	hydrate() {
    if (!this.#form) {
      this.#init();
    }
		if (this.#data) {
      const { name, alias, points, crusadePoints, wargear, enhancements, modelCount, xp } = this.#data;
      const unitType = this.querySelector("[name=unitType]");
      unitType.value = name ?? "";
      unitType.classList[!!name ? 'add' : 'remove']('u-readonly')

      this.querySelector("[name=unitName]").value = alias ?? "";
      this.querySelector("[name=modelCount]").value = modelCount ?? "1";
      this.querySelector("[name=pointsCost]").value = points ?? "50";
      this.querySelector("[name=crusadePoints]").value = crusadePoints ?? "";
      this.querySelector("[name=wargear]").value = wargear ?? "";
      this.querySelector("[name=enhancements]").value = enhancements ?? "";
      this.querySelector("[name=xp]").value = xp ?? "0";
    
      const rankChecks = [
        this.querySelector("#rank1"),
        this.querySelector("#rank2"),
        this.querySelector("#rank3"),
        this.querySelector("#rank4")
      ];
      this.querySelector("[name=xp]").addEventListener("change", evt => {
        const { value } = evt.target;
        let checked = null;
        if (value > 5 && value < 16) {
          checked = rankChecks[0];
        } else if (value >= 16 && value < 31) {
          checked = rankChecks[1];
        } else if (value > 30 && value < 51) {
          checked = rankChecks[2];
        } else if (value > 50) {
          checked = rankChecks[3];
        }
        rankChecks.forEach(c => {
          c.checked = (c === checked);
        })
      });

      this.querySelector("[name=unitName]").focus();
		}
	}

	connectedCallback() {
		this.innerHTML = `<style>${CSS}</style><form autocomplete="off">${TEMPLATE}</form>`;
    this.hydrate();
	}
}

window.customElements.define('unit-card', UnitCard);
