const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
const passport = require('passport');
const {mongodbUrl} = require('./config/database')



app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride('_method'));
app.use(fileUpload());

mongoose.connect(mongodbUrl).then(db=>console.log('Mongo Connected'))
    .catch(err=>console.log(err));
    



//session
app.use(session({
    secret: 'surajprajapti',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
//Using Local Variables for flash

app.use(flash());

app.use((req, res, next)=>{
    res.locals.User = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.update_message = req.flash('update_message');
    res.locals.delete_message = req.flash('delete_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

//Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories')
const comments = require('./routes/admin/comments')

//Use Routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.use(express.static(path.join(__dirname, 'public')));



const {select, generateDate, paginate} = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs.engine({defaultlayout: 'home', helpers: {select: select, generateDate: generateDate, paginate: paginate}, handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'handlebars');

const port = process.env.PORT || 4000;
app.listen(port, ()=>console.log(`LISTENING on PORT ${port}`));