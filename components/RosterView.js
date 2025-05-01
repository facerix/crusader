// import '../components/RecipeEditor.js'
import { jsx, listify } from '../src/domUtils.js';
// import RecipeCollection from '../src/RecipeCollection.js';
// import { getRecipeSlug } from "../src/slug.js";
// import { IngredientList } from './IngredientList.js';

// const whenLoaded = Promise.all(
// 	[
// 		customElements.whenDefined("recipe-editor")
// 	],
// );

const CSS = `
	
`;

const Instructions = (instructionList) => {
	return jsx`
		<div class="instructions">
			<h4>Instructions</h4>
			${listify(instructionList, true)}
		</div>
	`;
}

class RosterView extends HTMLElement {
	#recipe = null;
	#article = null;
	#editor = null;
	#modal = null;

	/**
	 * @param {{ sourceUrl: string | URL; thumbnail: string; title: string; ingredients: object[]; instructions: string[]; }} recipe
	 */
	set recipe(recipe) {
		this.#recipe = recipe;
		this.innerHTML = jsx`
			<style>${CSS}</style>
			<article> </article>
			<dialog>
				<recipe-editor title="Edit Recipe"></recipe-editor>
			</dialog>
		`;
	}

	hydrate() {
		if (this.#recipe) {
			const { id, title, thumbnail, sourceUrl, ingredients, instructions } = this.#recipe;
			this.#article.innerHTML = jsx`
				<div class='recipe-image'>
					<img src='${thumbnail}' alt='${title}' />
					<button class='icon' id='hide' title='Hide image'></button>
				</div>
				<div class='recipe-detail'>
					<header>
						<h3>${title}</h3>
						<div class="actions">
							<button class="icon" id="print" title="Print recipe"></button>
							<button class="icon" id="add" title="Add recipe to your collection"></button>
							<button class="icon" id="share" title="Share recipe"></button>
							<button class="icon" id="delete" title="Delete recipe"></button>
							<button class="icon" id="edit" title="Edit recipe"></button>
						</div>
					</header>
					${sourceUrl && OriginallyFrom(sourceUrl)}
					${ingredients && IngredientList(ingredients)}
					${instructions && Instructions(instructions)}
				</div>
			`;

			this.#activateButton("#hide", this.onShowHide);
			// if there's no ID, it's because this was loaded from a share slug; don't show the action buttons
			if (id) {
				this.#activateButton("#edit", this.onEdit);
				this.#activateButton("#share", this.onShare);
				this.#activateButton("#delete", this.onDelete);
			}
		}
	}

	connectedCallback() {
		whenLoaded.then(() => {
			this.#modal = this.querySelector("dialog");
			this.#editor = this.querySelector("recipe-editor");
			this.#article = this.querySelector("article");
			this.#editor.onCancel = this.onCancelEdit.bind(this);
			this.#editor.onSave = this.onSaveEdit.bind(this);
			this.hydrate();

			RecipeCollection.addEventListener("change", this.onRecipeChange.bind(this));
		})
	}

	/**
	 * All the action buttons are hidden & inactive by default; hydrate() calls this function
	 * with the ones that should be active based on its input
	 * @param {String} buttonId 
	 */
	#activateButton = (buttonId, handler) => {
		const btn = this.querySelector(buttonId);
		if (btn) {
			btn.classList.add("active");
			btn.addEventListener("click", handler);
		}
	}

	onShowHide = () => {
		this.querySelector(".recipe-image").classList.toggle("hidden");
	}

	onShare = () => {
		const slug = getRecipeSlug(this.#recipe);
		navigator.clipboard.writeText(`${window.location.origin}/r/?s=${slug}`);
		alert("Sharing URL copied to your clipboard");
	}

	onPrint = () => {
		window.print();
	}

	onEdit = () => {
		this.#editor.recipe = this.#recipe;
		this.#modal.showModal();
	}

	onCancelEdit(hasUnsavedChanges) {
		const okToClose = hasUnsavedChanges ? confirm("Cancel without saving changes?") : true;
		if (okToClose) {
			this.#modal.close();
		}
	}

	onSaveEdit() {
		this.#modal.close();
	}

	onDelete = () => {
		if (confirm("Delete this recipe?")) {
			RecipeCollection.delete(this.#recipe.id).then(success => {
				if (success) {
					window.location.assign("/");
				} else {
					alert("Could not delete");
				}
			});
		}
	}

	onRecipeChange() {
		RecipeCollection.getRecipeById(this.#recipe.id)
			.then(recipe => {
				this.#recipe = recipe;
				this.hydrate();
			})
	}
}

window.customElements.define('roster-view', RosterView);
