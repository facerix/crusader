import '../components/SiteHeader.js';
import '../components/RosterEditor.js';
import DataStore from '../src/DataStore.js';
import { h, queryParams } from '../src/domUtils.js';
import { parseArmyList } from '../src/parser.js';
import { v4WithTimestamp } from '../src/uuid.js';
import { FACTION_IMAGE_URLS, FACTION_NAMES } from '../src/factions.js';

const newRosterCard = (rosterData) => {
  const unitCount = rosterData.unitCount;
  const factionUrl = FACTION_IMAGE_URLS[rosterData.faction];
  const { id } = rosterData;
  const card = h("roster-card", {}, [
    h("a", { href: `/roster/${queryParams({ id })}` }, [
      h("img", { src: factionUrl, alt: `Faction image for ${rosterData.faction}`}),
      h("h3", { innerText: rosterData.armyName }),
      h("h4", { innerText: FACTION_NAMES[rosterData.faction] ?? '(Unknown faction)' }),
      h("h5", { innerText: `${unitCount} unit${unitCount !== 1 && 's'}` })
    ])
  ]);
  return card;
}

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("roster-editor"),
  ],
);

whenLoaded.then(() => {
  const btnNew = document.querySelector("#btnNew");
  const btnClipboard = document.querySelector("#btnClipboard");
  const btnImport = document.querySelector("#btnImport");
  const uploader = document.querySelector("input[type=file]");
  const rosterFlow = document.querySelector(".roster-flow");
  const editModal = document.querySelector("#roster-modal");
  const editor = editModal.querySelector("roster-editor");
  DataStore.init();

  DataStore.addEventListener("change", evt => {
    const { detail } = evt;
    switch (detail.changeType) {
      case "init":
        detail.rosters.forEach(r => rosterFlow.append(newRosterCard(r)));
        break;
      case "add":
        rosterFlow.append(newRosterCard(detail.affectedRecords));
        break;
      default:
        // no action to take otherwise
        break;
    }
  });

  btnClipboard.addEventListener("click", () => {
    navigator.clipboard
      .readText()
      .then(clipText => {
        const army = parseArmyList(clipText);
        if (army?.armyName) {
          DataStore.addRoster(army);
        } else {
          alert("Clipboard doesn't contain valid army data");
        }
      });
  });

  btnNew.addEventListener("click", () => {
    editModal.showModal();
  })

  btnImport.addEventListener("click", () => {
    uploader.click();
  });

  editor.addEventListener("cancel", () => {
    editModal.close();
  });

  editor.addEventListener("save", evt => {
    DataStore.addRoster({
      id: v4WithTimestamp(),
      ...evt.detail
    });
    editModal.close();
  });

  uploader.addEventListener("change", evt => {
    if (evt.target.files.length) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target.readyState === FileReader.DONE) {
          const army = parseArmyList(evt.target.result);
          DataStore.addRoster(army);
        }
      }
      reader.readAsText(evt.target.files[0]);
    }
  });

});
