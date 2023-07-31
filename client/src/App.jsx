import './App.css'
import JamBoard from './components/Board/jamboard'
import Navbar from './components/Navbar/Navbar'
import Lobby from './components/Lobby/Lobby'

function App() {
  return(
    <div className='app'>
      <Navbar/>
      <div className="window" style={{display:'flex'}}>
        <JamBoard/>
        <Lobby/>
      </div>
    </div>
  )
}

export default App
