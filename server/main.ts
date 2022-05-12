import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts"
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

start_server({
	path: "/home/fa404/mealbooking/web.sock",
	transport: "unix",
})

start_queue()
