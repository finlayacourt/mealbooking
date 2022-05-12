import { database } from "../../../main.ts"
import { logger } from "../../_lib/logger/logger.ts"
import { validate } from "../../_lib/validator/validator.ts"
import { PermissionDenied } from "../../errors.ts"
import { get_ticket } from "../../mealbooking/ticket.ts"
import { run_queue } from "../../queue/queue.ts"

export async function unqueue(request: Request) {
	const session = request.headers.get("x-api-key")

	if (session === null) {
		throw new PermissionDenied("No session key")
	}

	const result = database.query<[string, string, number]>(
		"SELECT username, token, expires FROM users WHERE session = ?",
		[session],
	)

	if (result.length === 0) {
		throw new PermissionDenied("Invalid session key")
	}

	const [username, token, expires] = result[0]

	if (expires < Date.now()) {
		throw new PermissionDenied("Session expired")
	}

	const data = await request.json()
	validate({
		type: "object",
		props: {
			query: { type: "string" },
		},
	}, data)

	const { query } = data

	database.query(
		"DELETE FROM queued WHERE username = ? AND query = ?",
		[username, query],
	)

	logger.info(`ticket unqueued (query: ${query}, username: ${username})`)

	run_queue()

	const ticket = await get_ticket(query, token)

	return new Response(
		JSON.stringify({
			ticket: { ...ticket, queued: false },
		}),
		{
			headers: {
				"content-type": "application/json",
			},
		},
	)
}
