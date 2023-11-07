const path = require('path');
const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const check = require(path.join(__dirname, "../middleware/login_check.js"));
const db = require(path.join(__dirname, "../utils/db.js"));

router.use(check.login_check);

router.get('/', (req, res) => {
	res.render('chat', {
		username: req.session.username
	});
})

router.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('https://dylan.live/login?logout=true');
})

router.get('/get_chat_ids', (req, res) => {
	let username = req.query.username;
	let user = req.query.user;

	let q = `SELECT chat_id FROM messages WHERE (sender = '${user}' AND recipients = '${username}') OR (sender = '${username}' AND recipients = '${user}')`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			res.send({ chat_result: true, chat_id: results[0].chat_id });
		} else {
			res.send({ chat_result: false });
		}
	})
})

router.post('/message', (req, res) => {
	let sender = req.body.sender;
	let recipient = req.body.recipient;
	let content = req.body.message;
	let chat_id = req.body.chat_id;
	let dt = req.body.datetime;

	let q = `INSERT INTO messages VALUES (default, '${sender}', '${recipient}', '${chat_id}', '${content}', '${dt}')`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		res.send({ success: true, date: dt, sender: sender, content: content })
	})
})

router.post('/get_chats', (req, res) => {
	let chat_id = req.body.chat_id;
	let q = `SELECT * FROM messages WHERE chat_id = '${chat_id}'`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		if (results.length > 0) {
			let list = [];
			results.forEach((result) => {
				let dt = new Date(result.date);
				let dt_noT = dt.toISOString().split('T');
				let date = dt_noT[0];
				let time = dt_noT[1].substring(0, 8);
				let obj = {
					m_id: result.id,
					sender: result.sender,
					recipient: result.recipients,
					content: result.content,
					date: date + ' ' + time
				}

				list.push(obj);
			})

			res.send({ success: true, messages: list });
		} else {
			res.send({ success: false })
		}
	})
})

module.exports = router;
