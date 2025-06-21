import '../components/SiteHeader.js';
import './BattleReport.js';
import DataStore from '../src/DataStore.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("battle-report"),
  ],
);

whenLoaded.then(() => {
  const reportView = document.querySelector("battle-report");
  const urlParams = new URL(window.location).searchParams;
  const id = urlParams.get('id');

  DataStore.addEventListener("init", () => {
    if (id) {
      DataStore.getBattleById(id)
        .then(battle => {
          reportView.battle = battle;
        })
        .catch(err => {
          console.error(err);
          alert("Couldn't find a battle with this ID");
        });
  
    } else {
      // TODO
    }
  });
});
