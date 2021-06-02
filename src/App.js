/* global window */
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';

const MAPBOX_ACCESS_TOKEN = '';

// Source data CSV
const DATA_URL = {
    BUILDINGS: '',
    // 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
    TRIPS: './file3.json' // eslint-disable-line
        // TRIPS: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json' // eslint-disable-line
};

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0
});

const pointLight = new PointLight({
    color: [255, 255, 255],
    intensity: 2.0,
    position: [114, 22.6, 8000]
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
    buildingColor: [74, 80, 87],
    trailColor0: [253, 128, 93],
    trailColor1: [23, 184, 190],
    material,
    effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
    longitude: 114,
    latitude: 22.6,
    zoom: 13,
    pitch: 45,
    bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const landCover = [
    [
        [114.0, 22.6],
        [114.02, 22.6],
        [114.02, 22.62],
        [114.0, 22.62]
    ]
];

export default function App({
    buildings = DATA_URL.BUILDINGS,
    trips = DATA_URL.TRIPS,
    trailLength = 180,
    initialViewState = INITIAL_VIEW_STATE,
    mapStyle = MAP_STYLE,
    theme = DEFAULT_THEME,
    loopLength = 1800, // unit corresponds to the timestamp in source data
    animationSpeed = 1,
}) {
    const [time, setTime] = useState(0);
    const [animation] = useState({});

    const animate = () => {
        setTime(t => (t + animationSpeed) % loopLength);
        animation.id = window.requestAnimationFrame(animate);
    };

    useEffect(
        () => {
            animation.id = window.requestAnimationFrame(animate);
            return () => window.cancelAnimationFrame(animation.id);
        }, [animation]
    );

    const layers = [
        // This is only needed when using shadow effects
        new PolygonLayer({
            id: 'ground',
            data: landCover,
            getPolygon: f => f,
            stroked: false,
            getFillColor: [0, 0, 0, 0]
        }),
        new TripsLayer({
            id: 'trips',
            data: trips,
            getPath: d => d.coordinates,
            getTimestamps: d => d.timestamp,
            getColor: d => d.color,
            // getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
            opacity: 0.3,
            widthMinPixels: 2,
            rounded: true,
            trailLength,
            currentTime: time,

            shadowEnabled: false
        }),
        new PolygonLayer({
            id: 'buildings',
            data: buildings,
            extruded: true,
            wireframe: false,
            opacity: 0.5,
            getPolygon: f => f.polygon,
            getElevation: f => f.height,
            getFillColor: theme.buildingColor,
            material: theme.material
        })
    ];

    return ( < DeckGL layers = { layers }
        effects = { theme.effects }
        initialViewState = { initialViewState }
        controller = { true } >
        <
        StaticMap reuseMaps mapStyle = { mapStyle }
        preventStyleDiffing = { true }
        mapboxApiAccessToken = { MAPBOX_ACCESS_TOKEN }
        /> </DeckGL >
    );
}

export function renderToDOM(container) {
    render( < App / > , container);
}
