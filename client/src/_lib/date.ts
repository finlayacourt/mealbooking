const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function to_day(date: number) {
	return days[new Date(date).getDay()]
}

export function to_date(date: number) {
	const d = new Date(date)
	const dd = d.getDate().toString().padStart(2, "0")
	const mm = (d.getMonth() + 1).toString().padStart(2, "0")
	const yy = d.getFullYear().toString().substring(2)
	return `${dd}/${mm}/${yy}`
}
