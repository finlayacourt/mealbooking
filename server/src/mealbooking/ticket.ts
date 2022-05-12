import { serialize_cookie } from "../_lib/cookie/cookie.ts"
import { logger } from "../_lib/logger/logger.ts"
import { InvalidTicket } from "../errors.ts"
import { MBS_COOKIE_NAME, MBS_URL } from "./consts.ts"
import { parse_ticket } from "./parse/ticket.ts"
import { parse_response } from "./response.ts"
import { Ticket } from "./types.ts"

export async function get_ticket(query: string, token: string) {
	const res = await fetch(MBS_URL + query, {
		headers: {
			Cookie: serialize_cookie(MBS_COOKIE_NAME, token),
		},
		redirect: "manual",
	})
	const text = await parse_response(res)
	try {
		const ticket_data = parse_ticket(text)
		const ticket: Ticket = { ...ticket_data, query }
		return ticket
	} catch (error) {
		if (error instanceof InvalidTicket) {
			logger.error(`InvalidTicket: ${error.message} (query: ${query})`)
		}
		throw error
	}
}
