import './components/SiteHeader.js';
import DataStore from './src/DataStore.js';
import { parseArmyList } from './src/parser.js';

const whenLoaded = Promise.all(
	[
		customElements.whenDefined("site-header"),
	],
);

whenLoaded.then(() => {
  const btnImport = document.querySelector("#btnImport");
  const uploader = document.querySelector("input[type=file]");
  DataStore.init();

  DataStore.addEventListener("change", evt => {
    console.debug({ evt });
    // switch (evt.detail.changeType) {
    //   case "init":
    //     if (DataStore.collectionId) {
    //       btnContinue.href = `/plan/?id=${DataStore.collectionId}`;
    //       btnContinue.classList.add("show");
    //       btnRestart.classList.add("show");
    //     } else {
    //       btnStart.classList.add("show");
    //       btnImport.classList.add("show");
    //     }
    //     break;
    //   default:
    //     // no action to take otherwise
    //     break;
    // }
  });

  const newCollection = () => {
    DataStore.newCollection().then(collectionId => {
      window.location = `/plan/?id=${collectionId}`;
    });
  };

  btnImport.addEventListener("click", () => {
    uploader.click();
  });

	uploader.addEventListener("change", evt => {
		if (evt.target.files.length) {
			const reader = new FileReader();
			reader.onload = (evt) => {
				if (evt.target.readyState === FileReader.DONE) {
					const army = parseArmyList(evt.target.result);
          document.querySelector("#debug").value = JSON.stringify(army, null, 2);
				}
			}
			reader.readAsText(evt.target.files[0]);
		}
	});

});
