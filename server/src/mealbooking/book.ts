import { serialize_cookie } from "../_lib/cookie/cookie.ts"
import { logger } from "../_lib/logger/logger.ts"
import { IncorrectTicket, InvalidTicket } from "../errors.ts"
import { MBS_COOKIE_NAME, MBS_URL } from "./consts.ts"
import { parse_ticket } from "./parse/ticket.ts"
import { parse_response } from "./response.ts"
import { Ticket } from "./types.ts"

export async function book_ticket(
	query: string,
	body: string,
	token: string,
): Promise<Ticket> {
	const params = new URLSearchParams(body)
	params.append("update", "Create")

	const res = await fetch(MBS_URL + query, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Cookie: serialize_cookie(MBS_COOKIE_NAME, token),
		},
		body: params.toString(),
	})

	const text = await parse_response(res)
	try {
		const ticket_data = parse_ticket(text)
		if (!ticket_data.booked) {
			logger.warn(
				`IncorrectTicket: failed to book event (query: ${query})`,
			)
			throw new IncorrectTicket("Failed to book event")
		}
		return { query, ...ticket_data }
	} catch (error) {
		if (error instanceof InvalidTicket) {
			logger.error(`InvalidTicket: ${error.message} (query: ${query})`)
		}
		throw error
	}
}
