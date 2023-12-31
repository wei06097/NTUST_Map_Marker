import remote from "../../function/remote"
import canvas from "../../function/canvas"
import React, { useEffect, useRef, useState } from "react"
import { ReactComponent as GeoIcon } from "../../assets/geo.svg"
import NTUST_MAP from "../../assets/NTUST_MAP.png"

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
        const routeCanvas = routeCanvasRef.current
        canvas.clearCanvas(routeCanvas)
        const ids = Object.keys(nodes)
        ids.forEach(id => {
            const startPoint = nodes[id].img_coord
            const neighbors = Object.keys(nodes[id].edges)
            neighbors.forEach(neighbor => {
                const endPoint = nodes[neighbor].img_coord
                canvas.drawLine(routeCanvas, startPoint, endPoint, 20)
                canvas.drawDot(routeCanvas, startPoint, 10)
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
        const img_coord = canvas.htmlSize_To_realSize(routeCanvasRef.current, [clickX, clickY])
        setImgCoord(img_coord)
    }
    function nodeClickHandler(id) {
        setShowing(true)
        const neighbors = Object.keys(nodes[id].edges).join(" ")
        setNodeInfo({id, neighbors})
    }
    async function editNeighborsHandler() {
        const nodes = await remote.editNeighbors({
            id : nodeInfo.id,
            neighbors : nodeInfo.neighbors.split(" ").filter(element => element!=="")
        })
        setNodes(nodes)
        setShowing(false)
    }
    async function deleteNodeHandler() {
        const nodes = await remote.deleteNode({id: nodeInfo.id})
        setNodes(nodes)
        setShowing(false)
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
                            const value = e.target.value
                            if (value.includes("\n")) {
                                editNeighborsHandler()
                            } else {
                                setNodeInfo({
                                    id: nodeInfo.id,
                                    neighbors: value
                                })
                            }
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
                        const size = 18
                        const mapCanvas = mapCanvasRef.current
                        const point = nodes[id].img_coord
                        const [left, top] = canvas.realSize_To_htmlSize(mapCanvas, point)
                        return <div
                            key={id}
                            className="dot_icon"
                            style={{left:`${left - size/2}px`, top:`${top - size/2}px`}}
                            onClick={() => {nodeClickHandler(id)}}
                        >{id}</div>
                    })
            }
        </div>
    </>
}

export default NtustMap
