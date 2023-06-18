// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
var express = require('express');
var router = express.Router();

const mongoose = require("mongoose");
const { WritingModel } = require("../models/writing_model");
const { AuthorModel } = require("../models/author_model");

router.get("/", (req, res) => {
  	res.status(200).send({message : "글 관련 로직"});
});

// writing _id로 하나의 글만을 가져오는 요청 처리
router.get('/getWriting', async (req, res) => {
	try{
		const writing = await WritingModel.findOne({ _id: req.query.writingID }).lean();
		return res.status(200).send({writing});
	}catch (err){
		console.log(err);
		return res.status(500).json({
			sucess: false,
			message: err,
		});
	 }
});

// author token으로 작가의 모든 글을 가져오는 로직
router.get('/getAuthorWritings', async (req, res) => {
	try{
		const authorID = await AuthorModel.getIdByToken(req.query.token);
		// lean을 통해 객체를 document 형태가 아닌 일반 js object로 변환
		const author = await AuthorModel.findOne({ _id: authorID }).lean();
		const writingIDs = author.writings;
		
		
		var writings = [];
		for(var i = 0;i < writingIDs.length;i++)
			writings.push(await WritingModel.findOne({ _id: writingIDs[i] }).lean());
		
		return res.status(200).send({writings});
	}catch (err){
		console.log(err);
		return res.status(500).json({
			sucess: false,
			message: err,
		});
	 }
});

// 글 작성, 작가 writings token 추가 로직
router.post('/addWriting', async (req, res) => {
	// 두개 이상의 collection에 접근하기 때문에 transaction 사용
	const session = await mongoose.startSession();
	await session.startTransaction();
	try {
		const writing = new WritingModel(req.body);
		const authorID = await AuthorModel.getIdByToken(writing.authorToken);
		await writing.save({ session });
				
		const stat = await AuthorModel.findOneAndUpdate(
			{ _id : authorID },
			{ $push: { writings : writing._id } },
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

// 글 수정
router.put('/modifyWriting', async (req, res) => {
	try {
		await WritingModel.findOneAndUpdate(
			{ _id : req.body.writingID },
			{
				title : req.body.title,
				content : req.body.content,
				updateDate: Date.now(),
			}
		);
		
		res.status(200).json({success: true});
	}catch (err) {
		res.status(500).json({success: false, err});
		console.log(err);
	}
});

// 글 삭제
router.delete('/deleteWriting', async (req, res) => {
	const session = await mongoose.startSession();
	await session.startTransaction();
	try {
		const writing = await WritingModel.findOne({ _id : req.body.writingID });
		const authorID = await AuthorModel.getIdByToken(writing.authorToken);
		
		await AuthorModel.findOneAndUpdate(
			{ _id : authorID },
			{ $pull : { writings : writing._id } },
			{ session: session }
		);
		await WritingModel.deleteOne({ _id : req.body.writingID }, { session });
		
		await session.commitTransaction();
		res.status(200).json({success: true});
	}catch (err) {
		await session.abortTransaction();
		res.status(500).json({success: false, err});
		console.log(err);
	}
	await session.endSession();
});

module.exports = router;