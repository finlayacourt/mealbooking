import { writable } from "svelte/store"
import { parse_cookie } from "./_lib/cookie"

export interface Ticket {
	query: string
	name: string
	date: number
	opens: number | null
	booked: boolean
	bookable: boolean
	queueable: boolean
	queued: boolean
}

export const session = writable<string | undefined>(undefined)
export const route = writable<"login" | "tickets" | "error">("login")
export const error = writable<string | undefined>(undefined)

const cookie = parse_cookie(document.cookie)["SESSION"]
if (cookie !== undefined) {
	session.set(cookie)
	route.set("tickets")
}

export const tickets = writable<Ticket[] | undefined>(undefined)
export const current_ticket = writable<Ticket | undefined>(undefined)
current_ticket.subscribe(($ticket) => {
	if ($ticket === undefined) {
		document.documentElement.classList.remove("noscroll")
	} else {
		document.documentElement.classList.add("noscroll")
	}
})
