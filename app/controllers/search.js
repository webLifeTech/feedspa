const mongoose = require('mongoose');
const async = require('async');

const feedspa = require('../services/feedspa');
const feedsModel = mongoose.model('Feeds');
const userModel = mongoose.model('Users');
const followModel = mongoose.model('FollowUsers');


// Search by topic,tags,people
exports.get  = (req, res) => {
	const ii = new RegExp(".*"+req.body.searchKey.toLowerCase()+".*", "i");

	async.parallel({
        postF: (callback) => {
            feedsModel.find({
				"tag_topic": { $regex: ii }
			}).populate({
		        path: 'user',
		        select: 'full_name profile_pic'
		    }).sort({
		        'created_at': -1
		    })
		    .limit(50)
		    .lean().exec((err, post) => {
		    	callback(null, post);
		    });
        },
        peopleF: (callback) => {
            userModel.find({
				"full_name": { $regex: ii }
			})
			.limit(50)
		    .lean().exec((err, people) => {

		    	if (!people.length) {
		    		callback(null, people);
		    		return;
		    	}

		    	let count = 0;
		    	const follow = () => {
		    		if (count < people.length) {
		    			followModel.findOne({
		    				my_id: req.body.userId,
		    				follow_id: people[count]._id
			            }).lean().exec((err, fData) => {
			            	// console.log("==",fData);

			            	if (!(fData && fData._id)) {
			            		followModel.findOne({
				    				my_id: people[count]._id,
				    				follow_id: req.body.userId
					            }).lean().exec((err, fData1) => {
					            	// console.log(">>",fData1);

					            	if (!(fData1 && fData1._id)) {
					            		people[count]['follow_btn'] = 'Follow';
					            	} else {
					            		people[count]['follow_btn'] = 'unFollow';
					            	}
					            	count += 1;
					            	follow();
					            });
			            	} else {
			            		people[count]['follow_btn'] = 'unFollow';
				            	count += 1;
				            	follow();
			            	}
			            });
		    		} else {
		    			callback(null, people);
		    		}
		    	}
		    	follow();
		    });
        }
    }, (err, results) => {
        res.json({
            status: true,
            post: results['postF'] || [],
            people: results['peopleF'] || []
        });
    });
}


// Get top5 daily topics
exports.topics  = (req, res) => {
	feedsModel.find({
		tag_topic: { $exists: true, $not: {$size: 0} },
		created_at: { $gte: new Date((new Date().getTime() - (10 * 24 * 60 * 60 * 1000))) }
	}, {
		tag_topic: true
	}).sort({
		'created_at': -1
    }).exec((err, response) => {
    	let topTags = [];
    	if (response && response.length) {
    		for (let i in response) {
	    		for (let k in response[i]['tag_topic']) {
	    			if (topTags.length != 5) {
	    				topTags.push(response[i]['tag_topic'][k]);
	    			}
	    		}
    		}
    	}

		res.json({
			status: true,
			result: topTags
		})
    });
}