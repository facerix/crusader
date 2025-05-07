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

  constructor() {
    super();
    this.#init();
  }

  #init() {
    this.innerHTML = jsx`<style>${CSS}</style>${TEMPLATE}`;
  }

  connectedCallback() {
    // this.#form = this.querySelector("form");
    // this.#form.addEventListener("input", this.handleFormInput.bind(this));
    // this.#form.addEventListener("change", this.handleFormChange.bind(this));
    // this.#form.addEventListener("submit", this.handleFormSubmit.bind(this));
    // this.#saveBtn = this.querySelector("#save");
    // this.#saveBtn.addEventListener("click", this.handleSave.bind(this));
    // this.querySelector("#cancel").addEventListener("click", this.handleCancel.bind(this));
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
    const armyNameHeader = this.querySelector("#armyName");
    const factionImg = this.querySelector("#faction");
    const unitList = this.querySelector(".unit-list");
    const btnAddUnit = this.querySelector("#btnAddUnit");
    const armyModal = this.querySelector("#army-modal");
    const armyEditor = armyModal.querySelector("roster-editor");
    const unitModal = this.querySelector("#unit-modal");
    const unitCard = this.querySelector("unit-card");
    const btnClose = this.querySelector("#btnClose");
    const btnDeleteUnit = this.querySelector("#btnDeleteUnit");
    const btnSave = this.querySelector("#btnSave");
    const confirmModal = this.querySelector("confirmation-modal");
    let activeUnit = null;

    const { armyName, faction, units } = this.#data;

    armyNameHeader.innerText = armyName;
    factionImg.src = FACTION_IMAGE_URLS[faction];
    unitCard.faction = FACTION_NAMES[faction];

    // units
    unitList.innerHTML = "";
    units.forEach((u, idx) => unitList.append(UnitRow(u, idx)));

    armyNameHeader.addEventListener("click", evt => {
      armyEditor.roster = this.#data;
      armyModal.showModal();
    });

    armyEditor.addEventListener("cancel", () => {
      armyModal.close();
    });

    armyEditor.addEventListener("save", evt => {
      DataStore.updateRoster({
        ...this.#data,
        ...evt.detail,
        units
      });
      armyModal.close();
    });

    unitList.addEventListener("click", evt => {
      activeUnit = evt.target.closest(".unit-summary");
      if (activeUnit) {
        const unitDetails = units[activeUnit.dataset.unitIndex];
        btnDeleteUnit.disabled = false;
        unitCard.unit = unitDetails;
        unitModal.showModal();
      }
    });

    btnAddUnit.addEventListener("click", () => {
      unitCard.unit = {};
      btnDeleteUnit.disabled = true;
      unitModal.showModal();
    });

    btnClose.addEventListener("click", () => {
      unitModal.close();

      // TODO
      // if (evt.detail.hasUnsavedChanges) {
      //   if (confirm("Discard your updates?")) {
      //   }
      // }
    });

    btnDeleteUnit.addEventListener("click", evt => {
      confirmModal.showModal("Delete this unit: Are you sure?", ["deleteUnit", activeUnit.dataset.unitIndex]);
    });

    confirmModal.addEventListener("confirm", evt => {
      const { context } = evt.detail;
      if (context[0] === "deleteUnit" && context[1] === activeUnit.dataset.unitIndex) {
        DataStore.deleteUnitFromRoster(activeUnit.dataset.unitIndex, this.#data.id);
        unitModal.close();
      }
    });

    btnSave.addEventListener("click", () => {
      unitModal.close();

      if (activeUnit) {
        // editing existing

        // update saved data in memory & update saved data in DataStore
        units[activeUnit.dataset.unitIndex] = { ...unitCard.unit };
        DataStore.updateUnitInRoster(activeUnit.dataset.unitIndex, unitCard.unit, this.#data.id);

      } else {
        // adding new
        units.push({ ...unitCard.unit });
        DataStore.addUnitToRoster(unitCard.unit, this.#data.id);
      }

    });
  };
};

window.customElements.define('roster-view', RosterView);
