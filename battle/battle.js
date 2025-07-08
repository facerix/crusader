import '../components/SiteHeader.js';
import '../components/ConfirmationModal.js';
import '../components/BattleReport.js';
import DataStore from '../src/DataStore.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("confirmation-modal"),
    customElements.whenDefined("battle-report"),
  ],
);

whenLoaded.then(() => {
  const btnDelete = document.querySelector("#btnDelete");
  const btnEdit = document.querySelector("#btnEdit");
  const reportView = document.querySelector("battle-report");
  const confirmModal = document.querySelector("confirmation-modal");
  const urlParams = new URL(window.location).searchParams;
  const id = urlParams.get('id');
  
  DataStore.addEventListener("init", ({ detail }) => {
    if (detail.recordType === "battles" && !!id) {
      DataStore.getBattleById(id)
        .then(battle => {
          reportView.battle = battle;
        })
        .catch(err => {
          console.error(err);
          alert("Couldn't find a battle with this ID");
        });
    }
  });

  DataStore.addEventListener("delete", evt => {
    const { detail: { recordType, affectedRecords} } = evt;
    if (recordType === "battle" && affectedRecords.id === id) {
      window.location = `/battles/`;
    }
  });

  btnDelete.addEventListener("click", () => {
    confirmModal.showModal("Delete this battle report: this can't be undone. Are you sure?", "deleteBattle");
  });

  confirmModal.addEventListener("confirm", evt => {
    if (evt.detail.context === "deleteBattle") {
      DataStore.deleteBattle(id);
    }
  });
});
