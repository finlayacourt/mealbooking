import { assertObjectMatch } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { parse_ticket } from "./ticket.ts"

const tests: ({ path: string; ticket: any })[] = [
	{
		path: "booked_full_active.html",
		ticket: {
			name: "International Women's Day Formal",
			date: 1646697600000,
			opens: 1646373600000,
			booked: true,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "booked_open_inactive.html",
		ticket: {
			name: "Cafeteria Hall",
			date: 1646524800000,
			opens: 1646200800000,
			booked: true,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "booked_passed_active.html",
		ticket: {
			name: "Formal Hall",
			date: 1646265600000,
			opens: 1645941600000,
			booked: true,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "booked_passed_inactive.html",
		ticket: {
			name: "Formal Hall",
			date: 1644451200000,
			opens: 1644127200000,
			booked: true,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "unbooked_early_inactive.html",
		ticket: {
			name: "Formal Hall",
			date: 1646870400000,
			opens: 1646546400000,
			booked: false,
			bookable: false,
			queueable: true,
		},
	},
	{
		path: "unbooked_full_active.html",
		ticket: {
			name: "Formal Hall",
			date: 1646352000000,
			opens: 1646028000000,
			booked: false,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "unbooked_passed_inactive.html",
		ticket: {
			name: "Student Lunch",
			date: 1646265600000,
			opens: 1645941600000,
			booked: false,
			bookable: false,
			queueable: false,
		},
	},
	{
		path: "unbooked_open_inactive.html",
		ticket: {
			name: "First Hall",
			date: 1646352000000,
			opens: 1646028000000,
			booked: false,
			bookable: true,
			queueable: false,
		},
	},
]

Deno.test("tickets", async (t) => {
	for (const test of tests) {
		await t.step(test.path, async () => {
			const html = await Deno.readTextFile(
				`./src/mealbooking/parse/test_data/${test.path}`,
			)
			const ticket = parse_ticket(html)
			assertObjectMatch(ticket, test.ticket)
		})
	}
})
