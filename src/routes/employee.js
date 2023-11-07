const path = require('path');
const express = require('express');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));
const login_util = require(path.join(__dirname, "../utils/login_util.js"));

router.use(login_util.employee_check);

router.get('/', (req, res) => {
	res.sendFile("/var/www/dylan.live/templates/views/employee_status.html");
})

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/login?logout=true');
})

router.get('/get_tickets', (req, res) => {
	console.log('hello');
	let q = `SELECT * FROM tickets WHERE employee = '${req.session.username}'`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.send(results);
	})
})

router.get('/get_username', (req, res) => {
	res.send({ username: req.session.username })
})

router.get('/view', (req, res) => {
	res.sendFile("/var/www/dylan.live/templates/views/employee_dashboard.html");
})
	

module.exports = router;
