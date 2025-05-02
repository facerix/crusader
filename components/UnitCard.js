const CSS = `
unit-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.unit-xp {
  background-image: url(/images/unit-xp.png);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top left;
  align-items: center;

  #xp {
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

    #rank0 {
      display: none;
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
`;

const TEMPLATE = `
<header class="u-hidden">
  <h2 id="armyName">Loading...</h2>
  <img src="/images/loader.svg" id="faction" alt="army faction logo" />
</header>

<!-- top row: Unit type/name/count, points -->
<div class="u-flex gap-2">
  <div class="u-flex--65 u-flex u-flex--column gap-2">
    <div class="u-flex gap-2 items-center bg-black">
      <div class="u-flex--20 row-header p-l-2">UNIT NAME</div>
      <input id="unitName" type="text" class="u-flex--stretch p-1 h-10 text-lg" placeholder="Enter unit name">
    </div>
    <div class="u-flex gap-2 items-center bg-black">
      <div class="u-flex--20 row-header p-l-2">UNIT TYPE</div>
      <input id="unitType" type="text" class="u-flex--stretch p-1 h-10 text-lg" readonly>
    </div>
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">No. of Models</div>
    <input id="modelCount" type="number" class="u-flex--stretch p-1 text-center text-xl" readonly>
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Points Cost</div>
    <input id="pointsCost" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Crusade Points</div>
    <input id="crusadePoints" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
</div>

<!-- Wargear / battle honors + scars -->
<div class="u-flex gap-2 h-40">
  <div class="u-flex--25 u-flex u-flex--column">
      <div class="row-header p-1 text-center">WARGEAR</div>
      <textarea id="wargear" class="p-1 w-full resize-none u-flex--stretch" placeholder="List wargear here"></textarea>
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
      <textarea id="enhancements" class="p-1 w-full resize-none u-flex--stretch" placeholder="List enhancements here"></textarea>
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
    <input id="battlesPlayed" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Battles Survived</div>
    <input id="battlesSurvived" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>
  <div class="u-flex u-flex--column u-flex--11">
    <div class="row-header p-1 text-xs text-center">Enemy Units Destroyed</div>
    <input id="unitsKilled" type="number" class="u-flex--stretch p-1 text-center text-xl" placeholder="0">
  </div>

  <div class="u-flex--65 u-flex gap-2 unit-xp">
    <input id="xp" type="number" value="0" min="0" />
    <div class="rankCheckmarks">
      <input id="rank1" name="rank" type="radio" readonly />
      <input id="rank2" name="rank" type="radio" readonly />
      <input id="rank3" name="rank" type="radio" readonly />
      <input id="rank4" name="rank" type="radio" readonly />
      <input id="rank0" name="rank" type="radio" readonly />
    </div>
  </div>
</div>`

class UnitCard extends HTMLElement {
	#data = null;

	set unit(data) {
		this.#data = data;
    this.hydrate();
	}

  get unit() {
		return { ...this.#data };
	}

	hydrate() {
		if (this.#data) {
      const { name, alias, points, crusadePoints, wargear, enhancements, modelCount } = this.#data;

      this.querySelector("#unitName").value = alias ?? "";
      this.querySelector("#unitType").value = name;
      this.querySelector("#modelCount").value = modelCount ?? "1";
      this.querySelector("#pointsCost").value = points;
      this.querySelector("#crusadePoints").value = crusadePoints ?? "";
      this.querySelector("#wargear").value = wargear ?? "";
      this.querySelector("#enhancements").value = enhancements ?? "";
    
      const rank0 = this.querySelector("#rank0");
      const rank1 = this.querySelector("#rank1");
      const rank2 = this.querySelector("#rank2");
      const rank3 = this.querySelector("#rank3");
      const rank4 = this.querySelector("#rank4");
      this.querySelector("#xp").addEventListener("change", evt => {
        const { value } = evt.target;
        if (value < 6) {
          rank0.checked = true;
        } else if (value > 5 && value < 16) {
          rank1.checked = true;
        } else if (value >= 16 && value < 31) {
          rank2.checked = true;
        }
      });

      this.querySelector("#unitName").focus();
		}
	}

	connectedCallback() {
		this.innerHTML = `<style>${CSS}</style>${TEMPLATE}`;
    this.hydrate();
	}
}

window.customElements.define('unit-card', UnitCard);
