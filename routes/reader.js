// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
var express = require('express');
var router = express.Router();

const { AuthorModel } = require("../models/author_model");
const { WritingModel } = require("../models/writing_model");
const { CompilationModel } = require("../models/compilation_model");
const { ReaderModel } = require("../models/reader_model");

router.get("/", (req, res) => {
  	res.status(200).send({message : "독자 사용자 관련 로직"});
});

// 회원가입을 위한 요청 처리
router.post('/signup', async (req, res) => {
	try {
		const reader = new ReaderModel(req.body);
		const stat = await reader.save();

		if (!stat){
			const err = new Error("Internal Server Error");
			res.status(400).json({success: false, message : err});
		}
		res.status(200).json({success: true});
	}catch (err) {
		res.status(500).json({success: false, message : err.message});
	}
});

module.exports = router;