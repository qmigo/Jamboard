const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const PORT = 5000

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket)=>{
    console.log('socket connected', socket.id)
        
    socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})

    socket.on('sendMessage', (message)=>{
        socket.broadcast.emit('message', message)
    })

    socket.on('sendBoard', (message)=>{
        socket.broadcast.emit('board', message)
    })
})

server.listen(PORT, ()=>{
    console.log('server running '+`http://localhost:${PORT}`)
})
