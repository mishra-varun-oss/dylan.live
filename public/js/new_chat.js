const chat_container = document.querySelector("#chat_container");
const ws = new WebSocket("wss://dylan.live/chat");
const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});
let chat_id = params.id;

let username;
let role;

function get_date_time() {
	var currentdate = new Date(); 
	var datetime = currentdate.getFullYear() + "-"
			+ (currentdate.getMonth()+1)  + "-" 
			+ currentdate.getDate() + " "  
			+ currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
	return datetime;
}

function sendMessage() {
	let content = document.querySelector('#text').value;
	let obj = {
		type: 'message', 
		sender: username,
		content: content,
		id: chat_id,
		datetime: get_date_time()
	}
	ws.send(JSON.stringify(obj));
	document.querySelector('#text').value = '';
}

async function post(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	return response.json();
}

function appendMessage(sender, date, content) {
	let div = document.createElement('div');

	let span_user = document.createElement('span');
	let span_user_text;
	if (sender == username) {
		span_user_text = 'You';
	} else {
		span_user_text = sender;
	}
	let span_user_content = document.createTextNode(`${date} ${span_user_text}: `);
	span_user.appendChild(span_user_content);
	span_user.classList.add('user');

	let span_message = document.createElement('span');
	let span_content = document.createTextNode(content);
	span_message.appendChild(span_content);
	span_message.classList.add('content');

	div.appendChild(span_user);
	div.appendChild(span_message);
	div.classList.add('message');

	chat_container.appendChild(div);
}

function closeChat() {
	window.close();
}

function logout() {
	let obj = {
		type: 'logout',
		username: username,
		id: chat_id
	}
	ws.send(JSON.stringify(obj));

}

ws.addEventListener('open', (event) => {
	//console.log('connected');
	post('/chat/get_messages', { id: chat_id })
	.then((data) => {
		if (data.success) {
			//RENDER MESSAGES
			if (data.messages.length > 0) {
				data.messages.forEach((m) => {
					appendMessage(m.sender, m.nice_date, m.content);
				})	
			}
			let obj = {
				status: true,
				type: 'user'
			}	
			window.opener.postMessage(obj, '*'); 
			chat_container.scrollTop = chat_container.scrollHeight;
		}
	})
})

ws.addEventListener('message', (event) => {
	let m = JSON.parse(event.data);
	//console.log(m, event);
	if (m.type == 'message') {
		appendMessage(m.sender, m.date, m.content);
	} else if (m.type == 'login') {
		let uname = m.username;
		if (uname != username) {
			let div = document.createElement('div');
			let span = document.createElement('span');
			let span_content = document.createTextNode(`${uname} has entered chat!`);
			span.appendChild(span_content);
			span.classList.add('content');
			div.appendChild(span);
			div.classList.add('message');
			chat_container.appendChild(div);
		}
	} else if (m.type == 'logout') {
		let div = document.createElement('div');
		let span = document.createElement('span');
		let span_content = document.createTextNode(`${m.username} has left chat!`);
		span.appendChild(span_content);
		span.classList.add('content');
		div.appendChild(span);
		div.classList.add('message');
		chat_container.appendChild(div);
	}
	chat_container.scrollTop = chat_container.scrollHeight;
})

ws.addEventListener('close', (event) => {
	logout();
})

window.addEventListener('beforeunload', (e) => {
	logout();
})


window.addEventListener('message', (e) => {
	if (e.origin.includes('dylan.live')) {
		console.log(e.data);
		if (e.data.type == 'info') {
			username = e.data.username;
			role = e.data.role;

			let obj = {
				type: 'login',
				username: username,
				id: chat_id
			}
			ws.send(JSON.stringify(obj));
		}
	} else {
		return
	}
})

window.onload = () => {
//	chat_container.scrollTo(0, chat_container.scrollHeight);
}
