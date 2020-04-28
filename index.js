const watches = require('./config/watches.json');
const items = require('./items');

function logArbitrage(name, buy, sell, demand, profitRate) {
	console.log(name.toString().padStart(35)
		+ buy.toString().padStart(20)
		+ sell.toString().padStart(20)
		+ demand.toString().padStart(20)
		+ profitRate.toString().padStart(20));
}

function rankArbitrage(indexedItems) {
	console.log("")
	console.log("=== Arbitrage ===".padStart(70))
	console.log("")
	logArbitrage("Name", "Buy", "Sell", "Demand", "Profit Rate");
	logArbitrage("----", "---", "----", "------", "-----------");
	const arbitrageItems = [];
	for (const key in indexedItems) {
		if (indexedItems.hasOwnProperty(key)) {
			const item = indexedItems[key];
			arbitrageItems.push(item);
		}
	}
	arbitrageItems.sort((a, b) => {
		return b.estimateArbitrage.score - a.estimateArbitrage.score;
	})
		.slice(0, 18)
		.forEach(item => {
			const name = item.name
			const buy = item.estimateArbitrage.globalLowestPrice + " (" + item.estimateArbitrage.globalLowestServer + ")";
			const sell = item.estimateArbitrage.localLowestPrice;
			const demand = item.estimateArbitrage.demand.toFixed(2);
			const profitRate = (item.estimateArbitrage.profitRate * 100).toFixed(2) + "%";
			logArbitrage(name, buy, sell, demand, profitRate);
		});
}

function logCraft(name, obtain, sell, demand, profitRate) {
	console.log(name.toString().padStart(35)
		+ obtain.toString().padStart(20)
		+ sell.toString().padStart(20)
		+ demand.toString().padStart(20)
		+ profitRate.toString().padStart(20));
}

function rankCraft(indexedItems) {
	console.log("")
	console.log("=== Craft ===".padStart(70))
	console.log("")
	logCraft("Name", "Obtain Cost", "Sell", "Demand", "Profit Rate");
	logCraft("----", "-----------", "----", "------", "-----------");

	let ffxivCraftingAffix = [];
	const craftItems = [];
	for (const key in indexedItems) {
		if (indexedItems.hasOwnProperty(key)) {
			const item = indexedItems[key];
			craftItems.push(item);
		}
	}
	craftItems.sort((a, b) => {
		return b.estimateCraft.score - a.estimateCraft.score;
	})
		.slice(0, 18)
		.forEach(item => {
			const name = item.name
			const obtainCost = item.estimateCraft.obtainCost;
			const sell = item.estimateCraft.bestLocalPrice;
			const demand = item.estimateCraft.demand.toFixed(2);
			const profitRate = (item.estimateCraft.profitRate * 100).toFixed() + "%";
			logCraft(name, obtainCost, sell, demand, profitRate);
			ffxivCraftingAffix.push(item.id + ",1");
		});

	console.log("https://ffxivcrafting.com/list/saved/" + ffxivCraftingAffix.join(":"));
}

(async () => {
	for (let index in watches) {
		if (watches.hasOwnProperty(index)) {
			const watchedItemId = watches[index].id;
			await items.loadTree(watchedItemId);
		}
	}
	const indexedItems = items.fullyLoad();

	rankArbitrage(indexedItems);
	rankCraft(indexedItems);
})();
