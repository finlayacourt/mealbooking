import { logger } from "../_lib/logger/logger.ts"
import * as errors from "../errors.ts"
import { login } from "./routes/1_login.ts"
import { tickets } from "./routes/2_tickets.ts"
import { book } from "./routes/3_book.ts"
import { unbook } from "./routes/4_unbook.ts"
import { queue } from "./routes/5_queue.ts"
import { unqueue } from "./routes/6_unqueue.ts"

export function coalesce_to_error(error: unknown) {
	return error instanceof Error ? error : new Error(JSON.stringify(error))
}

async function router(request: Request) {
	try {
		const url = new URL(request.url)
		switch (request.method) {
			case "POST":
				switch (url.pathname) {
					case "/login":
						return await login(request)
				}
				break
			case "PUT":
				switch (url.pathname) {
					case "/book":
						return await book(request)
					case "/queue":
						return await queue(request)
				}
				break
			case "DELETE":
				switch (url.pathname) {
					case "/unbook":
						return await unbook(request)
					case "/unqueue":
						return await unqueue(request)
				}
				break
			case "GET":
				switch (url.pathname) {
					case "/tickets":
						return await tickets(request)
				}
				break
		}

		return new Response("Not Found", {
			status: 404,
		})
	} catch (error: unknown) {
		if (error instanceof errors.PermissionDenied) {
			return new Response(error.message, {
				status: 401,
			})
		} else if (error instanceof errors.InvalidData) {
			return new Response(error.message, {
				status: 400,
			})
		} else if (error instanceof errors.NotConnected) {
			return new Response(error.message, {
				status: 500,
			})
		} else if (error instanceof errors.InvalidTicket) {
			return new Response(error.message, {
				status: 500,
			})
		} else if (error instanceof errors.IncorrectTicket) {
			return new Response(error.message, {
				status: 500,
			})
		} else {
			logger.error(coalesce_to_error(error))
			return new Response("Unknown server error", {
				status: 500,
			})
		}
	}
}

async function handle(conn: Deno.Conn) {
	for await (const { request, respondWith } of Deno.serveHttp(conn)) {
		await respondWith(router(request))
	}
}

export async function start_server(options: any) {
	for await (const conn of Deno.listen(options)) {
		handle(conn)
	}
}
