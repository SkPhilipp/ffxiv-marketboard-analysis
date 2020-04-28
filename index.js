const watches = require('./config/watches.json');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');

(async () => {

	for (let key in watches) {
		if (watches.hasOwnProperty(key)) {
			const watchedItemId = watches[key].id;
			await items.loadTree(watchedItemId);
		}
	}
	const index = items.index();

	// -- arbitrage estimates --

	for (const key in index) {
		const item = index[key];
		estimates.estimateArbitrage(item);
	}
	ranks.rankArbitrage(index);

	// -- crafting estimates --

	for (const key in index) {
		const item = index[key];
		estimates.estimateCraft(item);
	}
	ranks.rankCraft(index);

})();
