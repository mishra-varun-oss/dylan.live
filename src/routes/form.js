const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));
const utils = require(path.join(__dirname, "../utils/utils.js"));
const login_utils = require(path.join(__dirname, "../utils/login_util.js"));

const storage = multer.diskStorage({ 
	destination: '/var/www/dylan.live/public/uploads',
	filename: (req, file, cb) => {
		cb(null, file.originalname.replace(/\s/g, "_"));
	}
})

const upload = multer({ storage: storage });

router.use(login_utils.employee_check);

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/?logout=true');
})

router.get('/', (req, res) => {
	let q = `SELECT *, DATE_FORMAT(dt, '%m-%d-%Y %H:%i:%s') AS nice_dt FROM tickets WHERE employee = '${req.session.username}'`;
	db.query(q, (err, results) => {
		if (err) throw err;
		res.render('employee', { 
			username: req.session.username,
			role: req.session.role,
			result: results
		});
	})
//	res.sendFile("/var/www/dylan.live/templates/views/form.html");
})

router.post('/ticket', upload.array('file_data', 10), (req, res) => {
	//handle data req.body and req.files
	utils.organize_files(req.files)
	.then((file_list) => {
		let q = `INSERT INTO tickets VALUES (default, '${req.body.employee}', '${req.body.category}', '${req.body.priority}', '${req.body.description}', CAST('${utils.get_current_date_time()}' AS DateTime), '${file_list.join(';;')}', 'OPEN')`;
		db.query(q, (err, fields) => {
			if (err) throw err;

			res.send({ status: true });
		})
	})
})

router.get('/ticket/:id', (req, res) => {
	let id = req.params.id;
	let q = `SELECT *, DATE_FORMAT(dt, '%m-%d-%Y %H:%m:%s') AS nice_dt FROM tickets WHERE id = ${id}`;
	db.query(q, (err, results) => {
		if (err) throw err;
		let r = results[0];
		res.render('employee_ticket_view', {
			username: req.session.username,
			role: req.session.role,
			r: r
		})
	})
})

router.get('/ticket', (req, res) => {
	res.sendFile("/var/www/dylan.live/templates/views/form.html");
})

module.exports = router;
