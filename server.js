'use strict'

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3015;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log('client on error'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

client.connect().then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
})