const files = document.querySelector("#files").value.split(';;');
const fileListContainer = document.getElementById('fileList');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');

async function post(url="", data={}) {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	})
	return response.json();
}
function update_data(e, element) {
	let id = document.querySelector("#id").value;
	post("https://dylan.live/specialist/view/update", { id: id, value: element.value }) 
	.then((data) => {
		if (data.status) {
			document.querySelector("#message").textContent = data.message;
		}
	})
}
function createFilePreview(filePath) {
	const fileItem = document.createElement('div');
	fileItem.className = 'file-item';
	const img = document.createElement('img');
	img.src = filePath;
	img.alt = 'File Preview';
	img.className = 'file-preview';
	img.addEventListener('click', () => openModal(filePath));
	fileItem.appendChild(img);
	return fileItem;
}

function openModal(filePath) {
modal.style.display = 'flex';
modalImage.src = filePath;
}

function closeModal() {
	modal.style.display = 'none';
	modalImage.src = '';
}
function isModalOrContent(element) {
	return element === modal || modal.contains(element);
}
function set_status(value, element) {
	console.log(element.nodeName);
	if (element.nodeName == 'SELECT') {
		for (let i = 0; i < element.options.length; i++) {
			let option = element.options[i];
			if (option.value == value) {
				element.selectedIndex = i;
				break;
			}
		}
	} else {
		element.textContent = value;
	}
}

// Create file previews and add them to the file list container
files.forEach((filePath) => {
	let path = `/ticket_images/${filePath}`;
	const filePreview = createFilePreview(path);
	fileListContainer.appendChild(filePreview);
});

window.addEventListener('click', (event) => {
	if (event.target === modal) {
		closeModal();
	}
});
window.addEventListener('touchstart', (event) => {
      if (!isModalOrContent(event.target)) {
        closeModal();
      }
});

window.onload = () => {
	const status = document.querySelector("#status");
	set_status(document.querySelector("#status_data").value, status);
}

