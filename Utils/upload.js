const config = require('./config'),
    fs = require('fs-extra'),
    multer = require('multer'),
    path = require('path');

exports.any = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, done) => {
            const dir = path.join(__dirname, '..', config.upload.path, req.params.course);
            // create course directory if it does not already exist
            fs.mkdirs(dir, err => {
                if (err)
                    return done(err);
                done(null, dir);
            });
        },
        filename: (req, file, done) => {
            const dir = path.join(__dirname, '..', config.upload.path, req.params.course),
                extname = path.extname(file.originalname),
                basename = path.basename(file.originalname, extname);

            let i = 1;
            fs.readdir(dir, (err, filenames) => {
                if (err)
                    return done(err);
                // generate filename until it is unique within the directory
                for (;;) {
                    let newname = [basename, i > 1 ? ` (${i})` : '', extname].join('');
                    if (filenames.indexOf(newname) === -1)
                        return done(null, newname);
                    i++;
                }
            });
        }
    })
});

exports.csv = multer({ storage: multer.MemoryStorage });