import '../components/SiteHeader.js';
import '../components/NewBattleModal.js';
import '../components/BattleCard.js';
import DataStore from '../src/DataStore.js';

const whenLoaded = Promise.all(
  [
    customElements.whenDefined("site-header"),
    customElements.whenDefined("battle-card"),
    customElements.whenDefined("new-battle-modal"),
  ],
);

whenLoaded.then(() => {
  const btnNew = document.querySelector("#btnNew");
  const modal = document.querySelector("new-battle-modal");
  const battleList = document.querySelector(".battle-list");
  let rosterNames = [];
  
  DataStore.addEventListener("init", ({ detail }) => {
    switch (detail.recordType) {
      case "rosters":
        rosterNames = DataStore.rosters.map(({ armyName, id }) => ({ armyName, id }));
        break;
      case "battles":
        DataStore.battles.forEach(b => {
          const card = document.createElement("battle-card");
          card.data = b;
          battleList.append(card);
        });
        break;
    }
  });

  DataStore.addEventListener("add", ({ detail }) => {
    if (detail.recordType === "battle") {
      window.location.assign(`/battle/?id=${detail.affectedRecords.id}`);
      // const card = document.createElement("battle-card");
      // card.data = detail.affectedRecords;
      // battleList.append(card);
    }
  });

  modal.addEventListener("save", ({ detail: formData }) => {
    DataStore.startNewBattle(formData);
  });

  btnNew.addEventListener("click", () => {
    modal.rosters = rosterNames;
    modal.showModal();
  });
});

window.debug = () => {
  DataStore.startNewBattle({
    id: "1978edb8-23b2-454e-b2f7-44807149db5c",
    date: "3/21/25",
    mission: "Supply Raid",
    location: "Home",
    teams: [
      {
        id: "196f3ed0-578c-4723-875a-f269e5f12fde",
        armyName: "Skêyfyr’s Gambit",
        player: "Rylee",
        faction: "votann",
        score: 7
      },
      {
        id: "19714ded-6ca1-4973-a0e3-cb16293f3387",
        armyName: "Lamenters",
        player: "Sarah",
        faction: "bloodAngels",
        score: 16
      }
    ],
    attacker: 0,
    rounds: [
      {
        round: 1,
        p1Score: 0,
        p2Score: 0,
        kills: [
          {
            killed: "Beserks",
            killedBy: "Death Company",
            killingPlayer: 1,
          }
        ]
      },
      {
        round: 2,
        p1Score: 1,
        p2Score: 2,
        kills: [
          {
            killed: "Scout Squad",
            killedBy: "Pioneers",
            killingPlayer: 0,
          },
          {
            killed: "Death Company",
            killedBy: "Kâhl",
            killingPlayer: 0,
          },
          {
            killed: "Death Company Captain",
            killedBy: "Keynn the Unyielding",
            killingPlayer: 0,
          },
          {
            killed: "Pioneers",
            killedBy: "Assault Intercessors",
            killingPlayer: 1,
          },
        ]
      },
      {
        round: 3,
        p1Score: 0,
        p2Score: 2,
        kills: [],
      },
      {
        round: 4,
        p1Score: 2,
        p2Score: 4,
        kills: [
          {
            killed: "VIPR Squad",
            killedBy: "Baal Predator",
            killingPlayer: 1,
          },
          {
            killed: "Keynn the Unyielding",
            killedBy: "Baal Predator",
            killingPlayer: 1,
          },
          {
            killed: "Hearthkyn Warriors",
            killedBy: "Amadeo",
            killingPlayer: 1,
          },
          {
            killed: "Kâhl",
            killedBy: "Amadeo",
            killingPlayer: 1,
          },
        ],
      },
      {
        round: 5,
        p1Score: 4,
        p2Score: 8,
        kills: [
          {
            killed: "Baal Predator",
            killedBy: "Þruma Squad",
            killingPlayer: 0
          },
          {
            killed: "Sagitaur",
            killedBy: "Aggressor Squad",
            killingPlayer: 1
          }
        ]
      }
    ],
    scars: [
      {
        unit: "Scout Squad",
        scar: "Fatigued"
      },
      {
        unit: "Kêynn the Unyielding",
        scar: "Crippling Damage"
      },
    ]
  });
}

window.ds = DataStore;