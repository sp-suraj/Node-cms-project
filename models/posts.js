const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLslugs = require('mongoose-url-slugs');


const postSchema = new Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    category:{
        type: Schema.Types.ObjectId,
        ref: 'categories'

    },

    title:{
        type: String,
        require: true
    },

    status:{
        type: String,
        default: 'public'
    },

    allowComments:{
        type: Boolean,
        require: true
    },

    description:{
        type: String,
        require: true
    },

    file:{
        type: String
    },

    date:{
        type: Date,
        default: Date.now()
    },
    slug:{
        type: String
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
});

postSchema.plugin(URLslugs('title', {field: 'slug'}))

module.exports = mongoose.model('posts', postSchema);
