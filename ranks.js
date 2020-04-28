function logHeaders(title) {
	console.log();
	console.log(("=== " + title + " ===").padStart(70));
	console.log();
	logLine("Name", "Obtain Cost", "Sell", "Demand", "Profit", "Profit Rate", "Global Lowest Price");
	logLine("----", "-----------", "----", "------", "------", "-----------", "-------------------");

}

function logLine(name, obtainCost, sell, demand, profit, profitRate, globalLowestPrice) {
	console.log(name.toString().padStart(35)
		+ obtainCost.toString().padStart(17)
		+ sell.toString().padStart(12)
		+ demand.toString().padStart(10)
		+ profit.toString().padStart(12)
		+ profitRate.toString().padStart(17)
		+ globalLowestPrice.toString().padStart(25));
}

function logItem(item) {
	const name = item.name;
	const obtainCost = item.estimate.obtainCost;
	const sell = item.estimate.localLowest.price;
	const demand = item.estimate.demand.toFixed(2);
	const profit = item.estimate.profit;
	const profitRate = (item.estimate.profitRate * 100).toFixed(2) + "%";
	const globalLowestPrice = item.estimate.globalLowest.price + " (" + item.estimate.globalLowest.server + ")";
	logLine(name, obtainCost, sell, demand, profit, profitRate, globalLowestPrice);
}

function rankArbitrage(index) {
	const arbitrageItems = [];
	for (const key in index) {
		if (index.hasOwnProperty(key)) {
			const item = index[key];
			arbitrageItems.push(item);
		}
	}
	logHeaders("Arbitrage");
	arbitrageItems.sort((a, b) => b.estimate.score - a.estimate.score)
		.slice(0, 18)
		.forEach(item => logItem(item));
}

function rankCraft(index) {
	const craftItems = [];
	for (const key in index) {
		if (index.hasOwnProperty(key)) {
			const item = index[key];
			craftItems.push(item);
		}
	}
	const ffxivCraftingAffix = [];
	logHeaders("Arbitrage");
	craftItems.sort((a, b) => b.estimate.score - a.estimate.score)
		.slice(0, 18)
		.forEach(item => {
			logItem(item);
			ffxivCraftingAffix.push(item.id + ",1");
		});

	console.log();
	console.log("https://ffxivcrafting.com/list/saved/" + ffxivCraftingAffix.join(":"));
}

exports.rankArbitrage = rankArbitrage;
exports.rankCraft = rankCraft;