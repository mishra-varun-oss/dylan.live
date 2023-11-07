import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const drop_area = document.querySelector("#drop_area");

let app = createApp({ 
	components: {
		'navbar': navbar
	},
	data() {
		return {
			files: [],
			sending_files: [],
			isDragging: false,
			files_length: 0,
			modalOpen: false,
			modalImageUrl: '',
			progressVisible: false,
			progress: 0,
			complete_form_message: false,
			username: ''
		}
	},
	mounted() {
		this.app_mounted();
		this.get_user_info();
	},
	methods: {
		app_mounted() {
			document.body.addEventListener('dragenter', (e) => { this.handleDragEnter(e) }) 
			document.body.addEventListener('dragover', (e) => { this.handleDragOver(e) })	
			document.body.addEventListener('dragleave', (e) => { this.handleDragLeave(e) })
			document.body.addEventListener('drop', (e) => { this.handleDrop(e) })
		},
		handleFileChange(event) {
			const selectedFiles = event.target.files;
			this.addFiles(selectedFiles);
		},
		handleDragEnter(event) {
			event.preventDefault();
			this.isDragging = true;
			console.log('enter');
		},
		handleDragOver(event) {
			event.preventDefault();
			this.isDragging = true;
			console.log('over');
		},
		handleDragLeave(event) {
			event.preventDefault();
			this.isDragging = false;
			console.log('leave');
		},
		handleDrop(event) {
			event.preventDefault();
			console.log('drop');
			this.isDragging = false;
			const droppedFiles = event.dataTransfer.files;
			this.addFiles(droppedFiles);
		},
		addFiles(selectedFiles) {
			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				if (!this.isFileExists(file)) {
					const reader = new FileReader();
					reader.onload = (e) => {
						const fileData = {
							name: file.name,
							type: file.type,
							url: e.target.result
						}
						this.sending_files.push(file);
						this.files.push(fileData);
						this.files_length++;
					}
					reader.readAsDataURL(file);
				}
			}
		},
		isFileExists(file) {
			return this.files.some((f) => f.name === file.name && f.type === file.type);
		},
		deleteFile(index) {
			this.sending_files.splice(index, 1);
			this.files.splice(index, 1);
			this.files_length--;
		},
		openModal(imageUrl) {
			this.modalImageUrl = imageUrl;
			this.modalOpen = true;
		},
		closeModal() {
			this.modalImageUrl = '';
			this.modalOpen = false;
		},
		handleSubmit() {
			const form_data = new FormData();
			const category = document.querySelector("#category");
			const priority = document.querySelector("#priority");
			const description = document.querySelector("#description");
			for (let i = 0; i < this.sending_files.length; i++) {
				form_data.append('file_data', this.sending_files[i]);
			}
			form_data.append('category', category.value);
			form_data.append('priority', priority.value);
			form_data.append('description', description.value);
			form_data.append('employee', this.username);

			this.progressVisible = true;
			this.progress = 0;
			axios.post('/employee/ticket/', form_data, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				onUploadProgress: (progressEvent) => {
					this.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				}
			}).then((response) => {
				if (response.status) {
					this.complete_form_message = true;
					this.progressVisible = false;
					category.selectedIndex = 0;
					priority.selectedIndex = 0;
					description.value = '';
					this.files = [];
					this.sending_files = [];
					this.files_length = 0;
				}
			})
		},
		get_user_info() {
			axios.get('/login/info')
			.then((response) => {
				if (response.data.status) {
					this.username = response.data.username;
				}
			})
		},
	}
});

app.mount("#form");
