import { assert, assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { auth } from "./auth.ts"
import { book_ticket } from "./book.ts"
import { cancel_ticket } from "./cancel.ts"
import { get_tickets } from "./tickets.ts"
import { Ticket } from "./types.ts"

Deno.test({
	name: "mealbooking",
	ignore: Deno.args.length < 2,
	async fn(t) {
		let token: string | undefined = undefined
		let tickets: Ticket[] | undefined = undefined

		await t.step("auth", async () => {
			const [username, password] = Deno.args
			const data = await auth(username, password)
			assertEquals(data.username, "fa404")
			token = data.token
		})

		await t.step("tickets", async () => {
			tickets = await get_tickets(token!)
		})

		await t.step("ticket", async (t) => {
			const bookable_ticket = tickets!.find((ticket) => !ticket.booked && ticket.bookable)

			if (bookable_ticket == undefined) {
				throw new Error("No testable ticket available")
			}

			await t.step("book", async () => {
				const body = "guests=0&guests_names=&vegetarians=0&requirements=&update=Create"
				const ticket = await book_ticket(bookable_ticket.query, body, token!)
				assert(ticket.booked)
			})

			await t.step("cancel", async () => {
				const ticket = await cancel_ticket(bookable_ticket.query, token!)
				assert(!ticket.booked)
			})
		})
	},
})
