const path = require('path');
const url = require('url');

const express = require('express')
const hbs = require('hbs')
const ws = require('ws');
const session = require('express-session');
const body_parser = require('body-parser');

const app = express()

const public_dir_path = path.join(__dirname,"../public");
const views_dir_path = path.join(__dirname,"../templates/views");
const chat = require(path.join(__dirname, "/routes/chat.js"));
const login = require(path.join(__dirname, "/routes/login.js"));
const apply = require(path.join(__dirname, "/routes/apply.js"));
const applicants = require(path.join(__dirname, "/routes/applicants.js"));
const form = require(path.join(__dirname, "/routes/form.js"));
const utils = require(path.join(__dirname, "/utils/chat_tools.js"));
const db = require(path.join(__dirname, "/utils/db.js"));
const employee = require(path.join(__dirname, "/routes/employee.js"));
const specialists = require(path.join(__dirname, "/routes/specialists.js"));
const new_chat = require(path.join(__dirname, "/routes/new_chat.js"));

const configs = require(path.join(__dirname, "./utils/configs.js"));

require('dotenv').config(configs.src_path);

const wss = new ws.Server({ noServer: true });
wss.on('connection', socket => {
	console.log('connected!');
	//let id = utils.getUniqueId();
	//socket.id = id;

	socket.on('message', (message, isBinary) => {
		let m = JSON.parse(message);
		//console.log(m);

		if (m.type === 'login') {
			let username = m.username;
			let id = m.id;
			socket.id = id;
			wss.clients.forEach((client) => {
				console.log(client.id);
				if (client.id == id) {
					let obj = {
						type: 'login',
						username: username
					}
					client.send(JSON.stringify(obj), { binary: isBinary });
				}
			})
/*
			let q = `UPDATE users SET socket_id = '${id}', loggedin = 'true' WHERE username = '${m.username}'`;
			db.query(q, (err, results) => {
				if (err) throw err;
				
				utils.get_logged_in_users()
				.then((list) => {
					wss.clients.forEach((client) => {
						if (client.readyState == ws.WebSocket.OPEN) {
							client.send(JSON.stringify(list), { binary: isBinary });
						}
					})
				})
			})
*/
		} else if (m.type === 'message') {
			let sender = m.sender;
			let content = m.content;
			let chat_id = m.id;
			let dt = m.datetime;
			let q = `INSERT INTO messages VALUES (default, '${sender}', ${chat_id}, '${content}', '${dt}')`;
			db.query(q, (err, results) => {
				if (err) throw err;
								
				wss.clients.forEach((client) => {
					if (client.id == chat_id) {
						console.log(client.id);
						let obj = {
							type: 'message',
							sender: sender,
							content: content,
							date: dt
						}
						client.send(JSON.stringify(obj), { binary: isBinary });
					}
				})
			})
/*
			let q = `SELECT * FROM users WHERE username = '${recipient}' OR username = '${sender}'`;
			db.query(q, (err, results, fields) => {
				if (err) throw err;
				console.log(results);

				results.forEach((result) => {
					wss.clients.forEach((client) => {
						if (client.id == result.socket_id) {
							console.log(result);
							let obj = {
								type: 'message',
								sender: sender,
								recipient: recipient,
								content: content,
								date: dt
							}
							client.send(JSON.stringify(obj), { binary: isBinary });
						}
					})
				})
			})
*/
		} else if (m.type === 'logout') {
			//console.log(m);
			wss.clients.forEach((client) => {
				if (client.id == m.id) {
					let obj = {
						type: 'logout',
						username: m.username
					}
					client.send(JSON.stringify(obj), { binary: isBinary });
				}
			})
		}
	})
/*
	socket.on('close', () => {
		let q = `UPDATE users SET loggedin = 'false' WHERE socket_id = '${socket.id}'`;
		db.query(q, (err, results) => {
			if (err) throw err;

			utils.get_logged_in_users()
			.then((list) => {
				wss.clients.forEach((client) => {
					if (client.readyState == ws.WebSocket.OPEN) {
						client.send(JSON.stringify(list));
					}
				})
			})
		})
	})
*/
})

app.use(express.static(path.join(__dirname,'../public')));
app.use('/tickets',express.static(path.join(__dirname,'../public/tickets')));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.use(session({ 
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}))
app.set('view engine','hbs')
app.set('views',views_dir_path);

app.get('/', (req,res) =>{
	res.sendFile(path.join(__dirname, "../templates/views/login.html"))
})
app.use('/chat', new_chat);
app.use('/login', login);
app.use('/specialist', specialists);
//app.use('/employee', employee);
app.use('/employee', form);
//app.use('/apply', apply);
//app.use('/applicants', applicants);

const port = process.env.PORT;
const server = app.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`dylan.live is running on port ${port}`);
})
server.on('upgrade', (request, socket, head) => {
	let u = url.parse(request.url);

	if (u.pathname === '/chat') {
		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit('connection', ws, request);
		})
	}
})
