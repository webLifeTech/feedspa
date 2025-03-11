const mongoose = require('mongoose');
const async = require('async');
const feedspa = require('../services/feedspa');
const countryCode = require('../assets/countrycode');
const adminService = require('../services/adminservice');
const userModel = mongoose.model('Users');
const followModel = mongoose.model('FollowUsers');
const reportsModel = mongoose.model('Reports');
const feeds = mongoose.model('Feeds');
const comments = mongoose.model('Comments');
const musicsModel = mongoose.model('Musics');
const stickersModel = mongoose.model('Stickers');
const uid = require('uid');

// Get all users
exports.listUser = (req, res) => {
    userModel.find({}, {
        full_name: true,
        profile_pic: true,
        user_name: true,
        email: true,
        bio: true,
        mobile: true,
        blockstatus: true,
    })
        .skip(0)
        .limit(20)
        .sort({ 'created_at': -1 })
        .exec((err, response) => {
            res.json({
                status: true,
                result: response
            });
        });
}

// Get Online User ==> NOTE : This Is Pending
exports.onlineUser = (req, res) => {
    userModel.find({}, {
        full_name: true,
        profile_pic: true,
        user_name: true,
        email: true,
        bio: true,
        mobile: true,
        blockstatus: true,
    })
        .skip(0)
        .limit(20)
        .sort({ 'created_at': -1 })
        .exec((err, response) => {
            res.json({
                status: true,
                result: response
            });
        });
}

// Get Online Activity ==> NOTE : This Is Pending
exports.activity = (req, res) => {
    userModel.find({}, {
        full_name: true,
        profile_pic: true,
        user_name: true,
        email: true,
        bio: true,
        mobile: true,
        blockstatus: true,
    })
        .skip(0).limit(20).sort({ 'created_at': -1 })
        .exec((err, response) => {
            res.json({
                status: true,
                result: response
            })
        })
}

// Update profile data
exports.editProfile = (req, res) => {
    req.body.isEdit = true;
    feedspa.uniqueUserName(req.body, (username) => {
        req.body.user_name = username;
        userModel.update({
            _id: req.body._id,
        }, req.body).exec((errr, response) => {

            userModel.findOne({
                _id: req.body._id,
            }).exec((errr, userRes) => {

                res.json({
                    status: true,
                    message: 'Profile updated successfully.',
                    result: userRes
                });
            });
        });
    });
};

// Block User
exports.blockUser = (req, res) => {
    console.log(req.body)
    userModel.update({
        _id: req.body._id,
    }, req.body).exec((err, response) => {
        res.json({
            status: true,
            message: req.body.blockstatus ? 'User blocked now!' : 'User Unblocked now!',
        });
    });
};

// Delete User
exports.userDelete = (req, res) => {
    userModel.find({
        _id: req.body._id
    }).deleteOne((err, result) => {
        res.json({
            status: true,
            message: "User deleted successfully.",
        });
    });
}

//Get Following No & Followers No
exports.followList = (req, res) => {
    userModel.find({}, {
        full_name: true,
        user_name: true,
        blockstatus: true,
    })
        .skip(0)
        .limit(20)
        .lean()
        .sort({ 'created_at': -1 })
        .exec((err, response) => {
            userId = [];
            for (let i in response) {
                userId.push(response[i]._id);
            }
            followModel.find({
                $or: [
                    { my_id: { $in: userId } },
                    { follow_id: { $in: userId } },
                ]
            }).exec((err, followRes) => {
                for (let i in response) {
                    response[i].followingNo = 0;
                    response[i].followersNo = 0;
                    for (let fr in followRes) {
                        if (followRes[fr].my_id == response[i]._id) {
                            response[i].followingNo += 1;
                        }
                        if (followRes[fr].follow_id == response[i]._id) {
                            response[i].followersNo += 1;
                        }
                    }
                }
                res.json({
                    status: true,
                    result: response
                });
            });
        });
}

// Get User Comment
exports.commentList = (req, res) => {
    async.waterfall([
        (callback) => {
            comments.find({}).lean().exec((err, commentData) => {
                callback(null, commentData);
            })
        },
        (commentData, callback) => {
            userId = [];
            for (let i in commentData) {
                userId.push(commentData[i].user);
            }
            userModel.find({
                _id: { $in: userId }
            }, {
                full_name: true,
                user_name: true
            }).lean().exec((err, userByComment) => {
                for (let ind in commentData) {
                    for (let j in userByComment) {
                        if (commentData[ind].user.toString() == userByComment[j]._id) {
                            commentData[ind].full_name = userByComment[j].full_name;
                            commentData[ind].user_name = userByComment[j].user_name;
                            commentData[ind].noOfLikes = commentData[ind].likes.length;
                        }
                    }
                }
                callback(null, commentData);
            })
        }
    ], (callback,response) => {
        res.json({
            status: true,
            result: response,
        });

    });
}

// Delete Comment
exports.deleteComment = (req, res) => {
    comments.find({
        _id: req.body._id
    }).deleteOne((err, result) => {
        res.json({
            status: true,
            message: "Comment deleted successfully.",
        });
    });
}

// Dashboard
exports.dashboard = (req, res) => {
    async.parallel({
        // Total Registered Users
        one: (callback) => {
            userModel.find({}).count().exec((err, userCount) => {
                callback(null, userCount);
            })
        },
        // Total Online Users ==> NOTE : This Is Pending
        two: (callback) => {
            userModel.find({}).count().exec((err, onlineUCount) => {
                callback(null, onlineUCount);
            })
        },
        // Total Meetings ==> NOTE : This Is Pending
        three: (callback) => {
            userModel.find({}).count().exec((err, meetingCount) => {
                callback(null, meetingCount);
            })
        },
        // Total Clients ==> NOTE : This Is Pending
        four: (callback) => {
            userModel.find({}).count().exec((err, clientsCount) => {
                callback(null, clientsCount);
            })
        },
    }, (err, dashData) => {
        res.json({
            status: true,
            result: {
                totalUsers: dashData['one'],
                totalOnlineUsers: dashData['two'],
                totalClients: dashData['three'],
                totalMeetings: dashData['four']
            }
        })
    })
}

// User By Gender
exports.userByGender = (req, res) => {
    userModel.find({}, { gender: true }).exec((err, userGender) => {
        genderCount = { male: 0, female: 0, other: 0 };
        for (let i in userGender) {
            if (userGender[i].gender == 'male') {
                genderCount.male += 1;
            }
            if (userGender[i].gender == 'female') {
                genderCount.female += 1;
            }
            if (userGender[i].gender == 'other') {
                genderCount.other += 1;
            }
        }
        res.json({
            status: true,
            result: genderCount
        })
    })
}

// User By Mobile
exports.userByMobile = (req, res) => {
    userModel.find({}, {
        full_name: true,
        user_name: true,
        mobile: true,
        status: "Online", // Pending
    })
        .skip(0).limit(20).sort({ 'created_at': -1 })
        .exec((err, userMobile) => {
            res.json({
                status: true,
                result: userMobile
            })
        })
}

// Reports
exports.getReports = (req, res) => {
    async.waterfall([
        (callback) => {
            reportsModel.find({})
            .skip(0).limit(20).sort({ 'created_at': -1 })
            .lean().exec((err, reportsData) => {
                callback(null, reportsData);
            })
        },
        (reportsData, callback) => {
            itemId = [];
            for (let i in reportsData) {
                itemId.push(reportsData[i].item_id);
            }
            feeds.find({
                _id:{ $in: itemId }
            },{
                user:true,
                type:true,
                text:true,
                post:true,
                video_thumb:true,
            }).lean().exec((err, feedsData) => {
                for (let ind in reportsData) {
                    for (let j in feedsData) {
                        if (reportsData[ind].item_id == feedsData[j]._id) {
                            reportsData[ind].reportedId = feedsData[j].user;
                            reportsData[ind].postType = feedsData[j].type;
                            reportsData[ind].text = feedsData[j].text;
                            reportsData[ind].post = feedsData[j].post;
                            reportsData[ind].video_thumb = feedsData[j].video_thumb;
                        }
                    }
                }
                callback(null, reportsData);
            });
        },
        (reportsData, callback) => {
            userId = [];
            for (let i in reportsData) {
                userId.push(reportsData[i].user,reportsData[i].reportedId);
            }
            userModel.find({
                _id: { $in: userId }
            },{full_name: true,user_name: true}).lean().exec((err, userByRepId) => {
                for (let ind in reportsData) {
                    for (let j in userByRepId) {
                        if (reportsData[ind].user.toString() == userByRepId[j]._id) {
                            reportsData[ind].reporter = userByRepId[j].full_name
                        }
                        if(reportsData[ind].reportedId.toString() == userByRepId[j]._id){
                            reportsData[ind].reported = userByRepId[j].full_name;
                        }
                    }
                }
                callback(null, reportsData);
            })
        }], (err, result) => {
            res.json({
                status:true,
                result:result
            })
        }
    )
}

// Reports Delete
exports.reportDelete = (req, res) => {
    reportsModel.find({
        _id:req.body._id
    }).deleteOne((err, result) => {
        res.json({
            status: true,
            message: "Report deleted successfully!",
        });
    })
}

// Statistics
exports.getStatistics = (req, res) => {
    async.parallel({
        // Total Registered User
        one: (callback) => {
            userModel.find({}).count().exec((err, userCount) => {
                callback(null, userCount);
            })
        },

        // Total Online User ==> NOTE : This Is Pending
        two: (callback) => {
            userModel.find({}).count().exec((err, onlineUser) => {
                callback(null, onlineUser);
            });
        },
        // Total Post
        three: (callback) => {
            feeds.find({}).count().exec((err, feedsCount) => {
                callback(null, feedsCount);
            });
        },
        // Total Comment
        four: (callback) => {
            comments.find({}).count().exec((err, commentCount) => {
                callback(null, commentCount);
            })
        },
        // Total Stream ==> NOTE : This Is Pending
        five: (callback) => {
            feeds.find({}).count().exec((err, feedsCount) => {
                callback(null, feedsCount);
            });
        },
        // Total Feedback ==> NOTE : This Is Pending
        six: (callback) => {
            feeds.find({}).count().exec((err, feedsCount) => {
                callback(null, feedsCount);
            });
        },
        // Total Reports
        seven: (callback) => {
            reportsModel.find({}).count().exec((err, reportsCount) => {
                callback(null, reportsCount);
            });
        },
        // Total Messages ==> NOTE : This Is Pending
        eight: (callback) => {
            feeds.find({}).count().exec((err, feedsCount) => {
                callback(null, feedsCount);
            });
        },
    }, (err, statiData) => {
        res.json({
            status: true,
            result: {
                totalRegiUsers: statiData['one'],
                totalOnlineUsers: statiData['two'],
                totalPosts: statiData['three'],
                totalComments: statiData['four'],
                totalStream: statiData['five'],
                totalFeedback: statiData['six'],
                totalReports: statiData['seven'],
                totalMessages: statiData['eight']
            }
        })
    })
}

// Get User By Country
exports.userByCountry = (req, res) => {
    userModel.find({},{
        country_code: true,
        full_name: true,
        user_name: true,
    }).lean().exec((err, userData) => {
        count = 0;
        countryObj = [];
        for(let idx in userData){
            for(let i in countryCode){
                if(idx == 0){
                    countryObj[i] = {};
                    countryObj.totalCountry = 0;
                    /* i == 0 ? countryObj[i] = {
                        "count": 10,
                        "name": "USA"
                    } : i == 9 ? countryObj[i] = {
                        "count": 16,
                        "name": "Canada"
                    } : countryObj[i] = {}; */
                }
                if(countryCode[i].dial_code == userData[idx].country_code){
                    countryObj[i] = {
                        count :count += 1,
                        name :countryCode[i].name,
                    };
                    countryObj.totalCountry += 1;
                }
            }
        }
        // for(let dt in countryObj){
        //     if(Object.keys(countryObj[dt]).length !== 0 && countryObj[dt] !== Object){
        //         countryObj[dt] = countryObj[dt]
        //     }
        // }
        res.json({
            status: true,
            result : countryObj
        })
    })
}

// Add Sticker
exports.addMusic = (req, res) => {
    feedspa.uploadAssets('audio/', req.files.audio, uid(10)+'.mp3', (mp3Url)=> {
        req.body.audio = mp3Url;

        feedspa.uploadAssets('audio/', req.files.thumb, uid(10)+'.jpg', (thumbUrl)=> {
            req.body.thumb = thumbUrl;
            action();
        });
    });

    // Save data in db
    const action = () => {
        req.body.created_at = new Date();
        const musics = new musicsModel(req.body);

        musics.save((err, result) => {
            res.json({
                status : true,
                message: "Music Added successfully!",
            });
        });
    }
}

// Delete Music
exports.musicDelete = (req, res) => {
    musicsModel.find({
        _id:req.body._id
    }).deleteOne((err, result) => {
        res.json({
            status: true,
            message: "Music deleted successfully.",
        });
    })
}

// Add Sticker
exports.addSticker = (req, res) => {
    feedspa.uploadAssets('sticker/', req.files.file, uid(10)+'.jpg', (imageUrl) => {
        req.body.sticker = imageUrl;
        action();
    });
    const action = () => {
        req.body.created_at = new Date();
        const stickers = new stickersModel(req.body);
        stickers.save((err, result) => {
            res.json({
                status : true,
                message: "Stickers Added successfully!",
            })
        })
    }
}

// Delete Sticker
exports.deleteSticker = (req, res) => {
    stickersModel.find({
        _id:req.body._id
    }).deleteOne((err, result) => {
        res.json({
            status: true,
            message: "Sticker deleted successfully!",
        });
    })
}


