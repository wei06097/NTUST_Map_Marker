import React, { useEffect, useRef, useState } from "react"
import { ReactComponent as DotIcon } from "../assets/dot.svg"
import { ReactComponent as GeoIcon } from "../assets/geo.svg"
import NTUST_MAP from "../assets/NTUST_MAP.png"

/* ======================================== */
function realSize_To_htmlSize(canvas, [originX, originY]) {
    // const [originWidth, originHeight] = [4292, 2475]
    const imageX = (canvas.offsetWidth / canvas.width) * originX
    const imageY = (canvas.offsetHeight / canvas.height) * originY
    return [Math.round(imageX), Math.round(imageY)]
}
function htmlSize_To_realSize(canvas, [imageX, imageY]) {
    const originX = (canvas.width / canvas.offsetWidth) * imageX 
    const originY = (canvas.height / canvas.offsetHeight) * imageY
    return [Math.round(originX), Math.round(originY)]
}
function drawLine(canvas, [startX, startY], [endX, endY], lineWidth=20, color="blue") {
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.closePath()
}
/*
    function drawDot(canvas, [x, y], radius=20, color="blue") {
        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2*Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.closePath()
    }
*/
/*
    function clearCanvas(canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
*/

/* ======================================== */
function NtustMap({ setImgCoord, nodes, setNodes }) {
    const geoIconRef = useRef()
    const mapCanvasRef = useRef()
    const routeCanvasRef = useRef()
    const [inited, setInited] = useState(false)
    const [showing, setShowing] = useState(false)
    const [nodeInfo, setNodeInfo] = useState({id: "", neighbors: ""})

    useEffect(() => {
        document.title = "檢查所有點"
        const mapCanvas = mapCanvasRef.current
        const routeCanvas = routeCanvasRef.current
        const mapCtx = mapCanvas.getContext('2d')
        const image = new Image()
        image.src = NTUST_MAP
        image.onload = function() {
            mapCanvas.width = image.width
            mapCanvas.height = image.height
            routeCanvas.width = image.width
            routeCanvas.height = image.height
            mapCtx.drawImage(image, 0, 0)
            setInited(true)
        }
    }, [setNodes])
    useEffect(() => {
        if (!inited) return
        const ids = Object.keys(nodes)
        ids.forEach(id => {
            const routeCanvas = routeCanvasRef.current
            const startPoint = nodes[id].img_coord
            const neighbors = Object.keys(nodes[id].edges)
            neighbors.forEach(neighbor => {
                const endPoint = nodes[neighbor].img_coord
                drawLine(routeCanvas, startPoint, endPoint, 20)
            })
        })
    }, [nodes, inited])

    /* ======================================== */
    function mapClickHandler(e) {
        const image = e.target
        const clickX = e.clientX - image.getBoundingClientRect().left
        const clickY = e.clientY - image.getBoundingClientRect().top
        const geoIcon = geoIconRef.current
        const size = geoIcon.getBoundingClientRect().height
        geoIcon.style.left = clickX - size / 2
        geoIcon.style.top = clickY - size
        const img_coord = htmlSize_To_realSize(routeCanvasRef.current, [clickX, clickY])
        setImgCoord(img_coord)
        // console.log(img_coord)
    }
    function nodeClickHandler(id) {
        setShowing(true)
        const neighbors = Object.keys(nodes[id].edges).join(" ")
        setNodeInfo({id, neighbors})
    }
    async function editNeighborsHandler() {
        console.log(nodeInfo)
        // const nodes = await remote.addNodes({geoCoord, imgCoord})
        // setNodes(nodes)
        // setShowing(false)
    }
    async function deleteNodeHandler() {
        console.log(nodeInfo.id)
        // const nodes = await remote.addNodes({geoCoord, imgCoord})
        // setNodes(nodes)
        // setShowing(false)
    }

    /* ======================================== */
    return <>
        {
            showing &&
            <div className="dialog">
                <div className="template">
                    <div>node {nodeInfo.id}</div>
                    <div className="button_group">
                        <button onClick={deleteNodeHandler}>刪除節點</button>
                    </div>
                    <br />
                    <div>edges</div>
                    <textarea cols="30" rows="5" className="edge_input" 
                        value={nodeInfo.neighbors}
                        onChange={(e) => {
                            setNodeInfo({
                                id: nodeInfo.id,
                                neighbors: e.target.value
                            })
                        }}
                    />
                    <div className="button_group">
                        <button onClick={() => {setShowing(false)}}>取消</button>
                        <button onClick={editNeighborsHandler}>確認</button>
                    </div>
                </div>
            </div>
        }   
        <div className="map_container">
            <canvas ref={mapCanvasRef} className="ntust_map" />
            <canvas ref={routeCanvasRef} className="ntust_map" 
                onClick={mapClickHandler}
            />
            <GeoIcon
                ref={geoIconRef}
                className="geo_icon"
                style={{top: "-1000"}}
            />
            {
                Object.keys(nodes)
                    .map(id => {
                        const size = 20
                        const canvas = mapCanvasRef.current
                        const point = nodes[id].img_coord
                        const [left, top] = realSize_To_htmlSize(canvas, point)
                        return <div
                            key={id}
                            className="dot_icon"
                            style={{left:`${left - size/2}px`, top:`${top - size/2}px`}}
                            onClick={() => {nodeClickHandler(id)}}
                        >
                            <DotIcon
                                style={{width:`${size}px`, height:`${size}px`}}
                            />
                            <div><span>{id}</span></div>
                        </div>
                    })
            }
        </div>
    </>
}

export default NtustMap
