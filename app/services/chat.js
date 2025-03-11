// const mongoose = require('mongoose');
// const socketSer = require('./socket');
// const pushNotify = require('./pushnotify');
// const helper = require('./helper');

// const chatModel = mongoose.model('Chats');
// const userModel = mongoose.model('Users');
// const friendModel = mongoose.model('Friends');


// /**
//  * Post chat
//  */
// exports.postChat = (req, res) => {
//     req.body.createdAt = new Date();
//     const model = new chatModel(req.body);

//     model.save((err, result) => {

//         if (socketSer.deviceToken[req.body.reciever]) {
//             socketSer.deviceToken[req.body.reciever].socket.emit('sentMessage', result);
//             socketSer.deviceToken[req.body.reciever].socket.emit('unreadMsgCount', result);
//         } else {
//             userModel.findOne({
//                 _id: req.body.sender
//             },{
//                 firstName: true,
//                 lastName: true,
//             }).exec((err, suser) => {
//                 pushNotify.pushNotification({
//                     userId: req.body.reciever,
//                     title: suser.firstName+' '+suser.lastName,
//                     body: 'Sent a message.',
//                 });
//             });
//         }

//         res.json({
//             status: true,
//             result: result
//         });
//     });
// }


// /**
//  * Get chat
//  */
// exports.getMessages = (req, res) => {
//     chatModel.find({
//         sender: req.body.sender,
//         reciever: req.body.reciever,
//     }, {
//         message: true,
//         reciever: true,
//         sender: true,
//         isRead: true,
//         createdAt: true
//     }).exec((err, res1) => {
//         chatModel.find({
//             sender: req.body.reciever,
//             reciever: req.body.sender,
//         }, {
//             message: true,
//             reciever: true,
//             sender: true,
//             isRead: true,
//             createdAt: true
//         }).exec((err, res2) => {
//             let data = res1.concat(res2);
//             data = helper.sortByKey(data, 'createdAt');
//             res.json({
//                 status: true,
//                 result: data
//             });
//         });
//     });
// }


// /** 
//  * Get Friends
//  */
// exports.getChatUsers = (req, res) => {
//     try {
//         friendModel.find({
//             $or:[
//                 { sender: req.body.userId },
//                 { receiver: req.body.userId}
//             ],
//             status: true
//         }).exec((err, friends) => {
//             let ff = [];

//             if (friends && friends.length) {
//                 for (var i in friends) {
//                     if (friends[i].sender == req.body.userId) {
//                         ff.push(friends[i].receiver);
//                     }
//                     if (friends[i].receiver == req.body.userId) {
//                         ff.push(friends[i].sender);
//                     }
//                 }
//             }

//             userModel.find({
//                 _id: {$in: ff}
//             },{
//                 firstName: true,
//                 lastName: true,
//                 avatar: true,
//                 createdAt: true,
//                 lastSeen: true,
//             }).lean().exec((err, result) => {
//                 for (var i in result) {
//                     result[i].count = 0;
//                     if (socketSer.deviceToken[result[i]._id]) {
//                         result[i].online = true;
//                     }
//                 }

//                 chatModel.find({
//                     sender: {$in: ff},
//                     reciever: req.body.userId,
//                     isRead: false,
//                 },{
//                     sender: true
//                 }).exec((err, unreadChats) => {
//                     for (var i in result) {
//                         for (var j in unreadChats) {
//                             if (result[i]._id == unreadChats[j].sender) {
//                                 result[i].count += 1;
//                             }
//                         }
//                     }

//                     res.json({
//                         status: true,
//                         result: helper.sortByKeyDesc(result, 'count')
//                     });
//                 });
//             });
//         });
//     }catch(errr) {
//         res.json({
//             status: false,
//             result: []
//         });
//     }
// }


// /** 
//  * Get Friends
//  */
// exports.getUnreadMsgCount = (data, cb) => {
//     friendModel.find({
//         $or:[
//             { sender: data.userId },
//             { receiver: data.userId}
//         ],
//         status: true
//     }).exec((err, friends) => {
//         let ff = [];

//         if (friends && friends.length) {
//             for (var i in friends) {
//                 if (friends[i].sender == data.userId) {
//                     ff.push(friends[i].receiver);
//                 }
//                 if (friends[i].receiver == data.userId) {
//                     ff.push(friends[i].sender);
//                 }
//             }
//         }

//         chatModel.count({
//             sender: {$in: ff},
//             reciever: data.userId,
//             isRead: false,
//         }).exec((err, chatCount) => {
//             cb({
//                 status: true,
//                 result: chatCount || 0
//             });
//         });
//     });
// }


// /** 
//  * Read Messages
//  */
// exports.readMessage = (data) => {
//     chatModel.updateOne({
//         sender: data.sender,
//         reciever: data.reciever,
//         isRead: false,
//     },{
//         isRead: true
//     }, {multi: true}).exec((err, unreadChats) => {});
// }