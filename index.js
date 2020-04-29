const watches = require('./watches');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');
const path = require('path');

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
		console.log(title);
		console.log("=".repeat(title.length));
		console.log();
		const rankedItems = ranks.rank(index, 15);
		ranks.log(rankedItems);
		ranks.logFfxivCraftingUrl(rankedItems);
		items.clear();
	}
}

(async () => {
	if (process.argv.length <= 2) {
		console.error("No watch file provided, use " + process.argv[1] + " {watch_file}");
		return;
	}
	const watchPath = path.join(__dirname, process.argv[2]);
	const watched = await watches.load(watchPath);
	await rankWatched(await watched);
	return 0;
})();
