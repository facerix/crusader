// import './RecipeEditor.js';
// import './BurgerMenu.js';
import { jsx } from "../src/domUtils.js";
// import RecipeCollection from '../src/RecipeCollection.js';

const CSS = `
	header.site {
		&.fixed {
			position: fixed;
			top: 0;
			z-index: 100;
		}
		
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-left: 0.5em;
		padding-right: 0.5em;
		width: 100vw;
		height: 4em;
		background-color: white;
	
		border-bottom: 2px inset;
	
		&>* {
			flex: inherit;
		}

		a.home,
		& > nav {
			display: flex;
			gap: 0.25rem;
		}
      
		h1 {
			flex: 1;
			margin: 0 auto 0 0.5em;

            font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;
            font-weight: 400;
		}
	
		nav {
			text-align: right;
	
			.buttons {
				a {
					margin-left: 0.25em;
					margin-right: 0.25em;
					text-decoration: none;
				}
			}
			
			.hidden {
				display: none;
			}
		}
	}

	/* burger-menu content */
	nav.floating {
		position: fixed;
		top: 1.5em;
		right: 0;
		z-index: 100; /* keep it on top of everything */
	}
`;

class SiteHeader extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		const title = this.getAttribute("title") ?? 'Crusader';
		const actions = this.innerHTML;
		this.innerHTML = jsx`
			<style>${CSS}</style>
			<header class="site">
				<a href="/" class="home">
					<img src="/sword.svg" width="48" alt="Sword logo" />
				</a>
				<h1>${title}</h1>
				<nav>${actions}</nav>
			</header>
		`;
	}

	updateSelectedCount() {
		this.querySelector("#selection-count").innerText = RecipeCollection.selections.size;
	}
}

window.customElements.define('site-header', SiteHeader);
