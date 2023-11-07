let chat_window;
let id;

function open_chat(id) {
	id = id;
	const width = 350;
	const height = 550;
	const left = (window.innerWidth - width) / 2;
	const top = (window.innerHeight - height) / 2;
	const windowOptions = `width=${width},height=${height},left=${left},top=${top},resizable=no`;

	chat_window = window.open(`https://dylan.live/chat?id=${id}`, '_blank', windowOptions);
}

window.addEventListener('message', (e) => {
	console.log(document.querySelector("#username").value);
	if (e.origin.includes('dylan.live')) {
		//console.log(e.data);
		if (e.data.type == 'user') {
			let username = document.querySelector("#username").value;
			let role = document.querySelector("#role").value;
			let obj = {
				type: 'info',
				username: username,
				role: role
			}
			chat_window.postMessage(obj, '*');
		}
	} else {
		return
	}
})
