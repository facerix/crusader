import { h, jsx } from "../src/domUtils.js";
import { FACTION_IMAGE_URLS } from '../src/factions.js';

const CSS = `
:host {
  margin-top: 1em;
  border: 2px outset #442222;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 32rem;

  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

/* TODO: responsive styles for the card */

h3 {
  font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;
  font-variant: common-ligatures small-caps;
}

.dateLine {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;;

  img {
    max-height: 1.25rem;
  }
}

.actions {
  margin-left: auto;
  display: inline-flex;
}

.results {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  .status {
    width: 100%;
    text-align: center;
    margin-bottom: 1rem;
  }

  .player {
    text-align: center;
    flex: 1 1 0%;

    .name {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    h3, p {
      margin: 0;
    }
  }

  .vs {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .score {
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 2rem;
    margin-top: 0.5rem;
  }
}

img {
  width: 2em;
}

button, a.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 0.25rem;
  border-radius: 0.25rem;
  border-color: transparent;
  background: transparent;
  cursor: pointer;
  font-variant: common-ligatures small-caps;
  text-decoration: none;
  
  img {
    height: 2em;
    width: 2em;
  }

  &:disabled {
    cursor: not-allowed;
    img {
      opacity: 0.5;
    }
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    outline: #7c0028 auto 1px;
    background-color: #ddbfc67a;
    text-decoration: underline;
  }
}

`;

class BattleCard extends HTMLElement {
	#data = null;
  #header = null;
  #body = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.innerHTML = CSS;
    this.#header = h("div", { className: "dateLine" });
    this.#body = h("div", { className: "results" });

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.#header);
    this.shadowRoot.appendChild(this.#body);

    this.hydrate();
  }

  #emit(eventType, detail) {
    const evt = new CustomEvent(eventType, { detail });
    this.dispatchEvent(evt);
  }

  /**
   * @param {Battle} data
   */
  set data(data) {
    this.#data = data;
    this.hydrate();
  }

  hydrate() {
    if (this.#data && this.#header) {
      const { id, date, teams: [p1, p2] } = this.#data;
      this.#header.innerHTML = jsx`
        <img src="/images/calendar.svg" alt="calendar icon" />
        <span>${date}</span>
        <div class="actions">
          <button id="btnDelete" title="Delete battle report">
            <img src="/images/delete.svg" alt="trash icon" />
          </button>
          <a class="btn details" title="View battle report" href="/battle/?id=${id}">
            <img src="/images/card-details.svg" alt="edit icon" />
          </a>
        </div>`;

      if (p1.score + p1.score >= 0) {
        // game has happened
        this.#body.innerHTML = jsx`
        <div class="player">
          <div class="name">
            <img src="${FACTION_IMAGE_URLS[p1.faction]}" alt="${p1.faction}" />
            <h3>${p1.armyName}</h3>
          </div>
          <p>${p1.player}</p>
          <div class="score">${p1.score}</div>
        </div>
        <div class="vs">vs</div>
        <div class="player">
          <div class="name">
            <img src="${FACTION_IMAGE_URLS[p2.faction]}" alt="${p2.faction}" />
            <h3>${p2.armyName}</h3>
          </div>
          <p>${p2.player}</p>
          <div class="score">${p2.score}</div>
        </div>`;
      } else {
        this.#body.innerHTML = jsx`
        <h3 class="status">TO BE RECORDED</h3>
        <div class="player">
          <div class="name">
            <img src="${FACTION_IMAGE_URLS[p1.faction]}" alt="${p1.faction}" />
            <h3>${p1.armyName}</h3>
          </div>
          <p>${p1.player}</p>
        </div>
        <div class="vs">vs</div>
        <div class="player">
          <div class="name">
            <img src="${FACTION_IMAGE_URLS[p2.faction]}" alt="${p2.faction}" />
            <h3>${p2.armyName}</h3>
          </div>
          <p>${p2.player}</p>
        </div>`;
      }
    }
  }
}

window.customElements.define('battle-card', BattleCard);
