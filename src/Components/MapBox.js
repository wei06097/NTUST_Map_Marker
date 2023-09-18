/* import */
/* ======================================== */
/* Hooks */
import { useEffect, useState } from "react"
/* mapbox */
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

/* ======================================== */
mapboxgl.accessToken = "pk.eyJ1IjoicGVuaXNhbjM4NSIsImEiOiJjbGtxaDd6a3MxM2FqM2Rwcm5pNGNjaXowIn0.1QaQ6qLmk3RUtaV5ljzE5w"
const startCenter = [121.54052153484844, 25.01378719649183]

export default function MapBox({ setGeoCoord }) {
    const [mark, setMark] = useState(null)
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
                // console.log(location)
            })
        map.flyTo({ center: startCenter, zoom: (map.getZoom() <= 10)? 14: map.getZoom() })
        return () => {
            map.remove()
        }
    }, [setGeoCoord])
    useEffect(() => {
    }, [mark])
    
    /* ==================== 分隔線 ==================== */
    return <>
        <div id="map" className="map"></div>
    </>
}
