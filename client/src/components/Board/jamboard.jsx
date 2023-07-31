import React, { useEffect, useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import { produce } from 'immer'
// import './board.css'
import 'src/components/Board/board.css'

import { BiRectangle } from 'react-icons/bi';
import {BsPencil, BsEraser} from 'react-icons/bs'
import {PiLineSegmentBold} from 'react-icons/pi'
import {GrSelect} from 'react-icons/gr'
import {AiOutlineRedo, AiOutlineUndo} from 'react-icons/ai'
import {io} from 'socket.io-client'

const SERVER = import.meta.env.VITE_SERVER
console.log(SERVER)
const socket = io(SERVER) 

const JamBoard = () => {
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState([])
  const [tool, setTool] = useState('curve')
  const [undoStack, setUndoStack] = useState([])
  const [isSelected, setIsSelected] = useState(false)
  const [distance, setDistance] = useState([0,0])
  const [selectedElement, setSelectedElement] = useState({type:null, index: null})
  const [boardOffset, setBoardOffset] = useState([0,0])
  const [recievedElements, setRecievedElements] = useState([])

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

      if(name === 'curve') {
        
        metric?.forEach((point)=> {
          if(((point[0]-x)*(point[0]-x))+((point[1]-y)*(point[1]-y))<=100) {
            type = 'curve'
            index = key
            return
          }
        })
      }

    })

    return {type, index}
  }

  function startDrawing(event) {
    let {clientX, clientY} = event
    clientX -= boardOffset[0]
    clientY -= boardOffset[1]
  
    if(tool === 'select' || tool === 'eraser')
    {
      setIsDrawing(false)
      const {type, index} = isInside(clientX, clientY)
      if(type===null || index===null)return;
      
      if(tool === 'eraser') {
        const nextState = produce(elements, draft => {
          draft = draft.splice(index,1)
        })
        setElements(nextState)
      }
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

      if(type === 'curve') {
        let newPoints = elements[index].metric.map((item) => {
          return [clientX-item[0], clientY-item[1]]
        })
        setDistance(newPoints)
      }
      setSelectedElement({type, index})
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
    let {clientX, clientY} = event

    clientX-=boardOffset[0]
    clientY-=boardOffset[1]

    if(isSelected)
    {   
    
      const {type, index} = selectedElement

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

      if(type === 'curve') {

        const copyCurve = elements[index].metric?.map((item, key)=> {
          return [clientX-distance[key][0], clientY-distance[key][1]]
        })
        const nextState = produce(elements, draft => {
          draft[index].metric = copyCurve
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
    if(undoStack.length===0)return;

    setElements([...elements, undoStack[undoStack.length-1]])
    const nextState = produce(undoStack, draft => {
      draft.pop()
    })
    setUndoStack(nextState)
  }

  useEffect(()=>{
    socket.on('board', (item)=>{
      console.log(item)
      setRecievedElements([...recievedElements,...item])
    })
  }, [socket])
  
  useLayoutEffect(()=>{
    const canvas = document.getElementById('canvas')
    const {left, top} = canvas.getBoundingClientRect()

    setBoardOffset([left, top])
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

    const property = {
      stroke: 'red'
    }
    recievedElements?.forEach(({name, metric}, key) => {
      if(name === 'rectangle') {
        rc.rectangle(...metric, property)
      }

      if(name === 'curve') {
        rc.linearPath(metric, property)
      }

      if(name === 'line') {
        rc.line(...metric, property)
      }
    })

    const getData = setTimeout(() => {
      socket.emit('sendBoard', elements)
    }, 2000)

    return () => clearTimeout(getData)
    
  }, [elements, recievedElements])


  return (
    <div className='jamboard'>
      <div className="swatch">
        <div onClick={()=>{setTool('rectangle')}}><BiRectangle/></div>
        <div onClick={()=>{setTool('curve')}}><BsPencil /></div>
        <div onClick={()=>{setTool('line')}}><PiLineSegmentBold/></div>
        <div onClick={()=>{setTool('select')}}><GrSelect/></div>
        <div onClick={()=>{setTool('eraser')}}><BsEraser/></div>
        <div onClick={undo}><AiOutlineUndo/></div>
        <div onClick={redo}><AiOutlineRedo/></div>
      </div>
      <canvas id='canvas' height={window.innerHeight} width={window.innerWidth*0.7} onMouseDown={startDrawing} onMouseMove={keepDrawing} onMouseUp={endDrawing} ></canvas>
    </div>
  )
}

export default JamBoard