const fs = require('fs');

function load(path) {
	const watchFileContent = fs.readFileSync(path, {
		encoding: 'utf8'
	});
	return JSON.parse(watchFileContent);
}

exports.load = load;
