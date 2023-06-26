const mongoose = require("mongoose");

// 장르 스키마, 거의 static하게 구성
const genreSchema = mongoose.Schema({
	parentID: {				// 상위 장르 _id
		type: String,
	},
	name: {					// 장르 이름
		type: String,
		maxLength: 100,
		required: true
	},
});

const GenreModel = mongoose.model("GenreModel", genreSchema);

module.exports = { GenreModel };