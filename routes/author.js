// author_model과 관련된 요청 처리, 독자 사용자와 라우터 분리
var express = require('express');
var router = express.Router();

const { AuthorModel } = require("../models/author_model");

// controller로 분리하지 않고 route에서 바로 구현
router.get("/", (req, res) => {
  	res.status(200).send({message : "사용자 인증 로직"});
});

router.post('/signup', async (req, res) => {
	try {
		const authorModel = new AuthorModel(req.body);
		const stat = await authorModel.save();

		if (!stat){
			const err = new Error("Internal Server Error");
			res.status(400).json({success: false, err});
		}
		res.status(200).json({success: true});
		console.log(stat);
	}catch (err) {
		res.status(500).send(err);
		console.log(err);
	}
});

router.get('/login', async (req, res) => {
	try{
		const author = await AuthorModel.findOne({ email: req.query.email })
		
		if(author){
			  author
				.comparePassword(req.query.password)
				.then((isMatch) => {
				  if (!isMatch) {
					return res.json({
					  loginSuccess: false,
					  message: "Invalid Password",
					});
				  }
				  author
					.generateToken()
					.then((author) => {
					  res
						.status(200)
						.json({ loginSuccess: true, authorToken : author.token }); // userId: user._id
					})
					.catch((err) => {
					  res.status(400).send({loginSuccess: false, err});
					});
				})
				.catch((err) => res.json({ loginSuccess: false, err }));
			}else {
			  res.status(400).send({loginSuccess: false, message: "No Such Author"});
			}
	}catch (err){
		return res.json({
			loginSuccess: false,
			message: err,
		});
	 }
});

module.exports = router;