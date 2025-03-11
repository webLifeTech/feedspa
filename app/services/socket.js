const mongoose = require('mongoose');
const chatService = require('./chat');

const userModel = mongoose.model('Users');
exports.deviceToken = [];
let SOCKET = null;


module.exports.setSocket = (socket) => {
    SOCKET = socket;

	socket.on('disconnect', ()=> {
        let disUser = "";

        for (let i in exports.deviceToken) {
            if (exports.deviceToken[i].socketId == socket.id) {
                disUser = exports.deviceToken[i].userId;
            }
        }

        if (disUser) {
            userModel.updateOne({
                _id: disUser,
            },{
                lastSeen: new Date()
            }).exec((err, updateRes) => {
                socket.broadcast.emit('userOffline',{
                    userId: disUser,
                    status: false,
                    lastSeen: new Date()
                });
                delete exports.deviceToken[disUser];
            });
        }
    });


    socket.on('userConnected', (user) => {
        if(user && user.userId) {
            exports.deviceToken[user.userId] = {};
            exports.deviceToken[user.userId].token = user.token;
            exports.deviceToken[user.userId].userId = user.userId;
            exports.deviceToken[user.userId].socketId = socket.id;
            exports.deviceToken[user.userId].socket = socket;

            socket.broadcast.emit('userOffline',{
                userId: user.userId,
                status: true,
            });

            if (user.token && user.userId) {
                userModel.findOne({
                   _id: user.userId
                }).exec((err, data) => {
                    data.fcmToken = user.token;
                    data.save();
                });
            }
        }
    });

   socket.on('readMessage', (data)=> {
       chatService.readMessage(data);
   });

   socket.on('getUnreadMsgCount', (data)=> {
       chatService.getUnreadMsgCount(data, (ress)=>{
           if (exports.deviceToken[data.userId]) {
               exports.deviceToken[data.userId].socket.emit('getUnreadMsgCount', ress);
           }
       });
   });

   socket.on('requestDecline', (data)=> {
      if (exports.deviceToken[data.sender]) {
         exports.deviceToken[data.sender].socket.emit('requestDecline', data);
      }
      if (exports.deviceToken[data.receiver]) {
         exports.deviceToken[data.receiver].socket.emit('requestDecline', data);
      }
   });
};

exports.fireSocket = (data) => {
    if (exports.deviceToken[data.userId]
        && exports.deviceToken[data.userId].socket) {
        exports.deviceToken[data.userId].socket.emit(data.emit, data);
    }
}

exports.deletePost = (data) => {
    SOCKET.broadcast.emit('deletePost', data);
}