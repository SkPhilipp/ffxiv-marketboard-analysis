const fs = require('fs');
const garland = require('./garland');

function load(path) {
	const watchFileContent = fs.readFileSync(path, {
		encoding: 'utf8'
	});
	const watch = JSON.parse(watchFileContent);
	// TODO: Assign item.id when only item.name is known
	return watch;
}

exports.load = load;
