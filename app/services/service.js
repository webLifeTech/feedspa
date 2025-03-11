// const mongoose = require('mongoose');
// const uid = require('uid');
// const async = require('async');

// const postModel = mongoose.model('UserPost');
// const userModel = mongoose.model('Users');
// const notificationModel = mongoose.model('Notifications');
// const friendModel = mongoose.model('Friends');
// const commentModel = mongoose.model('PostComments');
// const reportSpamModel = mongoose.model('ReportSpam');


// //Service
// const bucketService = require("./bucket");
// const helper = require('./helper');
// const pushNotify = require('./pushnotify');
// const socket = require('./socket');


// /**
//  * get Data
//  */
// module.exports.uploadPost = (data) => {
//     return new Promise((resolve, reject) => {
//         if (data.type == 1) {
//             data.user = mongoose.Types.ObjectId(data.userId);
//             data.topic = data.topic.split(',');
//             data.createdAt = new Date();

//             const model = new postModel(data);

//             model.save(function(err, result) {
//                 if (err) {
//                     reject({status:500,message:'Internal Server Error'});
//                 } else{
//                     resolve({status:200,result:result});
//                 }
//             });
//         }

//         if (data.type == 2) {
//             data.user = mongoose.Types.ObjectId(data.userId);
//             data.topic = data.topic.split(',');
//             data.createdAt = new Date();

//             helper.uploadService(data, (file)=> {
//                 data.post = file;
//                 const model = new postModel(data);

//                 model.save(function(err, result) {
//                     if (err) {
//                         reject({status:500,message:'Internal Server Error'});
//                     } else{
//                         resolve({status:200,result:result});
//                     }
//                 });
//             });
//         }

//         if (data.type == 3) {
//             data.user = mongoose.Types.ObjectId(data.userId);
//             data.topic = data.topic.split(',');
//             data.createdAt = new Date();

//             helper.uploadService(data, (fileRes)=> {
//                 if (fileRes.fileName) {
//                     data.post = fileRes.fileName;
//                     data.thumbnail = fileRes.thumbnail;

//                     const model = new postModel(data);

//                     model.save(function(err, result) {
//                         if (err) {
//                             reject({status:500,message:'Internal Server Error'});
//                         } else{
//                             resolve({status:200,result:result});
//                         }
//                     });
//                 } else {
//                     reject({status:500,message:'Internal Server Error'});
//                     return;
//                 }
//             });
//         }

//         userModel.findOne({
//             _id: data.userId,
//         },{
//             firstName: true,
//             lastName: true,
//             friends: true,
//         }).exec((err, userRes) => {
//             pushNotify.notifyToFriends({
//                 user: data._fuid,
//                 title: 'Heloo World!',
//                 body: userRes.firstName +' '+ userRes.lastName + ' Added new post!',
//                 friends: userRes.friends
//             });
//         });
//     });
// }


// /**
//  * Upload profile
//  */
// module.exports.uploadProfile = (data) => {
//     return new Promise((resolve, reject) => {
//         helper.uploadProfile(data, (file)=> {
//             userModel.updateOne({
//                 _id: data.userId,
//             }, {
//                 avatar: file
//             }).exec((err, updateRes) => {
//                 resolve({ status: 200, message: 'Profile updated Successfully', result:file })
//             });
//         });
//     });
// }

// /**
//  * Get popular Data
//  */
// module.exports.getPopularPost = (data) => {
//     return new Promise((resolve, reject) => {
//         postModel.countDocuments({}).exec((err, count) => {
//             postModel.find({})
//             .skip(data.skip)
//             .limit(10)
//             .populate({ path: 'user', select: 'firstName lastName avatar uid'})
//             // .sort({ 'shares': -1, "comments": -1, "likes": -1 })
//             .sort({ 'createdAt': -1 })
//             .exec((err, response) => {
//                 resolve({ status: 200, message: 'Post get Successfully.', result: response, count: 193 });
//             });
//         });
//     });
// }

// /**
//  * Get relative post
//  */
// module.exports.getRelativesPost = (data) => {
//     return new Promise((resolve, reject) => {
//         friendModel.find({
//             $or:[
//                 { sender: data.userId },
//                 { receiver: data.userId}
//             ],
//             status: true
//         }).exec((err, friends) => {
//             let ff = [];

//             if (friends && friends.length) {
//                 for (var i in friends) {
//                     if (friends[i].sender == data.userId) {
//                         ff.push(friends[i].receiver);
//                     }
//                     if (friends[i].receiver == data.userId) {
//                         ff.push(friends[i].sender);
//                     }
//                 }
//             }

//             postModel.countDocuments({
//                 user: { $in: ff },
//             }).exec((err, count) => {
//                 postModel.find({
//                     user: { $in: ff }
//                 })
//                 .skip(data.skip)
//                 .limit(20)
//                 .populate({ path: 'user', select: 'firstName lastName avatar'}).sort({ 'createdAt': -1 }).exec((err, result) => {
//                     resolve({ status: 200, message: 'Post get Successfully.', result: result, count: count });
//                 });
//             });
//         });
//     });
// }




// /**
//  * Remove post
//  */
// module.exports.remove = (data) => {
//     return new Promise((resolve, reject) => {
//         postModel.remove({
//             _id: data.postId,
//         }).exec(function (err, result) {

//             commentModel.find({
//                 postId: data.postId
//             }).remove((err, response) => {});

//             notificationModel.find({
//                 postImg: data.post
//             }).remove((err, response) => {});

//             if (data.type == 2 || data.type == 3) {
//                 const bucket = bucketService.initBucket('hello-world-app');
//                 const b1 = bucket.file(data.post);

//                 b1.delete(function (err, apiResponse) {
//                     socket.deletePost({
//                         postId: data.postId
//                     });
//                     resolve({ status: 200, message: 'Post Deleted successfully' });
//                 });

//                 if (data.type == 3 && data.thumbnail) {
//                     const bucket = bucketService.initBucket('hello-world-app');
//                     const b1 = bucket.file(data.thumbnail);
//                     b1.delete(function (err, apiResponse) {});
//                 }
//             } else {
//                 socket.deletePost({
//                     postId: data.postId
//                 });
//                 resolve({ status: 200, message: 'Post Deleted successfully' });
//             }
//         });
//     });
// }




// /** 
//  * Post like
//  */
// module.exports.like = (data) => {
//     return new Promise((resolve, reject) => {
//         let action = {
//             $push: { likes: data.userId }
//         }

//         if (data.key == 2) {
//             action = {
//                 $pull: { likes: data.userId }
//             }
//         }

//         postModel.updateOne({
//             _id: data.postId,
//         }, action).exec((err, updateRes) => {

//             if (data.key == 1 && data.postUser != data.userId) {
//                 data.postUser = data.postUser;
//                 data.postImg = data.postImg;
//                 data.title = 'Like Your post';
//                 data.message = '';
//                 data.createdAt = new Date();
//                 data.user = mongoose.Types.ObjectId(data.userId);
//                 helper.postNotify(data);

//                 socket.fireSocket({
//                     emit: 'newNotification',
//                     userId: data.postUser,
//                     key: 'like'
//                 });
//             }

//             resolve({ status: 200, message: 'Post Like Successfully', result:updateRes })
//         });
//     });
// }


// /** 
//  * @param {objectId} data userId 
//  */
// module.exports.getProfile = (data) => {
//     return new Promise((resolve, reject) => {
//         userModel.findOne({
//             _id: data.userId,
//         }).lean().exec(function (err, result) {
//             async.parallel({
//                 myFriends: function (callback) {
//                     friendModelcountDocuments({
//                         userId: '' + result._id,
//                     }).exec((err, postCount) => {
//                         result.posts = postCount;
//                         callback();
//                     });
//                 },
//                 imYourFriend: function (callback) {
//                     postModelcountDocuments({
//                         userId: '' + result._id,
//                     }).exec((err, postCount) => {
//                         result.posts = postCount;
//                         callback();
//                     });
//                 },
//             }, function (err, results) {
//                 resolve({ status: 200, result: result })
//             });
//         });
//     })
// }


// /** 
//  * Get My post
//  */
// module.exports.myPost = (data) => {
//     return new Promise((resolve, reject) => {
//         postModel.find({
//             user: mongoose.Types.ObjectId(data.userId),
//         })
//         .skip(data.skip)
//         .limit(20)
//         .populate({path: 'user', select: 'firstName lastName avatar'}).sort({ 'createdAt': -1 }).exec((err, response) => {
//             resolve({ status: 200, message: 'Post get Successfully.', result: response });
//         });
//     });
// }


// /** 
//  * Get my notifications
//  */
// module.exports.notifications = (data) => {
//     return new Promise((resolve, reject) => {
//         notificationModel.find({
//             postUser: data.userId,
//             createdAt: { $gte: new Date((new Date().getTime() - (10 * 24 * 60 * 60 * 1000))) }
//         })
//         .populate({path: 'user', select: 'firstName lastName avatar'})
//         .sort({ 'createdAt': -1 }).exec((err, response) => {
//             if (err) {
//                 reject({ status: 500, message: 'Internal Server Error.' })
//             } else {
//                 resolve({ status: 200, result: response })
//             }
//         });
//     })
// }


// /** 
//  * Clean Notify
//  */
// module.exports.cleanNotify = (data) => {
//     return new Promise((resolve, reject) => {
//         notificationModel.find({
//             postUser: mongoose.Types.ObjectId(data.userId),
//         }).remove((err, response) => {
//             if (err) {
//                 reject({ status: 500, message: 'Internal Server Error.' })
//             } else {
//                 resolve({ status: 200, result: response })
//             }
//         });
//     })
// }


// /** 
//  * @param {objectId} data userName
//  */
// module.exports.search = (data) => {
//     return new Promise((resolve, reject) => {
//         const ii = new RegExp(".*"+data.text+".*", "i");

//         userModel.find({
//             _id: {$ne: data.userId},
//             $or:[
//                 { firstName: { $regex: ii }},
//                 { lastName: { $regex: ii }},
//                 { email: { $regex: ii }}
//             ]
//         }, {
//             firstName: true,
//             lastName: true,
//             uid: true,
//             avatar: true,
//             createdAt: true,
//         }).limit(20).exec((err, result) => {
//             if (err) {
//                 reject({status:500,message:'Internal Server Error'})
//             } else{
//                 resolve({status:200,result:result})
//             }
//         });
//     });
// }


// /** 
//  * Follow to other
//  */
// module.exports.follow = (data) => {
//     return new Promise((resolve, reject) => {

//         const model = new friendModel({
//             receiver: data.receiver,
//             sender: data.sender,
//             createdAt: new Date()
//         });
//         model.save(function(err, result) {
//             helper.postNotify({
//                 postUser: data.receiver,
//                 title: 'Sent You a friend request!',
//                 createdAt: new Date(),
//                 user: mongoose.Types.ObjectId(data.sender)
//             });

//             socket.fireSocket({
//                 emit: 'newNotification',
//                 userId: data.receiver,
//                 key: 'fRequest'
//             });

//             userModel.findOne({
//                 _id: data.sender,
//             },{
//                 firstName: true,
//                 lastName: true,
//             }).exec((err, userRes) => {
//                 pushNotify.pushNotification({
//                     userId: data.receiver,
//                     title: 'Heloo World!',
//                     body: userRes.firstName +' '+ userRes.lastName + ' Sent You a friend request!',
//                 });
//             });

//             resolve({ status: 200, message: 'Request Successfully', result:true })
//         });
//     });
// }


// /** 
//  * Reject Followers
//  */
// module.exports.rejectFollowReq = (data) => {
//     return new Promise((resolve, reject) => {
//         friendModel.find({
//             sender: data.sender,
//             receiver: data.receiver,
//         }).deleteOne((err, rmRes) => {

//             friendModel.find({
//                 receiver: data.sender,
//                 sender: data.receiver,
//             }).deleteOne((err, rmRes1) => {
//                 resolve({ status: 200, message: 'Unfriend Successfully', result:true });
//             });
//         });
//     });
// }


// /** 
//  * Get friend request
//  */
// module.exports.getFriendRequest = (data) => {
//     return new Promise((resolve, reject) => {
//         async.parallel({
//             sent: function (callback) {
//                 friendModel.find({
//                     sender: data.userId,
//                     status: false
//                 }).exec((err, reqRes) => {
//                     if (reqRes && reqRes.length) {
//                         let users = [];
//                         for (var i in reqRes) {
//                             users.push(reqRes[i].receiver);
//                         }
           
//                         userModel.find({
//                             _id: { $in: users }
//                         },{
//                             firstName: true,
//                             lastName: true,
//                             avatar: true,
//                             createdAt: true,
//                         }).exec((err, result) => {
//                             callback(null,result);
//                         });
//                     } else {
//                         callback(null,[]);
//                     }
//                 });
//             },
//             receave: function (callback) {
//                 friendModel.find({
//                     receiver: data.userId,
//                     status: false
//                 }).exec((err, reqRes) => {
//                     if (reqRes && reqRes.length) {
//                         let users = [];
//                         for (var i in reqRes) {
//                             users.push(reqRes[i].sender);
//                         }

//                         userModel.find({
//                             _id: { $in: users }
//                         },{
//                             firstName: true,
//                             lastName: true,
//                             avatar: true,
//                             createdAt: true,
//                         }).exec((err, result) => {
//                             callback(null, result);
//                         });
//                     } else {
//                         callback(null, []);
//                     }
//                 });
//             },
//         }, function (err, results) {
//             resolve({ status: 200, result: {
//                 receive: results.receave,
//                 sent: results.sent,
//             }})
//         });
//     });
// }




// /** 
//  * Get Friends
//  */
// exports.getFriends = (data) => {
//     return new Promise((resolve, reject) => {
//         friendModel.find({
//             $or:[
//                 { sender: data.userId },
//                 { receiver: data.userId}
//             ],
//             status: true
//         }).exec((err, friends) => {
//             if (friends && friends.length) {
//                 let ff = [];
//                 for (var i in friends) {
//                     if (friends[i].sender == data.userId) {
//                         ff.push(friends[i].receiver);
//                     }
//                     if (friends[i].receiver == data.userId) {
//                         ff.push(friends[i].sender);
//                     }
//                 }

//                 userModel.find({
//                     _id: {$in: ff}
//                 },{
//                     firstName: true,
//                     lastName: true,
//                     avatar: true,
//                     createdAt: true,
//                 }).exec((err, result) => {
//                     resolve({ status: 200, message: 'Get friends Successfully', result:result });
//                 });
//             } else {
//                 resolve({ status: 200, message: 'Get friends Successfully', result:[] });
//             }
//         });
//     });
// }


// /** 
//  * @param {object} data details
//  */
// module.exports.acceptRequest = (data) => {
//     return new Promise((resolve, reject) => {
//         if (data.key == 1) {
//             friendModel.updateOne({
//                 receiver: data.receiver,
//                 sender: data.sender,
//             },{
//                 status: true,
//             }).exec((err, updateRes) => {
//                 socket.fireSocket({
//                     emit: 'newFriend',
//                     userId: data.sender,
//                     receiver: data.receiver,
//                     sender: data.sender,
//                     key: 'accept'
//                 });

//                 helper.postNotify({
//                     postUser: data.sender,
//                     title: 'Accept you friend request!',
//                     createdAt: new Date(),
//                     user: mongoose.Types.ObjectId(data.receiver)
//                 });

//                 userModel.findOne({
//                     _id: data.receiver,
//                 },{
//                     firstName: true,
//                     lastName: true,
//                 }).exec((err, userRes) => {
//                     pushNotify.pushNotification({
//                         userId: data.sender,
//                         title: 'Heloo World!',
//                         body: userRes.firstName +' '+ userRes.lastName + ' Accept your friend request!',
//                     });
//                 });

//                 resolve({ status: 200, message: 'Accept Successfully', result:updateRes })
//             });
//         }

//         if (data.key == 2) {
//             console.log(data);

//             friendModel.deleteOne({
//                 sender: data.sender,
//                 receiver: data.receiver,
//             }).exec((err, v1) => {
//                 console.log("v1 >>>", v1);

//                 friendModel.deleteOne({
//                     sender: data.receiver,
//                     receiver: data.sender,
//                 }).exec((err, v2) => {
//                     console.log("v2 >>>", v2);
//                     resolve({ status: 200, message: 'Decline Successfully', result:true })
//                 });
//             });
//         }
//     });
// }


// /** 
//  * @param {object} data details
//  */
// module.exports.postComment = (data) => {
//     return new Promise((resolve, reject) => {
//         data.user = mongoose.Types.ObjectId(data.userId);
//         data.createdAt = new Date();

//         const model = new commentModel(data);

//         model.save(function(err, result) {
//             if (err) {
//                 reject({status:500,message:'Internal Server Error'});
//             } else{
//                 postModel.updateOne({
//                     _id: data.postId
//                 },{
//                     $inc: { comments: 1 }
//                 }).exec((err, upRes) => {});

//                 if (data.postUser != data.userId) {
//                     helper.postNotify({
//                         postUser: data.postUser,
//                         title: 'Commented on your post!',
//                         createdAt: new Date(),
//                         user: mongoose.Types.ObjectId(data.userId)
//                     });

//                     socket.fireSocket({
//                         emit: 'newNotification',
//                         userId: data.postUser,
//                         key: 'comment'
//                     });
//                 }

//                 resolve({status:200,result:result});
//             }
//         });
//     });
// }

// /** 
//  * @param {object} data details
//  */
// module.exports.deleteComment = (data) => {
//     return new Promise((resolve, reject) => {
//         commentModel.remove({
//             _id: data._id
//         }).exec((err, response) => {
//             postModel.updateOne({
//                 _id: data.postId
//             },{
//                 $inc: { comments: -1 }
//             }).exec((err, upRes) => {});

//             resolve({ status: 200, message: 'Deleted Successfully.', result: response });
//         });
//     });
// }

// /** 
//  * @param {object} data details
//  */
// module.exports.getComment = (data) => {
//     return new Promise((resolve, reject) => {
//         commentModel.find({
//             postId: data.postId
//         })
//         .skip(data.skip)
//         .limit(20)
//         .populate({ path: 'user', select: 'firstName lastName avatar'})
//         .sort({ 'createdAt': 1 })
//         .exec((err, response) => {
//             resolve({ status: 200, message: 'Comment get Successfully.', result: response });
//         });
//     });
// }

// /** 
//  * Share count in post
//  */
// module.exports.shareCount = (data) => {
//     return new Promise((resolve, reject) => {
//         postModel.updateOne({
//             _id: data.postId
//         },{
//             $inc: { shares: 1 }
//         }).exec((err, upRes) => {
//             resolve({ status: 200, message: 'Share Successfully.', result: upRes });
//         });
//     });
// }

// /** 
//  * Report Spam
//  */
// module.exports.reportSpam = (data) => {
//     return new Promise((resolve, reject) => {
//         data.createdAt = new Date();

//         const model = new reportSpamModel(data);

//         model.save(function(err, result) {
//             if (err) {
//                 reject({status:500,message:'Internal Server Error'});
//             } else{
//                 resolve({status:200,result:result});
//             }
//         });
//     });
// }