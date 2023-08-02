import React, { useEffect, useRef, useState } from 'react'
import Peer from "simple-peer"
import 'src/components/Lobby/lobby.css'

const Lobby = ({socket, username}) => {

  const [me, setMe] = useState('')
  const [stream, setStream] = useState()
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState('')
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [idToCall, setIdToCall] = useState('')
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState('')

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()

  useEffect(() => {
    socket.on('me', (id) => {
      setMe(id)
    })
    setTimeout(()=> {
      navigator.mediaDevices.getUserMedia( {video: true, audio: true}).then((stream) => {
        setStream(stream)
        if (myVideo.current) 
        {
          myVideo.current.srcObject = stream;
        }
      })
  
      socket.on('callUser', (data) => {
        setReceivingCall(true)
        setCaller(data.from)
        setName(data.name)
        setCallerSignal(data.signal)
      })
  
      console.log(username)

    }, 1000)
    
  }, [])

  const callUser = (id) => {
    const peer = new Peer ({
      initiator: true,
      trickle: false,
      stream: stream,
      secure: true
    })

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData : data,
        from: me,
        name: username
      })
    })

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream
    })

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })
    
    connectionRef.current = peer
    
  }

  const answerCall = () => {
    setCallAccepted(true)

    const peer = new Peer ({
      initiator: false,
      trickle: false,
      stream: stream,
      secure: true
    })

    peer.on('signal', (data) => {
      socket.emit('answerCall', {
        signal: data,
        to: caller
      })
    })

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
  }

  const leaveCall = () => {
    setCallEnded(true)
    setCallAccepted(false)
    setReceivingCall(false)
    connectionRef.current.destroy()
  }

  return (
    <div className='Lobby'>
      
      <div className="video-container">
        
          <div className="video">
            {stream &&  <video playsInline muted ref={myVideo} autoPlay />}
          </div>
        
        
          <div className="video">
            {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay  />:
            <></>}
          </div>
       
      </div>
      <div className="panel">
        {
          !callAccepted && 
          <>
          <b>From</b>
          <div className="my-id">
            {me}
            </div>
          <b>To</b> <br />
          <input type="text" placeholder='Id to call' onChange={(e)=>{setIdToCall(e.target.value)}}/>
          </>
          
        }
        <div className="call-btns">
        <div className="accept-button">
					{callAccepted && !callEnded ? (
						<button className='btn btn-danger my-2' onClick={leaveCall}>
							End Call
						</button>
					) : (
						<button className= 'btn btn-success my-2' onClick={() => callUser(idToCall)}>
							Call
						</button>
					)}

				</div>
        <div className="decline-button">
        {receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<button className = 'btn btn-dark 'onClick={answerCall}>
							Answer
						</button>
					</div>
				) : null}
        </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby
