export function parse_cookie(input: string) {
	const output: Record<string, string> = {}
	const pairs = input.split(";")

	for (const pair of pairs) {
		const index = pair.indexOf("=")
		if (index < 0) continue
		const key = pair.substring(0, index).trim()
		let val = pair.substring(index + 1, pair.length).trim()
		if (val[0] === "\"") val = val.slice(1, -1)
		if (output[key] === undefined) output[key] = decodeURIComponent(val)
	}

	return output
}

export interface CookieSerializeOptions {
	expires?: Date
	path?: string
	same_site?: "lax" | "strict" | "none"
	secure?: boolean
}

export function serialize_cookie(
	name: string,
	value: string,
	options: CookieSerializeOptions = {},
) {
	const encoded = encodeURIComponent(value)
	let output = name + "=" + encoded

	if (options.path) output += `; Path=${options.path}`
	if (options.expires) output += `; Expires=${options.expires.toUTCString()}`
	if (options.secure) output += "; Secure"
	if (options.same_site) {
		switch (options.same_site) {
			case "strict":
				output += "; SameSite=Strict"
				break
			case "none":
				output += "; SameSite=None"
				break
			default:
				output += "; SameSite=Lax"
		}
	}

	return output
}
