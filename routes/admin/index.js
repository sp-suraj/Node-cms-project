const express = require('express');
const router = express.Router();
const Post = require('../../models/posts');
const faker = require('faker');
const Comment = require('../../models/comments');
const Category = require('../../models/categories');

router.all('/*', (req, res, next)=>{
    
    req.app.locals.layout = 'admin';
    next();
})

router.get('/', (req, res)=>{

    Post.count().then(postCount=>{
        Comment.count().then(commentCount=>{
            Category.count().then(categoryCount=>{

                res.render('admin/index', {postCount: postCount,commentCount: commentCount, categoryCount: categoryCount});
            })
        })
    })
    
    
    
});

router.get('/dashboard', (req, res)=>{

    res.render('admin/dashboard');
});

router.post('/generate-fake-posts', (req, res)=>{

    for(let i = 0; i < req.body.amount; i++){
        
        let post = new Post();
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.datatype.boolean();
        post.description = faker.lorem.sentence();
        post.slug = faker.name.title();

        post.save().then(savedPost=>{
            console.log('faking done');
        })

    }

    res.redirect('/admin/posts');
})

module.exports = router;