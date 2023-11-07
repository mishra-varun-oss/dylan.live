const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const db = require(path.join(__dirname, "../utils/db.js"));
const utils = require(path.join(__dirname, "../utils/utils.js"));

const storage = multer.diskStorage({ 
	destination: '/var/www/dylan.live/public/uploads',
	filename: (req, file, cb) => {
		cb(null, file.originalname.replace(/\s/g, "_"));
	}
})

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
	let q = `SELECT * FROM tickets WHERE employee = '${req.session.username}'`; 
	db.query(q, (err, results) => {
		if (err) throw err;
		res.send(results);
	})
//	res.sendFile("/var/www/dylan.live/templates/views/form.html");
})

router.post('/', upload.array('file_data', 10), (req, res) => {
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

module.exports = router;
