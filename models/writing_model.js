const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// 개별 글을 구성하는 스키마
const writingSchema = mongoose.Schema({
	title: {				// 글 제목
		type: String,
		maxLength: 100,
		required: true
	},
	content: {				// 글 내용
		type: String,
		required: true
	},
	CreateDate: {			// 생성 날짜
		type: Date,
		default: Date.now,
	},
	UpdateDate: {			// 마지막 업데이트 날짜
		type: Date,
		default: Date.now,
	},
	authorToken: {			// 작가 토큰
		type: String,
		required: true
	},
});

writingSchema.methods.generateToken = function () {
	const token = jwt.sign(this._id.toHexString(), "secretToken");
	this.token = token;
	
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

writingSchema.statics.getIdByToken = async (token) => {
  return jwt.verify(token, "secretToken", function (err, decoded) {
	  try{
		  return decoded;
	  }catch(err){
		  return err;
	  }
  }
)};

const WritingModel = mongoose.model("WritingModel", writingSchema);

module.exports = { WritingModel };