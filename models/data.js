// todo.js
require.paths.unshift('vendor/mongoose');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/todo');
var Schema = mongoose.Schema;

var Todo = new Schema({
  name: {
    type: String,
    index: true,
    validate: [function(v){return v.length > 0;}, 'name is required.'],
  },
  todo_state: Number,
  memo: {
    type: String,
    validate: [function(v){return v.length > 0;}, 'memo is required.'],
  },
  created_at: Date,
  voteUsers: Array,
  wantUsers: Array,
  dontUsers: Array,
  voteNum: Number
});

Todo.pre('save', function(next) {
  if (this.isNew) {
    this.todo_state = 0;
    this.created_at = new Date();
//    this.voteNum = 0;
  }
  next();
});
mongoose.model('Todo', Todo);

//module.exports = Todo;
module.exports.Todo = db.model('Todo');


// vim: set ts=2 sw=2 sts=2 expandtab fenc=utf-8:

var User = new Schema({
  name: {
    type: String,
    index: true,
    validate: [function(v){return v.length > 0;}, 'name is required.'],
  },
  
  password: {
    type: String,
    validate: [function(v){return v.length > 0;}, 'password is required.'],
  },
  
  passwordRepeat: {
  	type: String,
  	validate: [function(v){return (v.length > 0)&&(v == this.password);}, 'password is not mach.'],
  },
  
  created_at: Date,
});

User.pre('save', function(next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  next();
});

mongoose.model('User', User);
module.exports.User = db.model('User');

var DailyInf = new Schema({
  created_at: {
    type: Date,
    index: true,
  },
  voteName: String,
  want: String,
  dont: String,
});

DailyInf.pre('save', function(next) {
  if (this.isNew) {
    var date = new Date();
    this.created_at = date.toDateString();
  }
  next();
});

mongoose.model('DailyInf', DailyInf);
module.exports.DailyInf = db.model('DailyInf');