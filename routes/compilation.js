// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
var express = require('express');
var router = express.Router();

const mongoose = require("mongoose");
const { AuthorModel } = require("../models/author_model");
const { WritingModel } = require("../models/writing_model");
const { CompilationModel } = require("../models/compilation_model");

router.get("/", (req, res) => {
  	res.status(200).send({message : "모음집 관련 로직"});
});

// 모음집 만들기, author token으로 배열에 추가
router.post('/addCompilation', async (req, res) => {
	const session = await mongoose.startSession();
	await session.startTransaction();
	try {
		const compilation = new CompilationModel(req.body);
		const authorID = await AuthorModel.getIdByToken(compilation.authorToken);
		await compilation.save({ session });
				
		const stat = await AuthorModel.findOneAndUpdate(
			{ _id : authorID },
			{ $push: { compilations : compilation._id } },
			{ session: session }
		);
		
		await session.commitTransaction();
		res.status(200).json({success: true});
	}catch (err) {
		await session.abortTransaction();
		res.status(500).json({success: false, err});
		console.log(err);
	}
	await session.endSession();
});

// 모음집에 글 추가
router.put('/addWriting', async (req, res) => {
	try {
		const compilationID = req.body.compilationID;
				
		const stat = await CompilationModel.findOneAndUpdate(
			{ _id : compilationID },
			{ $push: { writings : req.body.writingID } },
		);
			
		res.status(200).json({success: true});
	}catch (err) {
		res.status(500).json({success: false, err});
		console.log(err);
	}
});

// 모음집에서 글 삭제
router.delete('/deleteWriting', async (req, res) => {
	try {
		const compilationID = req.body.compilationID;
				
		const stat = await CompilationModel.findOneAndUpdate(
			{ _id : compilationID },
			{ $pull: { writings : req.body.writingID } },
		);
			
		res.status(200).json({success: true});
	}catch (err) {
		res.status(500).json({success: false, err});
		console.log(err);
	}
});


module.exports = router;