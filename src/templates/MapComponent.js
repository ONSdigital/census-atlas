

onMount(() => {
    link.onload = map.create
    document.head.appendChild(link);

    // return () => {
    //     get(map).remove();
    //     link.parentNode.removeChild(link);
    // };
});

</script>
<script context="module">

// PARAMS
        const mapstyle = "https://bothness.github.io/ons-basemaps/data/style-omt.json";
        let minzoom = 4;
        let maxzoom = 14;

        //IMPORTS
        import {onMount} from 'svelte';//setContext
        import {Map, NavigationControl} from 'mapbox-gl';
        import {writable, get} from 'svelte/store';

        // WRITABLE CONSTANTS
        export const latlon = writable(undefined);
        export const bounds = writable(undefined);
        export let zoom;

        export const map = Cartify();
        let container;
        let options;



        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/mapbox-gl/dist/mapbox-gl.css';


// setContext('map', {
            // 	getMap: () => map
            // });

            // UPDATES
            // move map on bbox change
            bounds.subscribe((b) => { if (get(map)) get(map).fitBounds(b, { padding: 20 }); })




function Cartify() {
    // function to create map
	const {subscribe, set, update} = writable(null);

        return {
            subscribe,
            create: function () {


            let dmap = new Map({
            container,
            style: mapstyle,//mapbox://styles/mapbox/streets-v11',
        minZoom: minzoom,
        maxZoom: maxzoom,
        //     accessToken:
        // "pk.eyJ1IjoiZW1hbWQtai1hcm1hbmQiLCJhIjoiY2p0aTBwY3drMGt0ajQ0cGYyMWozZTUyMCJ9.VcYxgVc6cJMaYNC3w-KUyA",
        ...options
            });

        dmap.addControl(new NavigationControl(),'bottom-right');

            // Get initial zoom level
            dmap.on('load', () => {
            zoom = dmap.getZoom();
            })

            // Update zoom level when the view zooms
            dmap.on('zoom', () => {
            zoom = dmap.getZoom();
            });

        set(dmap)
        bounds.set([-5.737, 49.882,2.166, 56.014]) // minx miny maxx maxy : default bbox England/Wales

        console.warn('wwww',dmap)
        }
		// reset: () => { }
	
}
}









