<script>
	import './styles.css';

	export const ssr = false;
	export const prerender = true;

</script>

<nav>
	<h1>Monthlies Simplified</h1>
	
</nav>
<main>
	<slot />
</main>


<style>
	h1 {
		margin: 3px 2px;
		float: left;
		font-size: 22px;
	}

	nav, main {
		position: fixed;
		left: 0px;
		right: 0px;
	}

	nav {
		top: 0px;
		height: 40px;
		background-color: #333;
		color: #fff;
		padding: 5px;
	}

	main {
		bottom: 0px;
		height: calc( 100vh - 40px );
		overflow: auto;
	}
</style>
