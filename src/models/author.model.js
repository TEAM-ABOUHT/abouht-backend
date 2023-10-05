const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// 작가의 프로필을 구성하는 스키마
const authorSchema = mongoose.Schema({
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
    // 작가 이름
    type: String,
    required: true,
  },
  phoneNumber: {
    // 작가 핸드폰 번호
    type: String,
    required: true,
  },
  birthDate: {
    // 작가 생일
    type: Date,
    default: Date.now,
    required: true,
  },
  gender: {
    // 작가 성별
    type: Number, // 0-남자, 1-여자, 2-특정할 수 없음
    required: true,
  },
  penName: {
    // 작가의 필명, unique
    type: String,
    unique: true,
    required: true,
  },
  introduction: {
    // 작가 자기소개, 프로필에 사용
    type: String,
    maxLength: 1000,
    required: true,
  },
  preview: {
    // 앞으로 연재할 작품 미리보기
    type: String,
    maxLength: 2000,
    required: true,
  },
  writings: {
    // 작가의 글 _id array
    type: Array,
    default: [],
  },
  compilations: {
    // 작가의 모음집 _id array
    type: Array,
    default: [],
  },
});

//save 메소드가 실행되기전에 비밀번호를 암호화
authorSchema.pre('save', function (next) {
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

authorSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

authorSchema.methods.generateToken = function () {
  const token = jwt.sign(this._id.toHexString(), 'secretToken');
  this.token = token;

  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

// jwt 토큰을 받아서 id로 반환함
authorSchema.statics.getIdByToken = async (token) => {
  return jwt.verify(token, 'secretToken', function (err, decoded) {
    try {
      return decoded;
    } catch (err) {
      return err;
    }
  });
};

const AuthorModel = mongoose.model('AuthorModel', authorSchema);

module.exports = { AuthorModel };
