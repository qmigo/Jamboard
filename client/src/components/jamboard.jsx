import React, { useEffect, useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import { produce } from 'immer'

const JamBoard = () => {
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState([])
  const [tool, setTool] = useState('curve')
  const [undoStack, setUndoStack] = useState([])
  const [isSelected, setIsSelected] = useState(false)
  const [distance, setDistance] = useState([0,0])
  const [selectedElement, setSelectedElement] = useState({type:null, index: null})

  function isPointNearLine(x1, y1, x2, y2, x, y, d_threshold) {
    const m = (y2-y1)/(x2-x1);
    const A = m;
    const B = -1;
    const C = ((-m*x1)+y1)
    const N = Math.abs((A*x)+(B*y)+C)
    const D = Math.sqrt((A*A)+(B*B))
    const d = N/D
    
    return d <= d_threshold;
  }

  function isInside(x, y) {

    let type = null, index = null
    elements?.forEach(({name, metric}, key)=>{
      
      if(name === 'rectangle') {
        const x1 = metric[0], y1 = metric[1], x2 = metric[2]+x1, y2 = metric[3]+y1
        if(x1<=x && x<=x2 && y1<=y && y<=y2)
        {
          type = 'rectangle'
          index = key
        }
      }

      if(name === 'line') {
        if(isPointNearLine(...metric, x,y,10))
        {
          type = 'line'
          index = key
        }
      }
    })

    return {type, index}
  }

  function startDrawing(event) {
    const {clientX, clientY} = event

    if(tool === 'select')
    {
      setIsDrawing(false)
      const {type, index} = isInside(clientX, clientY)
      if(type===null || index===null)return;
      
      setIsSelected(true)
      if(type === 'rectangle') {
        setDistance([clientX-elements[index].metric[0], clientY-elements[index].metric[1]])
      }
      if(type === 'line') {
        setDistance([
          clientX-elements[index].metric[0], clientY-elements[index].metric[1],
          clientX-elements[index].metric[2], clientY-elements[index].metric[3], 
        ])
      }
      setSelectedElement({type, index})
      // console.log(type, index, distance)
      return;
    }

    setIsDrawing(true)

    if(tool === 'rectangle') {
      const newRectangle = {
        name: 'rectangle',
        metric: [clientX, clientY, 0, 0]
      }
      setElements([...elements, newRectangle])
    }

    if(tool === 'curve') {
      const newCurve = {
        name: 'curve',
        metric: [[clientX, clientY]]
      }
      setElements([...elements, newCurve])
    }

    if(tool === 'line') {
      const newLine = {
        name: 'line',
        metric: [clientX, clientY, clientX, clientY]
      }
      setElements([...elements, newLine])
    }

  }

  function keepDrawing(event) {
    const {clientX, clientY} = event

    if(isSelected)
    { 
      const {type, index} = selectedElement
      console.log(type, index)

      if(type === 'rectangle') {
        const nextState = produce(elements, draft => {
          draft[index].metric[0] = clientX-distance[0];
          draft[index].metric[1] = clientY-distance[1];
        })
        setElements(nextState)
      } 

      if(type === 'line') {
      
        const nextState = produce(elements, draft => {
          draft[index].metric[0] = clientX-distance[0]
          draft[index].metric[1] = clientY-distance[1]
          draft[index].metric[2] = clientX-distance[2]
          draft[index].metric[3] = clientY-distance[3]
        })
        setElements(nextState)

      }
    }

    if(!isDrawing)return;

    const index = elements.length-1;

    if(tool === 'rectangle') {

      const nextState = produce(elements, draft => {
        draft[index].metric[2] = clientX-elements[index].metric[0] 
        draft[index].metric[3] = clientY-elements[index].metric[1]
      })
      setElements(nextState)
    }

    if(tool === 'curve') {

      const nextState = produce(elements, draft => {
        draft[index].metric.push([clientX, clientY])
      })
      setElements(nextState)
    }

    if(tool === 'line') {
      const nextState = produce(elements, draft => {
        draft[index].metric[2] = clientX
        draft[index].metric[3] = clientY
      })
      setElements(nextState)
    }
  }

  function endDrawing() {
    // console.log('End drawing')
    setIsSelected(false)
    setIsDrawing(false)
  }

  function undo() {
    if(elements.length===0)return;
    setUndoStack([...undoStack, elements[elements.length-1]])
    const nextState = produce(elements, draft => {
      draft.pop()
    })
    setElements(nextState)
  }

  function redo() {
    console.log(undoStack)
    if(undoStack.length===0)return;

    setElements([...elements, undoStack[undoStack.length-1]])
    const nextState = produce(undoStack, draft => {
      draft.pop()
    })
    setUndoStack(nextState)
  }
  
  useLayoutEffect(()=>{
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const rc = rough.canvas(canvas)

    elements?.forEach(({name, metric}, key) => {
      if(name === 'rectangle') {
        rc.rectangle(...metric)
      }

      if(name === 'curve') {
        rc.linearPath(metric)
      }

      if(name === 'line') {
        rc.line(...metric)
      }
    })
    
  }, [elements])


  return (
    <div className='jamboard'>
      <canvas id='canvas' height={window.innerHeight-100} width={window.innerWidth-100} onMouseDown={startDrawing} onMouseMove={keepDrawing} onMouseUp={endDrawing} style={{border:'5px solid black', cursor:'crosshair'}} ></canvas>
      <div className="swatch">
        <button onClick={()=>{setTool('rectangle')}}>Rectangle</button>
        <button onClick={()=>{setTool('curve')}}>Curve</button>
        <button onClick={()=>{setTool('line')}}>Line</button>
        <button onClick={()=>{setTool('select')}}>Select</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>

      </div>
    </div>
  )
}

export default JamBoard