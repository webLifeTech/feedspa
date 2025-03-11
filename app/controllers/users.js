const mongoose = require('mongoose');
const async = require('async');
const feedspa = require('../services/feedspa');

const userModel = mongoose.model('Users');
const followModel = mongoose.model('FollowUsers');
const helper = require('../services/helper');


// User Login / Register
exports.login = (req, res) => {
    userModel.findOne(
        { $or: [ { mobile: req.body.mobile || 1 }, { email: req.body.email || '@' } ] }
    ).lean().exec((err, result) => {

        if (!(result && result._id)) {
            feedspa.uniqueUserName(req.body, (username) => {

                req.body.createdAt = new Date();
                req.body.user_name = username;

                const user = new userModel(req.body);

                user.save((err2, saveRe) => {
                    res.json({
                        status: true,
                        result: saveRe,
                        message: 'Register Successfully.',
                    });
                });
            })
            return;
        }

        res.json({
            status: true,
            result: result,
            message: 'Login successfully.',
        });
    });
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


// Upload profile picture
exports.uploadProfile = (req, res) => {
    feedspa.uploadAssets('profile/', req.files.image, req.body._id+'.jpg', (url)=> {
        userModel.update({
            _id: req.body._id,
        },{
            "profile_pic": url
        }).exec((errr, response) => {

            res.send({
                status: true,
                message: 'Profile picture updated successfully.',
                result: url
            });
        });
    });
};


// Get all users
exports.listUser = (req, res) => {

    async.parallel({
        one: (callback) => {
            userModel.find({_id:{$nin:req.body.userId}})
            .sort({ 'created_at': -1 })
            .lean()
            .exec((err, response) => {
                callback(null, response);
            });
        },
        two: (callback) => {
            followModel.find({
                $or:[
                    { my_id: req.body.userId },
                    { follow_id: req.body.userId },
                ]
            }).exec((err, fdata) => {
                callback(null, fdata);
            });
        }
    }, (err, results) => {

        for (let j in results['one']) {
            results['one'][j]['follow_btn'] = 'Follow';
        }

        if (results['two'] && results['two'].length) {
            for (let i in results['two']) {
                for (let j in results['one']) {
                    if (results['two'][i]['follow_id'] == results['one'][j]._id || results['two'][i]['my_id'] == results['one'][j]._id) {
                        results['one'][j]['follow_btn'] = 'unFollow';
                    }
                }
            }
        }
        
        res.json({
            status: true,
            result: results['one'],
        });
    });
}


// Follow / UnFollow user
exports.followUnfollow = (req, res) => {
    if (req.body.key == 1) {
        req.body.createdAt = new Date();

        const table = new followModel(req.body);

        table.save((err2, saveRe) => {
            res.json({
                status: true,
                result: saveRe,
                message: 'Follow Successfully.',
            });
        });
    }
    if (req.body.key == 2) {
        followModel.findOne({
            "my_id": req.body.my_id,
            "follow_id": req.body.follow_id
        }).remove((err, v1) => {
            followModel.findOne({
                "my_id": req.body.follow_id,
                "follow_id": req.body.my_id
            }).remove((err, v2) => {

                if (err) {
                    res.json({
                        status: false,
                        message: "Server not responding!"
                    });
                    return;
                }

                res.json({
                    status: true,
                    message: "unFollow successfully.",
                });
            });
        });
    }
}
