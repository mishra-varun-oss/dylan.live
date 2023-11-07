const path = require('path');
const express = require('express');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));
const login_util = require(path.join(__dirname, "../utils/login_util.js"));

router.use(login_util.specialist_check);

router.get('/', (req, res) => {
	let q = `SELECT *, DATE_FORMAT(dt, '%m-%d-%Y %H:%i:%s') AS nice_dt FROM tickets`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.render('specialist_view', {
			username: req.session.username,
			result: results
		})
	})
})

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/login?logout=true');
})

router.get('/view/:id', (req, res) => {
	let id = req.params.id;
	let q = `SELECT *, DATE_FORMAT(dt, '%m-%d-%Y %H:%m:%s') AS nice_dt FROM tickets WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		let r = results[0];
		res.render('specialist_ticket_view', {
			username: req.session.username,
			r: r
		})
	})
})

router.post('/view/update', (req, res) => {
	console.log(req.body);
	let q = `UPDATE tickets SET status = '${req.body.value}' WHERE id = ${req.body.id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.send({ status: true, message: 'Updated status!' })
	})
})


module.exports = router;
