// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
var express = require('express');
var router = express.Router();

const { AuthorModel } = require("../models/author_model");

router.get("/", (req, res) => {
  	res.status(200).send({message : "작가 사용자 관련 로직"});
});

// 작가 정보를 token으로 가져오는 요청 처리 (_id, password는 노출되지 않음)
router.get('/getAuthor', async (req, res) => {
	try{
		const authorID = await AuthorModel.getIdByToken(req.query.token);
		// lean을 통해 객체를 document 형태가 아닌 일반 js object로 변환
		const author = await AuthorModel.findOne({ _id: authorID }).lean();
		
		author._id = undefined;
		author.password = undefined;
		return res.status(200).send({author});
	}catch (err){
		return res.status(500).json({
			sucess: false,
			message : err.message
		});
	 }
});

// 회원가입을 위한 요청 처리
router.post('/signup', async (req, res) => {
	try {
		const author = new AuthorModel(req.body);
		const stat = await author.save();

		if (!stat){
			const err = new Error("Internal Server Error");
			res.status(400).json({success: false, message : err});
		}
		res.status(200).json({success: true});
	}catch (err) {
		res.status(500).json({success: false, message : err.message});
	}
});

// 로그인을 위한 요청 처리, _id로 생성된 token 발급
router.get('/login', async (req, res) => {
	try{
		const author = await AuthorModel.findOne({ email: req.query.email })
		console.log(req.query.email + " " + req.query.password)
		if(author){
			  author
				.comparePassword(req.query.password)
				.then((isMatch) => {
				  if (!isMatch) {
					return res.json({
					  loginSuccess: false,
					  err: "Invalid Password",
					});
				  }
				  author
					.generateToken()
					.then((author) => {
					  res
						.status(200)
						.json({ sucess: true, authorToken : author.token }); // userId: user._id
					})
					.catch((err) => {
					  res.status(400).send({sucess: false, message : err.message});
					});
				})
				.catch((err) => res.json({ sucess: false, message : err.message }));
			}else {
			  res.status(400).send({sucess: false, err: "No Such Author"});
			}
	}catch (err){
		return res.status(500).json({
			sucess: false,
			message : err.message
		});
	 }
});

// 계정 정보 수정을 위한 요청 처리, replace로 document replace
router.put('/modify', async (req, res) => {
	try{
		const token = req.body.token;
		const authorID = await AuthorModel.getIdByToken(token);
		const baseAuthor = await AuthorModel.findOne({ _id: authorID });
		
		if(baseAuthor){
				const status = await AuthorModel.replaceOne(
					{_id : authorID},
					req.body
				);
			
				return res.status(200).send({sucess: true, status});
		}else {
			res.status(400).send({sucess: false, message: "No Such Author"});
		}
	}catch (err){
		return res.status(500).json({
			sucess: false,
			message : err.message,
		});
	 }
});

module.exports = router;