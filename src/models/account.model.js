const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 작가의 프로필을 구성하는 스키마
const accountSchema = mongoose.Schema({
  email: {
    // 이메일, 로그인을 위해 사용
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    // 비밀번호
    type: String,
    minLength: 4,
    required: true,
  },
  name: {
    // 사용자 이름
    type: String,
    required: true,
  },
  phoneNumber: {
    // 사용자 핸드폰 번호
    type: String,
    required: true,
  },
  birthDate: {
    // 사용자 생일
    type: Date,
    default: Date.now,
    required: true,
  },
  gender: {
    // 사용자 성별
    type: String, // 0-남자, 1-여자, 2-특정할 수 없음
    required: true,
  },
  type: {
    // 사용자 타입
    type: String, // reader, author, admin, etc...
    required: true,
  },
});

//save 메소드가 실행되기전에 비밀번호를 암호화
accountSchema.pre('save', function (next) {
  let user = this;

  //model 안의 paswsword가 변환될때만 암호화
  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

accountSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

accountSchema.methods.generateToken = function ({ email, type, id }) {
  console.log(`email : ${email}, type ${type}, _id${id}`);
  const token = jwt.sign({ email, type, id }, process.env.SECERT_KEY, {
    expiresIn: '3h',
    issuer: 'abouht',
  });
  this.token = token;

  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

// jwt 토큰을 받아서 id로 반환함
accountSchema.statics.getIdByToken = async (token) => {
  return jwt.verify(token, process.env.SECERT_KEY, function (err, decoded) {
    try {
      return decoded;
    } catch (err) {
      return err;
    }
  });
};

const AccountModel = mongoose.model('AccountModel', accountSchema);

module.exports = { AccountModel };
