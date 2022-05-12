import { parse } from "https://esm.sh/node-html-parser@5.3.3"

export interface ItemData {
	query: string
	type: "group" | "ticket"
}

export function parse_items(html: string) {
	const document = parse(html)
	const items: ItemData[] = []

	for (const table of document.querySelectorAll("table")) {
		if (table.previousElementSibling.innerHTML === "Bookable events") {
			for (const a of table.querySelectorAll("a")) {
				if (a.hasAttribute("href")) {
					const query = a.getAttribute("href")!
					const type = (new URLSearchParams(query)).has("date")
						? "ticket"
						: "group"
					items.push({ query, type })
				}
			}
		}
	}

	return items
}
