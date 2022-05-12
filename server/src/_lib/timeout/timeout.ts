const TIMEOUT_MAX = 2147483647

const timeouts: (number | undefined)[] = []

export function set_timeout(
	listener: () => void,
	after: number,
	id = timeouts.length,
	max = TIMEOUT_MAX,
) {
	if (after <= max) {
		timeouts[id] = setTimeout(listener, after)
	} else {
		timeouts[id] = setTimeout(() => {
			set_timeout(listener, after -= max, id)
		}, max)
	}
	return id
}

export function clear_timeout(id: number) {
	clearTimeout(timeouts[id])
	timeouts[id] = undefined
}
