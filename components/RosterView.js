import './UnitCard.js';
import './RosterEditor.js';
import './ConfirmationModal.js';
import { FACTION_IMAGE_URLS, FACTION_NAMES } from '../src/factions.js';
import { h, jsx } from '../src/domUtils.js';
import DataStore from '../src/DataStore.js';

const UnitRow = (unit, index) => {
  const nameText = unit.alias ? `${unit.alias} (${unit.name})` : unit.name;
  const row = h("div", { className: "unit-summary" }, [
    h("span", { className: "unit-name", innerText: nameText }),
    h("span", { className: "unit-pts points", innerText: unit.points }),
    h("span", { className: "unit-pts crusadePoints", innerText: unit.crusadePoints ?? '' }),
  ]);
  row.dataset.unitId = unit.id;
  row.dataset.unitIndex = index;
  return row;
}

const TEMPLATE = `
<header>
  <div>
    <h2 id="armyName">Loading...</h2>
    <!-- <input /> -->
  </div>
  <img src="/images/loader.svg" id="faction" alt="army faction logo" />
  <div class="bubble" id="battles" data-caption="Battles">-</div>
  <div class="bubble" id="victories" data-caption="Victories">-</div>
  <div class="bubble" id="requisitionPoints" data-caption="Req&nbsp;pts">-</div>
</header>

<hr />

<div class="u-flex units-header">
  <span class="unit-name">Unit Name</span>
  <span class="unit-pts">Points<br/>Value</span>
  <span class="unit-pts">Crusade<br/>Points</span>
</div>
<div class="unit-list"></div>
<div class="u-flex unit-actions">
  <button id="btnAddUnit">
    <img src="/images/add-row.svg" alt="plus icon" />
    Add a unit
  </button>
</div>

<dialog id="unit-modal" closedby="any">
  <header>
    <h3>Unit Card</h3>
    <button>
      <img id="btnClose" src="/images/close.svg" alt="close modal" tabindex="50" />
    </button>
  </header>
  <unit-card></unit-card>
  <footer>
    <button id="btnDeleteUnit">
      <img src="/images/delete.svg" alt="trash" />
      Delete Unit
    </button>
    <button id="btnSave">
      <img src="/images/card-details.svg" alt="card" />
      Save Unit
    </button>
  </footer>
</dialog>
<dialog id="army-modal" closedby="any">
  <roster-editor title="Edit Roster"></roster-editor>
</dialog>
<confirmation-modal></confirmation-modal>
`;

class RosterView extends HTMLElement {
  #data = null;

  // DOM handles to things we only want to set up once
  armyNameHeader = null;
  factionImg = null;
  unitList = null;
  btnAddUnit = null;
  armyModal = null;
  armyEditor = null;
  unitModal = null;
  unitCard = null;
  btnClose = null;
  btnDeleteUnit = null;
  btnSave = null;
  confirmModal = null;
  activeUnit = null;

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.innerHTML = jsx`<style>${CSS}</style>${TEMPLATE}`;
  }

  connectedCallback() {
    this.armyNameHeader = this.querySelector("#armyName");
    this.factionImg = this.querySelector("#faction");
    this.unitList = this.querySelector(".unit-list");
    this.btnAddUnit = this.querySelector("#btnAddUnit");
    this.armyModal = this.querySelector("#army-modal");
    this.armyEditor = this.armyModal.querySelector("roster-editor");
    this.unitModal = this.querySelector("#unit-modal");
    this.unitCard = this.querySelector("unit-card");
    this.btnClose = this.querySelector("#btnClose");
    this.btnDeleteUnit = this.querySelector("#btnDeleteUnit");
    this.btnSave = this.querySelector("#btnSave");
    this.confirmModal = this.querySelector("confirmation-modal");

    // set up event handlers
    this.armyNameHeader.addEventListener("click", evt => {
      this.armyEditor.roster = this.#data;
      this.armyModal.showModal();
    });

    this.armyEditor.addEventListener("cancel", () => {
      this.armyModal.close();
    });

    this.armyEditor.addEventListener("save", evt => {
      DataStore.updateRoster({
        ...this.#data,
        ...evt.detail,
        units: this.#data.units
      });
      this.armyModal.close();
    });

    this.unitList.addEventListener("click", evt => {
      this.activeUnit = evt.target.closest(".unit-summary");
      if (this.activeUnit) {
        const unitDetails = this.#data.units[this.activeUnit.dataset.unitIndex];
        this.btnDeleteUnit.disabled = false;
        this.unitCard.unit = unitDetails;
        this.unitModal.showModal();
      }
    });

    this.btnAddUnit.addEventListener("click", () => {
      this.activeUnit = null;
      this.unitCard.unit = {};
      this.btnDeleteUnit.disabled = true;
      this.unitModal.showModal();
    });

    this.btnClose.addEventListener("click", () => {
      this.unitModal.close();

      // TODO
      // if (evt.detail.hasUnsavedChanges) {
      //   if (confirm("Discard your updates?")) {
      //   }
      // }
    });

    this.btnDeleteUnit.addEventListener("click", evt => {
      this.confirmModal.showModal("Delete this unit: Are you sure?", ["deleteUnit", this.activeUnit.dataset.unitIndex]);
    });

    this.confirmModal.addEventListener("confirm", evt => {
      const { context } = evt.detail;
      if (context[0] === "deleteUnit" && context[1] === this.activeUnit.dataset.unitIndex) {
        DataStore.deleteUnitFromRoster(this.activeUnit.dataset.unitId, this.#data.id);
        this.unitModal.close();
      }
    });

    btnSave.addEventListener("click", this.#onUnitSave.bind(this));  
  }

  set data(armyData) {
    this.#data = armyData;
    this.#hydrate();
  }

  get data() {
    return { ...this.#data };
  }

  #hydrate() {
    if (!this.#data) return;
    const { armyName, faction, units } = this.#data;

    this.armyNameHeader.innerText = armyName;
    this.factionImg.src = FACTION_IMAGE_URLS[faction];
    this.unitCard.faction = FACTION_NAMES[faction];

    // units
    this.unitList.innerHTML = "";
    units.forEach((u, idx) => this.unitList.append(UnitRow(u, idx)));

    // TODO
  };

  #onUnitSave() {
    this.unitModal.close();

    if (this.activeUnit) {
      // editing existing
      DataStore.updateUnitInRoster(this.activeUnit.dataset.unitId, this.unitCard.unit, this.#data.id);

    } else {
      // adding new
      DataStore.addUnitToRoster(this.unitCard.unit, this.#data.id);
    }
  }
};

window.customElements.define('roster-view', RosterView);
