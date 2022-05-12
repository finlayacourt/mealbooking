export const logger = {
	info(...message: any[]) {
		console.info(`[*] [${(new Date()).toISOString()}]`, ...message)
	},
	warn(...message: any[]) {
		console.warn(`[!] [${(new Date()).toISOString()}]`, ...message)
	},
	error(...message: any[]) {
		console.error(`[x] [${(new Date()).toISOString()}]`, ...message)
	},
}
