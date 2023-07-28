import React, { useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'


const DrawingBoard = () => {
    
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState('curve')

    const [curves, setCurves] = useState([])
    const [rectangles, setRectangles] = useState([])
    const [lines, setLines] = useState([])
    const [ovals, setOvals] = useState([])

    const [selectedShape, setSelectedShape] = useState({shape:null, index:null})
    const [isSelected, setIsSelected] = useState(false)
    const [distance, setDistance] = useState([0,0])

    useLayoutEffect(()=>{
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const rc = rough.canvas(canvas)

        curves?.forEach((curve)=>{
            rc.linearPath(curve)
        })

        rectangles?.forEach((rectangle)=>{
            rc.rectangle(...rectangle)
        })

        lines?.forEach((line)=>{
            rc.line(...line)
        })

        ovals?.forEach((oval)=>{
            const arr = [...oval]

            if(isSelected)
            {
                rc.ellipse(arr[0], arr[1], (arr[2]-arr[0])*2, (arr[3]-arr[1]*2))
            }
            
            else
            {
                const a = (arr[2]-arr[0]);
                const b = (arr[3]-arr[1]);
                
                
                rc.ellipse(arr[0]+(a/2), arr[1]+(b/2), Math.abs(a), Math.abs(b))
            }
        })

        
    }, [curves, rectangles, lines, ovals])

    const isInside = (x, y)=>
    {   
        let shape = null
        let index = null

        ovals.forEach((oval, key)=>{
            
            const a = (oval[2]-oval[0])/2;
            const b = (oval[3]-oval[1])/2;

            const x1 = (oval[0]+a);
            const y1 = (oval[1]+b);
            
            if (((x-x1)*(x-x1)*b*b)+((y-y1)*(y-y1)*a*a)<=a*a*b*b)
            {
                shape = 'oval'
                index = key
            }
        })

        rectangles.forEach((rectangle, key)=>{
            let x1 = rectangle[0], y1 = rectangle[1], x2 = rectangle[0]+rectangle[2], y2 = rectangle[1]+rectangle[3]
            if(x>=x1 && x<=x2 && y>=y1 && y<=y2)
            {
                shape = 'rectangle'
                index = key
            }            
        })

        return {shape, index}

    }

    const startDrawing = (event)=> {
        const {clientX, clientY} = event
        if(tool === 'select')
        {   
            const {shape, index} = isInside(clientX, clientY)
            console.log(shape, index)
            if(shape===null || index===null)return
            
            setIsSelected(true)

            if(shape === 'rectangle')
            {
                setDistance([clientX-rectangles[index][0], clientY-rectangles[index][1]])
            }
            if(shape === 'oval')
            {   
                const oval = ovals[index]
                const a = (oval[2]-oval[0])/2;
                const b = (oval[3]-oval[1])/2;

                const x1 = (oval[0]+a);
                const y1 = (oval[1]+b);
                setDistance([clientX-x1, clientY-y1])
            }
            setSelectedShape({shape, index})
            return;
        }
        setIsDrawing(true)

        if(tool === 'curve')
        {
            const prevCurves = curves
            prevCurves.push([[clientX, clientY]])
            setCurves(prevCurves)
        }

        if(tool === 'rectangle')
        {
            setRectangles([...rectangles, [clientX, clientY, 0, 0]])   
        }

        if(tool === 'line')
        {
            setLines([...lines, [clientX, clientY, clientX, clientY]])
        }

        if(tool === 'oval')
        {
            setOvals([...ovals, [clientX, clientY, clientX, clientY]])
        }
        
    }

    const draw = (event)=>{
        const {clientX, clientY} = event

        if(isSelected)
        {      
            setIsDrawing(false)
            const {shape, index} = selectedShape
            if(shape === 'rectangle')
            {
                const copyRectangles = [...rectangles]
                
                copyRectangles[index][0]=clientX-distance[0]
                copyRectangles[index][1]=clientY-distance[1]
                setRectangles(copyRectangles)
            }

            if(shape == 'oval')
            {
                const copyOvals = [...ovals]

                copyOvals[index][0] = clientX-distance[0]
                copyOvals[index][1] = clientY-distance[1]
                setOvals(copyOvals)
            }
            
        }
        if(!isDrawing) return;
        
        if(tool === 'curve')
        {
            const index = curves.length-1
            const copyCurves = [...curves]
            copyCurves[index].push([clientX, clientY])
            setCurves(copyCurves)
        }

        if(tool === 'rectangle')
        {
            const index = rectangles.length-1

            const copyRectangles = [...rectangles]
            copyRectangles[index][2] = clientX-rectangles[index][0]
            copyRectangles[index][3] = clientY-rectangles[index][1]
            setRectangles(copyRectangles)
        }

        if(tool === 'line')
        {
            const index = lines.length-1;

            const copyLines = [...lines]
            copyLines[index][2] = clientX
            copyLines[index][3] = clientY
            setLines(copyLines)
        }

        if(tool === 'oval')
        {   
            console.log(clientX, clientY)
            const index = ovals.length-1;

            const copyOvals = [...ovals]
            copyOvals[index][2] = clientX
            copyOvals[index][3] = clientY
            
            setOvals(copyOvals)
        }
    }

    const endDrawing = ()=>{
        setIsSelected(false)
        setIsDrawing(false)
    }

  return (
    <div className='canvas'>
        <canvas id='canvas'  width={innerWidth-100} height={innerHeight-100} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} style={{border:"2px solid black"}}>
        Canvas
        </canvas>
        <br />
        <button onClick={()=>{setTool('curve')}}>Curve</button>
        <button onClick={()=>{setTool('rectangle')}}>Rectangle</button>
        <button onClick={()=>{setTool('line')}}>Line</button>
        <button onClick={()=>{setTool('oval')}}>Ecllipse</button>
        <button onClick={()=>{setTool('select')}}>Select</button>
    </div>
  )
}

export default DrawingBoard
