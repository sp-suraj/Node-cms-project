const express = require('express');
const router = express.Router();
const Category = require('../../models/categories');


router.all('/*', (req, res, next)=>{
    
    req.app.locals.layout = 'admin';
    next();
})

router.get('/', (req, res)=>{
    Category.find({}).then(categories=>{

        res.render('admin/categories/index', {categories: categories});
    })
});

router.post('/create', (req, res)=>{

    let newCategory = new Category({
        name: req.body.name
    })
    newCategory.save().then(savedCategory=>{
        req.flash('success_message', `Category ${savedCategory.name} was created successfully`)
        res.redirect('/admin/categories');
    })
});

router.get('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{

        res.render('admin/categories/edit', {category: category});
    });
});

router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{

        category.name = req.body.name;
        category.save().then(updatedCategory=>{

            req.flash('update_message', `Category ${updatedCategory.name} was updated successfully`);
            res.redirect('/admin/categories');
        });
    });
});

router.delete('/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.remove().then(message=>{
            req.flash('delete_message', `Category ${category.name} was deleted successfully`);
            res.redirect('/admin/categories');
        })
    })
})


module.exports = router;