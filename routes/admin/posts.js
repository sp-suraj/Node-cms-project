const express = require('express');
const posts = require('../../models/posts');
const router = express.Router();
const Post = require('../../models/posts');
const Category = require('../../models/categories');
const {isEmpty, uploadDir} = require('../../helpers/uploads-helpers');
const fs = require('fs');
const path = require('path');
const categories = require('../../models/categories');

router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Post.find({})
    .populate('category').then(posts=>{
    res.render('./admin/posts/index', {posts: posts});
    });
});

router.get('/my-posts', (req, res)=>{

    Post.find({user: req.user})
    .populate('category').then(posts=>{
    res.render('./admin/posts/my-posts', {posts: posts});
    });
});







router.get('/create', (req, res)=>{
    Category.find({}).then(categories=>{
        res.render('./admin/posts/create', {categories: categories});
    });
});

router.post('/create', (req, res)=>{
    let errors = [];
    if(!req.body.title){
        errors.push({message:'please Enter Title'});
    }
    if(!req.body.description){
        errors.push({message:'please Enter Description'});
    }
    if(errors.length > 0){
        res.render('admin/posts/create', {errors: errors})
    }
    else{
        let fileName = 'fav-car.jpg';
        if(!isEmpty(req.files)){
            let file = req.files.file;
            fileName = Date.now() + '-' + file.name;
            file.mv('./public/uploads/' + fileName, (err)=>{
                if (err) throw err;
            })
        }
        else{
            console.log('is empty')
        }   
        let allowComments = true;
        if(req.body.allowComments){
            allowComments = true;
        }
        else{
            allowComments = false;
        }
        const newPost = new Post({

            user: req.user.id,
            category: req.body.category,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            description: req.body.description,
            file: fileName
        });
        newPost.save().then(dataSaved=>{
            
            req.flash('success_message', `Post ${dataSaved.title} was created successfully`);

            res.redirect('/admin/posts/my-posts');
            // console.log('data saved');
        });
    };
});

router.get('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('./admin/posts/edit', {post: post, categories: categories});
        });         
    });
});


router.put('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        if(req.body.allowComments){
            allowComments = true;
        }
        else{
            allowComments = false;
        }
        posts.user = req.user.id;
        post.category = req.body.category;     
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.description = req.body.description;

        if(!isEmpty(req.files)){
            let file = req.files.file;
            fileName = Date.now() + '-' + file.name;
            post.file = fileName;
            file.mv('./public/uploads/' + fileName, (err)=>{
                if (err) throw err;
            })
        }

        post.save().then(updatedPost=>{

            req.flash('update_message', `Post ${updatedPost.title} is updated successfully`);
            res.redirect('/admin/posts/my-posts');
        })
    })
})


router.delete('/:id', (req, res)=>{

    Post.findOne({_id: req.params.id})
    .populate('comments')
    .then(post=>{

        if(post.comments.length > 0){

            post.comments.forEach(comment=>{
                comment.remove();
            })
        };


        post.remove();

        fs.unlink(uploadDir+post.file, (err)=>{         
            req.flash('delete_message', `Post ${post.title} was deleted successfully`);
            res.redirect('/admin/posts/my-posts');
        })
    })
})








module.exports = router;

