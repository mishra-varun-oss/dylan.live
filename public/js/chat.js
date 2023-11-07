let ws = new WebSocket('wss://dylan.live/chat');

const username = document.querySelector("#username").value;
const contact_list = document.querySelector("#contact_list");
const message_target = document.querySelector("#message_target");
const message_status = document.querySelector("#message_status");
const send = document.querySelector("#send");
const message_content = document.querySelector("#message_content");
const m_list = document.querySelector("#m-list");
const m_container = document.querySelector("messages_container");

let chat_id = document.querySelector("#chat_id").value;
let active_users;

function getDateTime() {
	var now     = new Date(); 
	var year    = now.getFullYear();
	var month   = now.getMonth()+1; 
	var day     = now.getDate();
	var hour    = now.getHours();
	var minute  = now.getMinutes();
	var second  = now.getSeconds(); 
	if(month.toString().length == 1) {
		month = '0'+month;
	}
	if(day.toString().length == 1) {
		day = '0'+day;
	}   
	if(hour.toString().length == 1) {
		hour = '0'+hour;
	}
	if(minute.toString().length == 1) {
		minute = '0'+minute;
	}
	if(second.toString().length == 1) {
		second = '0'+second;
	}   
	var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;   
	return dateTime;
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

function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function contact_click(contact) {
	m_list.innerHTML = '';

	message_target.value = contact;
	chat_id = document.querySelector(`#${contact}`).value;
	message_status.textContent = `Message ${contact}`;

	post('https://dylan.live/chat/get_chats', { chat_id: chat_id })
	.then((data) => {
		if (data.success) {
			let m = data.messages;
			for (let i = 0; i < m.length; i++) {
				let dt = m[i].date;
				console.log(m[i]);
				let li = document.createElement('li');
				let sender;
				if (m[i].sender == username) {
					sender = 'YOU';
				} else {
					sender = m[i].sender;
				}
				let text = `<strong>${dt} ${sender}: </strong>${m[i].content}`;
				li.innerHTML = text;
				li.classList.add('message');
				li.id = m[i].id;
				m_list.appendChild(li);
			}
			console.log(m_container);
			m_container.scrollTop = m_container.scrollHeight;
		}
	})
}

send.addEventListener('click', (event) => {
	let recipient = message_target.value;
	if (recipient) {
		if ((message_content.value === null) || (message_content.value.match(/^ *$/) !== null)) {
			console.log('spaces!!');
			message_content.value = '';
		} else {
			let obj = {
				type: 'message',
				sender: username,
				recipient: recipient,
				message: message_content.value,
				chat_id: chat_id,
				datetime: getDateTime()
			}
			message_content.value = '';
			post('https://dylan.live/chat/message', obj)
			.then((data) => {
				if (data.success) {
					ws.send(JSON.stringify(obj));
				}
			})
		}
	} else {
		message_status.textContent = 'Select from contacts first';
	}
})

ws.addEventListener('open', (event) => {
	let obj = {
		type: 'login', 
		username: username
	}
	ws.send(JSON.stringify(obj));
})

ws.addEventListener('message', (event) => {
	let m = JSON.parse(event.data);

	if (Array.isArray(m)) {
		console.log(m);
		active_users = m;

		fetch("https://jalfry.com/api/get_users?domain=dylan")
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				contact_list.innerHTML = '';
				let contacts = data.data;
				for (let i = 0; i < contacts.length; i++) {
					if (contacts[i] != username) {
						fetch(`https://dylan.live/chat/get_chat_ids?username=${contacts[i]}&user=${username}`)
						.then((response) => response.json())
						.then((data) => {
							console.log(data);
							let chat_id;
							if (data.chat_id) {
								chat_id = data.chat_id;
							} else {
								chat_id = makeid(5);
							}
							let li = document.createElement('li');
							let input = document.createElement('input');
							input.type = 'hidden';
							input.value = chat_id;
							input.id = contacts[i];
							let t;
							for (let j = 0; j < active_users.length; j++) {
								if (contacts[i] === active_users[j].username) {
									t = `${contacts[i]} (online)`;
								} else {
									t = contacts[i];
								}
							}
							let text = document.createTextNode(t);
							li.appendChild(text);
							li.appendChild(input);
							li.addEventListener('click', function() { contact_click(contacts[i]) });
							contact_list.appendChild(li);
						})
					}
				}
			}
		})
	} else if (m.type === 'message') {
		console.log(m, message_target.value, m.sender);
		if ((m.sender == message_target.value) || (m.sender == username)) {
			let li = document.createElement('li');
			let sender;
			if (m.sender == username) {
				sender = 'YOU';
			} else {
				sender = m.sender;
			}
			let text = `<strong>${m.date} ${sender}: </strong>${m.content}`;
			li.innerHTML = text;
			li.classList.add('message');
			m_list.appendChild(li);
			m_container.scrollTop = m_container.scrollHeight;
		} else {
			for (let i = 0; i < contact_list.children.length; i++) {
				if (contact_list.children[i].textContent.includes(m.sender)) {
					let noti = document.createTextNode('New Message!');
					contact_list.children[i].appendChild(noti);
				}
			}
		}
	}
})
