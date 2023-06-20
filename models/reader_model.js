const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// 작가의 프로필을 구성하는 스키마
const readerSchema = mongoose.Schema({
	email: {				// 이메일, 로그인을 위해 사용
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	password: {				// 비밀번호
		type: String,
		minLength: 4,
		required: true
	},
	name: {					// 독자 이름
		type: String,
		required: true
	},
	phoneNumber: {			// 독자 핸드폰 번호
		type: String,
		required: true
	},
	birthDate: {			// 독자 생일
		type: Date,
		default: Date.now,
		required: true
	},
	gender: {				// 독자 성별
		type: Number,		// 0-남자, 1-여자, 2-특정할 수 없음
		required: true
	},
	OAuthInfo: {			// OAuth 인증 종류 (KAKAO, Facebook etc)
		type: String,		// 추후 OAuth를 적용할 때 사용
		required: true
	},
	userName: {				// 독자 닉네임
		type: String,
		required: true,
		unique: true,
	},
	preRegistration: {		// 오픈전 사전 이벤트 관련 필드
		type: String,		// 추후 사전 이벤트를 기획하면서 사용
	},
	recentWriting: {		// 최근에 읽은 글의 _id
		type: String,
	},
	subAuthors : {			// 구독한 작가 _id
		type : Array,
		default : [],
	},
	bookmarks: {			// 북마크한 글 _id들
		type : Array,
		default : [],
	}
});

//save 메소드가 실행되기전에 비밀번호를 암호화
readerSchema.pre("save", function (next) {
  let user = this;

  //model 안의 paswsword가 변환될때만 암호화
  if (user.isModified("password")) {
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

readerSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

readerSchema.methods.generateToken = function () {
	const token = jwt.sign(this._id.toHexString(), "secretToken");
	this.token = token;
	
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

// jwt 토큰을 받아서 id로 반환함
readerSchema.statics.getIdByToken = async (token) => {
  return jwt.verify(token, "secretToken", function (err, decoded) {
	  try{
		  return decoded;
	  }catch(err){
		  return err;
	  }
  }
)};

const ReaderModel = mongoose.model("ReaderModel", readerSchema);

module.exports = { AuthorModel };