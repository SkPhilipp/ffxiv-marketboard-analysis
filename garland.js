const fetch = require('node-fetch');
const fs = require('fs');
const cache = require('./config/garland-cache.json')
const cacheByName = {};

for (const key in cache) {
	if (cache.hasOwnProperty(key)) {
		const item = cache[key];
		cacheByName[item.name] = item;
	}
}

let cacheTouched = false;

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function save() {
	if (cacheTouched) {
		let cacheJson = JSON.stringify(cache, null, 2);
		fs.writeFileSync('./config/garland-cache.json', cacheJson);
		cacheTouched = false;
	}
}

async function itemData(id) {
	if (cache.hasOwnProperty(id)) {
		return cache[id];
	}
	console.log("populating garland " + id);
	const response = await fetch("https://www.garlandtools.org/db/doc/item/en/3/" + id + ".json");
	const item = (await response.json()).item;
	cacheByName[item.name] = item;
	cache[id] = item;
	cacheTouched = true;
	await sleep(100);
	return item;
}

async function item(id) {
	const item = await itemData(id);

	const recipes = [];
	for (const craftsKey in item.craft) {
		if (item.craft.hasOwnProperty(craftsKey)) {
			const ingredients = []
			const itemCraft = item.craft[craftsKey];
			for (let ingredientsKey in itemCraft.ingredients) {
				if (itemCraft.ingredients.hasOwnProperty(ingredientsKey)) {
					const ingredientEntry = itemCraft.ingredients[ingredientsKey];
					ingredients.push({
						id: ingredientEntry.id,
						amount: ingredientEntry.amount
					})
				}
			}
			recipes.push({
				ingredients: ingredients
			})
		}
	}

	const ingredientOf = [];
	const itemIngredientOf = item.ingredient_of;
	for (let ingredientOfKey in itemIngredientOf) {
		if (itemIngredientOf.hasOwnProperty(ingredientOfKey)) {
			ingredientOf.push(parseInt(ingredientOfKey));
		}
	}

	return {
		id: item.id,
		name: item.name,
		recipes: recipes,
		ingredientOf: ingredientOf
	};
}

exports.itemData = itemData;
exports.item = item;
exports.save = save;
