import { database } from "../../../main.ts"
import { validate } from "../../_lib/validator/validator.ts"
import { auth } from "../../mealbooking/auth.ts"

export async function login(request: Request) {
	const data = await request.json()
	validate({
		type: "object",
		props: {
			username: { type: "string" },
			password: { type: "string" },
		},
	}, data)
	const { username, token } = await auth(data.username, data.password)
	const session = crypto.randomUUID()
	const expires = Date.now() + 2 * 60 * 60 * 1000
	database.query(
		"INSERT OR REPLACE INTO users(username, password, session, token, expires) values(?, ?, ?, ?, ?)",
		[username, data.password, session, token, expires],
	)
	return new Response(
		JSON.stringify({ session }),
		{
			headers: {
				"content-type": "application/json",
			},
		},
	)
}
