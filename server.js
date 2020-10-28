'use strict'
//CONFIGURATIONS
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3015;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log('client on error'));
//APPLY EJS TO THE VIEWS FOLDER
app.set('view engine', 'ejs');
//USE THE EJS AS A STATIC FRONT END FOR OUR SERVER
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());
//ROUTES
app.get('/', homePage);
app.post('/search', (req, res) => { // check radVal and call the correct function
    let queryStr = inputVal.split(' ').join('-');
    if (req.body.radVal === 'games'){
        detailPage(queryStr, res);
    } else {
        pubPage(queryStr, res);
    }
});
app.post('/homePagination', homePage);
app.get('/favorites', favPage);
app.get('/nomatch', notMatched);
app.delete('/del', delItem);
app.get('*', () => console.log('error 404'));

//FUNCTIONS START
function Game(game){
    this.title = game.name ? game.name : 'Unknown';
    this.image_url = game.background_image ?  game.background_image : 'https://image.freepik.com/free-vector/glitch-game-background_23-2148090006.jpg';
    this.rating = game.rating ? game.rating : 'No data';
    this.ratingCount = game.ratings_count ? game.ratings_count : 'No data';
    this.platforms = game.platforms ? game.platforms.map(plat => plat.platform.name) : ['No data'];
    this.parent_platforms = game.parent_platforms ? game.parent_platforms.map(plat => plat.platform.name) : ['No data'];
    this.genres = game.genres ? game.genres.map(type => type.name) : ['No data'];
    this.trailer = game.clip ? game.clip.clip ? game.clip.clip : '' : '';
    this.filters = game.tags ? game.tags.map(tag => tag.name) : ['No data'];
    this.description = game.description_raw ? game.description_raw : 'No data';
}

function homePage(req, res){
    //1. query https://api.rawg.io/api/games?order=-rating
    //2. render all games with pagination, maybe 15 at a time to match wireframe; maybe attach data tags to the sections
    //3. create internal functions to remove sections that don't fall into filter rules
    let page = req.body.page ? req.body.page : '1';
    const url = `https://api.rawg.io/api/games?order=-rating&page_size=15&page=${page}`;
    superagent.get(url)
        .then(list => {
            let gamesList = list.results.map(game => new Game(game));
            let pages = {
                previous: list.previous ? page-1 : null,
                current: page,
                next: list.next ? page+1 : null
            }
            res.render('/homepage.ejs', {gamesList: gamesList, pages: pages});
        })
        .catch(err => console.log('home page err'))
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