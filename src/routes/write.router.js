// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
const express = require('express');
const router = express.Router();

const jsend = require('../middlewares/jsend');

const mongoose = require('mongoose');
const { WritingModel } = require('../models/writing.model');
const { AuthorModel } = require('../models/author.model');
const { checkAuth } = require('../middlewares/auth-cookie');

router.get('/', (req, res) => {
  res.status(200).json(jsend.SUCCESS('글쓰기 기능'));
});

router.post('/', checkAuth('author'), (req, res) => {
  const { title, content } = req.body;
});

module.exports = router;
