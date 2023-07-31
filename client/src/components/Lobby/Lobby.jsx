import React from 'react'
import './lobby.css'
import { BsFillSendFill } from 'react-icons/bs'

const Lobby = () => {
  return (
    <div className='Lobby'>
        <div className="lobby-contact">
            Himesh
        </div>
        <div className="lobby-chat">

        </div>
        <div className="lobby-utility">
            <input type="text" />
            <BsFillSendFill size={'1.2rem'}/>
        </div>
    </div>
  )
}

export default Lobby
