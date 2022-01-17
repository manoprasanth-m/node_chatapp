const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const filter = require('bad-words')
const {generateMessage, generateLocation} = require('../utils/messages')
const {addUser, removeUser, getUsersInRoom, getUser} = require('../utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin',`${user.username} has left!`))

            io.to(user.room).emit('roomdata',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
        
    })

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)
        
            const Filter = new filter()
            if(Filter.isProfane(message)) {
                return callback('Not allowed')
            }
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback('Delivered')
        
    })

    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)
        
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Delivered')
        
    })

    socket.on('join', ({username,room}, callback) => {

        const {error, user} = addUser({id: socket.id, username,room})

        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('admin','welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('admin',`${user.username} has joined`))

        io.to(user.room).emit('roomdata',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})


//socket.emit, io.emit, socket.broadcast.emit
//io.to.emit. socket.broadcast.to.emit