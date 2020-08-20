const { EventEmitter } = require('events');
const { State } = require('./state');

const camelCase = ([first, ...rest] = []) => [
	first,
	rest.map((s) => s[0].toUpperCase() + s.substring(1)),
].join('');

const status = {
	OL: 'online',
	OB: 'battery',
	LB: 'low battery',
	'OL CAL': 'calibrating',
};

const parse = (data, parsers) => {
	const result = { ...data };
	parsers.forEach(({ parse, fields }) => {
		fields.forEach((field) => {
			if (undefined === result[field]) return;

			result[field] = parse(result[field]);
		});
	});

	return result;
};

module.exports.Device = class Device extends EventEmitter {

	topics() {
		return ['info', 'battery', 'input', 'output', 'status'];
	}

	constructor(platform, name, description) {
		super();

		this.state = {};
		this.topics().forEach((topic) => {
			this.state[topic] = new State();
			this.state[topic].on('change', (data) => this.emit('update', topic, data));
		});

		this.platform = platform;
		this.name = name;
		this.description = description;

		setInterval(() => this.fetch(), this.platform.config.interval);
	}

	async fetch() {
		const data = await this.platform.call('GetUPSVars', this.name);

		this.update(this.parse(data));
	}

	parse(raw) {
		const data = parse(raw, [
			{
				parse: (a) => parseInt(a, 10),
				fields: [
					'battery.charge',
					'ups.temperature',
					'ups.load',
				],
			},
			{
				parse: (a) => parseFloat(a),
				fields: [
					'battery.voltage',
					'battery.voltage.high',
					'battery.voltage.low',
					'battery.voltage.nominal',
					'input.current.nominal',
					'input.frequency',
					'input.frequency.nominal',
					'input.voltage',
					'input.voltage.fault',
					'input.voltage.nominal',
					'output.voltage',
				],
			},
		]);

		return {
			...data,

			'status.mode': status[data['ups.status']],
			'status.beeper': data['ups.beeper.status'] === 'enabled',
			'status.temperature': data['ups.temperature'],
			'status.load': data['ups.load'],

			'info.type': data['ups.type'] || undefined,
			'info.manufacturer': data['ups.mfr'] || data['device.mfr'] || undefined,
			'info.model': data['ups.model'] || data['device.model'] || undefined,
			'info.firmware': data['ups.firmware'] || undefined,
		};
	}

	update(data) {
		const update = { info: {} };

		Object.keys(data).forEach((key) => {
			const [topic, ...parts] = key.split('.');

			if (!this.state[topic]) return;

			const name = camelCase(parts);

			update[topic] = { ...update[topic], [name]: data[key] };
		});

		Object.keys(update).forEach((key) => this.state[key].set(update[key]));
	}

};
