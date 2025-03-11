const mongoose = require('mongoose');

const storyModel = mongoose.model('Story');


// Get all users
const listUser = () => {
    userModel.find({}, {
       _id: true
    })
    .exec((err, response) => {
        console.log(response);
    });
}

setInterval(()=> {
   listUser();
}, 300000);