const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Раздаём статические файлы из текущей папки
app.use(express.static(__dirname));

// Храним подключённых пользователей (в памяти)
const users = {};

io.on('connection', (socket) => {
    console.log('Кто-то подключился:', socket.id);

    // Вход в чат / Регистрация сессии
    socket.on('join', (username) => {
        users[socket.id] = username || 'Аноним';
        
        // Уведомляем всех о новом игроке
        io.emit('chat message', {
            user: 'Система',
            text: `🎮 ${users[socket.id]} присоединился к чату!`,
            system: true
        });
    });

    // Получение сообщения от игрока
    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Аноним';
        io.emit('chat message', {
            user: username,
            text: msg,
            system: false
        });
    });

    // Отключение
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('chat message', {
                user: 'Система',
                text: `🚪 ${users[socket.id]} покинул чат.`,
                system: true
            });
            delete users[socket.id];
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
