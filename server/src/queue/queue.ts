import { database } from "../../main.ts"
import { logger } from "../_lib/logger/logger.ts"
import { clear_timeout, set_timeout } from "../_lib/timeout/timeout.ts"
import { auth } from "../mealbooking/auth.ts"
import { book_ticket } from "../mealbooking/book.ts"
import { get_ticket } from "../mealbooking/ticket.ts"

let current_username: string | undefined = undefined
let current_query: string | undefined = undefined
let current_timeout: number | undefined = undefined

async function login_queue(
	username: string,
	password: string,
	query: string,
	body: string,
	opens: number,
) {
	database.query(
		"UPDATE queued SET state = 1 WHERE username = ? AND query = ?",
		[username, query],
	)
	try {
		const { token } = await auth(username, password)
		setTimeout(
			() => book_queue(username, query, body, token),
			opens - Date.now(),
		)
		run_queue()
	} catch {
		logger.error(`queued login failed (username: ${username})`)
		database.query(
			"UPDATE queued SET state = 2 WHERE username = ? AND query = ?",
			[username, query],
		)
	}
}

async function book_queue(
	username: string,
	query: string,
	body: string,
	token: string,
) {
	logger.info(`booked queued ticket (query: ${query}, username: ${username})`)
	try {
		await book_ticket(query, body, token)
		database.query(
			`DELETE FROM queued WHERE username = ? AND query = ?`,
			[username, query],
		)
	} catch {
		logger.error(
			`queued booking failed (query: ${query}, username: ${username})`,
		)
		database.query(
			"UPDATE queued SET state = 2 WHERE username = ? AND query = ?",
			[username, query],
		)
	}
}

export function run_queue() {
	const result = database.query<[string, string, string, string, number]>(`
        SELECT
            queued.username, password, query, body, MIN(opens)
        FROM
            queued
        INNER JOIN
            users
        ON users.username = queued.username
        WHERE
            state IS 0
    `)

	if (result[0][0] === null) {
		if (current_timeout !== undefined) {
			clear_timeout(current_timeout)
			current_timeout = undefined
			current_username = undefined
			current_query = undefined
		}
	} else {
		const [username, password, query, body, opens] = result[0]

		if (username !== current_username || query !== current_query) {
			if (current_timeout !== undefined) {
				clear_timeout(current_timeout)
			}
			current_username = username
			current_query = query

			const next = opens - Date.now() - 60 * 1000
			current_timeout = set_timeout(
				() => login_queue(username, password, query, body, opens),
				next,
			)
			logger.info(`next queued ticket at ${(new Date(opens).toISOString())}`)
		}
	}
}

async function update_queues() {
	const result = database.query<[string, string, string, number]>(
		`SELECT
            queued.username, password, query, opens
        FROM
            queued
        INNER JOIN
            users
        ON users.username = queued.username
        WHERE
            opens > ? AND state IS 0
		GROUP BY query`,
		[Date.now() + 24 * 60 * 60 * 1000],
	)

	logger.info(`updating ${result.length} queued tickets`)

	await Promise.all(
		result
			.map(async ([username, password, query, opens]) => {
				try {
					const { token } = await auth(username, password)
					const ticket = await get_ticket(query, token)
					if (ticket.opens !== opens) {
						database.query(
							"UPDATE queued SET opens = ? WHERE username = ? AND query = ?",
							[ticket.opens, username, query],
						)
					}
				} catch {
					logger.error(`failed to update queued ticket (query: ${query})`)
				}
			}),
	)

	run_queue()
}

export function start_queue() {
	database.query<[string, string, string, string, number]>(`
        UPDATE queued SET state = 0 WHERE state = 1
    `)
	run_queue()

	update_queues()
	setInterval(() => update_queues(), 2 * 24 * 60 * 60 * 1000)
}
