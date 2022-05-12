<script>
    import { error } from "../state"
</script>

<style>
    div {
        position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
        color: var(--red-1);
        text-align: center;
    }
    h3 {
        margin-bottom: 5px;
    }
</style>

<div>
    <h3>Something’s gone wrong!</h3>
    <p>{$error}</p>
</div>