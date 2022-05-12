import { database } from "../../../main.ts"
import { validate } from "../../_lib/validator/validator.ts"
import { PermissionDenied } from "../../errors.ts"
import { cancel_ticket } from "../../mealbooking/cancel.ts"

export async function unbook(request: Request) {
	const session = request.headers.get("x-api-key")

	if (session === null) {
		throw new PermissionDenied("No session key")
	}

	const result = database.query<[string, number]>(
		"SELECT token, expires FROM users WHERE session = ?",
		[session],
	)

	if (result.length === 0) {
		throw new PermissionDenied("Invalid session key")
	}

	const [token, expires] = result[0]

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
	const ticket = await cancel_ticket(query, token)

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
