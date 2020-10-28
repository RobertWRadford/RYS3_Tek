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
app.post('/detail', detailPage);
app.post('/search', (req, res) => { // check radVal and call the correct function
    let queryStr = inputVal.replace(/[\:\\\/\#\$]/g, '').replace(/\&/g, 'and').split(' ').join('-');
    detailPage(queryStr, res);
});
app.post('/homePagination', homePage);
app.get('/favorites', favPage);
//app.post('/schema', saveItem);
app.post('/addFavorite', saveGame);
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
    this.gameID = game.id ? game.id : 4828;
    this.slug = game.slug ? game.slug : 'No data';
}

function homePage(req, res){
    //1. query https://api.rawg.io/api/games?order=-rating
    //2. render all games with pagination, maybe 15 at a time to match wireframe; maybe attach data tags to the sections
    //3. create internal functions to remove sections that don't fall into filter rules
    let page = req.body.page ? req.body.page : '1';
    const url = `https://api.rawg.io/api/games?order=-rating&page_size=15&page=${page}`;
    superagent.get(url)
    .then(list => {
        let gamesList = list.body.results.map(game => new Game(game));
            let pages = {
                previous: list.body.previous ? list.body.previous : null,
                current: page,
                next: list.body.next ? list.body.next : null
            }
            res.render('pages/homepage.ejs', {gamesList: gamesList, pages: pages});
        })
        .catch(err => console.log('home page err'))
}

function detailPage(queryStr, res){
    // let url=https://api.rawg.io/api/games/${queryStr};
    // if it doesnt pull an exact match redirect to nomatch
    // render page with relevant data
    const url = `https://api.rawg.io/api/games/${queryStr.body.slug}`;
    superagent.get(url)
        .then(list => {
            let game = new Game(list.body);
            res.render('pages/games/gameDetails.ejs',{game: game});
        })
        .catch( res.render('pages/searches/nomatches.ejs'))
}

function favPage(req, res){
    // query database and populate all favorites, maybe paginate if over thresholds
    // give options to delete items from favorites or go to its detail page
    const sql = 'SELECT * FROM games;';
    client.query(sql)
        .then(results => {
            res.render('pages/favorites.ejs', {games: results.rows});
        })
        .catch(err => console.log('fav page error'))
}

function saveGame(req, res){
    const obj = req.body.game;
    let sql = `INSERT INTO games(title, image_url, rating, ratingCount, platforms, parent_platforms, genres, trailer, filters, description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    let values = [obj.title, obj.image_url, obj.rating, obj.ratingCount, obj.platforms, obj.parent_platforms, obj.genres, obj.trailer, obj.filters, obj.description]
    client.query(sql, values)
        .catch(err => console.log('save favorite error'))
}
//function saveItem (req, res){
    
//}
function delItem(req, res){
    // remove selected item from favorites list
    // redirect to /favorites
    let delId = req.body.id;
    let sql = `DELETE FROM books WHERE id=${delId};`;
    client.query(sql)
    .then(res.redirect('pages/favorites'))
    .catch(err => console.error('returned error:', err));
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}`);
    });
})