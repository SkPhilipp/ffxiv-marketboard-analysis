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

function estimate(item, group, profit, obtainCost, score) {
	const globalLowestPrice = itemGlobalLowestPrice(item);
	const localLowestPrice = itemLocalLowestPrice(item);
	const localDemand = itemLocalDemand(item);
	const profitRate = profit / obtainCost;
	let finalScore = score;
	if (group.minimumProfit !== null && profit < group.minimumProfit) {
		finalScore = 0;
	}
	if (group.minimumProfitRate !== null && profitRate < group.minimumProfitRate) {
		finalScore = 0;
	}
	if (group.minimumDemand !== null && localDemand < group.minimumDemand) {
		finalScore = 0;
	}
	item.estimate = {
		globalLowest: globalLowestPrice,
		localLowest: {
			"server": "Shiva",
			"price": localLowestPrice
		},
		demand: localDemand,
		obtainCost: obtainCost,
		profit: profit,
		profitRate: profitRate,
		score: finalScore
	};
}

function estimateArbitrage(item, group) {
	const globalLowestPrice = itemGlobalLowestPrice(item);
	const localLowestPrice = itemLocalLowestPrice(item);
	const localDemand = itemLocalDemand(item);
	const profit = localLowestPrice - globalLowestPrice.price;
	const profitRate = profit / globalLowestPrice.price;
	let score = 0;
	score += Math.sqrt(localDemand) - 2;
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
	estimate(item, group, profit, globalLowestPrice.price, score);
}

function estimateCraft(item, group) {
	const obtainCost = itemObtainCost(item);
	const localLowestPrice = itemLocalLowestPrice(item);
	const localDemand = itemLocalDemand(item);
	const profit = localLowestPrice - obtainCost;
	const profitRate = profit / obtainCost;
	let score = 0;
	score += Math.sqrt(localDemand) - 0.5;
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
	estimate(item, group, profit, obtainCost, score);
}

exports.estimateCraft = estimateCraft;
exports.estimateArbitrage = estimateArbitrage;
