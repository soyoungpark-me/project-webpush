const express = require('express');
const http = require('http');
const fs = require('fs');

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('dotenv').config();
global.utils = require('./utils/global');

const server = http.Server(app);
require('./utils/socket').init(server);
require('./routes')(app);

const args = process.argv.slice(2);
const port = args.length > 0 ? args[0] : process.env.PORT;

server.listen(port, process.env.HOST, () => {
  console.info('[HACKDAY-backend] Listening on port %s at %s', 
  port, process.env.HOST);
});

module.exports = app;