const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const io = new Server(server,
    {
        cors: {
            origin:'http://localhost:5173',
            methods:['GET', 'POST']
        }
    }
);
const port = 3000;

app.get('/', (req,res)=>{
    res.send('working')
})

app.use(cors())

let room;

io.on('connection', (socket) => {
    console.log(socket.id);

    //присоединяем юзера к комнате
    socket.on('join room', (roomID)=>{
        let elementArray = []
        room = roomID
        socket.join(roomID);
        
        socket.on('player_current_element', (current_element)=>{
            elementArray.push(current_element)
            if (elementArray.length == 2) {
                let player1_elem = elementArray[0]
                let player2_elem = elementArray[1]
                
                if (player1_elem == player2_elem) {
                    io.in(room).emit(send)
                }
                
            }
        })
    })

    //получение сообщения сервером и отправка их юзеру
    socket.on('send message', (message)=>{
        io.in(room).emit('getMessage', message)
    })
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});