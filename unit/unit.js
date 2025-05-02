import '../components/SiteHeader.js';
import '../components/UnitCard.js';
import '../components/ConfirmationModal.js';
import DataStore from '../src/DataStore.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("unit-card"),
    customElements.whenDefined("confirmation-modal"),
  ],
);

whenLoaded.then(() => {
	const card = document.querySelector("unit-card");
  const btnDelete = document.querySelector("#btnDelete");
  const confirmModal = document.querySelector("confirmation-modal");
  
  const urlParams = new URL(window.location).searchParams;
	const [id, index] = urlParams.get('id').split("|");

  DataStore.init();

  DataStore.addEventListener("change", evt => {
    const { detail } = evt;
    switch (detail.changeType) {
      case "init":
        if (id) {
          const army = DataStore.getRosterById(id);
          card.unit = army.units[index];

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
    confirmModal.showModal("Delete this unit: Are you sure?");
  });

  confirmModal.addEventListener("confirm", () => {
    DataStore.deleteUnit(id);
  });
});
