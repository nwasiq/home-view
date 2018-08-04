const multer = require('multer');
const path = require('path');


function checkFileType(files, cb) {
    // // Allowed ext
    // const filetypes = /fbx/;
    // // Check ext
    // const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // // Check mime
    // const mimetype = filetypes.test(file.mimetype);

    // if (mimetype && extname) {
    //     return cb(null, true);
    // } else {
    //     cb('Error: FBX files only!');
    // }

    if(files.fieldname == 'marker'){
        const markerExtension = path.extname(files.originalname);
        if (markerExtension !== '.jpeg' && markerExtension !== '.png' && markerExtension !== '.jpg')
        {
            cb('Error: jpeg, jpg or png files allowed for marker!');
        }
        else
            return cb(null, true);
    }
    else if(files.fieldname == 'fbx'){
        const fbxExtension = path.extname(files.originalname);
        if (fbxExtension !== '.obj') {
            cb('Error: only obj files allowed for fbx!');
        }
        else
            return cb(null, true);
    }
}

const storageForFiles = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + (req.user._id) + '-' + (req.user.counter + 1) + path.extname(file.originalname));
    }
});

module.exports = {
    uploadFiles: multer({
        storage: storageForFiles,
        fileFilter: function (req, files, cb) {
            checkFileType(files, cb);
        }
    }).fields([{ name: 'marker', maxCount: 1 }, { name: 'fbx', maxCount: 1 }])
};

