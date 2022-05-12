import { database } from "../../../main.ts"
import { logger } from "../../_lib/logger/logger.ts"
import { validate } from "../../_lib/validator/validator.ts"
import { InvalidData, PermissionDenied } from "../../errors.ts"
import { get_ticket } from "../../mealbooking/ticket.ts"
import { run_queue } from "../../queue/queue.ts"

export async function queue(request: Request) {
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
			body: { type: "string" },
		},
	}, data)

	const { query, body } = data

	const ticket = await get_ticket(query, token)

	if (ticket.opens === null) {
		throw new InvalidData(
			"Cannot queue booking without opening date",
		)
	}

	logger.info(`ticket queued (query: ${query}, username: ${username})`)

	database.query(
		"INSERT INTO queued(username, query, body, opens) values(?, ?, ?, ?)",
		[username, query, body, ticket.opens],
	)

	run_queue()

	return new Response(
		JSON.stringify({
			ticket: { ...ticket, queued: true },
		}),
		{
			headers: {
				"content-type": "application/json",
			},
		},
	)
}
