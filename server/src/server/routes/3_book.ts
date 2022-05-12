import { database } from "../../../main.ts"
import { validate } from "../../_lib/validator/validator.ts"
import { PermissionDenied } from "../../errors.ts"
import { book_ticket } from "../../mealbooking/book.ts"

export async function book(request: Request) {
	const session = request.headers.get("x-api-key")

	if (session === null) {
		throw new PermissionDenied("No session key")
	}

	const users_result = database.query<[string, number]>(
		"SELECT token, expires FROM users WHERE session = ?",
		[session],
	)

	if (users_result.length === 0) {
		throw new PermissionDenied("Invalid session key")
	}

	const [token, expires] = users_result[0]

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
	const ticket = await book_ticket(query, body, token)

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
