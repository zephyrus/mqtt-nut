module.exports.config = {

	mqtt: {
		host: process.env.MQTT_HOST,
		username: process.env.MQTT_USERNAME,
		password: process.env.MQTT_PASSWORD,
		id: process.env.MQTT_ID,
		path: process.env.MQTT_PATH || 'nut',
	},

	nut: {
		host: process.env.NUT_HOST,
		port: process.env.NUT_PORT || 3493,
		username: process.env.NUT_USERNAME,
		password: process.env.NUT_PASSWORD,
		interval: process.env.NUT_INTERVAL || 2000,
		reconnect: process.env.NUT_RECONNECT || 5000,
	},

};
