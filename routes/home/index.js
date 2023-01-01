const express = require('express');
const { findOne } = require('../../models/posts');
const router = express.Router();
const Post = require('../../models/posts');
const Category = require('../../models/categories');
const User = require('../../models/users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { LEGAL_TCP_SOCKET_OPTIONS } = require('mongodb');
const LocalStrategy = require('passport-local').Strategy;





// Home Default Layout


router.all('/*', (req, res, next)=>{   
    req.app.locals.layout = 'home';
    next();
})






// Home Route


router.get('/', (req, res)=>{

    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts=>{

        Post.count().then(postCount=>{
            Category.find({}).then(categories=>{
                res.render('home/index', {
                    posts: posts, 
                    categories: categories, 
                    current: parseInt(page),
                    pages: Math.ceil(postCount/perPage)
                });
            });
        });       
    });
});







// Single Post View Route


router.get('/post/:slug', (req, res)=>{
    Post.findOne({slug: req.params.slug}).populate({path: 'comments', populate:{path: 'user', model:'users'}})
    .populate('user')
    .then(post=>{

        Category.find({}).then(categories=>{
            res.render('home/post', {post: post,  categories: categories});           
        });
    });
});





// Login Get and Post Routes


router.get('/login', (req, res, next)=>{
    res.render('home/login');
});

// App Login
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{

    User.findOne({email: email}).then(user=>{
        if(!user) return done(null, false, {message: 'No user found'});

        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;
            if(!matched) return done(null, false, {message: 'Incorrect password'});     
            else return done(null, user);
        });
    });
}));
// //serialise and deserialise
passport.serializeUser((user, done)=>{
    done(null, user.id)
});
  
passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err, user);
    })
});

router.post('/login', (req, res, next)=>{

    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);

});



//Logout Route

router.get('/logout', (req, res)=>{

    req.logOut(err=>{
        if(err) return err;
    });
    res.redirect('/login');
})





// Register Get and Post Routes


router.get('/register', (req, res)=>{
    res.render('home/register');
});
router.post('/register', (req, res)=>{
    let errors = [];
    if(!req.body.firstName){
        errors.push({message:'please Enter First Name'});
    }
    if(!req.body.lastName){
        errors.push({message:'please Enter Last Name'});
    }
    if(!req.body.email){
        errors.push({message:'please Enter Email'});
    }
    if(!req.body.password){
        errors.push({message:'please Enter Password'});
    }
    if(!req.body.passwordConfirm){
        errors.push({message:'please Confirm Password'});
    }
    if(req.body.password !== req.body.passwordConfirm){
        errors.push({message:"Password don't match"});
    }
    if(errors.length > 0){
        res.render('home/register', {
            errors: errors,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
        })
    }
    else{
        User.findOne({email: req.body.email}).then(foundEmail=>{
            if(foundEmail){
                req.flash('error_message','User already registered, please login');
                res.redirect('/login');
            }
            else
            {
                const newUser = new User({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    password : req.body.password       
                });

                bcrypt.genSalt(10, (err, salt)=>{

                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{    
                            req.flash('success_message','You are now registered, please login');;
                            res.redirect('/login')
                        });
                    });
                });        
            };
        });
        
    };
});




// About Route

router.get('/about', (req, res)=>{
    res.render('home/about');
});



// Contact Route

router.get('/contact', (req, res)=>{
    res.render('home/contact');
});

//Forgot Password
router.get('/forgot-password', (req, res)=>{
    res.render('home/forgot-password');
});


router.post('/')



module.exports = router;