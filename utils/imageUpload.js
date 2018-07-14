const multer = require('multer');
const path = require('path');


function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Videos Only!');
    }
}

const storageForImages = multer.diskStorage({
    destination: './public/images/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + path.extname(file.originalname));
    }
});

module.exports = {
    uploadImage: multer({
        storage: storageForImages,
        limits: { fileSize: 10000000, files: 1 },
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).single('image')
};