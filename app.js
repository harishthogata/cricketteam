const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
var db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
  app.listen(3000, () => {
    console.log("Server connected to http://localhost:3000/");
  });
};

initializeDBAndServer();
// App 1
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT *
    FROM cricket_team;
    `;
  const playersList = await db.all(getPlayers);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// App 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const selectUserQuery = `SELECT 
  * 
  FROM 
  cricket_team
  WHERE 
  player_name = '${playerName}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const addPlayer = `
        INSERT INTO
            cricket_team(player_name,jersey_number,role)
        VALUES(
            ${playerName},
            '${jerseyNumber}',
            '${role}'
            );`;

    await db.run(addPlayer);
    response.send("Player Added to Team");
  } else {
    response.status(400);
    response.send("Player already exists");
  }
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SElECT *
    FROM
        cricket_team
    WHERE
        player_id= ${playerId};`;
  const playerObject = await db.all(getPlayer);

  const playerDetails = playerObject.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  });
  response.send(playerDetails);
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerDetails = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE 
        player_id = ${playerId}
        ;`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
        cricket_team
    WHERE
        player_id= ${playerId};`;
  const playerNames = await db.all(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
