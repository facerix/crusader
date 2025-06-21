import '../components/SiteHeader.js';
import DataStore from '../src/DataStore.js';
import { jsx } from '../src/domUtils.js';
import { FACTION_IMAGE_URLS } from '../src/factions.js';

const newBattleCard = (battle) => {
  const card = document.createElement("battle-card");
  card.innerHTML = jsx`
    <div class="dateLine">
      <img src="/images/calendar.svg" alt="calendar icon" />
      <span>${battle.date}</span>
      <a class="btn details" title="View battle report" href="/battle/?id=${battle.id}">
        <img src="/images/card-details.svg" alt="edit icon" />
      </a>
    </div>
    <div class="results">
      <div class="player">
        <div class="name">
          <img src="${FACTION_IMAGE_URLS[battle.teams[0].faction]}" alt="${battle.teams[0].faction}" />
          <h3>${battle.teams[0].name}</h3>
        </div>
        <p>${battle.teams[0].player}</p>
        <div class="score">${battle.teams[0].score}</div>
      </div>
      <div class="vs">vs</div>
      <div class="player">
        <div class="name">
          <img src="${FACTION_IMAGE_URLS[battle.teams[1].faction]}" alt="${battle.teams[1].faction}" />
          <h3>${battle.teams[1].name}</h3>
        </div>
        <p>${battle.teams[1].player}</p>
        <div class="score">${battle.teams[1].score}</div>
      </div>
    </div>  
  `;
  return card;
}

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
  ],
);

whenLoaded.then(() => {
  const btnNew = document.querySelector("#btnNew");
  const battleList = document.querySelector(".battle-list");

  DataStore.addEventListener("init", () => {
    DataStore.battles.forEach(b => battleList.append(newBattleCard(b)));
  });

  btnNew.addEventListener("click", () => {
    console.log("TODO")
  });
});