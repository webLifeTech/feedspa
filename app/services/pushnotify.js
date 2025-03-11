const mongoose = require('mongoose');
const userModel = mongoose.model('Users');
const FCM = require('fcm-node');
const serverKey = require('../heloo-world-a6b5f-firebase-adminsdk-2kbv3-f0bdb405e1.json');
const fcm = new FCM(serverKey);
const socket = require('./socket');


exports.pushNotification = function(data) {
    try {
        if (socket.deviceToken[data.userId]) {
            return;
        }

        userModel.findOne({
            _id: data.userId
        },{
            fcmToken: true,
        }).exec((err, userRes) => {
            if (userRes && userRes.fcmToken) {
                fcm.send({
                    to: userRes.fcmToken,
                    notification: {
                        title: data.title,
                        body: data.body,
                        sound : 'default',
                        icon: 'https://lh3.googleusercontent.com/zCq_HJQYKbbO2aMpUiyPq-HXHGf3l54Ykh7htua35n1Qoy72hcmdaJsXJ-fEF0KKFBfk=s180-rw'
                    }
                }, function(err, response) {
                    if (err) {
                        console.log("Something has gone wrong! ", err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            }
        });
    } catch(erre) {
        console.log("Something has gone wrong! ", erre);
    }
}


exports.notifyToFriends = function(data) {
    try {
        const sendNotify = (token) => {
            fcm.send({
                to: token,
                notification: {
                    title: data.title,
                    body: data.body,
                    sound : 'default'
                }
            }, function(err, response) {
                if (err) {
                    console.log("Something has gone wrong! ", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }

        userModel.find({
            _id: {$in: data.friends}
        },{
            fcmToken: true,
        }).exec((err, userRes) => {
            if (userRes && userRes.length) {
                for (var i in userRes) {
                    if (userRes[i].fcmToken) {
                        sendNotify(userRes[i].fcmToken);
                    }
                }
            }
        });
    } catch(errr) {
        console.log(errr);
    }
}