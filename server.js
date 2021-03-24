//START CONFIGURATIONS///////////////////////////////////////////////////////////////////////
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const app = express();
const cors = require('cors');
const methodOverride = require('method-override');
const PORT = process.env.PORT || 3015;
const key = process.env.KEY
let ssl_config = null;
if (process.env.NODE_ENV === 'development') {
    ssl_config = {rejectUnauthorized: false};
}
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    ssl: ssl_config
});

client.on('error', err => console.log('client on error'));
//APPLY EJS TO THE VIEWS FOLDER
app.set('view engine', 'ejs');
//USE THE EJS AS A STATIC FRONT END FOR OUR SERVER
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());
app.use(methodOverride('_method'));
//END CONFIGURATIONS///////////////////////////////////////////////////////////////////////

//START FUNCTIONS///////////////////////////////////////////////////////////////////////// 
let stores = [];
superagent.get('https://www.cheapshark.com/api/1.0/stores')
    .then(list => stores = list.body.map(store => store.storeName))
    .catch(err => console.error('returned error:', err))


/* The Game constructor function which creates game objects for every game that is rendered.
The title property is used to display the title of the game, and is expected to match the
search query of the user. On the /search route, the title is converted into a slug to query
the game API. The slug is used to query the API as a queryStr in the /gamepage route. */
function Game(game){
    this.title = game.name ? game.name : 'Unknown';
    this.slug = game.slug ? game.slug : 'unknown';
    this.image_url = game.background_image ?  game.background_image : 'https://image.freepik.com/free-vector/glitch-game-background_23-2148090006.jpg';
    this.rating = game.rating ? game.rating : 'No data';
    this.ratingCount = game.ratings_count ? game.ratings_count : 'No data';
    this.platforms = game.platforms ? game.platforms.map(plat => plat.platform.name) : ['No data'];
    this.parent_platforms = game.parent_platforms ? game.parent_platforms.map(plat => plat.platform.name) : ['No data'];
    this.genres = game.genres ? game.genres.map(type => type.name) : ['No data'];
    this.preview = game.clip ? game.clip.clip ? game.clip.clip : '' : '';
    this.trailer = game.clip ? game.clip.video ? game.clip.video : '' : '';
    this.filters = game.tags ? game.tags.map(tag => tag.name) : ['No data'];
    this.description = game.description_raw ? game.description_raw : 'No data';
    this.gameID = game.id ? game.id : 4828;
}

function Deal(store){
    let storeNum = store.storeID ? store.storeID : 1;
    this.price = store.salePrice ? store.salePrice : 'Unknown';
    this.originalPrice = store.normalPrice ? store.normalPrice : 'Unknown';
    this.sale = store.savings ? store.savings.slice(0, 2) : 'Unknown';
    this.shop = stores[storeNum-1];
}

/* This is the callback function for the homepage, which is loaded on the / route.
It queries the game API at the current page requested. In response it constructs
a new Game object for every game on the current page, and creates buttons to access
the previous and next pages if they exist. The homePage function then renders a 
homepage with the instantiated gamesList objects filling in the homepage template for
each game. It also renders the current page with the page navigation buttons. */
function homePage(req, res){
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let platformList = req.body.platform ? req.body.platform : 0;
    let genreList = req.body.genres ? req.body.genres : 0;
    let search = req.body.searchName ?  req.body.searchName : 0;
    let url = search != 0 ? `https://api.rawg.io/api/games?key=${key}&search=${search}&page_size=16&page=${page}` : `https://api.rawg.io/api/games?key=${key}&exclude_additions=1&page_size=16&page=${page}`;
    let platformUrl = platformList != 0 ? typeof(platformList) == 'object' ? '&parent_platforms='+platformList.join(',') : '&parent_platforms='+platformList : '';
    let genreUrl = genreList != 0 ? typeof(genreList) == 'object' ? '&genres='+genreList.join(',') : '&genres='+genreList : '';
    url = url + platformUrl + genreUrl;
    superagent.get(url).then(list => {
            let gamesList = list.body.results.map(game => new Game(game));
            let pages = {
                previous: list.body.previous ? page-1 : null,
                current: page,
                next: list.body.next ? page+1 : null
            }
            res.render('pages/homepage.ejs', {gamesList: gamesList, pages: pages, platforms: platformList, genres: genreList, searchName: search});
        }).catch(err => console.error('Homepage error:', err))
}

function searchPage(req, res, queryStr){
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let platformList = req.body.platform ? req.body.platform : 0;
    let genreList = req.body.genres ? req.body.genres : 0;
    let url = `https://api.rawg.io/api/games?key=${key}&search=${queryStr}&page_size=16&page=${page}`;
    let platformUrl = platformList != 0 ? typeof(platformList) == 'object' ? '&parent_platforms='+platformList.join(',') : '&parent_platforms='+platformList : '';
    let genreUrl = genreList != 0 ? typeof(genreList) == 'object' ? '&genres='+genreList.join(',') : '&genres='+genreList : '';
    url = url + platformUrl + genreUrl;
    superagent.get(url).then(list => {
            let gamesList = list.body.results.map(game => new Game(game));
            let pages = {
                previous: list.body.previous ? page-1 : null,
                current: page,
                next: list.body.next ? page+1 : null
            }
            res.render('pages/homepage.ejs', {gamesList: gamesList, pages: pages, platforms: platformList, genres: genreList, searchName: queryStr});
        }).catch(err => console.error('Homepage error:', err))
}


/* The queryStr (query string) is either coming in from the homepage which accesses the slug 
property of the request body or it comes in from the search form in the requet body under
the search property. That string is pushed into the game api url. A request is sent to this
API which returns the individual game information in the list (response body). The function
will either render a gameDetails page or a nomatches page. */
function detailPage(req, res, queryStr){
    const url = `https://api.rawg.io/api/games/${queryStr}?key=${key}`;
    superagent.get(url).then(list => {
            let game = new Game(list.body);
            let url2 = `https://www.cheapshark.com/api/1.0/deals?title=${game.slug}&exact=1`;
            superagent.get(url2).then(result => {
                    let deals = result.body.map(store => new Deal(store));
                    res.render('pages/games/gameDetails.ejs', {game: game, deals: deals});
                }).catch(err => console.error('returned error:', err))
        }).catch(err => console.error('Homepage error:', err))
}
/* This function is called by the route associated with our nav bar anchor tag MY GAMES.
When called, favPage will request the client to query the games database. Then, with
the results of the query, the function will render the favorites page, populated with
the games from the database.
    It still needs to be paginated if there are over 15 games. */
function favPage(req, res){
    const sql = 'SELECT DISTINCT title, slug, image_url, rating, ratingCount, platforms, parent_platforms, genres, preview, trailer, filters, description FROM games;';
    client.query(sql).then(results => {
            res.render('pages/games/favorites.ejs', {games: results.rows});
        }).catch(err => console.error('returned error:', err))
}
/* This route is called by the SAVE GAME button on the gameDetails page which submits
a form with all the game data that will be saved. The saveGame function finds the 
information from the request, and requests the SQL client to query our data values
and INTESERT them INTO our games datatable. Then it redirect the user to back to
the same /gameDetails route to keep looking at the details for the current game. */
function saveGame(req, res){
    const obj = req.body;
    // let sql = `IF NOT EXISTS (SELECT * FROM games WHERE slug = $2) INSERT INTO games(title, slug, image_url, rating, ratingCount, platforms, parent_platforms, genres, trailer, filters, description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;
    let sql = `INSERT INTO games(title, slug, image_url, rating, ratingCount, platforms, parent_platforms, genres, preview, trailer, filters, description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;
    let values = [obj.title, obj.slug, obj.image_url, obj.rating, obj.ratingCount, obj.platforms, obj.parent_platforms, obj.genres, obj.preview, obj.trailer, obj.filters, obj.description]
    client.query(sql, values).then(detailPage(req, res, obj.slug)).catch(err => console.error('returned error:', err))
}
/* This route is called by the REMOVE button on the favorites page which submits
a form with the id for the game as a remove_target input. The delItem function
finds the ID for the row we want to remove from the request, then removes the 
selected item from the favorites list, and redirect user to the /favorites route. */
function delItem(req, res){
    let delId = req.body.remove_target;
    let sql = `DELETE FROM games WHERE slug='${delId}';`;
    client.query(sql).then(res.redirect('/favorites')).catch(err => console.error('Error deleting item:', err));
}

function suggestGames(req,res){
    let gameSlug = req.body.slug;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let url = `https://api.rawg.io/api/games/${gameSlug}/suggested?key=${key}&page_size=16&page=${page}`;
    superagent.get(url).then(list => {
            let suggestionsList = list.body.results.map(game => new Game(game));
            let pages = {
                previous: list.body.previous ? page-1 : null,
                current: page,
                next: list.body.next ? page+1 : null
            }
            res.render('pages/games/suggestion.ejs', {suggestions:suggestionsList, pages: pages, slug: gameSlug});
        }).catch(err => console.error('Error suggesting games:', err));
}
//END FUNCTIONS //////////////////////////////////////////////////////////////////////////

//START ROUTES/////////////////////////////////////////////////////////////////////////////
//GET / route on page load and load homepage
app.get('/', homePage);
app.post('/', homePage);
/*POST /search route when search form submitted from homepage. Then replace the spaces with 
hyphens, any special characters with blanks, and replace ampersans with the full word and. 
This must be done to match the search request to the query string expected by the game API.*/
app.post('/search', (req, res) => {
    let queryStr = req.body.search;
    searchPage(req, res, queryStr);
});
/*POST the /gamepage route when the details button is pressed from any game form on the home
page. The slug property associated with the selected game object form will be used to query
the game API to respond with the data about the specific game selected.*/
app.post('/gamepage', (req, res) => {
    let queryStr = req.body.slug ? req.body.slug : 'unknown';
    detailPage(req, res, queryStr);
});

//POST the data from the page request from the home page and render the next home page. 
app.post('/homePagination', homePage);
//GET the favorites page when the user requests the favorites page in the nav bar.
app.get('/favorites', favPage);
/*POST the current game rendered on the current details page to the games database and 
rerender the current gameDetails page.*/

app.post('/addFavorite', saveGame);
//DELETE on the favorites route when the delete form is submitted from the favorites page.
app.delete('/favorites', delItem);
//GET all routes handles errors to unmanaged routes.
app.get('*', () => console.log('error 404'));
app.post('/suggest', suggestGames)
//END ROUTES///////////////////////////////////////////////////////////////////////////////

//listen to the port and log in the console to know which port is being listened to.
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}`);
    });
}).catch(err => console.error('database connection returned error:', err))