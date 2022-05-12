import { assertObjectMatch } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { parse_group } from "./group.ts"

const expected: any = [
	{
		name: "Formal Hall",
		query: "?event=1329&date=2022-03-03",
		date: 1646265600000,
		opens: 1645941600000,
		booked: true,
		bookable: false,
		queueable: false,
	},
	{
		name: "Formal Hall",
		query: "?event=1329&date=2022-03-01",
		date: 1646092800000,
		opens: 1645768800000,
		booked: false,
		bookable: false,
		queueable: false,
	},
	{
		name: "Formal Hall",
		query: "?event=1329&date=2022-03-04",
		date: 1646438400000,
		opens: 1646114400000,
		booked: false,
		bookable: true,
		queueable: false,
	},
	{
		name: "Formal Hall",
		query: "?event=1329&date=2022-03-04",
		date: 1646352000000,
		opens: 1646028000000,
		booked: false,
		bookable: false,
		queueable: false,
	},
]

Deno.test("group", async () => {
	const html = await Deno.readTextFile(
		"./src/mealbooking/parse/test_data/group.html",
	)
	const group = parse_group(html)
	assertObjectMatch(group, expected)
})
