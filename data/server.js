const cors = require("cors")
const express = require("express")
const app = express()
app.use(cors())
app.use(express.json())

/* ======================================== */
function getNearbyNode(nodes, coord) {
    let min = {id: null, distance: Infinity}
    Object.keys(nodes)
        .map(id => {
            const pointA = nodes[id].img_coord
            const pointB = coord
            const [x, y] = [pointA[0] - pointB[0], pointA[1] - pointB[1]]
            return [id, x*x + y*y]
        })
        .forEach(([id, distance]) => {
            if (distance < min.distance) min = {id, distance}
        })
    return min.id
}
function dijkstra(nodes, source, destination) {
    if (source === destination) return []
    const ids = Object.keys(nodes)
    ids.forEach(id => {
        nodes[id] = {
            ...nodes[id],
            lock: false,
            loss: Infinity,
            lastNode: null
        }
    })
    // 1. 鎖住損耗最低的格子(起點)
    let lastLocked = source
    nodes[lastLocked] = {
        ...nodes[lastLocked],
        lock: true,
        loss: 0,
        lastNode: null
    }
    while (true) {
        // 2. 找出與上鎖格相鄰且未上鎖的格子
        const neighbors = Object.keys(nodes[lastLocked].edges).filter(id => !nodes[id].lock)
        neighbors.forEach(neighbor => {
            // 3. 計算相鄰格的損耗
            const oldLoss = nodes[neighbor].loss
            const newLoss = nodes[lastLocked].loss + nodes[lastLocked].edges[neighbor]
            if (newLoss < oldLoss) {
                nodes[neighbor] = {
                    ...nodes[neighbor],
                    loss: newLoss,
                    lastNode: lastLocked
                }
            }
        })
        // 1. 鎖住損耗最低的格子
        let min = Infinity
        const unlockedList = ids.filter(id => nodes[id].lastNode && !nodes[id].lock)
        unlockedList.forEach(unlocked => {
            const loss = nodes[unlocked].loss
            if (loss < min) {
                min = loss
                lastLocked = unlocked
            }
        })
        nodes[lastLocked] = {
            ...nodes[lastLocked],
            lock: true,
        }
        // 終點鎖住 => 結束
        if (lastLocked === destination) break
    }
    // 從終點往回找
    const array = []
    let element = destination
    while (true) {
        array.unshift(element)
        if (!nodes[element].lastNode) break
        element = nodes[element].lastNode
    }
    return array
}

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
            const distance = haversineDistance(nodes[node].geo_coord, nodes[neighbor].geo_coord)
            nodes[node].edges[neighbor] = distance
            nodes[neighbor].edges[node] = distance
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
app.post("/pathfinding", (req, res) => {
    const {source, destination} = req.body
    const nodes = getNodes(file)
    const pointA = getNearbyNode(nodes, source)
    const pointB = getNearbyNode(nodes, destination)
    const path = dijkstra(nodes, pointA, pointB)
    res.json(path)
})
app.listen(50000)
