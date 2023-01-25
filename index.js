const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const io = new Server(server,
    {
        cors: {
            origin:'https://rps-new.vercel.app/',
            methods:['GET', 'POST']
        }
    }
);
const port = 3000;

app.get('/', (req,res)=>{
    res.send('working')
})

//подключение к сайту
app.use(cors())

let room;
let compareArray = []

io.on('connection', (socket) => {

    //присоединяем юзера к комнате
    socket.on('join room', (roomID)=>{
        room = roomID
        socket.join(roomID);
        
        socket.on('player_current_element', (PlayerMove)=>{
            compareArray.push(PlayerMove)
            console.log(compareArray);
            if (compareArray.length == 2) {
                let player1_elem = compareArray[0]
                let player2_elem = compareArray[1]

                //если НИЧЬЯ
                if (player1_elem.chosenElement == player2_elem.chosenElement) {
                    io.in(room).emit('send result', 'DRAW!')
                    compareArray = []
                }

                //если побеждает ПЕРВЫЙ
                if ((player1_elem.chosenElement == 'rock' && player2_elem.chosenElement == 'scissors') || 
                (player1_elem.chosenElement == 'paper' && player2_elem.chosenElement == 'rock') ||
                (player1_elem.chosenElement == 'scissors' && player2_elem.chosenElement == 'paper')) {

                    //отправка результатов каждому игрроку
                    io.to(player1_elem.playerID).emit('send result', 'WIN!')
                    io.to(player2_elem.playerID).emit('send result', 'MISS!')
                    compareArray = []
                }

                //если побеждает ВТОРОЙ
                if ((player2_elem.chosenElement == 'rock' && player1_elem.chosenElement == 'scissors') || 
                (player2_elem.chosenElement == 'paper' && player1_elem.chosenElement == 'rock') ||
                (player2_elem.chosenElement == 'scissors' && player1_elem.chosenElement == 'paper')) {
                    
                    //отправка результатов каждому игрроку
                    io.to(player2_elem.playerID).emit('send result', 'WIN!')
                    io.to(player1_elem.playerID).emit('send result', 'MISS!')
                    compareArray = []
                }     
            }
        })
    })

    //получение сообщения сервером и отправка их юзеру
    socket.on('send message', (message)=>{
        io.to(room).emit('getMessage', message)
    })
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});