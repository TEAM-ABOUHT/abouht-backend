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

module.exports = router;