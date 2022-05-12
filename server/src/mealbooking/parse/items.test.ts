import { assertObjectMatch } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { parse_items } from "./items.ts"

const expected: any = [
	{ query: "?event=1325", type: "group" },
	{ query: "?event=1327", type: "group" },
	{ query: "?event=1328", type: "group" },
	{ query: "?event=1329", type: "group" },
	{ query: "?event=1330", type: "group" },
	{ query: "?event=1358", type: "group" },
	{ query: "?event=1374", type: "group" },
	{ query: "?event=1326", type: "group" },
	{ query: "?event=1345", type: "group" },
	{ query: "?event=1379&date=2022-03-08", type: "ticket" },
	{ query: "?event=1380&date=2022-03-08", type: "ticket" },
	{ query: "?event=1356&date=2022-03-17", type: "ticket" },
	{ query: "?event=1372&date=2022-03-17", type: "ticket" },
	{ query: "?event=1357&date=2022-03-18", type: "ticket" },
	{ query: "?event=1373&date=2022-03-18", type: "ticket" },
]

Deno.test("groups", async () => {
	const html = await Deno.readTextFile(
		"./src/mealbooking/parse/test_data/groups.html",
	)
	const groups = parse_items(html)
	assertObjectMatch(groups, expected)
})
