const watches = require('./watches');
const showdown = require('showdown');
const express = require('express')
const app = express()
const port = 3000

const prefix = `<link rel="stylesheet" href="https://unpkg.com/purecss@1.0.1/build/pure-min.css" integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47" crossorigin="anonymous">
<style>
html {
	background: black;
	color: #e2e2e2;
}
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  text-align: left;
  padding: 8px;
}

body {
	margin: 30px;
}

tr:nth-child(even) {background-color: #242424;}
</style>
`;

app.get('/', function(req, res) {
	(async () => {
		res.write(prefix);
		const watchFiles = await watches.list();
		watchFiles.forEach(value => {
			res.write(`<a href='/watch/${value}'>${value}</a><br/>`);
		})
		res.write(`<form action="/search" method="get">
						<input type="search" name="item">
						<input type="submit" value="LOAD">
					</form>`);
		res.end();
	})();
});

app.get('/search', function(req, res) {
	(async () => {
		res.write(prefix);
		const item = req.param("item")
		if (item !== undefined
			&& item !== null
			&& item !== "") {
			const watched = {
				"name": "Custom Query",
				"groups": [
					{
						"name": "Crafted",
						"lookupMethod": "Direct",
						"scoreMethod": "CraftedRare",
						"items": [
							{"name": item}
						]
					}
				]
			};
			await watches.assignItemIds(watched);
			const outputs = await watches.rankWatched(watched);
			const converter = new showdown.Converter({tables: true});
			outputs.map(output => converter.makeHtml(output)).forEach(output => res.write(output));
		}
		res.write(`<form action="/search" method="get">
						<input type="search" name="item">
						<input type="submit" value="LOAD">
					</form>`);
		res.end();
	})();
})

app.get('/watch/:watchFile', function(req, res) {
	(async () => {
		res.write(prefix);
		const watched = await watches.load(req.params.watchFile);
		const outputs = await watches.rankWatched(await watched);
		const converter = new showdown.Converter({tables: true});
		outputs.map(output => converter.makeHtml(output)).forEach(output => res.write(output));
		res.write(`<form action="/search" method="get">
						<input type="search" name="item">
						<input type="submit" value="LOAD">
					</form>`);
		res.end();
	})();
});

app.listen(port, () => console.log(`Listening on port ${port}`))

