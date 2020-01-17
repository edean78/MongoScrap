var mongoose = require("mongoose");

// Save a refernce to the Schema constructor
var Schema = mongoose.Schema;

// Create a new UserSchema object
var ArticleSchema = new Schema({
    // 'headline' is required and of the type String
    article: {
        type: String,
        required: true,
        unique: true
    },
    // 'summary' is required and of type String
    Summary: {
        type: String,
        required: true
    },
    // 'URL' is required and of type String
    url: {
        type: String,
        required: true
    },
    // 'comment' is an object that stores a Comment id
    // The ref property links the ObjectId to the Comment model
    // This allows us to populate tghe Article with an associated Comment
    note: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Headline", ArticleSchema);

// Ecport the Headline model
module.exports = Article;