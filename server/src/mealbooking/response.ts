import { logger } from "../_lib/logger/logger.ts"
import { NotConnected, PermissionDenied } from "../errors.ts"

export async function parse_response(res: Response) {
	if (res.ok) {
		const text = await res.text()
		return text
	} else if (res.status === 303) {
		throw new PermissionDenied("Session token expired")
	} else {
		logger.warn(
			`NotConnected: failed to connect to mealbooking server (${res.status} ${res.statusText})`,
		)
		throw new NotConnected("Failed to connect to mealbooking server")
	}
}
