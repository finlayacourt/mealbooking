<script lang="ts">
    import { current_ticket, tickets, session, error, route } from "../state"
    import { serialize_cookie } from "../_lib/cookie";

    let disabled = false

    function form_data(target: HTMLFormElement) {
        const guests       = target.querySelector<HTMLInputElement>("[name=guests]")!.value
        const guests_names = target.querySelector<HTMLInputElement>("[name=guests_names]")!.value
        const vegetarians  = target.querySelector<HTMLInputElement>("[name=vegetarians]")!.value
        const requirements = target.querySelector<HTMLInputElement>("[name=requirements]")!.value
        return new URLSearchParams({ guests, guests_names, vegetarians, requirements }).toString()
    }

    async function request(url: string, method: string, body: Record<string, string>) {
        disabled = true
        const res = await fetch(url, {
            method,
            headers: { "X-Api-Key": $session! }, 
            body: JSON.stringify(body)
        })
        if (res.ok) {
            const data = await res.json()
            tickets.update($tickets => {
                const i = $tickets!.findIndex(ticket => ticket.query === $current_ticket!.query)
                $tickets![i] = data.ticket
                return $tickets
            })
            close()
        } else if (res.status === 401) {
            const text = await res.text()
            document.cookie = serialize_cookie("SESSION", "", { expires: new Date(0), path: "/", same_site: "strict", secure: true })
            error.set(text)
            route.set("login")
        } else if (res.status < 400) {
            const text = await res.text()
            error.set(text)
        } else {
            error.set("Unknown server error")
        }
    }

    function close() {
        disabled = false
        error.set(undefined)
        current_ticket.set(undefined)
    }
</script>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.2);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    aside {
		position: fixed;
		width: 90%;
		max-width: 500px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
        overflow: hidden;

        background-color: #FFF;
        border: 1px solid #000000;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
        border-radius: 3px;
        padding: 15px;
    }
    .error {
        position: absolute;
		top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        color: var(--red-1);
        background-color: #FFF;

        text-align: center;

        display: flex;
        align-items: center;
        justify-content: center;
    }
    .submit {
        margin-top: 15px;
        display: flex;
        gap: 10px;
    }
    h2 {
        margin-bottom: 15px;
    }
    h3 {
        margin-bottom: 5px;    
    }
</style>

{#if $current_ticket}
<div class="overlay" on:click={close} />
<aside>
{#if $error}
<div class="error">
    <div>
        <h3>Something’s gone wrong!</h3>
        <p>{$error}</p>
    </div>
</div>
{/if}
{#if $current_ticket.booked}
    <h2>Are you sure you want to delete this booking?</h2>
    <form on:submit|preventDefault={() => request("api/unbook", "DELETE", { query: $current_ticket.query })}>
        <div class="submit">
            <button {disabled} type="button" on:click={close}>Cancel</button>
            <button {disabled} class="red" type="submit">Delete</button>
        </div>
    </form>
{:else if $current_ticket.queued}
    <h2>Are you sure you want to delete this booking?</h2>
    <form on:submit|preventDefault={() => request("api/unqueue", "DELETE", { query: $current_ticket.query })}>
        <div class="submit">
            <button {disabled} type="button" on:click={close}>Cancel</button>
            <button {disabled} class="red" type="submit">Delete</button>
        </div>
    </form>
{:else if $current_ticket.bookable}
    <h2>Complete the booking form.</h2>
    <form on:submit|preventDefault={(e) => request("api/book", "PUT", { query: $current_ticket.query, body: form_data(e.target) })}>
        <label for="guests">Guests No.</label>	
        <input type="text" name="guests">
        <label for="guests_names">Guests</label>
        <input type="text" name="guests_names">
        <label for="guests">Vegetarians</label>
        <input type="text" name="vegetarians">
        <label for="guests">Requirements</label>
        <textarea name="requirements" rows="4"></textarea>
        <div class="submit">
            <button {disabled} type="button" on:click={close}>Cancel</button>
            <button {disabled} class="blue" type="submit">Book</button>
        </div>
    </form>
{:else}
    <h2>Complete the booking form.</h2>
    <form on:submit|preventDefault={(e) => request("api/queue", "PUT", { query: $current_ticket.query, body: form_data(e.target) })}>
        <label for="guests">Guests No.</label>	
        <input type="text" name="guests">
        <label for="guests_names">Guests</label>
        <input type="text" name="guests_names">
        <label for="guests">Vegetarians</label>
        <input type="text" name="vegetarians">
        <label for="guests">Requirements</label>
        <textarea name="requirements" rows="4"></textarea>
        <div class="submit">
            <button {disabled} type="button" on:click={close}>Cancel</button>
            <button {disabled} class="blue" type="submit">Queue</button>
        </div>
    </form>
{/if}
</aside>
{/if}