const watches = require('./watches');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');
const path = require('path');
const showdown = require('showdown');

async function rankWatched(watch) {
	const outputs = [];
	for (const groupKey in watch.groups) {
		const group = watch.groups[groupKey];
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

		const title = watch.name + ": " + group.name;
		const rankedItems = ranks.rank(index, 15);
		items.clear();
		outputs.push(title + "\n" + "=".repeat(title.length) + "\n\n"
			+ ranks.log(rankedItems) + "\n\n"
			+ ranks.logFfxivCraftingUrl(rankedItems) + "\n\n");
	}
	return outputs;
}

(async () => {
	if (process.argv.length <= 2) {
		console.error("No watch file provided, use " + process.argv[1] + " {watch_file}");
		return;
	}
	const watchFilePathArg = process.argv[2];
	const watchFileAsHtml = process.argv.length <= 3 ? false : process.argv[3] === "--html";
	const watchFilePath = path.join(__dirname, watchFilePathArg);
	const watched = await watches.load(watchFilePath);
	const outputs = await rankWatched(await watched);
	const converter = new showdown.Converter({tables: true});
	outputs.map(output => watchFileAsHtml ? converter.makeHtml(output) : output)
		.forEach(output => console.log(output));
	return 0;
})();
