const express = require('express');
const router = express.Router();

const authorRouter = require('./author.router');
const writingRouter = require('./writing.router');
const compilationRouter = require('./compilation.router');
const readerRouter = require('./reader.router');
const genreRouter = require('./genre.router');
const authRouter = require('./auth.router');
const writeRouter = require('./write.router');

router.get('/', async (req, res) => {
  const info = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    requestMethod: req.method,
    requestURL: req.url,
  };
  return res.send(
    `<h1>Abouht-Backend</h1> 
     <hr/>
     <h2>Connection Info</h2>
      <p><b>userAgent :</b> ${info.userAgent}</p>
      <p><b>ip :</b> ${info.ip}</p>
      <p><b>requestMethod :</b> ${info.requestMethod}</p>
      <p><b>requestURL :</b> ${info.requestURL}</p> 
    `
  );
});

router.use('/author', authorRouter);
router.use('/writing', writingRouter); // 글쓰기
router.use('/compilation', compilationRouter);
router.use('/reader', readerRouter); // 글읽기
router.use('/genre', genreRouter);
router.use('/auth', authRouter);
router.use('/write', writeRouter);

module.exports = router;
