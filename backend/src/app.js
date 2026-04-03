const express = require('express');
const { NODE_ENV, ALLOWED_ORIGINS } = require('./config/env');
const routes = require('./routes');

const app = express();

app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

app.use((req, res, next) => {
	const origin = req.headers.origin;

	if (NODE_ENV === 'development' || (origin && ALLOWED_ORIGINS.includes(origin))) {
		res.header('Access-Control-Allow-Origin', origin || '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		res.header('Access-Control-Allow-Credentials', 'true');
	}

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	return next();
});

app.use(express.json());

app.use('/', routes);

module.exports = app;
