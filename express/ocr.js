'use strict';

//Imports are declared
const bodyParser = require('body-parser');
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const fs = require("fs");
const multer = require('multer');
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();
const urlencodedParser = bodyParser.urlencoded({ extended : false });

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./uploads")
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage}).single("avatar");

app.set("view engine", "ejs");

app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/views', express.static('views'));


const router = express.Router();

//Routes

router.get('/post', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});


router.get('/',(req,res) => {
    res.render('./views/index', {
        title : ' ',
        imgPath : ' ',
        layout ; false
    });
});

router.post("/upload", (req,res) => {
    upload(req,res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`,(err, data) =>{
            if(err) return console.log('This is your error');

            worker
            .recognize(data,"eng",{tessjs_create_pdf: '1'})
            .progress(progress =>{
                console.log(progress);
            })
            .then(result =>{
               // res.send(result.text);
                    res.render('index',{ 
                        title : result.text,
                        imgPath : `/uploads/${req.file.originalname}`
                    });
            })
            .finally(() => worker.terminate());
        });
    });
});

router.get("/download",(req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

app.use('/.netlify/functions/ocr', router);

module.exports = app;
module.exports.handler = serverless(app);
