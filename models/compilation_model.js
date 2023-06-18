const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// 모음집을 구성하는 스키마
// 사용자 계정 이외의 데이터들은 _id로 관리
const compilationSchema = mongoose.Schema({
	title: {				// 모음집 제목
		type: String,
		maxLength: 100,
		required: true
	},
	preview: {				// 모음집 미리보기
		type: String,
		maxLength: 1000,
		required: true
	},
	writings: {				// 해당 모음집에 포함된 글
		type : Array,
		default : [],
	},
	authorToken: {			// 작가 토큰
		type: String,
		required: true
	},
});

const CompilationModel = mongoose.model("CompilationModel", compilationSchema);

module.exports = { CompilationModel };