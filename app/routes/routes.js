'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');
const connectMultiparty = require('connect-multiparty');
const multipartMiddleware = connectMultiparty();

require('../model/model');

const Feed = require('../controllers/feed');
const Comment = require('../controllers/comment');
const User = require('../controllers/users');
const Admin = require('../controllers/admin');
const Search = require('../controllers/search');
const Story = require('../controllers/story');


// define the home page route
router.get('/',(req, res) => {
	res.json('connected...');
});

router.all('/api/login', User.login);
router.all('/api/edit/profile', User.editProfile);
router.all('/api/upload/profile', multipartMiddleware, User.uploadProfile);
router.all('/api/user/list', User.listUser);
router.all('/api/user/follow-unfollow', User.followUnfollow);

router.all('/api/feed/post', Feed.add);
router.all('/api/feed/media', multipartMiddleware, Feed.mediaPost);
router.all('/api/feed/get', Feed.get);
router.all('/api/feed/delete', Feed.delete);
router.all('/api/feed/like', Feed.like);
router.all('/api/feed/share', Feed.share);
router.all('/api/feed/filter', Feed.filter);
router.all('/api/feed/by-id', Feed.byId);
router.all('/api/feed/save', Feed.save);
router.all('/api/feed/my-cmt-post', Feed.myCmtPost);
router.all('/api/feed/my-save-post', Feed.mySavePost);
router.all('/api/feed/report', Feed.reportAbuse);
router.all('/api/profile/remove-feed', Feed.removeFeed);

router.all('/api/comment/post', Comment.add);
router.all('/api/comment/get', Comment.get);
router.all('/api/comment/delete', Comment.delete);
router.all('/api/comment/like', Comment.like);

router.all('/api/search/all', Search.get);
router.all('/api/trending/topics', Search.topics);


router.all('/api/story/post', Story.add);
router.all('/api/story/media', multipartMiddleware, Feed.mediaPost);
router.all('/api/story/get', Story.get);
router.all('/api/story/delete', Story.delete);
router.all('/api/story/get-music', Story.getMusic);
router.all('/api/story/get-sticker', Story.getSticker);


// Admin Ctrl
router.all('/api/admin/dashboard', Admin.dashboard);
router.all('/api/admin/get', Admin.listUser);
router.all('/api/admin/online-user', Admin.onlineUser);
router.all('/api/admin/activity', Admin.activity);
router.all('/api/admin/profile', Admin.editProfile);
router.all('/api/admin/delete', Admin.userDelete);
router.all('/api/admin/block', Admin.blockUser);
router.all('/api/admin/user-by-gender', Admin.userByGender);
router.all('/api/admin/user-by-mobile', Admin.userByMobile);
router.all('/api/admin/reports', Admin.getReports);
router.all('/api/admin/report-delete', Admin.reportDelete);
router.all('/api/admin/statistics', Admin.getStatistics);
router.all('/api/admin/followList', Admin.followList);
router.all('/api/admin/commentList', Admin.commentList);
router.all('/api/admin/delete-comment', Admin.deleteComment);
router.all('/api/admin/user-country', Admin.userByCountry);
router.all('/api/admin/add-music', multipartMiddleware, Admin.addMusic);
router.all('/api/admin/delete-music', multipartMiddleware, Admin.musicDelete);
router.all('/api/admin/add-sticker',multipartMiddleware, Admin.addSticker);
router.all('/api/admin/delete-sticker',multipartMiddleware, Admin.deleteSticker);


module.exports = router;
