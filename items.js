const garland = require('./garland');
const universalis = require('./universalisapi');

const itemIndex = {};

/**
 * Loads in an item, containing:
 * - all base item data including ingredientOf & recipe entries
 * - all market data for that specific item
 * - all recipes' ingredient items (loaded, recursively)
 */
async function loadRecursively(itemId) {
	const item = await garland.item(itemId);
	item.market = await universalis.load(itemId);
	for (const recipe of item.recipes) {
		for (const ingredient of recipe.ingredients) {
			ingredient.item = await loadRecursively(ingredient.id);
		}
	}
	itemIndex[itemId] = item;
	return item;
}

/**
 * Loads an item and all the items it is an ingredient of.
 */
async function loadTree(itemId) {
	const item = await loadRecursively(itemId);
	for (const targetItemId of item.ingredientOf) {
		itemIndex[targetItemId] = await loadRecursively(targetItemId);
		await garland.save();
		await universalis.save();
	}
}

/**
 * Determines the lowest local market price of an item.
 */
function itemLocalLowestPrice(item) {
	if (item.market == null) {
		return 0;
	}
	let bestLocalPrice = null;
	for (const price of item.market.homePrices) {
		bestLocalPrice = bestLocalPrice == null ? price : Math.min(bestLocalPrice, price);
	}
	return bestLocalPrice || 0;
}

/**
 * Determines the local market demand of an item.
 */
function itemLocalDemand(item) {
	if (item.market == null) {
		return 0;
	}
	return item.market.homeHistoricDemandScore;
}

/**
 * Determines the best global price of an item.
 *
 * Ignores item quality.
 */
function itemGlobalLowestPrice(item) {
	let bestGlobalPrice = {
		server: "None",
		price: 0
	};
	if (item.market != null) {
		for (const globalPrice of item.market.globalPrices) {
			if (bestGlobalPrice.price === 0 || globalPrice.price < bestGlobalPrice.price) {
				bestGlobalPrice = globalPrice;
			}
		}
	}
	return bestGlobalPrice;
}

/**
 * Determines the total cost of obtaining an either by either crafting it or buying it off the market board.
 *
 * Crafting ingredients have the same method of cost applied to them.
 */
function itemObtainCost(item) {
	if (item.recipes != null) {
		let lowestRecipeCost = null;
		for (const recipe of item.recipes) {
			let recipeCost = 0;
			for (const ingredient of recipe.ingredients) {
				let ingredientCost = itemObtainCost(ingredient.item) * ingredient.amount;
				recipeCost = recipeCost + ingredientCost;
			}
			lowestRecipeCost = lowestRecipeCost == null ? recipeCost : Math.min(recipeCost, lowestRecipeCost);
		}
		if (lowestRecipeCost != null) {
			return lowestRecipeCost;
		}
	}

	let bestGlobalPrice = null;
	if (item.market == null) {
		return 0;
	}
	for (const globalPrice of item.market.globalPrices) {
		if (bestGlobalPrice == null || globalPrice.price < bestGlobalPrice) {
			bestGlobalPrice = globalPrice.price;
		}
	}
	return bestGlobalPrice;
}

function estimateArbitrage(item) {
	const globalLowestPrice = itemGlobalLowestPrice(item);
	const localLowestPrice = itemLocalLowestPrice(item);
	const localDemand = itemLocalDemand(item);
	const profit = localLowestPrice - globalLowestPrice.price;
	const profitRate = profit / globalLowestPrice.price;
	let score = 0;
	if (localDemand < 1) {
		score--;
	}
	if (localDemand > 2) {
		score++;
	}
	if (localDemand > 3) {
		score++;
	}
	if (localDemand > 4) {
		score++;
	}
	if (profitRate > 1 && profit > 100_000) {
		score++;
	}
	if (profitRate > 2 && profit > 20_000) {
		score++;
	}
	if (profitRate > 4 && profit > 5_000) {
		score++;
	}
	if (profit <= 1_000
		|| localDemand < 0.5) {
		score = 0;
	}
	item.estimateArbitrage = {
		globalLowestServer: globalLowestPrice.server,
		globalLowestPrice: globalLowestPrice.price,
		localLowestPrice: localLowestPrice,
		demand: localDemand,
		profit: profit,
		profitRate: profitRate,
		score: score
	};
}

function estimateCraft(item) {
	const obtainCost = itemObtainCost(item);
	const localLowestPrice = itemLocalLowestPrice(item);
	const localDemand = itemLocalDemand(item);
	const profit = localLowestPrice - obtainCost;
	const profitRate = profit / obtainCost;
	let score = 0;
	if (localDemand < 0.5) {
		score--;
	}
	if (localDemand > 2) {
		score++;
	}
	if (localDemand > 3) {
		score++;
	}
	if (localDemand > 4) {
		score++;
	}
	if (localDemand > 8) {
		score++;
	}
	if (localDemand > 14) {
		score++;
	}
	if (profit > 100_000) {
		score++;
	}
	if (profitRate < 1.5) {
		score--;
	}
	if (profitRate > 3) {
		score++;
	}
	if (profitRate > 5) {
		score++;
	}
	if (profit <= 5_000 || localDemand < 0.2) {
		score = 0;
	}
	item.estimateCraft = {
		obtainCost: obtainCost,
		bestLocalPrice: localLowestPrice,
		demand: localDemand,
		profit: profit,
		profitRate: profitRate,
		score: score
	};
}

function fullyLoad() {
	for (const key in itemIndex) {
		const item = itemIndex[key];
		estimateCraft(item);
		estimateArbitrage(item);
	}
	return itemIndex;
}

exports.loadTree = loadTree;
exports.fullyLoad = fullyLoad;
