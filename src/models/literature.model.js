const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// 개별 글을 구성하는 스키마
// 사용자 계정 이외의 데이터들은 _id로 관리
const literatureSchema = mongoose.Schema({
  title: {
    // 글 제목
    type: String,
    maxLength: 100,
    required: true,
  },
  content: {
    // 글 내용 ( 나중에 암호화 필요! )
    type: String,
    required: true,
  },
  authorId: {
    // 작가 _id
    type: String,
    required: true,
  },
  createDate: {
    // 생성 날짜
    type: Date,
    default: Date.now,
  },
  updateDate: {
    // 마지막 업데이트 날짜
    type: Date,
    default: Date.now,
  },
});

const LiteratureModel = mongoose.model('LiteratureModel', literatureSchema);

module.exports = LiteratureModel;
