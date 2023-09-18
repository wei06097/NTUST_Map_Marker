const canvas = {
    drawLine : (canvas, [startX, startY], [endX, endY], lineWidth=20, color="blue") => {
        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color
        ctx.stroke()
        ctx.closePath()
    },
    drawDot : (canvas, [x, y], radius=10, color="blue") => {
        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2*Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.closePath()
    },
    clearCanvas : (canvas) => {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}

export default canvas
