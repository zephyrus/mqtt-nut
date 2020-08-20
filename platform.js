const { EventEmitter } = require('events');
const Nut = require('node-nut');
const { Device } = require('./device');

module.exports.Platform = class Platform extends EventEmitter {

	constructor(config) {
		super();

		this.online = false;
		this.devices = [];

		this.config = config;

		this.nut = new Nut(config.port, config.host);

		this.nut.on('error', (error) => {
			this.status(false);
			this.emit('error', error);

			setTimeout(() => this.connect(), config.reconnect);
		});

		this.nut.on('close', () => {
			this.status(false);
			this.emit('close');
		});

		this.nut.on('ready', () => {
			this.status(true);
			this.fetch();
		});

		this.connect();
	}

	async connect() {
		await this.call('start');
		await this.call('SetUsername', this.config.username);
		await this.call('SetPassword', this.config.password);
	}

	async fetch() {
		const list = await this.call('GetUPSList');

		Object.keys(list).forEach((name) => {
			this.init(name, list[name]);
		});
	}

	status(status) {
		if (status === this.online) return;

		this.online = status;

		this.emit('status', status);
	}

	call(method, ...args) {
		return new Promise(
			(resolve, reject) => this.nut[method](
				...args,
				(data, err) => (err ? reject(err) : resolve(data)),
			),
		);
	}

	init(name, description) {
		const device = new Device(this, name, description);
		this.devices.push(device);

		device.on('update', (...args) => {
			this.emit('update', device, ...args);
		});

		device.on('ready', () => {
			this.emit('device', device);
		});
	}

};
