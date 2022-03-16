const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error is: ${error}`);
  }
};

app.get("/movies/", async (request, response) => {
  const getMoviesArrayQuery = `SELECT movie_name FROM movie`;

  const moviesArray = await db.all(getMoviesArrayQuery);
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetail = request.body;
  const { directorId, movieName, leadActor } = movieDetail;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}')`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;

  const movieDetail = await db.get(getMovieQuery);
  response.send(movieDetail);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetail = request.body;

  const { directorId, movieName, leadActor } = movieDetail;

  const updateMovieQuery = `UPDATE movie SET director_id=${directorId},
                                               movie_name= '${movieName}',
                                               lead_actor= '${leadActor}'
                                        WHERE movie_id=${movieId}`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;

  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMoviesQuery = `SELECT * FROM movie WHERE director_id = ${directorId}`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

initializeDbAndServer();
