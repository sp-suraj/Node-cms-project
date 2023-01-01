const express = require('express');
const router = express.Router();
const Post = require('../../models/posts');
const User = require('../../models/users');
const Comment = require('../../models/comments');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Comment.find({user: req.user.id}).populate('user')
    .then((comments) => {
        res.render('admin/comments', {comments: comments});
    });
});

router.post('/', (req, res) => {

    Post.findOne({_id: req.body.id}).then((post) => {

        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        post.comments.push(newComment);

        post.save().then((savedPost) => {
            newComment.save().then((savedComment) => {
                req.flash('success_message', 'Comment posted successfully');
                res.redirect(`/post/${post.id}`);
            });
        });
    });
});


router.delete('/:id', (req, res) => {

    Comment.findOne({_id: req.params.id}).then(comment=>{
        comment.remove().then(removedComment=>{

            Post.findOneAndUpdate({comments: req.params.id}, {$pull:{comments: req.params.id}}, (err, data) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/admin/comments')
            })
            
        });
    })
});


router.post('/approve-comment', (req, res)=>{

    Comment.findByIdAndUpdate(req.body.id, {$set:{approveComment: req.body.approveComment}}, (err, result)=>{
        if(err) throw err;

        res.send(result);
    });
})




module.exports = router;