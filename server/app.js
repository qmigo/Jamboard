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
    socket.on('sendMessage', (message)=>{
        socket.broadcast.emit('message', message)
    })
    socket.on('sendBoard', (message)=>{
        // console.log(message)
        socket.broadcast.emit('board', message)
    })

    socket.on('disconnect', (message)=>{
        console.log('Socket disconnected');
    })
})
app.get('/', (req, res)=>{
    res.end('hi')
})

server.listen(PORT, ()=>{
    console.log('server running '+`http://localhost:${PORT}`)
})
