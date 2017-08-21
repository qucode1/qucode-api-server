
var mongoose = require("mongoose");

var rowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Please define a Row name'
  },
  text: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Text"
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill"
  }],
  active: {
    type: Boolean,
    required: 'Please define if the Row should be public or not'
  }
});

module.exports = mongoose.model("Row", rowSchema);
