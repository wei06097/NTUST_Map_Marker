/* ==================== */
const POINT = {
    A : { //行政大樓
        geo : [121.54109305805667, 25.013265414844838],
        img : [4120, 2645]
    },
    B : { //國際大樓
        geo : [121.54018903041901, 25.013030855815018],
        img : [5291, 3257]
    }
}
const PARAMETER = {
    THETA : -136.5 * (Math.PI / 180),
    BASE : [121.54441046735, 25.01390096878],
    C12 : [6.897990354192532e-7, 6.927730843184932e-7],
    C34 : [1448740.1933143984, 1451271.8357635792]
}

/* ==================== */
function findC12(THETA, BASE, [x, y], [lon, lat]) {
    const c1 = (lon - BASE[0]) / (Math.cos(THETA) * x + Math.sin(THETA) * y)
    const c2 = (lat - BASE[1]) / (Math.sin(THETA) * x - Math.cos(THETA) * y)
    return [c1, c2]
}
function getGeoCoord(C12, THETA, BASE, [x, y]) {
    const lon = C12[0] * (Math.cos(THETA) * x + Math.sin(THETA) * y) + BASE[0]
    const lat = C12[1] * (Math.sin(THETA) * x - Math.cos(THETA) * y) + BASE[1]
    return [lon, lat]
}
function findC34(THETA, BASE, [x, y], [lon, lat]) {
    lon -= BASE[0]
    lat -= BASE[1]
    const c3 = x / (Math.cos(THETA) * lon + Math.sin(THETA) * lat)
    const c4 = y / (Math.sin(THETA) * lon - Math.cos(THETA) * lat)
    return [c3, c4]
}
function getImgCoord(C34, THETA, BASE, [lon, lat]) {
    lon -= BASE[0]
    lat -= BASE[1]
    const x = C34[0] * (Math.cos(THETA) * lon + Math.sin(THETA) * lat)
    const y = C34[1] * (Math.sin(THETA) * lon - Math.cos(THETA) * lat)
    return [Math.round(x), Math.round(y)]
}

/* ==================== */
function findBestBase() {
    const step = 0.00000000000001 // 0.00000000000001
    const start = [121.54441046735000, 25.01390096885000] //右下 [121.54441046738958, 25.01392271055478]
    const end =   [121.54441046740000, 25.01390096878000] //左上 [121.54462512615004, 25.01390096880897]
    let min = {i: null, j: null, dlon2: Infinity, dlat2: Infinity}
    for (let i=start[0]; i<=end[0]; i+=step) {
        for (let j=end[1]; j<=start[1]; j+=step) {
            const BASE = [i, j]
            const {THETA} = PARAMETER
            const C12 = findC12(THETA, BASE, POINT.A.img, POINT.A.geo)
            const [lon, lat] = getGeoCoord(C12, THETA, BASE, POINT.B.img)
            const [dlon2, dlat2] = [(POINT.B.geo[0]-lon)**2, (POINT.B.geo[1]-lat)**2]
            if (dlon2 < min.dlon2 && dlat2 < min.dlat2) {
                min = {i, j, dlon2, dlat2}
            }
        }
        console.log(i)
    }
    console.clear()
    console.log(min)
}
// findBestBase()

/* ==================== */
function test1() {
    const {C12, C34, THETA, BASE} = PARAMETER
    const [lon, lat] = getGeoCoord(C12, THETA, BASE, [1047, 1117])
    const [x, y] = getImgCoord(C34, THETA, BASE, [lon, lat])
    console.log(lat, lon)
    console.log(x, y)
}
test1()
