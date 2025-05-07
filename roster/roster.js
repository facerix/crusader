import '../components/SiteHeader.js';
import '../components/RosterView.js';
import '../components/ConfirmationModal.js';
import DataStore from '../src/DataStore.js';
import { exportArmyList } from '../src/parser.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("roster-view"),
    customElements.whenDefined("confirmation-modal"),
    customElements.whenDefined("roster-editor"),
    customElements.whenDefined("unit-card"),
  ],
);


whenLoaded.then(() => {
  const btnDelete = document.querySelector("#btnDelete");
  const btnExport = document.querySelector("#btnExport");
  const confirmModal = document.querySelector("confirmation-modal");
  const rosterView = document.querySelector("roster-view");
  
  const urlParams = new URL(window.location).searchParams;
	const id = urlParams.get('id');
  DataStore.init();

  DataStore.addEventListener("change", evt => {
    const { detail } = evt;
    switch (detail.changeType) {
      case "init":
        if (id) {
          const army = DataStore.getRosterById(id);
          rosterView.data = army;

        } else {
          // TODO
        }
        break;
      case "update":
        if (detail.affectedRecords.id === id) {
          rosterView.data = detail.affectedRecords;
        }
        break;
      case "delete":
        if (detail.affectedRecords[0] === id) {
          window.location = `/rosters/`;
        }
        break;
      default:
        // no action to take otherwise
        break;
    }
  });

  btnDelete.addEventListener("click", () => {
    confirmModal.showModal("Delete this army roster: Are you sure?", "deleteArmy");
  });

  confirmModal.addEventListener("confirm", evt => {
    if (evt.detail.context === "deleteArmy") {
      DataStore.deleteRoster(id);
    }
  });

  btnExport.addEventListener("click", () => {
    console.log(exportArmyList(rosterView.data));
  });
});
