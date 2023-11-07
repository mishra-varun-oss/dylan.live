const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'127.0.0.1',
	user:'infotech2',
	password:'novtown',
	database:'dylandotlive'
});

connection.connect((err) => {
	if (err) {
		console.error('error ' + err);
		return;
	}

	console.log('dylan.live is connected to MySQL');
})

module.exports = connection;
