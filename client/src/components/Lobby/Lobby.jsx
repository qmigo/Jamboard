import React, { useEffect, useState } from 'react'
// import './lobby.css'
import 'src/components/Lobby/lobby.css'

import { BsFillSendFill } from 'react-icons/bs'
import {io} from 'socket.io-client'


const SERVER = import.meta.env.VITE_SERVER

const socket = io(SERVER) 

const Lobby = () => {

  // const [recievedMessage, setRecievedMessage] = useState([])
  // const [sendedMessage, setSendedMessage] = useState([])

  const [messageList, setMessageList] = useState([])
  const [userInput, setUserInput] = useState(null)

  useEffect(()=>{
    socket.on('message', (item)=>{
      console.log(item)
      console.log(messageList)
      setMessageList([...messageList, item])
    })
  }, [socket])

  function sendMessage () {
    if(userInput === null)return;
    const userResponse = {
      data: userInput,
      time: new Date()
    }
    socket.emit('sendMessage', userResponse)
    setMessageList([...messageList, userResponse])
    setUserInput('')
    document.getElementById('input').value = ''
  }
  return (
    <div className='Lobby'>
        <div className="lobby-contact">
            Himesh
        </div>
        <div className="lobby-chat">
          {
            messageList?.map((msg)=>(
              <div>{msg.data}</div>
            ))
          }
        </div>
        <div className="lobby-utility">
            <input type="text" id='input' onChange={(e)=>{setUserInput(e.target.value)}}/>
            <BsFillSendFill size={'1.2rem'} onClick={sendMessage}/>
        </div>
    </div>
  )
}

export default Lobby
