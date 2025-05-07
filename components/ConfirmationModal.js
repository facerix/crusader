import { h } from "../src/domUtils.js";

const CSS = `
:host {
    dialog[open] {
        display: flex;
        flex-direction: column;
        min-width: 30vw;
        padding: 0;
        border-radius: 5px;
    }

    ::backdrop {
        // background-color: rgba(0, 0, 0, 0.25);
    }

    header {
        padding: 0 1em;
        background-color: lightslategray;
        color: #303030;

        display: flex;
        justify-content: space-between;

        h3 {
            margin: 15px 0;
        }

        #close-modal {
            z-index: 1;
            background: none;
            border: none;
            padding: 0;
            box-shadow: none;
            align-self: center;
            height: 2em;
    
            img {
                height: 2em;
                width: 2em;
            }

            &:hover,
            &:focus-visible {
                outline: 1px solid white;
            }
        }
    }

    form {
        flex: 1;

        background-color: darkslategray;
        color: white;
        padding: 1em;

        display: flex;
        flex-direction: column;
        align-items: center;

        fieldset {
            border: none;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1em;
        }

        input, button, select, textarea {
            font-size: larger;
        }

        .actions {
            display: flex;
            gap: 10px;
            margin: 1em 1em 0 auto;

            button {
                margin-left: 1em;
            }
        }
    }

    fieldset {
        width: 100%;
        width: -webkit-fill-available;
    }


    dialog, ::backdrop {
        transition: all 0.25s allow-discrete;
    
        opacity: 0;
    }
    
    [open],
    [open]::backdrop {
        opacity: 1;
    
        &::backdrop {
            opacity: 0.8;
        }
    }
    
    @starting-style {
        [open],
        [open]::backdrop {
            opacity: 0;
        }
    }

    @media ( prefers-reduced-motion: no-preference ) {
        @starting-style {
            [open] {
                height: 0;	
                transform: scale(50%);
            }
        
            [open],
            [open]::backdrop {
                opacity: 0;
            }
        }
    
    }
}
`;

class ConfirmationModal extends HTMLElement {
  #ready = false;
  #message = "";
  #context = "default";
  #modal = null;

  constructor() {
    super();
  }

  connectedCallback() {
    // Create shadow root
    const shadow = this.attachShadow({ mode: "open" });
    const styles = document.createElement("style");
    styles.innerHTML = CSS;
    shadow.appendChild(styles);

    // create the internal implementation
    this.#modal = h("dialog", { closedby: "any" }, [
      h("header", {}, [
        h("h3", { innerText: "Confirmation" }),
        h("button", { id: "close-modal" }, [
          h("img", { src: "/images/close.svg", alt: "close", width: 32 })
        ])
      ]),
      h("form", { method: "dialog", autocomplete: "off" }, [
        h("p", { id: "message", innerText: "Are you sure?" }),
        h("div", { className: "actions" }, [
          h("input", { type: "button", id: "btnCancel", value: "Cancel" }),
          h("input", { type: "submit", id: "btnOk", value: "OK" }),
        ])
      ])
    ]);
    shadow.appendChild(this.#modal);
  }

  #onClose(evt) {
    evt.preventDefault();
    this.#modal?.close();
  }

  #init() {
    const closeHandler = this.#onClose.bind(this);
    this.shadowRoot.querySelector("#close-modal").addEventListener("click", closeHandler);
    this.shadowRoot.querySelector("#btnCancel").addEventListener("click", closeHandler);

    this.shadowRoot.querySelector("dialog form").addEventListener("submit", (evt) => {
      if (evt.submitter.id === "btnOk") {
        this.#emit("confirm");
      }
    });
    this.#ready = true;
  }

  #emit(eventName) {
    const customEvent = new CustomEvent(eventName, { detail: { context: this.#context } });
    this.dispatchEvent(customEvent);
  }

  render() {
    // if we've already been attached to the document, 
    // replace the contents of each slot with the latest data
    if (this.#ready) {
      this.shadowRoot.querySelector("#message").innerText = this.#message;
    }
  }

  showModal(caption, context) {
    this.#message = caption;
    this.#context = context;
    if (!this.#ready) {
      this.#init();
    }
    this.render();
    this.#modal?.showModal();
  }
}

window.customElements.define('confirmation-modal', ConfirmationModal);
