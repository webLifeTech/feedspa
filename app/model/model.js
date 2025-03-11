const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    mobile: String,
    country_code: String,
    full_name: String,
    user_name: String,
    email: String,
    profile_pic: String,
    bio: String,
    birth_date: String,
    gender: String,
    facebook_link:String,
    instagram_link:String,
    twitter_link:String,
    blocked_users: [],
    settings: {},
    login_type: String,
    blockstatus: {
        type: Boolean,
        default: false
    },
    created_at: Date
});
mongoose.model('Users', userSchema);


const feedSchema = new Schema({
    type: Number,
    text: String,
    feed_style: {},
    post: String,
    likes: [],
    tag_topic: [],
    video_thumb: String,
    video_duration: String,
    privacy: String,
    lat: String,
    lng: String,
    address: String,
    share_count: Number,
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date,
    updated_at: Date,
});
mongoose.model('Feeds', feedSchema);


const saveFeedSchema = new Schema({
    feed: { type: Schema.Types.ObjectId, ref: 'Feeds' },
    postUser: { type: Schema.Types.ObjectId, ref: 'Users' },
    user_id: String,
    created_at: Date
});
mongoose.model('SavedFeeds', saveFeedSchema);


const commentSchema = new Schema({
    text: String,
    bg_color: String,
    likes: [],
    feed: { type: Schema.Types.ObjectId, ref: 'Feeds' },
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date
});
mongoose.model('Comments', commentSchema);


const followSchema = new Schema({
    my_id: String,
    follow_id: String,
    created_at: Date
});
mongoose.model('FollowUsers', followSchema);


const reportSchema = new Schema({
    type: String,
    item_id: String,
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date
});
mongoose.model('Reports', reportSchema);


const notificaitonSchema = new Schema({
    type: String,
    text: String,
    feed: { type: Schema.Types.ObjectId, ref: 'Feeds' },
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date
});
mongoose.model('Notificaitons', notificaitonSchema);


const chatSchema = new Schema({
    text: String,
    receiver: { type: Schema.Types.ObjectId, ref: 'Users' },
    sender: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date
});
mongoose.model('Chats', chatSchema);


const musicSchema = new Schema({   
    category : String,
    name: String,
    audio: String,
    thumb: String,
    created_at: Date
})
mongoose.model('Musics', musicSchema);


const stickerSchema = new Schema({   
    sticker : String,
    created_at: Date
})
mongoose.model('Stickers', stickerSchema);


const StorySchema = new Schema({
    stories: [],
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: Date,
    updated_at: Date,
})
mongoose.model('Story', StorySchema);

