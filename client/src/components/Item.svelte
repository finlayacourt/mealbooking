<script lang="ts">
    import type { Ticket } from "../state"
    import { current_ticket } from "../state";
    import { to_date, to_day } from "../_lib/date"

    export let ticket: Ticket

    let closed = !ticket.booked && !ticket.queued && !ticket.bookable && !ticket.queueable
</script>

<style>
    div {
        border: 1px solid var(--grey-1);
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.08);
        border-radius: 3px;
        min-height: 45px;
        padding: 10px 0;
        margin-bottom: 8px;

		display: flex;
		align-items: center;

        cursor: pointer;
        transition: border-color 0.2s;
    }

    div:not(.closed):hover {
        border-color: #000;
    }

	.icon {
		width: 19px;
        margin-left: 15px;
        margin-right: 15px;
	}
	svg {
		display: block;
		stroke-width: 0.8;
	}
	.day {
        text-align: right;
		width: 30px;
		margin-right: 12px;
	}
	.date {
		width: 65px;
		margin-right: 12px;
	}
	.name {
		flex: 1;
		margin-right: 12px;
	}

    .booked {
        background-color: var(--green-3);
    }
    .queued {
        background-color: var(--orange-2);
    }
    .closed {
        background-color: var(--grey-2);
        color: var(--grey-1);
        cursor: default;
    }
    .closed .name {
        text-decoration: line-through;
    }

    circle {
        fill: var(--green-1);
        stroke: #000;
    }

    .tick {
        fill: none;
        stroke: #000;
    }

    .glass {
        fill: none;
        stroke: #000;
    }

    .sand {
        fill: var(--orange-1);
        stroke: #000;
    }
</style>

<div
    class:booked={ticket.booked}
    class:queued={ticket.queued}
    class:closed
    on:click={() => !closed && current_ticket.set(ticket)}
>
    <span class="icon">
    {#if ticket.booked}
		<svg viewBox="0 0 16 16">
			<circle cx="8" cy="8" r="7" />
			<path class="tick" d="M4 8L7 11L12 5" />		
		</svg>
    {:else if ticket.queued}
		<svg viewBox="0 0 16 16">
			<path class="glass" d="M 4 14 L 12 14 L 4 2 L 12 2 L 4 14" />	
            <path class="sand" d="M 4 14 L 6.1 11 L 9.9 11 L 12 14 L 4 14" />	
		</svg>
    {/if}
    </span>
	<span class="day">{to_day(ticket.date)}</span>
	<span class="date">{to_date(ticket.date)}</span>
	<span class="name">{ticket.name}</span>
</div>