import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts"
import { logger } from "./src/_lib/logger/logger.ts"
import { start_queue } from "./src/queue/queue.ts"
import { start_server } from "./src/server/server.ts"

export const database = new DB("database.db")

database.execute(`
	CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY NOT NULL,
		password TEXT NOT NULL,
		session TEXT NOT NULL,
		token TEXT NOT NULL,
		expires INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS queued (
		username TEXT NOT NULL,
		query TEXT NOT NULL,
		body TEXT NOT NULL,
		opens INTEGER NOT NULL,
		state INTEGER DEFAULT 0 NOT NULL, 
		PRIMARY KEY (username, query),
		FOREIGN KEY (username)
			REFERENCES users (username)
	);
`)

let path: undefined | string = undefined
let port = 3000
for (let i = 0; i < Deno.args.length; i++) {
	if (Deno.args[i] === "--path" && Deno.args[i + 1]) {
		path = Deno.args[i + 1]
		break
	}
	if (Deno.args[i] === "--port" && Deno.args[i + 1]) {
		port = Number(Deno.args[i + 1])
		break
	}
}

if (path) {
	logger.info(`Listening on ${path}`)
	start_server({
		path,
		transport: "unix",
	})
} else {
	logger.info(`Listening on http://localhost:${port}`)
	start_server({
		port,
	})
}

start_queue()
