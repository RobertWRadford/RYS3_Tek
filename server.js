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

app.get('/', homePage);
app.post('/search', (req, res) => { // check radVal and call the correct function
    let queryStr = inputVal.split(' ').join('-');
    if (req.body.radVal === 'games'){
        detailPage(queryStr, res);
    } else {
        pubPage(queryStr, res);
    }
});
app.get('/favorites', favPage);
app.get('/nomatch', notMatched);
app.delete('/del', delItem);
app.get('*', err => console.log('error 404'))

function homePage(req, res){
    //query https://api.rawg.io/api/games?order=-rating
    //render all games with pagination, maybe 15 at a time to match wireframe; maybe attach data tags to the sections
    //create internal functions to remove sections that don't fall into filter rules
}

function pubPage(queryStr, res){
    // let url=https://api.rawg.io/api/publishers/${queryStr};
    // if it doesnt pull an exact match redirect to nomatch
    // render page with relevant data
}

function detailPage(queryStr, res){
    // let url=https://api.rawg.io/api/games/${queryStr};
    // if it doesnt pull an exact match redirect to nomatch
    // render page with relevant data
}

function notMatched(req, res){
    // render noMatch view
}

function favPage(req, res){
    // query database and populate all favorites, maybe paginate if over thresholds
    // give options to delete items from favorites or go to its detail page
}

function delItem(req, res){
    // remove selected item from favorites list
    // redirect to /favorites
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}`);
    });
})