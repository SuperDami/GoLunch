var express = require('express');

var app = module.exports = express.createServer();
var Model = require('./models/todo.js'),
    Todo = Model.Todo, ResigUser = Model.User;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  Todo.find({}, function(err, todos) {
    res.render('login', {
      title: 'go lunch',
      todos: todos,
      errors: req.session.errors,
    });
  });
});

app.post('/checkLogin', function(req, res) {
  ResigUser.find({name:req.body.nameInput}, function(err, user){
    if(user.length) {
      if(user[0].password == req.body.passwordInput) {
        req.session.items = user[0];
        res.end(JSON.stringify({url:"/toVote"}));
        return;    
      } else {
        console.log('password error');
        res.end(JSON.stringify({password:"password error"}));
      }
    } else {
      console.log("no this user");
      res.end(JSON.stringify({user:"no this user"}));
    } 
  }); 
});

app.use(express.cookieParser());
app.use(express.session({ secret: "User Track" }));

//app.post('/', function(req, res){
//  if(!req.body.nameInput){
//    res.redirect('/');
//    return;
//  }
//  ResigUser.find({name:req.body.nameInput}, function(err, user){
//    if(user.length) {
//
//        if(user[0].password == req.body.passwordInput){
//          req.session.items = user[0];
//          res.redirect('/toVote');
//          return;    
//        }
//        else {
//          console.log('password error');
//          req.session.errors = {password:"password error"};
//          res.redirect('/');
//        }
//      }  
//      else {
//        console.log("no this user");
//        req.session.errors = {user:"no this user"};
//        res.redirect('/');
//      }  
//  });  
//});

app.get('/toVote', function(req, res){
  Todo.find({}, function(err, todos) {
    res.render('vote', {
      title: 'vote now',
      user: req.session.items,
      todos: todos,
      showResult: false,
      errors: req.session.errors,
    });
  });
});

app.post('/voted',function(req, res)
{
  var select=req.body;
//  console.log(req.body.moodHid);
  if(select.mood instanceof Array){
    var j=0;
    for(var i=0; i<select.mood.length; i++){
      Todo.findById(select.moodHid[i], function(err, todo){  
        if(select.mood[j]=='Want'){
          todo.wantUsers.push(req.session.items.name);
          todo.save(function(err){
            if (err) console.log('ERROR:' + err);
            req.session.errors = [err];
          });
        }
        if(select.mood[j]=='Dont'){
          todo.dontUsers.push(req.session.items.name);
          todo.save(function(err){
            if (err) console.log('ERROR:' + err);
            req.session.errors = [err];
          });
        }  
        j++;
      });
    }
  }
  else{
    
  }

  res.redirect('/endVote');
});

app.get('/endVote', function(req, res){
  Todo.find({}, function(err, todos) {
    res.render('vote', {
      title: 'vote end',
      user: req.session.items,
      todos: todos,
      showResult: true,
      errors: req.session.errors,
    });
  });
});

app.get('/toResigter', function(req, res){
  res.render('register', {
    title:'register page',
    errors:req.session.errors,
  });
});

app.post('/checkResigter',function(req, res){

  ResigUser.find({name: req.body.u.name},function(err, user){
    if(user.length){
//      req.session.errors = {user:"user exist"};
//      res.redirect('/toResigter');
      res.end(JSON.stringify({user:"user exist"}));
      return;
    }  
    
    var newUser = new ResigUser(req.body.u);
    newUser.save(function(err){
      if (err){
//        req.session.errors = err.errors;
//        res.redirect('/toResigter');
        res.end(JSON.stringify(err.errors));
        return;
      }
      
      console.log("new user add: "+req.body.u);
      req.session.items = req.body.u;
      res.end(JSON.stringify({url:"/toVote"}));      
//      res.redirect('/toVote');  
            
    });
  });
});

app.get('/toManage', function(req, res){
  Todo.find({}, function(err, todos) {
    ResigUser.find({}, function(err, users){
      res.render('manage', {
        title: 'manage',
        todos: todos,
        users: users,
        errors: req.session.errors,
      });
    });
  });
});

app.post('/add',function(req, res) 
{
var todo = new Todo(req.body.m);

todo.voteNum = 0;
todo.save(function(err){
  if (err) console.log('ERROR:' + err);
  req.session.errors = [err];
});
res.redirect('/toManage');

});

app.post('/delete', function(req, res) {
  console.log(req.body.todo_state);  
  var ob = req.body.todo_state;
  
  if(!ob){
  res.redirect('/toManage');
  return;
  }
  
  if(ob instanceof Array){
    for(var i=0; i<ob.length; i++){
      Todo.findById(ob[i], function(err, todo) {
        if (err) {
          console(err);
          res.send('Post not found');
        } else {
          todo.remove(function(err) {
            if (err) {
              console.log(err);
            }
          }); 
        }
      });
    }
  }
  else {
  Todo.findById(req.body.todo_state, function(err, todo) {
      if (err) {
        console(err);
        res.send('Post not found');
      } else {
  //      todo.todo_state = req.body.todo_state;
        todo.remove(function(err) {
          if (err) {
            console.log(err);
          }
        }); 
      }
    });
  }
  res.redirect('/toManage');
});

app.post('/userManage', function(req, res){
  var delUser = req.body.user_state;
  
  if(!delUser){
  res.redirect('/toManage');
  return;
  }
  
  if(delUser instanceof Array){
    for(var i=0; i<delUser.length; i++){
      ResigUser.findById(delUser[i], function(err, user) {    
        if (err) {
          console(err);
          res.send('Post not found');
        } else {
    //      todo.todo_state = req.body.todo_state;
          user.remove(function(err) {
            if (err) {
              console.log(err);
            }
          }); 
        }
      });
    }
  }
  else {
    ResigUser.findById(delUser, function(err, user) {
      if (err) {
        console(err);
        res.send('Post not found');
      } else {
  //      todo.todo_state = req.body.todo_state;
        user.remove(function(err) {
          if (err) {
            console.log(err);
          }
        }); 
      }
    });
  }
  res.redirect('/toManage');
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
// vim: set ts=2 sw=2 sts=2 expandtab fenc=utf-8:
