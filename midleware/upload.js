const multer = require('multer')
const storage = multer.diskStorage({
    // destination for files
    destination: function (req, file, callback) {
      callback(null, './public/avatar/images');
    },
  
    // add back the extension
    filename: function (req, file, callback) {
      callback(null, Date.now() + file.originalname);
    },
  });

const upload = multer({
    storage: storage,
    limits: {
      fieldSize: 1024 * 1024 * 3,
    },
  })

exports.defaultAvatar = async(req, res, next) => {
    const {firstname} = req.body;
    var temp = firstname.slice(0,0);
    var avatarPath = `.public/avatar/default/${temp}`
    if(!avatarPath){
        return res.status(404).json({success: false, message: 'Canot find default avatar'})
    }
}