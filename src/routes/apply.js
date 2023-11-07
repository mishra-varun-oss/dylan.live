const path = require('path');
const express = require('express');
const multer = require('multer');
const mysql = require('mysql');

const router = express.Router();

const db = require(path.join(__dirname, '../utils/db.js'));

const uploading_path = '/var/www/dylan.live/public/resumes';
const storage = multer.diskStorage({ 
	destination: uploading_path,
	filename: (req, file, cb) => {
		cb(null, `${file.originalname.replace(/\s/g, "_")}`)
	}
})
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
	res.render('apply');
})

router.post('/', upload.single('file'), (req, res) => {
	let first_name = req.body.first_name;
	let last_name = req.body.last_name;
	let phone_number = req.body.phone_number;
	let email = req.body.email;
	let resume = req.file.originalname;
	let date_ob = new Date();

	let date = ("0" + date_ob.getDate()).slice(-2);
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	let year = date_ob.getFullYear();
	let apply_date = year + "-" + month + "-" + date;

	let q = `INSERT INTO applicants VALUES (default, '${first_name}', '${last_name}', '${apply_date}', '${resume}', '${phone_number}', '${email}')`;
	db.query(q, (err, results, fields) => {
		if (err) throw err;
		res.render('apply_thank_you', {
			name: `${first_name} ${last_name}`
		});
	})
})

module.exports = router;
