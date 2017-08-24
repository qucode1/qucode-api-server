
var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Please add a list Name'
  },
  items: [{
    type: String
  }]
});

module.exports = mongoose.model("List", listSchema);
