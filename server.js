const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const Redis = require('ioredis');
const client = new Redis();
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({ node: 'http://localhost:9200' }); 

client.on('connect', function() {
  console.log('Connected to Redis!');
});

client.on('error', function (err) {
  console.error('Redis error:', err);
});

const app = express();
app.use(cors());

app.use(cors(esClient));

app.use(bodyParser.json());

const route = require('./Routes/routes');
app.use(route);
app.use(cors());

const portServer = 8080;
const server = http.createServer(app);
server.listen(portServer, () => {
    console.log('Server is starting at port: ' + portServer);
});


module.exports = {client};
