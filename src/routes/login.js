const path = require('path');
const express = require('express');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));

router.get('/', (req, res) => {
	res.sendFile("/var/www/dylan.live/templates/views/login.html");
})

router.post('/', (req, res) => {
	//username and permission information from jalfry
	let u = req.body.username;
	let p = req.body.permission;

	//store user information in session
	req.session.username = u;
	req.session.role = p;
	req.session.loggedin = true;

	//redirect user to the application
	if (req.body.permission === "employee") {
		console.log(req.body.permission);
		res.send({ status: true, url: 'https://dylan.live/employee' }); 
	} else if (req.body.permission === "specialist") {
		res.send({ status: true, url: 'https://dylan.live/specialist' }); 
	} else {
		console.log(req.body.permission + '!');
		res.send({ status: false }); 
	}
})

router.get('/info', (req, res) => {
	if (req.session.loggedin) {
		let obj = {
			status: true,
			username: req.session.username
		}
		res.send(obj);
	}
})

module.exports = router;
