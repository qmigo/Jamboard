import './App.css'
import JamBoard from './components/Board/jamboard'
import Navbar from './components/Navbar/Navbar'
import Lobby from './components/Lobby/Lobby'
import {io} from 'socket.io-client'
import { useEffect } from 'react'


// const SERVER = 'https://slate-server.onrender.com'
const SERVER = 'http://localhost:5000'
const socket = io(SERVER) 

function App() {
  useEffect(()=>{
    socket.on('connect', ()=> {
      console.log('New User Connected', socket.id)
    })
  },[])

  return(
    <div className='app'>
      <Navbar socket={socket}/>
      <div className="window" style={{display:'flex'}}>
        <JamBoard socket={socket}/>
        <Lobby socket={socket}/>
      </div>
    </div>
  )
}

export default App
