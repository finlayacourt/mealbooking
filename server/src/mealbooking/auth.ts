import { parse_cookie, serialize_cookie } from "../_lib/cookie/cookie.ts"
import { logger } from "../_lib/logger/logger.ts"
import { PermissionDenied } from "../errors.ts"
import { MBS_COOKIE_NAME, MBS_COOKIE_VALUE, MBS_URL, RAVEN_COOKIE_NAME, RAVEN_URL } from "./consts.ts"

export async function auth(raw_username: string, password: string) {
	const params = new URLSearchParams({
		url: MBS_URL,
		userid: raw_username,
		pwd: password,
		ver: "3",
	})
	const body = params.toString()

	const raven = await fetch(RAVEN_URL, {
		redirect: "manual",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	})

	await raven.arrayBuffer()

	const mealbooking_location = raven.headers.get("location")
	if (mealbooking_location === null) {
		throw new PermissionDenied("Incorrect username or password")
	}

	const raven_cookie = raven.headers.get("set-cookie")!
	const raven_token = parse_cookie(raven_cookie)[RAVEN_COOKIE_NAME]
	const username = decodeURIComponent(raven_token).split("!", 2)[1]

	const mealbooking = await fetch(mealbooking_location, {
		redirect: "manual",
		method: "GET",
		headers: {
			cookie: serialize_cookie(MBS_COOKIE_NAME, MBS_COOKIE_VALUE),
		},
	})

	await mealbooking.arrayBuffer()

	const cookie = mealbooking.headers.get("set-cookie")
	if (cookie === null) {
		logger.warn(
			`PermissionDenied: registered with Raven but not Caius (username: ${username})`,
		)
		throw new PermissionDenied("User not registered with Caius")
	}

	const token = parse_cookie(cookie)[MBS_COOKIE_NAME]

	return { username, token }
}
