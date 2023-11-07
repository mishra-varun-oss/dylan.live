const path = require('path');
const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const db = require(path.join(__dirname, '../utils/db.js'));

router.get('/', (req, res) => {
	res.render('password');
})

router.post('/password', (req, res) => {
	let password = req.body.password;
	if (password == 'monalisa') {
		req.session.loggedin = true;
		res.redirect('/applicants/all');
	} else {
		res.redirect('/');
	}
})

router.use((req, res, next) => {
	if (req.session.loggedin) {
		next();
	} else {
		res.redirect('/applicants');
	}
})

router.get('/all', (req, res) => {
	let q = 'SELECT * FROM applicants';
	db.query(q, (err, results, fields) => {
		if (err) throw err;

		let applicants = [];
		results.forEach((result) => {
			let dt = new Date(result.date);
			let dt_split = dt.toISOString().split('T');
			console.log(dt_split);
			let obj = {
				id: result.id,
				first_name: result.first_name,
				last_name: result.last_name,
				date: dt_split[0],
				resume: `/resumes/${result.resume}`,
				phone_number: result.phone_number,
				email: result.email
			}
			applicants.push(obj);
		})

		res.render('applicants', {
			applicant: applicants
		})
	})
})

module.exports = router;
