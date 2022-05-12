import { database } from "../../../main.ts"
import { PermissionDenied } from "../../errors.ts"
import { get_tickets } from "../../mealbooking/tickets.ts"

export async function tickets(request: Request) {
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

	const tickets = await get_tickets(token)

	const queued_result = database.query<[string]>(
		"SELECT query FROM queued WHERE username = ?",
		[username],
	)

	const queued_map = new Set<string>()
	for (const [query] of queued_result) {
		queued_map.add(query)
	}

	return new Response(
		JSON.stringify({
			tickets: tickets
				.sort((a, b) => {
					if (a.date == b.date) {
						if (a.query < b.query) {
							return -1
						}
						if (a.query > b.query) {
							return 1
						}
						return 0
					} else {
						return a.date - b.date
					}
				})
				.map((ticket) => ({
					...ticket,
					queued: queued_map.has(ticket.query),
				})),
		}),
		{
			headers: {
				"content-type": "application/json",
			},
		},
	)
}
