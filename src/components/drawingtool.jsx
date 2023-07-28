import React, { useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'

const gen = rough.generator()

function createElement(x1, y1, x2, y2) {
    const roughEle = gen.line(x1, y1, x2, y2)
    return {x1, y1, x2, y2, roughEle}
}

const DrawingTool = () => {
    const [elements, setElements] = useState([])
    const [isDrawing, setIsDrawing] = useState(false)

    useLayoutEffect(()=>{
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rc = rough.canvas(canvas)
        
        elements.forEach((ele)=> rc.draw(ele.roughEle))
    }, [elements])

    function startDrawing(event) {
        setIsDrawing(true)
        const { clientX, clientY } = event
        const shape = createElement(clientX, clientY, clientX, clientY)
        setElements([...elements, shape])
    }

    function draw(event) {
        if(!isDrawing) return;
        const { clientX, clientY } = event
        const index = elements.length-1
        const {x1, y1} = elements[index]

        const shape = createElement(x1, y1, clientX, clientY)

        const copyElements = [...elements]
        copyElements[index] = shape
        setElements(copyElements)
    }

    function endDrawing() {
        setIsDrawing(false)
    }
    return (
    <canvas id='canvas' width={window.innerWidth-100} height={window.innerHeight-100} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing}>
        Canvas
    </canvas>
    )
}

export default DrawingTool
