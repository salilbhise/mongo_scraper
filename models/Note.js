const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
const Noteschema = new Schema({
  // `title` must be of type String
	title: {
		type: String,
  },
  // `body` must be of type String
	body: {
		type: String,
	}
});

// This creates our model from the above schema, using mongoose's model method
const Note = mongoose.model("Note", Noteschema);

// Export the Note model
module.exports = Note;