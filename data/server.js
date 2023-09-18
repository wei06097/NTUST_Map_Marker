const cors = require("cors")
const express = require("express")
const app = express()
app.use(cors())
app.use(express.json())

/* ======================================== */
const file = require('path').join(__dirname, "data.json")
// 讀取nodes
function getNodes(file) {
    const data = require('fs').readFileSync(file, {encoding:'utf8', flag:'r'})
    return JSON.parse(data)
}
// 寫入nodes
function writeNodes(file, nodes) {
    const new_data = JSON.stringify(nodes, null, '\t')
    require('fs').writeFileSync(file, new_data, {encoding:'utf8', flag:'w'})
}
// 經緯度轉換距離
function haversineDistance([lon1, lat1], [lon2, lat2]) {
    // 將經緯度轉為弧度
    const radLon1 = (Math.PI / 180) * lon1
    const radLon2 = (Math.PI / 180) * lon2
    const radLat1 = (Math.PI / 180) * lat1
    const radLat2 = (Math.PI / 180) * lat2
    // 地球的半徑 (km)
    const earthRadius = 6371
    // 半正矢公式 (Haversine formula)
    const dLon = radLon2 - radLon1
    const dLat = radLat2 - radLat1
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = earthRadius * c
    return distance * 1000 //公尺(m)
}
// 更新距離
function updateDistance(nodes) {
    const ids = Object.keys(nodes)
    ids.forEach(id => {
        const geo_coord_A = nodes[id].geo_coord
        const neighbors = Object.keys(nodes[id].edges)
        neighbors.forEach(neighbor => {
            const geo_coord_B = nodes[neighbor].geo_coord
            const distance = haversineDistance(geo_coord_A, geo_coord_B)
            nodes[id].edges[neighbor] = Number(distance.toFixed(3))
        })
    })
    return nodes
    /*
        // 測試
        const PointA = [121.54051788322738, 25.01378159377525]
        const PointB = [121.54063216741014, 25.013674193620844]
        const distance = haversineDistance(PointA, PointB)
        console.log("距離:", distance.toFixed(3), "(m)")
    */
}

/* ======================================== */
// 刪掉節點
function deleteNode(nodes, node) {
    if (nodes[node]) delete nodes[node]
    const ids = Object.keys(nodes)
    ids.forEach(id => {
        const neighbors = Object.keys(nodes[id].edges)
        if (neighbors.includes(node)) delete nodes[id].edges[node]
    })
    return nodes
}
// 增加節點
function addNode(nodes, geo_coord, img_coord) {
    const ids = Object.keys(nodes)
    let newId = Math.max(...ids.map(id => parseInt(id)))
    newId = (newId === -Infinity)? 1: newId + 1
    nodes[newId] = {
        "geo_coord": geo_coord,
		"img_coord": img_coord,
		"edges": {}
    }
    return nodes
}
// 增加節點的鄰居
function addNeighbors(nodes, node, neighbors) {
    if (!nodes[node]) return nodes
    neighbors.forEach(neighbor => {
        if (nodes[neighbor] && neighbor !== node) {
            nodes[node].edges[neighbor] = 0
            nodes[neighbor].edges[node] = 0
        }
    })
    return nodes
}
// 刪除節點的鄰居
function deleteNeighbors(nodes, node, neighbors) {
    if (!nodes[node]) return nodes
    neighbors.forEach(neighbor => {
        if (neighbor !== node && nodes[node].edges[neighbor] && nodes[neighbor] && nodes[neighbor].edges[node]) {
            delete nodes[node].edges[neighbor]
            delete nodes[neighbor].edges[node]
        }
    })
    return nodes
}

/* ======================================== */
app.get("/nodes", (req, res) => {
    const nodes = getNodes(file)
    res.json(nodes)
})
app.post("/node", (req, res) => {
    const {geoCoord, imgCoord} = req.body
    let nodes = getNodes(file)
    nodes = addNode(nodes, geoCoord, imgCoord)
    nodes = writeNodes(file, nodes)
    nodes = getNodes(file)
    res.json(nodes)
})
app.del("/node", (req, res) => {
    const {id} = req.body
    let nodes = getNodes(file)
    nodes = deleteNode(nodes, id)
    nodes = writeNodes(file, nodes)
    nodes = getNodes(file)
    res.json(nodes)
})
app.put("/node", (req, res) => {
    const {id, neighbors} = req.body
    let nodes = getNodes(file)
    const origin_list = Object.keys(nodes[id].edges)
    const intersection = origin_list.filter(element => neighbors.includes(element))
    const deletion = origin_list.filter(element => !intersection.includes(element))
    const addition = neighbors.filter(element => !intersection.includes(element))
    nodes = deleteNeighbors(nodes, id, deletion)
    nodes = addNeighbors(nodes, id, addition)
    nodes = writeNodes(file, nodes)
    nodes = getNodes(file)
    res.json(nodes)
})
app.listen(50000)
