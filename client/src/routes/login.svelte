<script lang="ts">
    import { error, route, session } from "../state"
	import { serialize_cookie } from "../_lib/cookie";

	let username: string = ""
	let password: string = ""
	let disabled = false

	async function login() {
        disabled = true

		try {
			const res = await fetch("api/login", {
				method: "POST",
				body: JSON.stringify({
					username: username,
					password: password
				})
			})

			if (res.ok) {
				const data = await res.json()
				document.cookie = serialize_cookie("SESSION", data.session, { same_site: "strict", path: "/", secure: true })
				session.set(data.session)
				route.set("tickets")
			} else if (res.status < 500) {
				const text = await res.text()
				error.set(text)
				password = ""
				disabled = false
			} else {
				error.set("Unknown server error")
				password = ""
				disabled = false
			}
		} catch {
			console.error(error)
			error.set("Unknown application error")
			disabled = false
		}
	}
</script>

<style>
	main {
		position: relative;
		margin: 16vh auto 0 auto;
		width: 245px;
	}
	h1 {
		text-align: center;
		margin-bottom: 55px;
	}
	form {
        margin-bottom: 10px;    
    }
    .error {
        color: var(--red-1);
        font-size: 0.9rem;
    }
	div {
		margin-top: 15px;	
	}
</style>

<main>
	<h1>Caius Choir<br>Mealbooking</h1>
	<form on:submit|preventDefault={login}>
		<label for="username">Username</label>
		<input bind:value={username} name="username" type="text">
		<label for="username">Password</label>
		<input bind:value={password} name="username" type="password">
		<div>
			<button {disabled} type="submit" class="blue">Submit</button>
		</div>
	</form>
	{#if $error}<p class="error">{$error}</p>{/if}
</main>