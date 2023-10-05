var express = require('express');
var router = express.Router();

const { AuthorModel } = require('../models/author.model');
const { WritingModel } = require('../models/writing.model');
const { CompilationModel } = require('../models/compilation.model');
const { ReaderModel } = require('../models/reader.model');

router.get('/', (req, res) => {
  res.status(200).send({ message: '독자 사용자 관련 로직' });
});

// 독자 정보를 token으로 가져오는 요청 처리 (_id, password는 노출되지 않음)
router.get('/getReader', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.query.token);
    const reader = await ReaderModel.findOne({ _id: readerID }).lean();

    reader._id = undefined;
    reader.password = undefined;
    return res.status(200).send({ reader });
  } catch (err) {
    return res.status(500).json({
      sucess: false,
      message: err.message,
    });
  }
});

// 회원가입을 위한 요청 처리
router.post('/signup', async (req, res) => {
  try {
    const reader = new ReaderModel(req.body);
    const stat = await reader.save();

    if (!stat) {
      const err = new Error('Internal Server Error');
      res.status(400).json({ success: false, message: err });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 로그인을 위한 요청 처리, _id로 생성된 token 발급
router.get('/login', async (req, res) => {
  try {
    const reader = await ReaderModel.findOne({ email: req.query.email });
    console.log(req.query.email + ' ' + req.query.password);
    if (reader) {
      reader
        .comparePassword(req.query.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.json({
              loginSuccess: false,
              err: 'Invalid Password',
            });
          }
          reader
            .generateToken()
            .then((reader) => {
              res.status(200).json({ sucess: true, readerToken: reader.token }); // userId: user._id
            })
            .catch((err) => {
              res.status(400).send({ sucess: false, message: err.message });
            });
        })
        .catch((err) => res.json({ sucess: false, message: err.message }));
    } else {
      res.status(400).send({ sucess: false, err: 'No Such Reader' });
    }
  } catch (err) {
    return res.status(500).json({
      sucess: false,
      message: err.message,
    });
  }
});

// 독자 삭제
router.delete('/deleteReader', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.body.token);
    if (!readerID) throw new Error('No such Reader');
    await ReaderModel.deleteOne({ _id: readerID });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 작가 구독, subAuthor Array에 _id 추가
router.put('/subscribe', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.body.readerToken);
    const authorToken = req.body.authorToken;

    const stat = await ReaderModel.findOneAndUpdate(
      { _id: readerID },
      { $addToSet: { subAuthors: authorToken } }
    );
    if (!stat) throw new Error('findOneAndUpdate err');

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 작가 구독 해제, subAuthor Array에 _id 삭제
router.put('/unSubscribe', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.body.readerToken);
    const authorToken = req.body.authorToken;

    const stat = await ReaderModel.findOneAndUpdate(
      { _id: readerID },
      { $pull: { subAuthors: authorToken } }
    );
    if (!stat) throw new Error('findOneAndUpdate err');

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 글 북마크, bookmarks Array에 _id 추가
router.put('/addBookmark', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.body.readerToken);
    const writingID = req.body.writingID;

    const stat = await ReaderModel.findOneAndUpdate(
      { _id: readerID },
      { $addToSet: { bookmarks: writingID } }
    );
    if (!stat) throw new Error('findOneAndUpdate err');

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 북마크 해제
router.put('/deleteBookmark', async (req, res) => {
  try {
    const readerID = await ReaderModel.getIdByToken(req.body.readerToken);
    const writingID = req.body.writingID;

    const stat = await ReaderModel.findOneAndUpdate(
      { _id: readerID },
      { $pull: { bookmarks: writingID } }
    );
    if (!stat) throw new Error('findOneAndUpdate err');

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
