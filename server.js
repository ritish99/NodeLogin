const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const { response } = require('express');
require('dotenv').config({ path: './.emv' });
const jwt = require('jsonwebtoken');
const session = require('express-session');
const store = new session.MemoryStore();
const router = new express.Router();

const JWT_SECRET = 'fnksdbfjobedjb^%&^Y*&*(Ey6r9638946983y6983rghb9b(@Y(*47r8hn';


//nodemon server.js

//connecting to db
mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, () =>
    console.log('Connected to DB')
);


//mongodb+srv://ritish:PHxQVVMIqf4SFhTN@login-app.hzfkt.mongodb.net/login-app?retryWrites=true&w=majority

const app = express();
app.use('/', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(session({secret:"nf3euh834h29hf328hb8f3b38b", resave:false, saveUninitialized:false, store}));

router.get('/', function(req, res){
	if(req.session.username){
		//window.location.assign("http://localhost:3000/401.html");
		console.log(req.session.username);
	}
	else{
		res.redirect('/401');
	}
});

app.post('/api/login', async (req, res) => {
	
	console.log(req.sessionID);
	const { username, password } = req.body;
	const user = await User.findOne({ username }).lean();

	if(!user){
		return res.json({ status: 'error', error: 'Invalid information' });
	}
	else{
		req.session.authenticated = true; 
		req.session.username = {
			username
		};
		//res.json(req.session);
		console.log(req.session.username);
	}

	if(await bcrypt.compare(password, user.password)){
		//combination was successful
		const token = jwt.sign({ id:user._id, username: user.username}, JWT_SECRET);
		// console.log(user)
		const userTokenResult = await User.findByIdAndUpdate(user._id, {"userToken":token}, function(err, result){
			if(err){

			}
			else{
				return res.json({ status: 'ok', data: token, user:username}); 
				//render next page (web chat) admin admin123
			}
		});	
	}
	else{
		res.json({ status: 'error', error: 'Invalid information' });
	}
	
});


app.get('/login', function(req,res){
	// if(req.session.username){
	// 	res.redirect('/index');
	// }
});

// https://livecodestream.dev/post/a-practical-guide-to-jwt-authentication-with-nodejs/
app.post('/api/validateToken', (req, res) => {
	// let token = req.body.token;
	// let username = req.body.username;
	// const user = User.findOne({ username }).lean();
	// console.log(user)
	// if(!user){
	// 	return res.json({ status: 'error', error: 'Invalid information' });
	// }
	// else{
	// 	// console.log(user.userToken);
	// }

});

app.post('/api/register', async (req, res) => {
	console.log(req.body);
	res.json({ status: 'ok' });

	const { username, password: plaintTextPassword } = req.body; 


	if(!username || typeof username !== 'string'){
		return res.json({status: 'error', error: 'Invalid username'});
	}

	if(!plaintTextPassword || typeof plaintTextPassword !== 'string'){
		return res.json({status: 'error', error: 'Invalid password'});
	}

	if(plaintTextPassword.length < 5){
		return res.json({status: 'error', error: 'Password is too small. Needs to be atleast 6 characters.'});
	}
	const password = await bcrypt.hash(plaintTextPassword, 10);

	//Hashing the passwords
	try{
		const res = await User.create({
			username,
			password
		});
		console.log('User response successfully: ', response);
	}catch(error){
		if(error.code === 11000){
		return res.json({status: 'error', error: 'Username already in use'});
		}
	}
	throw error;
});




app.listen(3000, () => {
	console.log('Server up at 3000');
});
