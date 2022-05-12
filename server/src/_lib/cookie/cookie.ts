/**
 * Parse an HTTP Cookie header string and returning an object of all cookie
 * name-value pairs.
 *
 * @param input the string representing a `Cookie` header value
 */
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
	/**
	 * Specifies the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.3|Domain Set-Cookie attribute}. By default, no
	 * domain is set, and most clients will consider the cookie to apply to only
	 * the current domain.
	 */
	domain?: string

	/**
	 * Specifies the `Date` object to be the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.1|`Expires` `Set-Cookie` attribute}. By default,
	 * no expiration is set, and most clients will consider this a "non-persistent cookie" and will delete
	 * it on a condition like exiting a web browser application.
	 *
	 * *Note* the {@link https://tools.ietf.org/html/rfc6265#section-5.3|cookie storage model specification}
	 * states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but it is
	 * possible not all clients by obey this, so if both are set, they should
	 * point to the same date and time.
	 */
	expires?: Date
	/**
	 * Specifies the boolean value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.6|`HttpOnly` `Set-Cookie` attribute}.
	 * When truthy, the `HttpOnly` attribute is set, otherwise it is not. By
	 * default, the `HttpOnly` attribute is not set.
	 *
	 * *Note* be careful when setting this to true, as compliant clients will
	 * not allow client-side JavaScript to see the cookie in `document.cookie`.
	 */
	http_only?: boolean
	/**
	 * Specifies the number (in seconds) to be the value for the `Max-Age`
	 * `Set-Cookie` attribute. The given number will be converted to an integer
	 * by rounding down. By default, no maximum age is set.
	 *
	 * *Note* the {@link https://tools.ietf.org/html/rfc6265#section-5.3|cookie storage model specification}
	 * states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but it is
	 * possible not all clients by obey this, so if both are set, they should
	 * point to the same date and time.
	 */
	max_age?: number
	/**
	 * Specifies the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.4|`Path` `Set-Cookie` attribute}.
	 * By default, the path is considered the "default path".
	 */
	path?: string
	/**
	 * Specifies the boolean or string to be the value for the {@link https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7|`SameSite` `Set-Cookie` attribute}.
	 *
	 * - `"lax"` will set the `SameSite` attribute to Lax for lax same site
	 * enforcement.
	 * - `"strict"` will set the `SameSite` attribute to Strict for strict same
	 * site enforcement.
	 *  - `"none"` will set the SameSite attribute to None for an explicit
	 *  cross-site cookie.
	 *
	 * More information about the different enforcement levels can be found in {@link https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7|the specification}.
	 *
	 * *note* This is an attribute that has not yet been fully standardized, and may change in the future. This also means many clients may ignore this attribute until they understand it.
	 */
	same_site?: "lax" | "strict" | "none"
	/**
	 * Specifies the boolean value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.5|`Secure` `Set-Cookie` attribute}. When truthy, the
	 * `Secure` attribute is set, otherwise it is not. By default, the `Secure` attribute is not set.
	 *
	 * *Note* be careful when setting this to `true`, as compliant clients will
	 * not send the cookie back to the server in the future if the browser does
	 * not have an HTTPS connection.
	 */
	secure?: boolean
}

/**
 * Serialize a cookie name-value pair into a `Set-Cookie` header string.
 *
 * @param name the name for the cookie
 * @param value value to set the cookie to
 * @param [options] object containing serialization options
 */
export function serialize_cookie(
	name: string,
	value: string,
	options: CookieSerializeOptions = {},
) {
	const encoded = encodeURIComponent(value)
	let output = name + "=" + encoded

	if (options.max_age) output += `; Max-Age=${options.max_age}`
	if (options.domain) output += `; Domain=${options.domain}`
	if (options.path) output += `; Path=${options.path}`
	if (options.expires) output += `; Expires=${options.expires.toUTCString()}`
	if (options.http_only) output += "; HttpOnly"
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
