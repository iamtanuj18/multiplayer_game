heroku container:push --app=multiplayer-chess-online-game web
heroku container:release --app=multiplayer-chess-online-game web
heroku logs --app=multiplayer-chess-online-game --tail
heroku pg:credentials --app=multiplayer-chess-online-game DATABASE
heroku config:set --app=multiplayer-chess-online-game PGSSLMODE=require