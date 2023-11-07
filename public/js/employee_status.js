import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

let app = createApp({ 
	components: {
		'navbar': navbar,
	},
	data() {
		return {
		}
	},
	mounted() {
	},
	methods: {
		selectEmoji(emoji) {
		      console.log("Selected emoji:", emoji);
		      // Perform your desired action when an emoji button is clicked
		    }
	}
});

app.mount("#app");
