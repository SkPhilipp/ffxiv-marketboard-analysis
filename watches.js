const fs = require('fs');
const garland = require('./garland');
const items = require('./items');
const estimates = require('./estimates');
const ranks = require('./ranks');
const path = require('path');

const watchDir = path.join(__dirname, 'watches')

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
						await items.loadTree(watchedItem);
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
		const rankedItems = ranks.rank(index, 15, group);
		items.clear();
		outputs.push("## " + title + "\n\n"
			+ ranks.log(rankedItems) + "\n\n"
			+ ranks.logFfxivCraftingUrl(rankedItems) + "\n\n");
	}
	return outputs;
}

async function assignItemIds(watch) {
	for (const groupKey in watch.groups) {
		if (watch.groups.hasOwnProperty(groupKey)) {
			const group = watch.groups[groupKey];
			const allowedItems = [];
			for (const itemsKey in group.items) {
				if (group.items.hasOwnProperty(itemsKey)) {
					const item = group.items[itemsKey];
					if (item.id == null) {
						item.id = await garland.itemId(item.name);
					}
					if (item.id != null) {
						allowedItems.push(item);
					}
				}
			}
			group.items = allowedItems;
		}
	}
}

async function load(watchFile) {
	const allowedWatchFiles = await list();
	if (!allowedWatchFiles.includes(watchFile)) {
		return {
			"name": "Not found",
			"groups": []
		}
	}
	const watchFilePath = path.join(watchDir, watchFile);
	const watchFileContent = fs.readFileSync(watchFilePath, {
		'encoding': 'utf8'
	});
	const watch = JSON.parse(watchFileContent);
	await assignItemIds(watch);
	return watch;
}

async function list() {
	return fs.readdirSync(watchDir);
}

exports.list = list;
exports.load = load;
exports.rankWatched = rankWatched;
exports.assignItemIds = assignItemIds;
