import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DrawingTool from './components/drawingtool'
import PencilTool from './components/penciltool'
// import DrawingBoard from './components/drawingboard'
import JamBoard from './components/jamboard'

function App() {
  return(
    <div className='app'>
      {/* <DrawingTool></DrawingTool> */}
      {/* <PencilTool></PencilTool> */}
      {/* <DrawingBoard></DrawingBoard> */}
      <JamBoard></JamBoard>
    </div>
  )
}

export default App
