

require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Project2';
const logger       = require('morgan');
const path         = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);


//Twilio call
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const schedule = require('node-schedule-tz');

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log(`Successfully connected to the database ${MONGODB_URI}`))
  .catch(error => {
    console.error(`An error ocurred trying to connect to the database ${MONGODB_URI}: `, error);
    process.exit(1);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
  
//sessions
app.use(
  session({
      secret: "regenerator",
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

app.get('/logout', function(req, res){
  if (req.session) {
    req.session.auth = null;
    res.clearCookie('auth');
    req.session.destroy(function() {});
  }
  res.redirect('/auth/login');
});

//end sessions

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));






// default value for title local
app.locals.title = 'IronCaller App';
app.locals.slogan = "The best app to remind you"


// ROUTES 
app.use('/', require('./routes/index'));
app.use("/auth", require("./routes/auth"));
app.use("/tasks", require("./routes/task-routes/task"));
app.use("/users", require("./routes/user-routes/user"));
app.use("/leads", require("./routes/comments-routes/comments"));




module.exports = app;
