import './components/SiteHeader.js';
// import DataStore from './src/DataStore.js';

const whenLoaded = Promise.all(
	[
		customElements.whenDefined("site-header"),
	],
);

whenLoaded.then(() => {
  // DataStore.init();

  // DataStore.addEventListener("change", evt => {
  //   switch (evt.detail.changeType) {
  //     case "init":
  //       // TODO: load whatever data we need for the home page
  //       break;
  //     default:
  //       // no action to take otherwise
  //       break;
  //   }
  // });

  // we actually don't need to do anything else here right now beyond loading SiteHeader.js
});
