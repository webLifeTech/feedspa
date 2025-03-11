const path = require('path');
const uid = require('uid');
const fs = require('fs');
const async = require('async');
const mongoose = require('mongoose');

const feedspa = require('../services/feedspa');
const storyModel = mongoose.model('Story');
const stickersModel = mongoose.model('Stickers');
const musicsModel = mongoose.model('Musics');



// Add new feed
exports.add = (req, res) => {
    req.body.created_at = new Date();
    req.body.updated_at = new Date();
    req.body.progress = 0.0;

    storyModel.update({
        user: mongoose.Types.ObjectId(req.body.userId)
    },{
        user: mongoose.Types.ObjectId(req.body.userId),
        $push: { stories: req.body },
    }, {
        upsert: true
    }).exec((err, result) => {
        res.json({
            status: true,
            message: "Story created successfully.",
            result: result
        });
    });
}


// Post story with (images/videos)
exports.mediaPost = (req, res) => {
    let fileName = uid(10)+'.jpg';

    if (req.body.type == 2) {
        fileName = uid(10)+'.mp4';
    }

    feedspa.uploadAssets('media/', req.files.media, fileName, (url)=> {
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
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.progress = 0.0;
        req.body.feed_style = JSON.parse(req.body.feed_style);

        storyModel.update({
            user: mongoose.Types.ObjectId(req.body.userId)
        },{
            user: mongoose.Types.ObjectId(req.body.userId),
            $push: { stories: req.body },
        }, {
            upsert: true
        }).exec((err, result) => {
            res.json({
                status: true,
                message: "Story created successfully.",
                result: result
            });
        });
    }
}


// Get story
exports.get = (req, res) => {
    if (!req.body.skip) {
        req.body.skip = 0;
    }

    storyModel.find({}).skip(req.body.skip).limit(20).populate({
        path: 'user',
        select: 'full_name profile_pic'
    }).sort({
        created_at: -1
    }).lean().exec((err, response) => {
        res.json({
            status: true,
            result: response,
        });
    });
}


// Delete story
exports.delete = (req, res) => {
    storyModel.find({
        _id: req.body._id
    }).remove((err, result) => {
        res.json({
            status: true,
            message: "Feed deleted successfully.",
        });
    });
}

// Get Sticker for Admin & App
exports.getSticker = (req, res) => {
    stickersModel.find({}).sort({ 'created_at': -1 })
        .exec((err, stickerData) => {
            res.json({
                status: true,
                result: stickerData
            })
        })
}

// Get Music for Admin & App
exports.getMusic = (req, res) => {
    musicsModel.find({})
        .skip(0).limit(20).sort({ 'created_at': -1 })
        .exec((err, musicsData) => {
            let musicByCat = [];

            if (musicsData && musicsData.length) {
                let unique = [...new Set(musicsData.map(a => a.category))];
                for (let j in unique) {
                    musicByCat.push({
                        catName: unique[j],
                        data: []
                    });
                }

                for (let i in musicsData) {
                    musicsData[i].name = musicsData[i].name.split('.mp3').pop()
                    for (let ta in musicByCat) {
                        if (musicByCat[ta].catName == musicsData[i].category) {
                            musicByCat[ta].data.push(musicsData[i])
                        }
                    }
                }
            }
            res.json({
                status: true,
                result: musicByCat
            });
        });
}