const path = require('path');
const express = require('express');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));

router.get('/', (req, res) => {
	res.render('new_chat');
})

router.post('/get_messages', (req, res) => {
	let id = req.body.id;
	let q = `SELECT *, DATE_FORMAT(date, '%m-%d-%Y %H:%m:%s') AS nice_date FROM messages WHERE chat_id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.send({ success: true, messages: results })
	})
})	

module.exports = router;
