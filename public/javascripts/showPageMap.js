// cannot use ejs in javascript file --> created a variable in script before this script is run in show.ejs
// reference it when calling this script 

// const campground = require("../../models/campground");

// mapboxgl.accessToken = "<%= process.env.MAPBOX_TOKEN %>";
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // there are many styles to the map
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    // set Popup - when user clicks on the marker, HTML will popup
    .setPopup(
        new mapboxgl.Popup({ offseet: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)