const garland = require('./garland');
const universalis = require('./universalisapi');

let itemIndex = {};

/**
 * Loads in an item, containing:
 * - all base item data including ingredientOf & recipe entries
 * - all market data for that specific item
 * - all recipes' ingredient items (not loaded)
 */
async function load(itemQuery) {
	const item = await garland.item(itemQuery.id);
	item.market = await universalis.load(itemQuery.id);
	itemIndex[itemQuery.id] = item;
	return item;
}

/**
 * Loads in an item, containing:
 * - all base item data including ingredientOf & recipe entries
 * - all market data for that specific item
 * - all recipes' ingredient items (loaded, recursively)
 */
async function loadRecursively(itemQuery) {
	const item = await load(itemQuery);
	for (const recipe of item.recipes) {
		for (const ingredient of recipe.ingredients) {
			ingredient.item = await loadRecursively({id: ingredient.id});
		}
	}
	return item;
}

/**
 * Loads an item and all the items it is an ingredient of.
 */
async function loadTree(itemQuery) {
	const item = await loadRecursively(itemQuery);
	for (const targetItemId of item.ingredientOf) {
		itemIndex[targetItemId] = await loadRecursively({id: targetItemId});
	}
}

async function save() {
	await garland.save();
	await universalis.save();
}

function index() {
	return itemIndex;
}

function clear() {
	itemIndex = {};
}

exports.loadRecursively = loadRecursively;
exports.loadTree = loadTree;
exports.load = load;
exports.index = index;
exports.clear = clear;
exports.save = save;
