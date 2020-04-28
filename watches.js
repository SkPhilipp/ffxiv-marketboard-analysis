const fs = require('fs');
const garland = require('./garland');

function load(path) {
	const watchFileContent = fs.readFileSync(path, {
		encoding: 'utf8'
	});
	const watch = JSON.parse(watchFileContent);
	for (const groupKey in watch.groups) {
		if (watch.groups.hasOwnProperty(groupKey)) {
			const group = watch.groups[groupKey];
			const allowedItems = [];
			for (const itemsKey in group.items) {
				if (group.items.hasOwnProperty(itemsKey)) {
					const item = group.items[itemsKey];
					if (item.id == null) {
						item.id = garland.itemId(item.name);
					}
					if (item.id == null) {
						// TODO: Implement a mechanism to discover item ids for unknown items
						console.log("Not known, ignored: " + item.name);
					} else {
						allowedItems.push(item);
					}
				}
			}
			group.items = allowedItems;
		}
	}
	return watch;
}

exports.load = load;
