/**
 * Created by dale.guo on 2/17/17.
 */
var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'chat';

	// Render the view
	view.render('intercom');
};

var express = require('express');
var router = express.Router();
var path = require('path');
var roomId = 'default';
//Database begin
var is_db_active = false;
var database = require('../databases/database');
var db = database.db;
db.on('error', function(){
	is_db_active = false;
	console.error.bind(console, 'connection error:')
});
db.once('open', function() {
	is_db_active = true;
});

var mongoose = database.mongoose;
var Chatroom = database.Chatroom;
var User = database.User;
var Message = database.Message;
var Log = database.Log;
//Database end

router.param('namespace', function(req, res, next, id){
	req.namespace = id;
	next();
});
/* GET users listing. */
// 1. https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
// 2. https://segmentfault.com/a/1190000000438604 分组数据传输
// route middleware to validate :name
router.param('room_id', function(req, res, next, id) {
	// TOdo validation on name here
	// ==============Save Log DEMO=================
	var log = new Log;
	log.type = 'notice';
	// log.user_id = new mongoose.Types.ObjectId;
	// log.room_id = new mongoose.Types.ObjectId;
	// log.message_id = new mongoose.Types.ObjectId;
	log.content = 'notice: a room quest begin!';
	log.save(function(err) {if (err) {console.log(err);}});
	console.log('============a room quest begin!===============>>>');
	// ==============Save Log DEMO=================

	// once validation is done save the new item in the req
	req.room_id = req.namespace + '/' + id;

	//create a room item if not exsits
	var room = new Chatroom;
	room.room_name = req.room_id;//: { type: String, required: true, unique: true }, //room_name:company1/1001
	// room.is_private = ;//:  { type: Boolean, default: false },//默认都是 公开 TODO:暂无该聊天室，请联系管理员添加！
	// room.join_key = ;//: String, //加入密码
	// room.created_uid = ;//: Schema.Types.ObjectId,//创建者
	// room.participants = ;//:[Schema.Types.ObjectId],//当前参与者！都有谁来过，通过message获得！ m.array.push(1);
	// room.created_at = ;//:  { type: Date, default: Date.now },
	// room.last_active_at = ;//:  { type: Date, default: Date.now },//last active time!
	room.save();
	// go to the next thing
	next();
});

var users = [];//all users in all rooms /:id
var connections = [];//all connections in all rooms

router.get('/:namespace/:room_id', function(req, res, next) {
	// res.send('respond with a rooms');
	//http://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
	res.sendFile('intercom.html', { root: path.join(__dirname, '../public') });

	//https://github.com/onedesign/express-socketio-tutorial
	var io = res.io;
	var namespace = req.namespace;
	var roomId = namespace + '/' + req.params.room_id;

	// Chatroom
	io.of(namespace).once('connection', function(socket){
		connections.push(socket);
		console.log('Connected: %s sockets connected',connections.length);


		//Disconnect
		socket.on('disconnect',function(data){
			connections.splice(connections.indexOf(socket), 1);
			console.log('Disconnected: %s sockets connected',connections.length);

			if(!socket.username) return;
			users.splice(users.indexOf(socket.username), 1);
			updateUsernames();
		})

		//http://stackoverflow.com/questions/33373176/typeerror-io-sockets-clients-is-not-a-function
		// var usersInRoom = io.of(namespace).in(roomId).clients;
		// console.log('usersInRoom');
		// console.log(usersInRoom);
		// console.log('clientsList');
		// var clientsList = io.sockets.adapter.rooms;
		// // var numClients = clientsList.length;
		// console.log(clientsList);
		// console.log('rooms');
		// console.log(io.of(namespace).adapter.rooms);

		// socket.emit('rooms', io.of('/').adapter.rooms);

		// 一个socket是否可以同时存在于几个分组，等效于一个用户会同时在几个聊天室活跃，答案是”可以“，socket.join()添加进去就可以了。官方提供了订阅模式的示例：
		socket.on('subscribe', function(data) {
			socket.join(roomId);
			console.log('subscribe Joined room: %s', roomId);
		})

		socket.on('unsubscribe', function(data) {
			socket.leave(roomId);
			console.log('unsubscribe Left room: %s', roomId);
		})

		socket.on('user join', function (data,callback) {
			callback(true);
			//====DB user insert==
			var uid = is_db_exsits(data.username);
			if(!uid){
				var user = new User;
				user.show_name = data.username;//TODO 重名？？
				user.ip = data.ip;
				user.navigator = data.navigator;
				//TODO other fields!
				user.save();
				console.log('new user saved to DB %s',user._id);
			}
			//room.update();
			//====DB user insert==

			socket.username = data.username;
			users.push({"username" : data.username, "room" : roomId});////TODO:所有的live用户！！！
			var roomuser =[];
			for(var i=0;i<users.length;i++){
				if(users[i].room == roomId){
					roomuser.push(users[i]);
				}
			}
			socket.roomuser = roomuser;
			console.log('new user join room:'+roomId,roomuser);
			updateUsernames(roomuser);
		});

		function is_db_exsits(username){
			return false;
		}


		function updateUsernames(roomuser){
			// socket.emit('get users',users);//Update only current session! 当前
			// io.sockets.in(roomId).emit('users update',users);//update all!  所有
			io.of(namespace).in(roomId).emit('users update',roomuser);//update all!  所有
			// socket.broadcast.to(roomId).emit('users update',users);//update except current session! 排除当前socket对应的client
			// broadcast方法允许当前socket client不在该分组内。
		}
		// when the client emits 'new message', this listens and executes
		socket.on('send message', function (data) {
			// we tell the client to execute 'new message'
			// io.sockets.emit('new message', {//socket.broadcast.emit
			// io.of(namespace).in(roomId).emit('new message', {//socket.broadcast.emit
			socket.broadcast.to(roomId).emit('new message', {
				username: socket.username,
				message: data
			});
		});

		//TODO: 用户正在输入！
		// when the client emits 'typing', we broadcast it to others
		socket.on('typing', function () {
			socket.broadcast.to(roomId).emit('typing', {
				username: socket.username
			});
		});

		// when the client emits 'stop typing', we broadcast it to others
		socket.on('stop typing', function () {
			socket.broadcast.to(roomId).emit('stop typing', {
				username: socket.username
			});
		});
	});
});

module.exports = router;
