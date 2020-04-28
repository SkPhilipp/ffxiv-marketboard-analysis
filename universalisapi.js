const cache = require('./config/universalis-cache-v2.json')
const fs = require('fs');
const fetch = require('node-fetch');
const moment = require('moment');

let cacheTouched = false;

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function save() {
	if (cacheTouched) {
		let cacheJson = JSON.stringify(cache, null, 2);
		fs.writeFileSync('./config/universalis-cache-v2.json', cacheJson);
		cacheTouched = false;
	}
}

async function pull(id) {
	const response = await fetch("https://universalis.app/api/Shiva/" + id);
	const responseJson = await response.json();
	const homePrices = [];
	responseJson.listings.forEach(listing => {
		homePrices.push(listing.pricePerUnit);
	})
	const homeLowestPrice = Math.min(...homePrices);
	const homePurchaseHistory = [];
	responseJson.recentHistory.forEach(recentHistory => {
		const datetime = moment.unix(recentHistory.timestamp);
		homePurchaseHistory.push(datetime.format("YYYY-MM-DD"));
	})
	const homeLastUpdated = moment.unix(responseJson.lastUploadTime / 1000).format("YYYY-MM-DD");
	return {
		"globalPrices": [
			{
				"server": "Shiva",
				"price": homeLowestPrice
			}
		],
		"homePrices": homePrices,
		"homePurchaseHistory": homePurchaseHistory,
		"homeLastUpdated": homeLastUpdated
	}
}

function enhance(item) {
	item.homeHistoricDemandPurchases = item.homePurchaseHistory.length;
	let homeLeastRecentPurchase
	if (item.homeHistoricDemandPurchases > 0) {
		homeLeastRecentPurchase = item.homePurchaseHistory[item.homeHistoricDemandPurchases - 1];
	} else {
		homeLeastRecentPurchase = moment([2019, 1, 1]);
	}
	const homeLeastRecentPurchaseDate = moment(homeLeastRecentPurchase, "YYYY-MM-DD");
	const homeLastUpdatedDate = moment(item.homeLastUpdated, "YYYY-MM-DD");
	item.homeHistoricDemandDays = Math.abs(homeLastUpdatedDate.diff(homeLeastRecentPurchaseDate, 'days'));
	if (item.homeHistoricDemandDays === 0) {
		item.homeHistoricDemandDays = 1;
	}
	item.homeHistoricDemandScore = item.homeHistoricDemandPurchases / (item.homeHistoricDemandDays == null ? 1 : item.homeHistoricDemandDays);
	return item;
}

async function load(id) {
	if (cache.hasOwnProperty(id)) {
		return enhance(cache[id]);
	}
	try {
		console.log("populating universalis " + id);
		let result = await pull(id);
		enhance(result);
		cache[id] = result;
		cacheTouched = true;
		return result;
	} catch (e) {
		console.log("erred on universalis " + id);
		return null;
	}
}

exports.load = load;
exports.save = save;
