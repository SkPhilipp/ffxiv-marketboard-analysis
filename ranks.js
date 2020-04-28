function logHeaders() {
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

function rank(index, top) {
	const items = [];
	for (const key in index) {
		if (index.hasOwnProperty(key)) {
			const item = index[key];
			items.push(item);
		}
	}
	return items.sort((itemA, itemB) => itemB.estimate.score - itemA.estimate.score)
		.filter(item => item.estimate.score > 0)
		.slice(0, top);
}

function log(items) {
	logHeaders();
	items.forEach(item => {
		logItem(item);
	});
}

function logFfxivCraftingUrl(items) {
	const ffxivCraftingAffix = [];
	items.forEach(item => {
		ffxivCraftingAffix.push(item.id + ",1");
	});
	const ffxivCraftingUrl = "https://ffxivcrafting.com/list/saved/" + ffxivCraftingAffix.join(":");
	console.log(ffxivCraftingUrl);
}

exports.rank = rank;
exports.log = log;
exports.logFfxivCraftingUrl = logFfxivCraftingUrl;
