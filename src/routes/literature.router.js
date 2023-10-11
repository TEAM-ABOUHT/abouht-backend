// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
const express = require('express');
const router = express.Router();

const jsend = require('../middlewares/jsend');
require('dotenv').config();
const mongoose = require('mongoose');
const LiteratureModel = require('../models/literature.model');
const { checkAuth } = require('../middlewares/auth-cookie');

router.get('/', (req, res) => {
  res.status(200).json(jsend.SUCCESS('글 읽기 쓰기 기능'));
});

router.get('/list', async (req, res) => {
  const literaturesList = await LiteratureModel.find({});
  return res
    .status(200)
    .json(jsend.SUCCESS('literatures list get success', literaturesList));
});

router.get('/read/:authorId/:index', async (req, res) => {
  // 미들웨어로 사용자 읽기 권한 검증 로직 필요

  const { authorId, index } = req.params;
  console.log(authorId, '      ', index);
  if (!authorId)
    res.status(400).json(jsend.ERROR('id querystring does not exist.'));
  try {
    const literatureList = await LiteratureModel.find({
      authorId: authorId,
    });
    if (!literatureList[index])
      return res.status(500).json(jsend.ERROR('해당 인덱스의 글이 없음'));
    return res
      .status(200)
      .json(jsend.SUCCESS('success', literatureList[index]));
  } catch (err) {
    return res.status(500).json(jsend.ERROR(err));
  }
});

router.post('/add', checkAuth('author'), async (req, res) => {
  // 토큰 사용자가 검증이 된 경우에 이 라우터가 실행됨.
  const authorId = req.data.id;
  const { title, content } = req.body;

  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const literature = new LiteratureModel({ title, content, authorId });

    if (
      !(await LiteratureModel.find({
        title,
        authorId,
      }).get())
    ) {
      await literature.save({ session });
    } else {
      await session.abortTransaction();
      return res
        .status(403)
        .json(
          jsend.FAIL(
            '해당 제목으로 기존에 배포한 내용이 존재합니다. 기존의 배포한 내용을 수정해주세요'
          )
        );
    }
    await session.commitTransaction();
    return res.status(200).json(jsend.SUCCESS('해당 문학 생성 및 배포 완료'));
  } catch (err) {
    await session.abortTransaction();
    console.log(err);

    return res.status(500).json(jsend.ERROR(err));
  }
  await session.endSession();
});

module.exports = router;
