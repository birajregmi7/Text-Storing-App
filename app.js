const express = require('express');
const app = express();
const ejs = require('ejs')
const path = require('path')
const ejsMate = require('ejs-mate')
const textModel = require('./models/message')
const passport = require('passport')
const methodOverride = require("method-override");
const expressSession = require('express-session');
const userModel = require('./models/owner');
const localStrategy = require('passport-local')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
let sessionDetails = {
    secret: 'ourrandomsecret',
    resave: true,
    saveUninitialized: true,
}
app.use(expressSession(sessionDetails));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser()); // user ka data session me store karna
passport.deserializeUser(userModel.deserializeUser()); // user ka data session se nikalna 

const isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        // req.flash('error', 'Sorry, you need to login before accessing');
        return res.redirect('/login');
    }
    next();
};
app.get('/', (req, res) => {
    res.redirect('/login')
})
app.get('/posts', isLoggedIn, async (req, res) => {
    const alltexts = await textModel.find({})
    // console.log(alltexts)
    res.render('index.ejs', { alltexts })
})
app.get('/posts/new', isLoggedIn, async (req, res) => {
    res.render('new.ejs')
})
app.post('/posts', isLoggedIn, async (req, res) => {
    let userMessage = req.body.message;
    // console.log(userMessage)
    const newMessage = new textModel({
        message: req.body.message
    });
    await newMessage.save()
    res.redirect('/posts')
    // console.log('Message saved', newMessage)
});
app.get('/posts/:id', isLoggedIn, async (req, res) => {
    let { id } = req.params;
    const findingId = await textModel.findById(id);
    res.render('edit.ejs', { findingId });
})
// app.get('/posts/:id/edit', (req, res) => {
//     res.render('edit.ejs')
// })
app.put('/posts/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const updatedFinalData = await textModel.findByIdAndUpdate(id, { message: req.body.message, });
    console.log(updatedFinalData)
    res.redirect('/posts')
})
app.delete('/posts/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const deletedData = await textModel.findByIdAndDelete(id)
    console.log(deletedData);
    res.redirect('/posts')
})
app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})
app.post('/signup', async (req, res) => {
    let { email, username, password } = req.body;
    const newUser = new userModel({ email, username })
    const registerdUser = userModel.register(newUser, password)
    console.log('new user is saved')
})
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/login',
    // failureFlash: true
}));
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect('/login')
    })
})
app.listen(3000, () => {
    console.log('Server is listening')
})