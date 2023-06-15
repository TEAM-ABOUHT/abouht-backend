const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
	email: {
		type: String,
		trim: true, //dhsdb 1541 @naver.com 을 dhsdb1541@naver.com로 trim
		unique: true,
	},
	name: {
		type: String,
		maxlength: 50,
	},
	password: {
		type: String,
		minLength: 5,
	},
	surveyID: {
		type: String,
		maxlength: 100,
		'default':"N/A", 
	},
});

//save 메소드가 실행되기전에 비밀번호를 암호화
userSchema.pre("save", function (next) {
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

userSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

userSchema.methods.generateToken = function () {
	// let user = this;
	const token = jwt.sign(this._id.toHexString(), "secretToken");
	this.token = token;
	
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

userSchema.statics.getIdByToken = async (token) => {
  return jwt.verify(token, "secretToken", function (err, decoded) {
	  try{
		  return decoded;
	  }catch(err){
		  return err;
	  }
  }
)};

const UserData = mongoose.model("UserData", userSchema);

module.exports = { UserData };