import '../components/SiteHeader.js';
import '../components/UnitCard.js';
import '../components/ConfirmationModal.js';
import DataStore from '../src/DataStore.js';
import { FACTION_IMAGE_URLS, FACTION_NAMES } from '../src/factions.js';
import { h } from '../src/domUtils.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    // customElements.whenDefined("unit-editor"),
    customElements.whenDefined("unit-card"),
    customElements.whenDefined("confirmation-modal"),
  ],
);

const RosterView = (viewRoot, rosterData) => {
  const armyNameHeader = viewRoot.querySelector("#armyName");
  const factionImg = viewRoot.querySelector("#faction");
  const unitList = viewRoot.querySelector(".unit-list");
  const btnAddUnit = document.querySelector("#btnAddUnit");
  const unitModal = document.querySelector("#unit-modal");
  const unitCard = document.querySelector("unit-card");
  const btnClose = document.querySelector("#btnClose");
  const btnSave = document.querySelector("#btnSave");
  let activeUnit = null;

  const { id, armyName, faction, units } = rosterData;

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
      unitCard.unit = unitDetails;
      unitModal.showModal();
    }
  });

  btnAddUnit.addEventListener("click", () => {
    unitCard.unit = {};
    unitModal.showModal();
  });

  btnClose.addEventListener("click", () => {
    unitModal.close();

    // TODO
    // if (evt.detail.hasUnsavedChanges) {
    //   if (confirm("Discard your updates?")) {
    //   }
    // }
  })

  btnSave.addEventListener("click", () => {
    const { name, alias, points, crusadePoints } = unitCard.unit;
    unitModal.close();

    // update saved data in memory
    units[activeUnit.dataset.unitIndex] = { ...unitCard.unit };

    // TODO: update saved data in DataStore

    // update saved data in DOM
    activeUnit.querySelector(".unit-name").innerText = alias ? `${alias} (${name})` : name;
    activeUnit.querySelector(".points").innerText = points ?? '';
    activeUnit.querySelector(".crusadePoints").innerText = crusadePoints ?? '';
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
