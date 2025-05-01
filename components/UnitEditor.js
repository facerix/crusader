import { jsx } from '../src/domUtils.js';

const CSS = `
unit-editor {
	display: flex;
	flex-direction: column;

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

    .row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .stretch {
      width: 100%;
      width: -webkit-fill-available;
    }

    .shrink {
      max-width: 110px;
      margin-left: auto;
    }

    label {
      font-variant: common-ligatures small-caps;
    }

		input, select, textarea {
			font-size: larger;
      width: 100%;
      width: -webkit-fill-available;
    }
    
    input, select {
      height: 28px;
    }

    textarea {
      height: 60px;
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

const FORM_MARKUP = `<form autocomplete="off">
  <div class="row">
    <div class="stretch">
      <label for="unitName">Unit type:</label><br />
      <input id="unitName" name="unitName" placeholder="Unit type" required />
    </div>
    <div class="shrink">
      <label for="points">Points cost:</label><br />
      <input id="points" name="points" type="number" placeholder="Unit cost" />
    </div>
  </div>
  <div class="row">
    <div class="stretch">
      <label for="unitAlias">Unit name:</label><br />
      <input id="unitAlias" name="unitAlias" placeholder="Name this unit" />
    </div>
    <div class="shrink">
      <label for="crusadePoints">Crusade points:</label><br />
      <input id="crusadePoints" name="crusadePoints" type="number" />
    </div>
  </div>
  <div class="row">
    <div class="stretch">
      <label for="wargear">Wargear:</label><br />
      <textarea id="wargear" name="wargear" cols="40"></textarea>
    </div>
  </div>
</form>`;

const TITLE_ADD = "Recruit new unit";
const TITLE_EDIT = "Edit Unit";

class UnitEditor extends HTMLElement {
  #data = null;
  #title = null;
  #form = null;
  #saveBtn = null;

  constructor() {
    super();
    this.#init();
  }

  #init() {
    const title = this.getAttribute("title") ?? TITLE_ADD;
    this.innerHTML = jsx`
			<style>${CSS}</style>
			<header><h3>${title}</h3></header>
        ${FORM_MARKUP}
			<footer>
				<button id="cancel">Cancel</button>
				<button id="save" type="submit" disabled>Save Unit</button>
			</footer>
		`;
  }

  connectedCallback() {
    this.#title = this.querySelector("header h3");
    this.#form = this.querySelector("form");
    this.#form.addEventListener("input", this.handleFormInput.bind(this));
    this.#form.addEventListener("change", this.handleFormChange.bind(this));
    this.#form.addEventListener("submit", this.handleFormSubmit.bind(this));
    this.#saveBtn = this.querySelector("#save");
    this.#saveBtn.addEventListener("click", this.handleSave.bind(this));
    this.querySelector("#cancel").addEventListener("click", this.handleCancel.bind(this));
  }

  #emit(eventType, detail) {
    const changeEvent = new CustomEvent(eventType, { detail });
    this.dispatchEvent(changeEvent);
  }

  #populateForm() {
    const { name, alias, points, crusadePoints, wargear } = this.#data ?? {};
    this.querySelector("#unitName").value = name ?? "";
    this.querySelector("#points").value = points ?? "0";
    this.querySelector("#unitAlias").value = alias ?? "";
    this.querySelector("#crusadePoints").value = crusadePoints ?? "";
    this.querySelector("#wargear").value = wargear ?? "";
  }

  #getFormData() {
    const data = new FormData(this.#form);
    return {
      name: data.get("unitName"),
      alias: data.get("unitAlias"),
      points: data.get("points"),
      crusadePoints: data.get("crusadePoints"),
      wargear: data.get("wargear")
    };
  };

  /**
   * @param {{ name: string; alias: string; points: string; wargear: string }} Unit
   */
  set data(data) {
    this.#title.innerText = data ? TITLE_EDIT : TITLE_ADD;
    this.#data = data ?? {};
    this.#populateForm();
  }

  get data() {
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
    this.data = null;
    this.#emit("save", edited);
  }

  handleCancel() {
    const hasUnsavedChanges = !this.#saveBtn.disabled;
    this.data = null;
    this.#emit("cancel", { hasUnsavedChanges });
  }
}

window.customElements.define('unit-editor', UnitEditor);
