import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
let chat_window;
let id;
let app = createApp({ 
	components: {
		'navbar': navbar,
	},
	data() {
		return {
			username: '',
			dropdownVisible: false,
			tableData: []
		}
	},
	mounted() {
		this.get_username();
		this.get_tickets();
		window.addEventListener('message', (e) => {
			if (e.origin.includes('dylan.live')) {
				//console.log(e.data);
				if (e.data.type == 'user') {
					//let username = document.querySelector("#username").value;
					//console.log(this.username);
					let obj = {
						type: 'info',
						username: this.username,
						role: 'specialist'
					}
					chat_window.postMessage(obj, '*');
				}
			} else {
				return
			}
		})
	},
	methods: {
		get_username() {
			axios.get('/employee/get_username')
			.then((response) => {
				console.log(response);
				this.username = response.data.username;
			})
		},
		get_tickets() {
			axios.get('/employee/get_tickets')
			.then((response) => {
				this.tableData = response.data;
			})
		},
		startTimers() {
			this.tableData.forEach(item => {
				item.timerId = setInterval(() => {
					item.startDate.setSeconds(item.startDate.getSeconds() + 1);
				}, 1000);
			});
		},
		stopTimers() {
			this.tableData.forEach(item => {
				clearInterval(item.timerId);
			});
		},
		formatTime(startDate) {
			const diff = Math.abs(new Date() - startDate);
			const seconds = Math.floor(diff / 1000) % 60;
			const minutes = Math.floor(diff / 1000 / 60) % 60;
			const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		},
		open_chat(id) {
			id = id;
			const width = 350;
			const height = 550;
			const left = (window.innerWidth - width) / 2;
			const top = (window.innerHeight - height) / 2;
			const windowOptions = `width=${width},height=${height},left=${left},top=${top},resizable=no`;

			chat_window = window.open(`https://dylan.live/chat?id=${id}`, '_blank', windowOptions);
		}
	}
});

app.mount("#app");
