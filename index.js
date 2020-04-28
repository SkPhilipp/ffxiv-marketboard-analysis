const watches = require('./watches');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');

async function rankWatched(watch) {
	for (let group of watch.groups) {

		// according to watch configuration, load in items
		const watchedItems = group.items;
		for (let key in watchedItems) {
			if (watchedItems.hasOwnProperty(key)) {
				const watchedItem = watchedItems[key];
				switch (group.lookupMethod) {
					case "Direct":
						await items.load(watchedItem);
						break;
					default:
					case "EndIngredientOf":
						await items.loadTree(watchedItem);
						break;
				}
			}
		}
		await items.save();

		// according to watch configuration, estimate and score
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
				case "Gather":
					estimates.estimateGather(item, group);
					break;
			}
		}

		// rank all items
		console.log();
		const title = watch.name + ": " + group.name;
		console.log(title.padStart(90));
		console.log("=".repeat(title.length).padStart(90));
		console.log();
		const rankedItems = ranks.rank(index, 15);
		ranks.log(rankedItems);
		ranks.logFfxivCraftingUrl(rankedItems);
		items.clear();
	}
}

(async () => {
	await rankWatched(watches.load('./watches/assorted-glamour-50.json'));
	await rankWatched(watches.load('./watches/assorted-items.json'));
	await rankWatched(watches.load('./watches/gatherables-miner.json'));
	return 0;
})();
