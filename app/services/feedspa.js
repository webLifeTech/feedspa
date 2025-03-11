const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ThumbnailGenerator = require('video-thumbnail-generator').default;

const userModel = mongoose.model('Users');
const commentModel = mongoose.model('Comments');


// Get user by id
exports.getUserById = (id, cb) => {
	userModel.findOne({
        _id: id
	}).lean().exec((err, result) => {
    	cb(result);
    });
}


// Generate thumb of video
exports.generateThumb = (videoPath, cb) => {
	const tg = new ThumbnailGenerator({
        sourcePath: videoPath,
        thumbnailPath: path.join( __dirname+'/../../', 'public/thumb/'),
    });

    tg.generateOneByPercentCb(90, {
        size: '200x400'
    }, (err, result) => {
    	cb(process.env.URL+'thumb/'+result);
    });
}


// Upload file
exports.uploadAssets = (type, file, fileName, cb) => {
	const assetUrl = path.join( __dirname+'/../../', 'public/'+type);

    fs.readFile(file.path,(err, data) => {
        if(err) {
            res.send(err);
            return;
        }

        fs.writeFile(assetUrl+fileName, data, (err) => {
            console.log("err>>>>>>",process.env.URL+type+fileName);
            cb(process.env.URL+type+fileName);
        });
    });
}


// Create Unique User name
exports.uniqueUserName = (data, cb) => {
    let condition = {};

    if (data.isEdit) {
        condition._id = { $nin: data._id }
    }

    if (data.full_name) {
        const fname = data.full_name.replace(/ /g, '');
        let usernm = '@'+fname.toLowerCase();
        condition.user_name = usernm;
        
        userModel.find(condition).count((err, unCount) => {
            if (unCount > 0) {
                usernm+=unCount;
            }
            cb(usernm);
        });
    } else {
        cb('');
    }
}


// comment count
exports.feedCommentsCount = (data, cb) => {
    if (!data.length) {
        cb(data);
        return;
    }

    let feed = [];
    for (let i in data) {
        feed.push(mongoose.Types.ObjectId(data[i]._id));
    }

    commentModel.find({
        feed: {$in: feed }
    }, {
        feed: true
    }).exec((err, comments) => {
        for (let i in data) {
            data[i]['comment_count'] = 0;

            for (let k in comments) {
                if (comments[k].feed.toString() == data[i]._id) {
                    data[i]['comment_count'] += 1;
                }
            }
        }

        cb(data);
    });
}

// Get Tag & Topics
exports.getTagsAndTopics = (data, cb) => {
    let res = [];
    let tags = data.text.match(/@\S+/g) || [];
    let topics = data.text.match(/#\S+/g) || [];
    res = tags.concat(topics);
    cb(res);
}