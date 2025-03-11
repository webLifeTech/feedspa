const path = require('path');
const uid = require('uid');
const fs = require('fs');
const async = require('async');
const mongoose = require('mongoose');

const feedspa = require('../services/feedspa');
const feedsModel = mongoose.model('Feeds');
const commentModel = mongoose.model('Comments');
const followModel = mongoose.model('FollowUsers');
const savedFeedModel = mongoose.model('SavedFeeds');
const reportModel = mongoose.model('Reports');


// Add new feed
exports.add = (req, res) => {
    feedspa.getTagsAndTopics(req.body, (tagRes) => {
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.user = mongoose.Types.ObjectId(req.body.userId);
        req.body.tag_topic = tagRes;

        const feed = new feedsModel(req.body);
        feed.save((err, result) => {

            res.json({
                status: true,
                message: "Feed created successfully.",
                result: result
            });
        });
    });
}
// Post feed with (images/videos)
exports.mediaPost = (req, res) => {

    let fileName = uid(10)+'.jpg';

    if (req.body.type == 2) {
        fileName = uid(10)+'.mp4';
    }

    feedspa.uploadAssets('media/', req.files.media, fileName, (url)=> {
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.user = mongoose.Types.ObjectId(req.body.userId);
        req.body.feed_style = JSON.parse(req.body.feed_style);
        req.body.post = url;

        if (req.body.type == 2) {
            feedspa.generateThumb(url, (thumb) => {
                req.body.video_thumb = thumb;
                action();
            });
        } else {
            action();
        }
    });

    // Save data in db
    const action = () => {
        const feed = new feedsModel(req.body);

        feed.save((err, result) => {

            res.json({
                status: true,
                message: "Feed created successfully.",
                result: result
            });
        });
    }
}
// Get feeds
exports.get = (req, res) => {
    if (!req.body.skip) {
        req.body.skip = 0;
    }
    feedsModel.find({}).skip(req.body.skip).limit(20).populate({
        path: 'user',
        select: 'full_name profile_pic'
    }).sort({
        'created_at': -1
    }).lean().exec((err, response) => {

        feedspa.feedCommentsCount(response, (data) => {
            res.json({
                status: true,
                result: data,
            });
        });
    });
}
// Delete feed
exports.delete = (req, res) => {
    feedsModel.find({
        _id: req.body.postId
    }).remove((err, result) => {

        commentModel.find({
            feed: mongoose.Types.ObjectId(req.body.postId)
        }).remove((err, result) => {});

        savedFeedModel.find({
            feed: mongoose.Types.ObjectId(req.body.postId)
        }).remove((err, result) => {});


        res.json({
            status: true,
            message: "Feed deleted successfully.",
        });
    });
}
// Like feed
exports.like = (req, res) => {
    let action = {
        $push: {
            likes: req.body.userId
        }
    }
    if (req.body.key == 2) {
        action = {
            $pull: {
                likes: req.body.userId
            }
        }
    }
    feedsModel.updateOne({
        _id: req.body._id
    }, action).exec((err, result) => {

        res.json({
            status: true,
            message: "Like successfully.",
        });
    });
}
// Add feed share count
exports.share = (req, res) => {
    feedsModel.updateOne({
        _id: req.body._id
    }, {
        $inc: {
            share_count: 1
        }
    }).exec((err, result) => {

        res.json({
            status: true,
            message: "Share successfully.",
        });
    });
}
// Filter feeds
exports.filter = (req, res) => {
    let condition = {
        type: req.body.type
    };
    if (req.body.userId) {
        condition.user = mongoose.Types.ObjectId(req.body.userId);
    }
    feedsModel.find(condition).populate({
        path: 'user',
        select: 'full_name profile_pic'
    }).sort({
        'created_at': -1
    }).lean().exec((err, response) => {

        feedspa.feedCommentsCount(response, (data) => {
            res.json({
                status: true,
                result: data,
            });
        });
    });
}
// Get feed by userid(or by profile)
exports.byId = (req, res) => {
    feedsModel.find({
        user: mongoose.Types.ObjectId(req.body.userId)
    })
    .populate({ path: 'user', select: 'full_name profile_pic'})
    .sort({
        'created_at': -1
    }).lean().exec((err, response) => {

        let likesCount = 0;
        let follow = 0;
        let following = 0;
        let follow_obj = {
            follow_btn: 'Follow'
        };

        async.parallel([
            (callback) => {
                followModel.count({
                    follow_id: req.body.userId
                }).exec((err, fcount) => {
                    follow = fcount;
                    callback(null, 1);
                });
            }, (callback) => {
                followModel.count({
                    my_id: req.body.userId
                }).exec((err, fwcount) => {
                    following = fwcount;
                    callback(null, 1);
                });
            }, (callback) => {
                followModel.findOne({
                    $or:[
                        { my_id: req.body.LoginUserId },
                        { follow_id: req.body.userId },
                        { my_id: req.body.userId },
                        { follow_id: req.body.LoginUserId }
                    ]
                }).lean().exec((err, fData) => {
                    if (fData && fData._id) {
                        follow_obj = fData;
                        follow_obj['follow_btn'] = 'unFollow';
                    }
                    callback(null, 1);
                });
            }
        ], (err, results) => {
            for (let i in response) {
                if (response[i].likes) {
                    likesCount += response[i].likes.length;
                }
            }

            feedspa.getUserById(req.body.userId, (userRes) => {
                feedspa.feedCommentsCount(response, (data) => {
                    res.json({
                        status: true,
                        result: {
                            "post": data,
                            "profile": userRes,
                            "post_count": data.length,
                            "likes_count": likesCount,
                            "follow_count": follow,
                            "following_count": following,
                            "follow_obj": follow_obj,
                        }
                    });
                });
            });
        });
    });
}
// Save feed
exports.save = (req, res) => {
    req.body.created_at = new Date();
    req.body.feed = mongoose.Types.ObjectId(req.body.postId);
    req.body.postUser = mongoose.Types.ObjectId(req.body.postUser);

    const feed = new savedFeedModel(req.body);
    feed.save((err, result) => {

        res.json({
            status: true,
            message: "Feed saved successfully.",
        });
    });
}
// Get my commented post
exports.myCmtPost = (req, res) => {

    commentModel.find({
        user: mongoose.Types.ObjectId(req.body.userId)
    }, {
        feed: true
    }).exec((err, result) => {
        if (!result.length) {
            res.json({
                status: true,
                result: [],
            });
            return;
        }

        let postIds = [];
        for(let i in result) {
            postIds.push(mongoose.Types.ObjectId(result[i].feed));
        }
        feedsModel.find({
            _id: {$in : postIds}
        })
        .populate({path: 'user', select: 'full_name profile_pic'})
        .lean()
        .exec((err, postRes) => {

            if (postRes && postRes.length) {
                for (let i in result) {
                    for (let j in postRes) {
                        if (postRes[j]['_id'] == result[i].feed.toString()) {
                            postRes[j]['comment_id'] = result[i]._id;
                        }
                    }
                }

                feedspa.feedCommentsCount(postRes, (data) => {
                    res.json({
                        status: true,
                        result: data,
                    });
                });
                return;
            }

            res.json({
                status: true,
                result: postRes,
            });
        });
    });
}

// Get saved post
exports.mySavePost = (req, res) => {
    savedFeedModel.find({
        user_id:req.body.userId
    })
    .lean()
    .populate({ path: 'feed'})
    .populate({ path: 'postUser', select: 'full_name profile_pic'}).exec((err, result) => {
        if (!result.length) {
            res.json({
                status: true,
                result: [],
            });
            return;
        }
        let finalDtata = [];

        for (let i in result) {
            result[i]['feed']['user'] = result[i]['postUser'];
            finalDtata.push(result[i]['feed']);
        }

        feedspa.feedCommentsCount(finalDtata, (data) => {
            res.json({
                status: true,
                result: data,
            });
        });
    });
}

// Report abuse
exports.reportAbuse = (req, res) => {
    req.body.created_at = new Date();
    req.body.user = mongoose.Types.ObjectId(req.body.userId);

    const report = new reportModel(req.body);
    report.save((err, result) => {
        res.json({
            status: true,
            message: "Report successfully.",
        });
    });
}

// Remove feed & respective data
exports.removeFeed = (req, res) => {

    if (req.body.key == 'saved') {
        savedFeedModel.deleteOne({
            feed: mongoose.Types.ObjectId(req.body._id),
            user_id: req.body.userId,
        }).remove((err, result) => {
            res.json({
                status: true,
                message: "Remove successfully.",
            });
        });
    }

    if (req.body.key == 'comment') {
        commentModel.deleteOne({
            _id: req.body._id,
            user: mongoose.Types.ObjectId(req.body.userId),
        }).exec((err, result) => {
            res.json({
                status: true,
                message: "Remove successfully.",
            });
        });   
    }
}