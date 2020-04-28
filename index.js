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
				const watchedItemId = watchedItems[key].id;
				switch (group.lookupMethod) {
					case "Direct":
						await items.load(watchedItemId);
						break;
					default:
					case "EndIngredientOf":
						await items.loadTree(watchedItemId);
						break;
				}
			}
		}

		// TODO: index is empty after loading in miner-gather.json Direct
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
	await rankWatched(watches.load('./watches/glamour-weapons.json'));
	await rankWatched(watches.load('./watches/assorted-items.json'));
	await rankWatched(watches.load('./watches/miner-gather.json'));
	return 0;
})();
