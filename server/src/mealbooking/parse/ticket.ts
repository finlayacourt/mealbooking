import { parseDate } from "https://esm.sh/chrono-node@2.3.8"
import { parse } from "https://esm.sh/node-html-parser@5.3.3"
import { InvalidTicket } from "../../errors.ts"
import { TicketData } from "../types.ts"

export function parse_ticket(html: string): TicketData {
	let name: string | undefined
	let date: number | undefined
	let opens: number | null = null
	let booked = false
	let bookable = false
	let queueable = false

	const document = parse(html)

	const h1 = document.querySelector("h1")
	if (h1) {
		name = h1.innerHTML
	} else {
		throw new InvalidTicket("cannot find name in ticket")
	}

	for (const td of document.querySelectorAll("td")) {
		if (td.innerHTML === "Date") {
			date = Date.parse(td.nextElementSibling.innerHTML)
			break
		}
	}
	if (date === undefined) {
		throw new InvalidTicket("cannot find date in ticket")
	}

	for (const td of document.querySelectorAll("td")) {
		if (td.innerHTML === "Signup opens") {
			opens = parseDate(
				td.nextElementSibling.innerHTML,
				new Date(date),
			).getTime()
			break
		}
	}

	for (const td of document.querySelectorAll("td")) {
		if (td.innerHTML === "Guests") {
			booked = true
			break
		}
	}

	if (!booked) {
		if (document.querySelector("input[value='Make booking']")) {
			bookable = true
		}
		if (opens !== null) {
			for (const p of document.querySelectorAll("p")) {
				if (p.innerHTML === "Bookings for this event have not yet opened") {
					queueable = true
					break
				}
			}
		}
	}

	return { name, date, opens, booked, bookable, queueable }
}
