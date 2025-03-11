// const mongoose = require('mongoose');
// const compress_images = require('compress-images');
// const uid = require('uid');
// const fs = require('fs');
// const bucketService = require("./bucket");
// const hbs = require('hbs');
// const nodemailer = require('nodemailer');
// const smtpTransport = require('nodemailer-smtp-transport');
// const ThumbnailGenerator = require('video-thumbnail-generator').default;

// const notifyModel = mongoose.model('Notifications');
// const userModel = mongoose.model('Users');
// const upload = __dirname + '/../../email-template/';


// exports.postNotify = (data) => {
//     const mdoel = new notifyModel(data);
//     mdoel.save((err, result) => {
//         console.log('notify me...');
//     });
// }


// const compressImage = (image, cb) => {
//     compress_images(image, upload, { compress_force: false, statistic: true, autoupdate: true }, false,
//         {jpg: {engine: 'webp', command: false}},
//         {png: {engine: false, command: false}},
//         {svg: {engine: false, command: false}},
//         {gif: {engine: false, command: false}}, (error, completed, statistic) => {

//         if(error === null) {
//             cb(statistic.path_out_new);
//         }else{
//             cb('');
//         }
//     });
// }

// const uploadInbucket = (fileData, files, callback)=> {
//     const mimeType = fileData.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];

//     let image = '';
//     if (fileData.indexOf("data:image\/png;base64") != -1) {
//         image = fileData.replace(/^data:image\/png;base64,/, "");
//     }
//     if (fileData.indexOf("data:image\/jpeg;base64") != -1) {
//         image = fileData.replace(/^data:image\/jpeg;base64,/, "");
//     }

//     fs.writeFile(upload+'test.jpg', image, "base64", (err) => {
//         compressImage(upload+'test.jpg', (compress) => {
//             fs.createReadStream(compress).pipe(files.createWriteStream({
//                 metadata: {
//                     contentType: mimeType
//                 }
//             })).on("error", (err) => {
//                 console.log("Error", err);
//             }).on('finish', () => {
//                 fs.unlink(compress, ()=>{});
//                 fs.unlink(upload+'test.jpg', ()=>{});
//                 callback();
//             });
//         });
//     });
// };

// const removeFile = (file)=> {
//     try {
//         const bucket = bucketService.initBucket('hello-world-app');
//         const b1 = bucket.file(file);
//         b1.delete((err, del) => {});
//     } catch(ert) {

//     }
// };

// exports.uploadService = (data, cb) => {
//     if (data.type == 2) {
//         const img = uid(10)+'.png';
//         const bucketObj = bucketService.init(img, "hello-world-app");

//         uploadInbucket(data.post,bucketObj,()=> {
//             cb(img);
//         });
//     }

//     if (data.type == 3) {
//         const videon = uid(10)+'.mp4';
//         const files = bucketService.init(videon, "hello-world-app");

//         const mimeType = data.post.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
//         const video = data.post.replace(/^data:video\/mp4;base64,/, "");

//         fs.writeFile(upload+'test.mp4', video, "base64", (err) => {
//             fs.createReadStream(upload+'test.mp4').pipe(files.createWriteStream({
//                 metadata: {
//                     contentType: mimeType
//                 }
//             })).on("error", (err) => {
//                 cb({
//                   fileName: '',
//                   thumbnail: '',
//                 });
//             }).on('finish', () => {
//                 try {
//                     const tg = new ThumbnailGenerator({
//                         sourcePath: upload+'test.mp4',
//                         thumbnailPath: upload,
//                     });

//                     tg.generateOneByPercentCb(90, {
//                         size: '400x350'
//                     }, (err, result) => {

//                         const thumbnail = uid(10)+'.png';
//                         const bucketObj = bucketService.init(thumbnail, "hello-world-app");

//                         fs.createReadStream(upload+result).pipe(bucketObj.createWriteStream({
//                             metadata: {
//                                 contentType: mimeType
//                             }
//                         })).on("error", (err) => {
//                             console.log("Error", err);
//                             cb({
//                                 fileName: '',
//                                 thumbnail: '',
//                             });
//                         }).on('finish', () => {
//                             fs.unlink(upload+result, ()=>{});
//                             fs.unlink(upload+'test.mp4', ()=>{});

//                             cb({
//                                fileName: videon,
//                                thumbnail: thumbnail,
//                             });
//                         });
//                     });
//                 } catch(erret) {
//                     cb({
//                       fileName: '',
//                       thumbnail: '',
//                     });
//                 }
//             });
//         });
//     }
// }

// exports.uploadProfile = (data, cb)=> {
//     const fileName = uid(10)+'-avatar.webp';
//     const bucketObj = bucketService.init(fileName, "hello-world-app");
    
//     uploadInbucket(data.avatar,bucketObj,()=> {
//         if (data.oldAvatar) {
//             removeFile(data.oldAvatar);
//         }
//         cb(fileName);
//     });
// }

// exports.sendEmail = function(userdata,condition, cb) {
   
//     var mailOptions = {
//         to: userdata.email,
//         from: 'helooworldapp@gmail.com',
//         subject: 'Heloo App',
//     }

//     if(condition == 'forgot') {
//           var data = {
//             firstname:userdata.firstName,
//             lastname:userdata.lastName,
//             password:userdata.password
//           }

//             fs.readFile(__dirname + '/../../email-template/' + 'password.html', 'utf8', function(err, htmlData) {
//             const template = hbs.compile(htmlData);
//             const compiledHTML = template(data || {});
//             mailOptions.html = compiledHTML;
//             sendMail(mailOptions, (err, response) => {
//                 cb(true);
//             });
//         });
//     } else {

//         var data = {
//             firstname:userdata.firstName,
//             lastname:userdata.lastName,
//             otp:userdata.otp
//         }

//         fs.readFile(__dirname + '/../../email-template/' + 'otp.html', 'utf8', function(err, htmlData) {
//             const template = hbs.compile(htmlData);
//             const compiledHTML = template(data || {});
//             mailOptions.html = compiledHTML;
//             sendMail(mailOptions, (err, response) => {
//                 cb(true);
//             });
//         });

//     }


//     const sendMail = (mailOptions, cb) => {
//         const transport = nodemailer.createTransport(smtpTransport({
//             secure: true,
//             service: "gmail",
//             host: 'smtp.gmail.com',
//             port: 465,
//             auth: {
//                 user: 'helooworldapp@gmail.com',
//                 pass: 'heloo@123'
//             }
//         }));

//         transport.sendMail(mailOptions, (err, response) => {
//             if (err) {
//                 cb(err);
//                 return;
//             }
//             cb(response);
//         });
//     };
// }

// exports.sortByKey = (array, key) => {
//     return array.sort((a, b) => {
//         let x = a[key];
//         let y = b[key];
//         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
//     });
// }

// exports.sortByKeyDesc = (array, key) => {
//     return array.sort((a, b) => {
//         let x = a[key];
//         let y = b[key];
//         return ((x > y) ? -1 : ((x < y) ? 1 : 0));
//     });
// }