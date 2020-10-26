# Vision
  The vision RYS3_Tek is to bring a new, sleek, user-friendly method of finding games and receiving game recommendations for any type of gamer.
  
  The problem with today's gaming industry is that the market is almost entirely cornered by STEAM for online computer gaming, and their platform has
  lots of redundancies, poor recommendation algorithms, and difficult UI.
  
  At RYS3_Tek, we plan on rysing above these meek industry standards, and push the boundaries to help any gamer, new or experienced, young or old, to
  experience new games that will definitely interest them.
  
## Scope
IN:

  Feature 1: The app will have a form with the ability to searching for the games requested by the user
  
  Feature 2: It will include some radio buttons to allow the user to filter games by genre, popularity, type, etc.
  
  Feature 3: When the user sees the search results, they will be able to save games to their favorites
  
  Feature 4: The app will analyze the user's favorites in order to make recommendations about future games to the user
  
  Feature 5: A user can delete games from their favorites, and the recommender will adapt to the new list of favorites.
  
OUT: 
  We will not be using a sign in method because we want to make sure that our app is not being used to hack individual data from users as this
  is a commonplace practice with Steam APIs.
  
Minimum Viable Product: 
  We expect that at minimum we can save the games to the application and filter the games by the different categories. We should then be able to 
  match the game by relation to those in the favorites section.
  
Stretch Goal: 
  To have the analysis of the recommendations be based on an individual profile of the user that can more accurately match a game 
  recommendation to their actual preferences.
  
## Functional Requirements
  1. The user can search games by submitting our search form
  2. A user can click on games to view the details of the games
  3. A user can save games to their favorites list
  4. A user can receive recommendation from the app
  
  Data Flow:
   
    A request for games will come from the front-end of the app, which will be coming into our server
    Our server take in a search request, and responds with a request to the Steam API to query games related to the search
    The Steam API then sends the query results back to the server in a response.
    
    A user can make a request to the server to save a game to the favorites. 
    This request to the server sends a request to the client of the database to insert a row of data about the saved game.
    The client runs the query and sends back a response to the server that it has been completed.
    The server then responds to the user by rendering the details of that saved game.
    
    Once a user has saved games, the front-end makes a request to the server to receive recommendations.
    The server compiles the statistics of the favorites and runs a request to another api to query similar games.
    The API responds with a bundle of recommendations, and the server takes that response as a response to the user.
    
## Non-Functional Requirements

  Usability: One of the most frustrating parts about using Steam is that there are lots of tiny boxes, too much data, everything is overcrowded.
  To make an app that could be friendly to anybody, it needs to be simple and clean. To do this we will take a chunk of time to focus on the css
  in order to style everything properly and to make the app readable.
  
  Scalability: We want to be able to use more game APIs so that we can guarantee that all the games that individuals may be interested in will
  be included in our app. To do this we need to make sure that we stay modularized and have all the functions with specific parameters and that 
  can have new APIs added to the app. We also want to be able to recommend based on more and more parameters in order to get more accurate 
  recommendations that more specifically match the user to improve user experience.
    

  
  
