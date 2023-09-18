/* import */
/* ======================================== */
/* Hooks */
import { useEffect, useState } from "react"
/* mapbox */
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

/* ======================================== */
mapboxgl.accessToken = "pk.eyJ1IjoicGVuaXNhbjM4NSIsImEiOiJjbGtxaDd6a3MxM2FqM2Rwcm5pNGNjaXowIn0.1QaQ6qLmk3RUtaV5ljzE5w"
const startCenter = [121.54098893948492, 25.013384895146856]

export default function MapBox({ setGeoCoord, nodes }) {
    const [map, setMap] = useState(null)
    const [mark, setMark] = useState(null)
    const [points, setPoints] = useState([])

    useEffect(() => {
        const map = new mapboxgl
            .Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: startCenter,
                zoom: 18,
                attributionControl: false,
            })
            .addControl(new mapboxgl.NavigationControl(), 'top-left')
            .on("click", (e) => {
                const location = [e.lngLat.lng, e.lngLat.lat]
                map.flyTo({ center: location, zoom: (map.getZoom() <= 10)? 14: map.getZoom() })
                setMark(mark => {
                    if (mark) mark.remove()
                    return new mapboxgl.Marker().setLngLat(location).addTo(map)
                })
                setGeoCoord(location)
            })
        map
            .setBearing(137)
            .flyTo({ center: startCenter, zoom: (map.getZoom() <= 10)? 14: map.getZoom() })
        setMap(map)
        return () => {
            map.remove()
        }
    }, [setGeoCoord])
    useEffect(() => {
        if (!map) return
        const array = Object.keys(nodes)
            .map(id => {
                const location = nodes[id].geo_coord
                const div = document.createElement('div')
                div.className = "pool_ball"
                div.innerText = id
                return new mapboxgl.Marker(div)
                    .setLngLat(location).addTo(map)
            })
        setPoints(prev => {
            prev.forEach(mark => mark.remove())
            return array
        })
    }, [map, nodes])
    useEffect(() => {
    }, [mark, points])

    /* ==================== 分隔線 ==================== */
    return <>
        <div id="map" className="map"></div>
    </>
}
