const path = require('path');
const mysql = require('mysql');

const configs = require(path.join(__dirname, "./configs.js"));

require('dotenv').config(configs.src_path);

const connection = mysql.createConnection({
	host:process.env.MYSQL_HOSTNAME,
	user:process.env.MYSQL_DYLAN_USERNAME,
	password:process.env.MYSQL_DYLAN_PASSWORD,
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
