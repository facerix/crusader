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

  DataStore.addEventListener("init", () => {
    if (id) {
      DataStore.getRosterById(id)
        .then(army => rosterView.data = army)
        .catch(err => {
          alert("Couldn't find a roster with this ID");
        });
  
    } else {
      // TODO
    }
  });

  DataStore.addEventListener("update", evt => {
    const { detail: { recordType, affectedRecords} } = evt;
    if (recordType === "roster" && affectedRecords.id === id) {
      rosterView.data = affectedRecords;
    }
  });

  DataStore.addEventListener("delete", evt => {
    const { detail: { recordType, affectedRecords} } = evt;
    if (recordType === "roster" && affectedRecords.id === id) {
      window.location = `/rosters/`;
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
