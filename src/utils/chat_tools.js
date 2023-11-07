const path = require('path');

const db = require(path.join(__dirname, './db.js'));

module.exports.getUniqueId = () => {
	let length = 8;
	let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let ret_val = '';
	for (var i = 0, n = charset.length; i < length; ++i) {
		ret_val += charset.charAt(Math.floor(Math.random() * n));
	}

	return ret_val;
}

module.exports.get_logged_in_users = () => {
	return new Promise((resolve, reject) => {
		let q = `SELECT * FROM users WHERE loggedin = 'true'`;
		db.query(q, (err, results) => {
			if (err) {
				return reject(err);
			}

			let list = [];
			results.forEach((result) => {
				let obj = {
					username: result.username,
					socket_id: result.socket_id
				}
				list.push(obj);
			})
			resolve(list);
		})
	})
}
