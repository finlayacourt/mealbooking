export interface TicketData {
	name: string
	date: number
	/** Booking opening date (in milliseconds) */
	opens: number | null
	/** Is the booking booked? */
	booked: boolean
	/** Is the booking open now? */
	bookable: boolean
	/** Will the booking by open in the future? */
	queueable: boolean
}

export interface Ticket extends TicketData {
	/**
		Querystring (including leading ?)
		@example "?event=1389&date=2022-05-05"
	*/
	query: string
}
