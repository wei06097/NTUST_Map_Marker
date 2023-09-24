/* ==================== */
const a = { //宿舍1
    geo : [121.54275944463592, 25.01289731624324],
    img : [2817, 610]
}
const b = { //國際大樓
    geo : [121.54018239926825, 25.013034932553623],
    img : [5291, 3259]
}

/* ==================== */
const theta = 136.5 * (Math.PI / 180)
function getParams([a, b], [x, y], [lon, lat]) {
    const c1 = (lon - a) / (Math.cos(theta) * x + Math.sin(theta) * y)
    const c2 = (lat - b) / (Math.sin(theta) * x - Math.cos(theta) * y)
    return [c1, c2]
}
function getGeo([a, b], [c1, c2], [x, y]) {
    const lon = c1 * (Math.cos(theta) * x + Math.sin(theta) * y) + a
    const lat = c2 * (Math.sin(theta) * x - Math.cos(theta) * y) + b
    return [lon, lat]
}
function getParams2([a, b], [x, y], [lon, lat]) {
    // const newAB = mercatorProjection([a, b])
    // const newLonLat = mercatorProjection([lon, lat])
    // a = newAB[0]
    // b = newAB[1]
    // lon = newLonLat[0]
    // lat = newLonLat[1]
    lon = lon - a
    lat = lat - b
    const c3 = x / (Math.cos(theta) * lon + Math.sin(theta) * lat)
    const c4 = (-1 * y) / (-1 * Math.sin(theta) * lon + Math.cos(theta) * lat)
    return [c3, c4]
}
function getImg([a, b], [c3, c4], [lon, lat]) {
    // const newAB = mercatorProjection([a, b])
    // const newLonLat = mercatorProjection([lon, lat])
    // a = newAB[0]
    // b = newAB[1]
    // lon = newLonLat[0]
    // lat = newLonLat[1]
    lon = lon -a
    lat = lat - b
    const x = c3 * (Math.cos(theta) * lon + Math.sin(theta) * lat)
    const y = -1 * c4 * (-1 * Math.sin(theta) * lon + Math.cos(theta) * lat)
    return [Math.round(x), Math.round(y)]
}

/* ==================== */
function mercatorProjection([lon, lat]) {
    const R = 6371
    const lonRad = lon * (Math.PI / 180)
    const latRad = lat * (Math.PI / 180)
    const x = R * lonRad
    const y = R * Math.log(Math.tan(Math.PI / 4 + latRad / 2))
    return [x, y]
}
function findBestBase() {
    const step = 0.0000001 // 0.00000000000001
    const start = [121.54441046738958, 25.01392271055478] //右下
    const end =   [121.54462512615004, 25.01390096880897] //左上
    let min = {i: null, j: null, dlon2: Infinity, dlat2: Infinity}
    for (let i=start[0]; i<=end[0]; i+=step) {
        for (let j=end[1]; j<=start[1]; j+=step) {
            const base = [i, j]
            const [c1, c2] = getParams(base, a.img, a.geo)
            const [lon, lat] = getGeo(base, [c1, c2], b.img)
            const [dlon, dlat] = [b.geo[0]-lon, b.geo[1]-lat]
            const [dlon2, dlat2] = [dlon**2, dlat**2]
            if (dlon2 < min.dlon2 && dlat2 < min.dlat2) {
                min = {i, j, dlon2, dlat2}
            }
            console.log(i, j)
        }
        console.clear()
    }
    console.log(min)
}
// findBestBase()

/* ==================== */
const base =  [121.54441046738958, 25.01390096880897]
function test1() {
    const test_data = a
    const params = getParams(base, test_data.img, test_data.geo)
    const [lon, lat] = getGeo(base, params, test_data.img)
    console.log(lat, lon)
    console.log(lat-test_data.geo[1], lon-test_data.geo[0])
}
function test2() {
    const test_data = a
    const params2 = getParams2(base, test_data.img, test_data.geo)
    const [x, y] = getImg(base, params2, test_data.geo)
    console.log(x, y)
    console.log(x-test_data.img[0], y-test_data.img[1])
}
// test1()
// test2()
