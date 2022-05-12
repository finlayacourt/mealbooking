import { serialize_cookie } from "../_lib/cookie/cookie.ts"
import { logger } from "../_lib/logger/logger.ts"
import { InvalidTicket } from "../errors.ts"
import { MBS_COOKIE_NAME, MBS_URL } from "./consts.ts"
import { parse_group } from "./parse/group.ts"
import { parse_items } from "./parse/items.ts"
import { parse_ticket } from "./parse/ticket.ts"
import { parse_response } from "./response.ts"
import { Ticket } from "./types.ts"

const DATE_RANGE = 10 * 7 * 24 * 60 * 60 * 1000

async function fetch_page(url: string, token: string) {
	const res = await fetch(url, {
		headers: {
			Cookie: serialize_cookie(MBS_COOKIE_NAME, token),
		},
		redirect: "manual",
	})
	return await parse_response(res)
}

export async function get_tickets(token: string) {
	const tickets: Ticket[] = []

	const text = await fetch_page(MBS_URL, token)
	const items = await parse_items(text)

	const from_string = new Date().toISOString().split("T")[0]
	const to_string = new Date(Date.now() + DATE_RANGE).toISOString().split("T")[0]

	await Promise.all(items.map(async (item) => {
		if (item.type === "group") {
			const query = item.query + `&from=${from_string}&to=${to_string}`
			const text = await fetch_page(
				MBS_URL + query,
				token,
			)
			try {
				const group = parse_group(text)
				tickets.push(...group)
			} catch (error) {
				if (error instanceof InvalidTicket) {
					logger.error(`InvalidTicket: ${error.message} (query: ${query})`)
				} else {
					throw error
				}
			}
		} else {
			const text = await fetch_page(MBS_URL + item.query, token)
			try {
				const ticket = parse_ticket(text)
				tickets.push({ ...ticket, query: item.query })
			} catch (error) {
				if (error instanceof InvalidTicket) {
					logger.error(
						`InvalidTicket: ${error.message} (query: ${item.query})`,
					)
				} else {
					throw error
				}
			}
		}
	}))

	return tickets
}
