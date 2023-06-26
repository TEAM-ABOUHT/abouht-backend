var express = require('express');
var router = express.Router();

const mongoose = require("mongoose");
const { GenreModel } = require("../models/genre_model");

router.get("/", (req, res) => {
  	res.status(200).send({message : "장르 관련 로직"});
});

// 장르 _id로 장르 정보 가져오기
router.get("/getGenre", (req, res) => {
  	res.status(200).send({message : "장르 관련 로직"});
});

module.exports = router;