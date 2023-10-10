// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
const express = require('express');
const router = express.Router();

const jsend = require('../middlewares/jsend');

const mongoose = require('mongoose');
const LiteratureModel = require('../models/literature.model');
const { checkAuth } = require('../middlewares/auth-cookie');

router.get('/', (req, res) => {
  res.status(200).json(jsend.SUCCESS('글쓰기 기능'));
});

router.post('/add', checkAuth('author'), async (req, res) => {
  // 토큰 사용자가 검증이 된 경우에 이 라우터가 실행됨.
  const { email, id } = req.data;
  const { title, content } = req.body;

  const session = await mongoose.startSession();
  await session.startTransaction();
  try {
    const literature = new LiteratureModel({ title, content, email });
    if (
      LiteratureModel.find({
        title,
        email,
      }).exist(false)
    ) {
      literature.save({ session });
    } else {
      await session.abortTransaction();
      res
        .status(403)
        .json(
          jsend.FAIL(
            '해당 제목으로 기존에 배포한 내용이 존재합니다. 기존의 배포한 내용을 수정해주세요'
          )
        );
    }
    await session.commitTransaction();
    res.status(200).json(jsend.SUCCESS('해당 문학 생성 및 배포 완료'));
  } catch (err) {
    await session.abortTransaction();
    console.log('ERROR ', err);
    res.status(500).json(jsend.ERROR(err));
  }
  await session.endSession();
});

router.get('/clear', async (req, res) => {
  console.log('### DB Clear ###');
  await LiteratureModel.deleteMany({});
  res.status(200).json(jsend.SUCCESS('done!'));
});

module.exports = router;
