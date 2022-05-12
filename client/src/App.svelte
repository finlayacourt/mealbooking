<script lang="ts">
	import "../src/app.css"

	import route_login from "./routes/login.svelte"
	import route_tickets from "./routes/tickets.svelte"
	import route_error from "./routes/error.svelte"

	import { route } from "./state"

	const routes = {
		login: route_login,
		tickets: route_tickets,
		error: route_error
	}
</script>

<svelte:component this={routes[$route]} />