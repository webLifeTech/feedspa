const path = require('path');
const uid = require('uid');
const fs = require('fs');

const mongoose = require('mongoose');
const commentModel = mongoose.model('Comments');


exports.add = (req, res) => {
    req.body.created_at = new Date();
    req.body.likes = [];
    req.body.user = mongoose.Types.ObjectId(req.body.userId);
    req.body.feed = mongoose.Types.ObjectId(req.body.feedId);

    const schema = new commentModel(req.body);

    schema.save((err, result) => {
        if (err) {
            res.json({
                status: false,
                message: "Server not responding."
            });
            return;
        }

        res.json({
            status: true,
            message: "Comment added successfully.",
            result: result
        });
    });
}

exports.get = (req, res) => {
	if (!req.body.skip) {
        req.body.skip = 0;
    }

    commentModel.find({
        feed: mongoose.Types.ObjectId(req.body.postId)
    }).skip(req.body.skip).limit(20)
    .populate({ path: 'user', select: 'full_name profile_pic user_name'})
    .sort({ 'created_at': 1 })
    .exec((err, response) => {
        res.json({
            status: true,
            result: response,
        })
    });
}

exports.delete = (req, res) => {
    commentModel.find({
        _id: req.body._id
    }).remove((err, result) => {

        if (err) {
            res.json({
                status: false,
                message: "Server not responding!"
            });
            return;
        }

        res.json({
            status: true,
            message: "Feed deleted successfully.",
        });
    });
}

exports.like = (req, res) => {
    let action = {
        $push: { likes: req.body.userId }
    }

    if (req.body.key == 2) {
        action = {
            $pull: { likes: req.body.userId }
        }
    }

    commentModel.updateOne({
        _id: req.body._id
    },action).exec((err, result) => {

        if (err) {
            res.json({
                status: false,
                message: "Server not responding!"
            });
            return;
        }

        res.json({
            status: true,
            message: "Like successfully.",
        });
    });
}