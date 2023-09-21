import style from "./Navigation.module.css"
import remote from "../function/remote"
import canvas from "../function/canvas"
import { useEffect, useRef, useState } from "react"
import NTUST_MAP from "../assets/NTUST_MAP.png"

/* ======================================== */
function Navigation() {
    const mapCanvasRef = useRef()
    const routeCanvasRef = useRef()
    const sourceCanvasRef = useRef()
    const destinationCanvasRef = useRef()
    const [nodes, setNodes] = useState({})
    const [inited, setInited] = useState(false)
    const [myCoord, setMyCoord] = useState([4154, 3744])
    const [desCoord, setDesCoord] = useState([4154, 3744])
    const [route, setRoute] = useState([])
    
    useEffect(() => {
        remote.getNodes().then(nodes => setNodes(nodes))
        document.title = "導航模擬"
        const mapCtx = mapCanvasRef.current.getContext('2d')
        const image = new Image()
        image.src = NTUST_MAP
        image.onload = function() {
            [mapCanvasRef, routeCanvasRef, sourceCanvasRef, destinationCanvasRef]
                .forEach(canvasRef => {
                    const canvas = canvasRef.current
                    canvas.width = image.width
                    canvas.height = image.height
                })
            mapCtx.drawImage(image, 0, 0)
            setInited(true)
        }
    }, [])

    useEffect(() => {
        const keysPressed = {}
        function handleKeyDown(e) {
            keysPressed[e.key] = true
            handleMovement()
        }
        function handleKeyUp(e) {
            delete keysPressed[e.key]
        }
        function handleMovement() {
            const step = 20
            let [left, top] = [0, 0]
            if (keysPressed["w"]) top -= step
            if (keysPressed["s"]) top += step
            if (keysPressed["a"]) left -= step
            if (keysPressed["d"]) left += step
            setMyCoord(prev => [prev[0]+left, prev[1]+top])
        }
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])
    useEffect(() => {
        if (!inited) return
        const sourceCanvas = sourceCanvasRef.current
        const destinationCanvas = destinationCanvasRef.current 
        canvas.clearCanvas(sourceCanvas)
        canvas.drawDot(sourceCanvas, myCoord, 40, "black")
        canvas.clearCanvas(destinationCanvas)
        canvas.drawDot(destinationCanvas, desCoord, 40, "red")
        remote.findPath({source: myCoord, destination: desCoord})
            .then(path => setRoute(path))
    }, [inited, myCoord, desCoord])
    useEffect(() => {
        if (!inited || !route[0]) return
        const routeCanvas = routeCanvasRef.current
        canvas.clearCanvas(routeCanvas)
        route.forEach((id, index) => {
            const pointA = nodes[id].img_coord
            canvas.drawDot(routeCanvas, pointA, 15)
            if (index+1 !== route.length) {
                const pointB = nodes[route[index+1]].img_coord
                canvas.drawLine(routeCanvas, pointA, pointB, 30)
            }
        })
    }, [inited, nodes, route])
    
    /* ======================================== */
    function mapClickHandler(e) {
        const image = e.target
        const destinationCanvas = destinationCanvasRef.current
        const clickX = e.clientX - image.getBoundingClientRect().left
        const clickY = e.clientY - image.getBoundingClientRect().top
        const img_coord = canvas.htmlSize_To_realSize(destinationCanvas, [clickX, clickY])
        setDesCoord(img_coord)
    }
    
    /* ======================================== */
    return <>
        <div className={style.map_container}>
            <canvas ref={mapCanvasRef} className={style.ntust_map} />
            <canvas ref={routeCanvasRef} className={style.ntust_map} />
            <canvas ref={sourceCanvasRef} className={style.ntust_map} />
            <canvas ref={destinationCanvasRef} className={style.ntust_map}
                onClick={mapClickHandler}
            />
        </div>
    </>
}

export default Navigation
