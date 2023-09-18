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

let nodes = getNodes(file)
updateDistance(nodes)
writeNodes(file, nodes)
