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

function index() {
	return itemIndex;
}

exports.loadTree = loadTree;
exports.index = index;
