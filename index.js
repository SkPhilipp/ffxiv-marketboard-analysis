const watches = require('./watches');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');

(async () => {

	const watched = watches.load('./config/crafted-rares.json');

	for (let group of watched.groups) {

		console.log();
		const title = watched.name + ": " + group.name;
		console.log(title.padStart(90));
		console.log("=".repeat(title.length).padStart(90));
		console.log();

		const watchedItems = group.items;
		for (let key in watchedItems) {
			if (watchedItems.hasOwnProperty(key)) {
				const watchedItemId = watchedItems[key].id;
				switch (group.lookupMethod) {
					default:
					case "EndIngredientOf":
						await items.loadTree(watchedItemId);
						break;
				}
			}
		}

		const index = items.index();
		for (const key in index) {
			const item = index[key];
			switch (group.scoreMethod) {
				case "Arbitrage":
					estimates.estimateArbitrage(item, group);
					break;
				default:
				case "CraftedRare":
					estimates.estimateCraft(item, group);
					break;
			}
		}

		const rankedItems = ranks.rank(index, 15);
		ranks.log(rankedItems);
		ranks.logFfxivCraftingUrl(rankedItems);
		items.clear();
	}

	return 0;

})();
