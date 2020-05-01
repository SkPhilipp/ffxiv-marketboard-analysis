function formatNumber(number) {
	if (number < 1000) {
		return number;
	}
	const scaleSymbol = ["", "K", "M", "B", "T", "Q"];
	const tier = Math.log10(number) / 3 | 0;
	const suffix = scaleSymbol[tier];
	const scale = Math.pow(10, tier * 3);
	const scaled = number / scale;
	return scaled.toFixed(1) + suffix;
}

const cellTypeName = {
	title: "Name",
	width: 35,
	method: item => item.name
};

const cellTypeObtainCost = {
	title: "Obtain Cost",
	width: 12,
	method: item => item.estimate.obtainCost === 0 ? "" : item.estimate.obtainCost
};

const cellTypeSell = {
	title: "Sell",
	width: 7,
	method: item => formatNumber(item.estimate.localLowest.price)
};

const cellTypeDemand = {
	title: "Demand",
	width: 8,
	method: item => item.estimate.demand.toFixed(2)
};

const cellTypeProfit = {
	title: "Profit",
	width: 8,
	method: item => formatNumber(item.estimate.profit)
};

const cellTypeProfitRate = {
	title: "Profit Rate",
	width: 12,
	method: item => item.estimate.profitRate === Infinity ? "" : ((item.estimate.profitRate * 100).toFixed(2) + "%")
};

const cellTypeGlobalLowestPrice = {
	title: "Lowest Price",
	width: 20,
	method: item => formatNumber(item.estimate.globalLowest.price) + " (" + item.estimate.globalLowest.server + ")"
};

const cellTypeScore = {
	title: "Score",
	width: 7,
	method: item => formatNumber(item.estimate.score.toFixed(2))
};

function asCellTitle(cellType) {
	return cellType.title.padStart(cellType.width) + " ";
}

function asCellValue(cellType, item) {
	return cellType.method(item).toString().padStart(cellType.width) + " ";
}

function asCellFill(cellType) {
	return "-".repeat(cellType.width + 1);
}

function logTable(cellTypes, items) {
	const title = "|" + cellTypes.map(cellType => asCellTitle(cellType)).join("|") + "|" + "\n";
	const separator = "|" + cellTypes.map(cellType => asCellFill(cellType)).join("|") + "|" + "\n";
	const content = items.map(item => "|" + cellTypes.map(cellType => asCellValue(cellType, item)).join("|") + "|").join("\n")
	return title + separator + content;
}

function rank(index, top, group) {
	const items = [];
	for (const key in index) {
		if (index.hasOwnProperty(key)) {
			const item = index[key];
			if (group.lookupMethod === "Direct") {
				for (const groupItem of group.items) {
					if (item.name === groupItem.name) {
						items.push(item);
						break;
					}
				}
			} else {
			}
		}
	}
	return items.sort((itemA, itemB) => itemB.estimate.score - itemA.estimate.score)
		.slice(0, top);
}

function log(items) {
	return logTable([
		cellTypeName,
		cellTypeObtainCost,
		cellTypeSell,
		cellTypeDemand,
		cellTypeProfit,
		cellTypeProfitRate,
		cellTypeGlobalLowestPrice,
		cellTypeScore,
	], items);
}

function logFfxivCraftingUrl(items) {
	const ffxivCraftingAffix = [];
	items.forEach(item => {
		ffxivCraftingAffix.push(item.id + ",1");
	});
	const link = `https://ffxivcrafting.com/list/saved/${ffxivCraftingAffix.join(":")}`;
	return `<p><a href="${link}">ffxivcrafting.com list</a></p>`;
}

exports.rank = rank;
exports.log = log;
exports.logFfxivCraftingUrl = logFfxivCraftingUrl;
