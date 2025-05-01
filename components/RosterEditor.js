import { jsx } from '../src/domUtils.js';

const CSS = `
roster-editor {
	display: flex;
	flex-direction: column;
	// align-items: center;

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

		input, select {
			font-size: larger;
      height: 28px;
      width: 100%;
      width: -webkit-fill-available;
    }
	}

	footer {
		border-top: 1px inset;
		margin-top: 1em;
		padding-top: 0.5em;
		justify-content: end;
    gap: 10px;
		width: 100%;
		width: -webkit-fill-available;
	}
}`;

const FORM_MARKUP = `<form>
  <div>
    <label for="armyName">Crusade Force:</label><br />
    <input id="armyName" name="armyName" placeholder="Name your army" autocomplete="off" required />
  </div>
  <div>
    <label for="faction">Faction</label><br />
    <select id="faction" name="faction">
      <optgroup label="Imperium">
        <option value="sisters">Adepta Sororitas</option>
        <option value="custodes">Adeptus Custodes</option>
        <option value="mechanicus">Adeptus Mechanicus</option>
        <option value="astra">Astra Militarum</option>
        <option value="greyKnights">Grey Knights</option>
        <option value="imperialAgents">Imperial Agents</option>
        <option value="imperialKnights">Imperial Knights</option>
      </optgroup>

      <optgroup label="Adeptus Astartes">
        <option value="blackTemplars">Black Templars</option>
        <option value="bloodAngels">Blood Angels</option>
        <option value="darkAngels">Dark Angels</option>
        <option value="deathwatch">Deathwatch</option>
        <option value="imperialFists">Imperial Fists</option>
        <option value="ironHands">Iron Hands</option>
        <option value="ravenGuard">Raven Guard</option>
        <option value="salamanders">Salamanders</option>
        <option value="spaceMarines">Space Marines</option>
        <option value="spaceWolves">Space Wolves</option>
        <option value="ultramarines">Ultramarines</option>
        <option value="whiteScars">White Scars</option>
      </optgroup>

      <optgroup label="Chaos">
        <option value="chaosMarines">Chaos Space Marines</option>
        <option value="deathGuard">Death Guard</option>
        <option value="emperorsChildren">Emperor's Children</option>
        <option value="thousandSons">Thousand Sons</option>
        <option value="worldEaters">World Eaters</option>
        <option value="daemons">Chaos Daemons</option>
        <option value="chaosKnights">Chaos Knights</option>
      </optgroup>

      <optgroup label="Xenos">
        <option value="aeldari">Aeldari</option>
        <option value="drukhari">Drukhari</option>
        <option value="gsc">Genestealer Cults</option>
        <option value="votann">Leagues of Votann</option>
        <option value="necrons">Necrons</option>
        <option value="orks">Orks</option>
        <option value="tyranids">Tyranids</option>
        <option value="tau">T'au Empire</option>
      </optgroup>
    </select>
  </div>
</form>`;

class RosterEditor extends HTMLElement {
  #data = null;
  #form = null;
  #saveBtn = null;

  // whenLoaded = Promise.all(
  // 	[
  // 		customElements.whenDefined("editable-list"),
  // 		// customElements.whenDefined("ingredient-editor"),		// for future development
  // 	],
  // );

  constructor() {
    super();
    this.#init();
  }

  #init() {
    // this.whenLoaded.then(() => {
    const title = this.getAttribute("title") ?? "Add Roster";
    this.innerHTML = jsx`
			<style>${CSS}</style>
			<header><h3>${title}</h3></header>
            ${FORM_MARKUP}
			<footer>
				<button id="cancel">Cancel</button>
				<button id="save" type="submit" disabled>Save Roster</button>
			</footer>
		`;
    // });
  }

  connectedCallback() {
    // this.whenLoaded.then(() => {
    this.#form = this.querySelector("form");
    this.#form.addEventListener("input", this.handleFormInput.bind(this));
    this.#form.addEventListener("change", this.handleFormChange.bind(this));
    this.#form.addEventListener("submit", this.handleFormSubmit.bind(this));
    this.#saveBtn = this.querySelector("#save");
    this.#saveBtn.addEventListener("click", this.handleSave.bind(this));
    this.querySelector("#cancel").addEventListener("click", this.handleCancel.bind(this));
    // });
  }

  #emit(eventType, detail) {
    const changeEvent = new CustomEvent(eventType, { detail });
    this.dispatchEvent(changeEvent);
  }

  #populateForm() {
    const { armyName, faction } = this.#data ?? {};
    this.querySelector("#armyName").value = armyName ?? "";
    this.querySelector("#faction").value = faction ?? "";
  }

  #getFormData() {
    const data = new FormData(this.#form);
    return {
      armyName: data.get("armyName"),
      faction: data.get("faction"),
      points: 0,
      detachment: "",
      units: []  
    };
  };

  /**
   * @param {{ armyName: string; faction: string }} Roster
   */
  set roster(data) {
    this.#data = data;
    this.#populateForm();
  }

  get roster() {
    return this.#data;
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
    const edited = Object.assign({}, this.#data, this.#getFormData());
    this.roster = null;
    this.#emit("save", edited);
  }

  handleCancel() {
    const hasUnsavedChanges = !this.#saveBtn.disabled;
    this.roster = null;
    this.#emit("cancel", { hasUnsavedChanges });
  }
}

window.customElements.define('roster-editor', RosterEditor);
