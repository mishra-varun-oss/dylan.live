const fs = require('fs');
const path = require('path');

const this_file = require(__dirname + '/utils.js');

module.exports.random_string_generator = (length) => {
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
module.exports.get_current_date_time = () => {
	let currentdate = new Date(); 
	let datetime = currentdate.getFullYear() + "-"
			+ (currentdate.getMonth()+1)  + "/" 
			+ currentdate.getDate() + " "  
			+ currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
	return datetime;
}
module.exports.organize_files = (files) => {
	return new Promise((resolve, reject) => {
		let f = [];
		files.forEach((file) => {
			let id = this_file.random_string_generator(10);
			let old_path = `/var/www/dylan.live/public/uploads/${file.originalname.replace(/\s/g, "_")}`;
			let new_path = `/var/www/dylan.live/public/ticket_images/${id}`;
			fs.rename(old_path, new_path, (error) => {
				if (error) {
					reject(error);
				}
				f.push(id);
				if (f.length == files.length) {
					resolve(f);
				}
			})
		})
	})
}
