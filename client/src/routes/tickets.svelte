<script lang="ts">
	import Item from "../components/Item.svelte"
	import Popup from "../components/Popup.svelte"

    import { route, error, tickets, session } from "../state"
	import { serialize_cookie } from "../_lib/cookie";

	error.set(undefined)

	fetch("api/tickets", {
		headers: {
			"X-Api-Key": $session!
		}
	})
	.then(async res => {
		if (res.ok) {
			const data = await res.json()
			tickets.set(data.tickets)
		} else if (res.status === 401) {
            const text = await res.text()
            document.cookie = serialize_cookie("SESSION", "", { expires: new Date(0), path: "/", same_site: "strict", secure: true })
            error.set(text)
            route.set("login")
		} else if (res.status < 500) {
			const text = await res.text()
			error.set(text)
			route.set("error")
		} else {
			error.set("Unknown server error")
			route.set("error")
		}
	})
	.catch(error => {
		console.error(error)
		error.set("Unknown application error")
		route.set("error")
	})

	function logout() {
		document.cookie = serialize_cookie("SESSION", "", { expires: new Date(0), path: "/", same_site: "strict", secure: true })
		session.set(undefined)
		route.set("login")
	}
</script>

<style>
	header {
		position: fixed;
		top: 0;
		width: 100%;
		height: 40px;
		border-bottom: 1px solid #000;
		background-color: #FFF;
	}

	main, .wrapper {
		max-width: 640px;
		padding: 0 10px;
		margin: 0 auto 0 auto;	
	}

	.wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100%;
	}

	.logout {
		padding-left: 10px;
		text-decoration: underline;
		cursor: pointer;
		color: #7A7A7A;
		transition: color 0.2s ease;
	}

	.logout:hover {
		color: #3a3a3a;
	}

	main {
		margin-top: 50px;
		margin-bottom: 100px;
	}
</style>

<header>
	<div class="wrapper">
		<h2>Choir Mealbooking</h2>
		<div class="logout" on:click|preventDefault={logout}>Logout</div>
	</div>
</header>

<Popup />
<main>
	{#if $tickets === undefined}
		Loading events...
	{:else} 
		{#each $tickets as ticket}
			<Item {ticket} />
		{/each}
	{/if}
</main>