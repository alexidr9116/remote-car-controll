const socketio = require('socket.io');
const activeUsers = new Set();


const sendMessageToChannel = (phoneNumber, msg, from) => {

    activeUsers.forEach((user) => {

        if (user.phoneNumber == phoneNumber) {
            if (user.socket.connected) {
                user.socket.emit("data-received", {...msg, from });
                // console.log({...msg, from }, " data sent... %s ", from);
            }

        }
    })
}
const initialize = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", (client) => {

        client.on("logined", data => {

            // console.log("logined", data);

            client.phoneNumber = data.phoneNumber;
            data.socket = client;
            activeUsers.add(data);
        });

        client.on("disconnect", () => {
            activeUsers.forEach((user) => {
                if (user.socket != null && (user.socket.id == client.id)) {
                    activeUsers.delete(user);
                }
            })

        })
    });
};

module.exports = {
    initialize,
    sendMessageToChannel
}