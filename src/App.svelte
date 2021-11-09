<script>
	
	import DesignSystemApp from "./routes/DesignSystemApp.svelte";
	import CensusAtlas from "./routes/CensusAtlas.svelte";
	import { Router, Link, Route } from "svelte-routing";

	export let url = "";

</script>

<Router url="{url}">
	<div>
	  <Route path="design-system" component="{DesignSystemApp}" />
	  <Route path="/"><CensusAtlas /></Route>
	</div>
  </Router>
