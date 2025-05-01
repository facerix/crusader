import '../components/SiteHeader.js';
import '../components/UnitEditor.js';
import '../components/ConfirmationModal.js';
import DataStore from '../src/DataStore.js';
import { parseArmyList } from '../src/parser.js';
import { v4WithTimestamp } from '../src/uuid.js';
import { FACTION_IMAGE_URLS, FACTION_NAMES } from '../src/factions.js';
import { h } from '../src/domUtils.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("unit-editor"),
    customElements.whenDefined("confirmation-modal"),
  ],
);

const RosterView = (viewRoot, rosterData) => {
  const armyNameHeader = viewRoot.querySelector("#armyName");
  const factionImg = viewRoot.querySelector("#faction");
  const unitList = viewRoot.querySelector(".unit-list");
  const btnAddUnit = document.querySelector("#btnAddUnit");
  const unitModal = document.querySelector("#unit-modal");
  const unitEditor = document.querySelector("unit-editor");
  let activeUnit = null;

  const { armyName, faction, units } = rosterData;

  armyNameHeader.innerText = armyName;
  factionImg.src = FACTION_IMAGE_URLS[faction];
  units.forEach((u, idx) => {
    const nameText = u.alias ? `${u.alias} (${u.name})` : u.name;
    const row = h("div", { className: "unit-summary" }, [
      h("span", { className: "unit-name", innerText: nameText }),
      h("span", { className: "unit-pts points", innerText: u.points }),
      h("span", { className: "unit-pts crusadePoints", innerText: u.crusadePoints ?? '' }),
    ]);
    row.dataset.unitId = u.id;
    row.dataset.unitIndex = idx;
    unitList.append(row);
  });
  
  unitList.addEventListener("click", evt => {
    activeUnit = evt.target.closest(".unit-summary");
    if (activeUnit) {
      const unitDetails = units[activeUnit.dataset.unitIndex];
      unitEditor.data = unitDetails;
      unitModal.showModal();
    }
  });

  btnAddUnit.addEventListener("click", () => {
    unitEditor.data = {};
    unitModal.showModal();
  });

  unitEditor.addEventListener("save", evt => {
    const { name, alias, points, crusadePoints } = evt.detail;
    unitModal.close();

    // update saved data in memory
    units[activeUnit.dataset.unitIndex] = evt.detail;

    // TODO: update saved data in DataStore

    // update saved data in DOM
    activeUnit.querySelector(".unit-name").innerText = alias ? `${alias} (${name})` : name;
    activeUnit.querySelector(".points").innerText = points ?? '';
    activeUnit.querySelector(".crusadePoints").innerText = crusadePoints ?? '';
  });
  
  unitEditor.addEventListener("cancel", evt => {
    unitModal.close();
    // if (evt.detail.hasUnsavedChanges) {
    //   if (confirm("Discard your updates?")) {
    //   }
    // }
  });
}

whenLoaded.then(() => {
	const viewRoot = document.querySelector("roster-view");
  const btnDelete = document.querySelector("#btnDelete");
  const confirmModal = document.querySelector("confirmation-modal");
  
  const urlParams = new URL(window.location).searchParams;
	const id = urlParams.get('id');
  DataStore.init();

  DataStore.addEventListener("change", evt => {
    const { detail } = evt;
    switch (detail.changeType) {
      case "init":
        if (id) {
          const army = DataStore.getRosterById(id);
          void RosterView(viewRoot, army);

        } else {
          // TODO
        }
        break;
      case "delete":
        window.location = `/rosters/`;
        break;
      default:
        // no action to take otherwise
        break;
    }
  });

  btnDelete.addEventListener("click", () => {
    confirmModal.showModal("Delete this army roster: Are you sure?");
  });

  confirmModal.addEventListener("confirm", () => {
    DataStore.deleteRoster(id);
  });
});
