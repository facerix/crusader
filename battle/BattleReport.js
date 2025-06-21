import { jsx } from '../src/domUtils.js';
import { FACTION_IMAGE_URLS } from '../src/factions.js';

const CSS = `
  :host {
    padding: 1em;


    @media (min-width: 1025px) {
      width: 1024px;
      margin: 0 auto;
    }
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;

    h2 {
      margin: 0;
    }

    h3 {
      border-bottom: 1px groove black;
      margin: 0;
    }

    .battle-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    table {
      border: 1px solid #e5e7eb;
      border-spacing: 0;
      margin-bottom: 1.5rem;
      
      thead {
        background-color: #f3f4f6;

        th {
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
      }

      td, th {
        padding: 5px 10px;
        border-bottom: 1px solid #e5e7eb;
      }
      tbody {
        tr:nth-child(even) {
          background-color: #f3f4f6;
        }
      }

      tfoot {
        background-color: #f3f4f6;

        td {
          border-bottom: none;
          font-weight: 700;
        }
      }
    }

    .battle-info,
    .final-score {
      h3 {
        margin-bottom: 1rem;
      }
    }

    .final-score {
      flex: 1;

      h3 {
        text-align: center;
      }
    }

    .playerFlex {
      display: flex;
    }

    .player {
      text-align: center;
      flex: 1;
      margin: 0 auto;
      padding: 1rem;
      border-radius: 1rem;

      img {
        width: 2em;
      }
    
      &.winner {
        /* color: green; */
        background-color: rgba(0, 128, 0, 0.1);
        border: 1px dashed green;
      }

      .name {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      h3,
      p {
        margin: 0;
      }
    }

    .score {
      font-weight: 700;
      font-size: 1.5rem;
      line-height: 2rem;
      margin-top: 0.5rem;
    }
  }

  .scars {
    margin-top: 0;
  }
`;

const reportRaw = (battle) => {
  /*
    {
      id: "1978edb8-23b2-454e-b2f7-44807149db5c",
      date: "3/21/25",
      mission: "Supply Raid",
      teams: [
        {
          id: "",
          name: "Skêyfyr’s Gambit",
          player: "Rylee",
          faction: "votann",
          score: 7
        },
        {
          id: "",
          name: "Lamenters",
          player: "Sarah",
          faction: "bloodAngels",
          score: 16
        }
      ],
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
        }
      ]
    }
  */
  const { mission, date, location, teams: [p1, p2], rounds, scars } = battle;
  const winner = p1.score > p2.score ? 0 : p2.score > p1.score ? 1 : -1;
  return jsx`
    <h2>${mission}</h2>
    <div class="battle-summary">
      <div class="battle-info">
        <h3>Battle Information</h3>
        <p><span class="font-medium">Date:</span> <span id="details-date">${date}</span></p>
        <p><span class="font-medium">Mission:</span> <span id="details-mission">${mission}</span></p>
        <p><span class="font-medium">Location:</span> <span id="details-location">${location}</span></p>
      </div>
      <div class="final-score">
        <h3>Final Score</h3>
        <div class="playerFlex">
          <div class="player ${winner === 0 ? 'winner' : ''}">
            <div class="name">
              <img src="${FACTION_IMAGE_URLS[p1.faction]}" alt="${p1.faction}" />
              <strong>${p1.name}</strong>
            </div>
            <p>${p1.player}</p>
            <div class="score">${p1.score}</div>
          </div>
          <div class="player ${winner === 1 ? 'winner' : ''}">
            <div class="name">
              <img src="${FACTION_IMAGE_URLS[p2.faction]}" alt="${p2.faction}" />
              <strong>${p2.name}</strong>
            </div>
            <p>${p2.player}</p>
            <div class="score">${p2.score}</div>
          </div>
        </div>
      </div>
    </div>
    <h3>Round-by-round</h3>
    <table>
      <thead><tr>
        <th>Round</th>
        <th>${p1.player}</th>
        <th>${p2.player}</th>
      </tr></thead>
      ${rounds.map(rnd => {
        const scoreRow = jsx`<tr>
          <td>Round ${rnd.round}</td>
          <td class="p1Score">${rnd.p1Score}</td>
          <td class="p2Score">${rnd.p2Score}</td>
        </tr>`;
        const killRows = rnd.kills.map(k => {
          let innerCells = `<td>${k.killedBy} destroys ${k.killed}</td>`;
          if (k.killingPlayer === 0) {
            return `<tr><td />${innerCells}<td /></tr>`;
          } else {
            return `<tr><td colspan="2" />${innerCells}</tr>`;
          }
        });
        return jsx`${scoreRow}${killRows}`;
      })}
      <tfoot>
        <tr>
          <td>Total</td>
          <td id="total-player1">${p1.score}</td>
          <td id="total-player2">${p2.score}</td>
        </tr>
      </tfoot>
    </table>
    ${scars.length && jsx`
      <h3>Battle Scars & Honors</h3>
      <ul class="scars">
        ${scars.map(s => `<li>${s.unit}: ${s.scar}</li>`)}
      </ul>
    `}
    <ul>
    </ul>`;
}

class BattleReport extends HTMLElement {
  #data = null;
  #article = null;

  constructor() {
    super();
    // Create a shadow DOM root
    this.attachShadow({ mode: 'open' }); // or 'closed'
  }

  connectedCallback() {
    const style = document.createElement('style');
    this.#article = document.createElement('article');
    style.innerHTML = CSS;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.#article);

    // // this.#modal = this.querySelector("dialog");
    // // this.#editor = this.querySelector("recipe-editor");
    // this.#article = this.querySelector("article");
    // // this.#editor.onCancel = this.onCancelEdit.bind(this);
    // // this.#editor.onSave = this.onSaveEdit.bind(this);
    // this.hydrate();
  }

  set battle(data) {
    this.#data = data;
    // this.innerHTML = jsx`
		// 	<style>${CSS}</style>
		// 	<article> </article>
		// `;
    this.hydrate();
  }

  hydrate() {
    if (!this.#article) {
      this.#article = this.querySelector("article");
    }
    if (this.#data && this.#article) {
      this.#article.innerHTML = reportRaw(this.#data);
    }
  }
}

window.customElements.define('battle-report', BattleReport);
