import { parseDate } from "https://esm.sh/chrono-node@2.3.8"
import { parse } from "https://esm.sh/node-html-parser@5.3.3"
import { InvalidTicket } from "../../errors.ts"
import { Ticket } from "../types.ts"

export function parse_group(html: string) {
	const document = parse(html)

	let name: string | undefined = undefined
	let raw_opens: string | undefined = undefined

	const h1 = document.querySelector("h1")
	if (h1) name = h1.innerHTML
	if (name === undefined) throw new InvalidTicket("cannot find name in group")

	for (const td of document.querySelectorAll("th")) {
		if (td.innerHTML === "Signup opens") {
			raw_opens = td.nextElementSibling.innerHTML
			break
		}
	}

	const tickets: Ticket[] = []
	for (const table of document.querySelectorAll("table")) {
		const text = table.previousElementSibling.innerHTML
		if (text === "Dates booked" || text === "Dates not booked") {
			const booked = text === "Dates booked"
			for (const tr of table.querySelectorAll("tr").slice(1, -1)) {
				let query: string | undefined = undefined
				let date: number | undefined = undefined
				let opens: number | null = null
				let bookable = false
				let queueable = false

				const a = tr.querySelector("a")
				if (a === null) {
					continue
				}
				query = a.getAttribute("href")!
				date = Date.parse(a.innerHTML)
				if (raw_opens !== undefined) {
					opens = parseDate(raw_opens, new Date(date)).getTime()
				}

				if (!booked) {
					for (const td of tr.querySelectorAll("td")) {
						const text = td.innerHTML
						if (text.startsWith("(") && text.endsWith(")")) {
							bookable = Number(text.substring(1, text.indexOf("/"))) > 0
						} else if (text === "Signup deadline has passed") {
							bookable = false
						} else if (text === "Signup has not yet opened") {
							bookable = false
							queueable = opens !== null
						}
					}
				}

				tickets.push({
					name,
					query,
					date,
					opens,
					booked,
					bookable,
					queueable,
				})
			}
		}
	}

	return tickets
}
