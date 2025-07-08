import { jsx } from "../src/domUtils.js";

const CSS = `
:host {
	display: flex;
	flex-direction: column;
	align-items: center;

	margin: 0;
	border-radius: 0;
	padding: 0;
	box-shadow: none;

	header {
		border-bottom: 1px outset;
		margin-bottom: 1em;
		padding-bottom: 0.5em;
		text-align: center;
		width: 100%;
		width: -webkit-fill-available;

		h3 {
			margin: 0;
		}
	}

	form {
		max-width: 100%;

    label {
      font-variant: common-ligatures small-caps;
    }

    .row {
      display: flex;
      margin-bottom: 0.5rem;
    }
    
    fieldset {
      display: flex;
      flex-direction: column;
      flex: 1;
      border: none;
      padding: 0;
    }

		input, select {
			font-size: larger;
      height: 28px;
      width: 100%;
      width: -webkit-fill-available;
    }
	}

	footer {
    display: flex;
		border-top: 1px inset;
		margin-top: 1em;
		padding-top: 0.5em;
		justify-content: end;
    gap: 10px;
		width: 100%;
		width: -webkit-fill-available;
	}
}`;

const DIALOG_BODY = `<header>
  <h3>Start a new battle</h3>
</header>
<form method="dialog" autocomplete="off">
  <div class="row">
    <fieldset>
      <label for="date">Date:</label>
      <input type="date" name="date" required />
    </fieldset>
    <fieldset>
      <label for="mission">Mission:</label>
      <input id="mission" name="mission" placeholder="Mission name" required />
    </fieldset>
  </div>
  <div class="row">
    <fieldset>
      <label for="attacker">Attacker</label>
      <select id="attacker" name="attacker">
        <option value="">Choose an army</option>
      </select>
    </fieldset>
    <fieldset>
      <label for="defender">Defender</label>
      <select id="defender" name="defender">
        <option value="">Choose an army</option>
      </select>
    </fieldset>
  </div>
</form>
<footer>
  <button id="cancel">Cancel</button>
  <button id="save" type="submit" disabled>Continue</button>
</footer>`;

class NewBattleModal extends HTMLElement {
  #dialog = null;
  #form = null;
  #rosters = [];
  #saveBtn = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.innerHTML = CSS;
    
    this.#dialog = document.createElement('dialog');
    this.#dialog.closedby = "any";
    this.#dialog.innerHTML = DIALOG_BODY;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.#dialog);
  }

  #init() {
    if (!this.#form) {
      this.#form = this.shadowRoot.querySelector("form");
      this.#form.addEventListener("input", this.handleFormInput.bind(this));
      this.#form.addEventListener("change", this.handleFormChange.bind(this));
      this.#form.addEventListener("submit", this.handleFormSubmit.bind(this));
      this.#saveBtn = this.shadowRoot.querySelector("#save");
      this.#saveBtn.addEventListener("click", this.handleSave.bind(this));
      this.shadowRoot.querySelector("#cancel").addEventListener("click", this.handleCancel.bind(this));
    }
  }

  #emit(eventType, detail) {
    const changeEvent = new CustomEvent(eventType, { detail });
    this.dispatchEvent(changeEvent);
  }

  #getFormData() {
    const data = new FormData(this.#form);
    const attackerId = data.get("attacker");
    const defenderId = data.get("defender");
    return {
      date: data.get("date"),
      mission: data.get("mission"),
      attackerId,
      defenderId,
      attackerName: this.#rosters.find(r => r.id === attackerId).armyName,
      defenderName: this.#rosters.find(r => r.id === defenderId).armyName,
    };
  };

  set rosters(rosterData) {
    this.#rosters = [...rosterData];
    const selectOptions = rosterData.map(({ armyName, id }) => jsx`<option value=${id}>${armyName}</option>`);
    const attacker = this.shadowRoot.querySelector("select#attacker");
    attacker.innerHTML = selectOptions.join("");
    const defender = this.shadowRoot.querySelector("select#defender");
    defender.innerHTML = selectOptions.join("");
  }

  showModal() {
    this.#init();
    this.#dialog.showModal();
  }

  /**
   * Fires on every input event in any of the form's fields.
   * Very noisy, so we should limit what we do here to the bare minimum.
   * @param {*} evt 
   */
  handleFormInput(evt) {
    this.#saveBtn.disabled = !this.#form.checkValidity();
  }

  /**
   * Fires on form field blur
   */
  handleFormChange() {
    this.#form.reportValidity();
  }

  handleFormSubmit(evt) {
    evt.preventDefault();
    this.handleSave();
  }

  handleSave() {
    const formData = this.#getFormData();
    this.#emit("save", formData);
    this.#dialog.close();
  }

  handleCancel() {
    this.#rosters = [];
    this.#dialog.close();
  }
}

window.customElements.define('new-battle-modal', NewBattleModal);
