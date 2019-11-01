const express=require('express');
const app=express();

const ejs=require('ejs');
app.set('view engine','ejs')

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended:false});
var mongoose = require('mongoose');

const db=require('./model/dao.js')
const md5=require('md5');

var session = require('express-session')
var NedbStore = require('nedb-session-store')( session );

const http=require('http').Server(app);
const io=require('socket.io')(http);
var dates = new Date();
var date=dates.getFullYear()+'-'+dates.getMonth()+'-'+dates.getDate()+' '+dates.getHours()+'时'+dates.getMinutes()+'分'
app.use('/public',express.static('./public/'))


var cacheFolder = 'public/images/uploadcache/';
const fs=require('fs')
const formidable=require('formidable')
app.use('/upload',(req,res)=>{
	
    currentUser={
    	id:123
    }
    var userDirPath =cacheFolder+ currentUser.id;
    if (!fs.existsSync(userDirPath)) {
        fs.mkdirSync(userDirPath);
    }
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = userDirPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    var displayUrl;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send(err);
            return;
        }
        var extName = ''; //后缀名
        switch (files.upload.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        if (extName.length === 0) {
            res.send({
                code: 202,
                msg: '只支持png和jpg格式图片'
            });
            return;
        } else {
            var avatarName = '/' + Date.now()+'lxl'+ '.' + extName;
            var newPath = form.uploadDir + avatarName;
            displayUrl = 'http://10.25.160.69:8989/' + userDirPath + avatarName;
            fs.renameSync(files.upload.path, newPath); //重命名
            res.send({
                code: 200,
                msg: displayUrl
            });
        }
    });

})



app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
  	maxAge:60*60*24*1000
  },
  store:new NedbStore({
	  filename: 'path_to_nedb_persistence_file.db'
	})
}))

app.get('/',(req,res)=>{
	if(req.session.user==''){
		res.render('login',{url:'http://10.25.160.69:8989/',user:''})
	}else{
		res.render('list',{user:req.session.user})
	}
	
})





app.post('/sign',urlencodedParser,(req,res)=>{
	var users={
		name:req.body.user,
		pass:md5(md5(md5(req.body.pass))),
		img:req.body.img
	}
	var whereStr = {"name":users.name };
	db.find('student','class1',whereStr,function(a){
		console.log(a)
		if(a==''){
			db.insert('student','class1',users,function(x){
				console.log(302)
				res.send({url:'http://10.25.160.69:8989/',msg:0})	
			})

		}else{
			console.log(1)
			res.send({url:'http://10.25.160.69:8989/',msg:1})
			// res.render('sign',{url:'http://10.25.160.69:8989/',user:'用户已存在!',msg:1})
		}
	})
	
	
})
app.get('/sign',(req,res)=>{
	res.render('sign',{url:'http://10.25.160.69:8989/',user:''})
})
app.get('/details',(req,res)=>{
	res.render('details',{url:'http://10.25.160.69:8989/',user:req.session.user})
})

app.post('/list',urlencodedParser,(req,res)=>{
	
	db.find('content','content1',{},function(a){	
		console.log('加载成功！')
		res.send(a)
	},0,10,{_id:-1})
})
app.use('/list',(req,res)=>{
	res.render('list',{user:req.session.user})
})

app.use('/chat',(req,res)=>{
	res.render('chat',{user:req.session.user})
})

app.post('/dellist',urlencodedParser,(req,res)=>{
	let del = {_id:mongoose.Types.ObjectId(req.body.id)};
	db.delete('content','content1',del,function(a){
		console.log('删除成功！')
		res.send(a)
	})
})
app.post('/deladd',urlencodedParser,(req,res)=>{
	let id=req.body.id
	console.log(id)
	db.find('content','content1',{},function(a){
		res.send(a)
	},id*10,1,{_id:-1})	
})

app.post('/fabu',urlencodedParser,(req,res)=>{
	var users={
		name:req.session.user,
		date:date,
		title:req.body.title,
		content:req.body.content,
		img:req.body.img
	}
	console.log(users)
	db.insert('content','content1',users,function(a){
		console.log(a)
		res.render('fabu',{user:req.session.user})
	})	
})
app.use('/fabu',(req,res)=>{
	res.render('fabu',{user:req.session.user})
})
app.use('/article',(req,res)=>{
	res.render('article',{user:req.session.user})
})
app.get('/article1',(req,res)=>{
	let num=Number(req.query.num)
	console.log(num)
	db.find('comments','comment1',{},function(a){	
		console.log('加载成功！')
		res.send(a)
	},num,10,{_id:-1})


})
app.post('/article1',urlencodedParser,(req,res)=>{
	let user1={
		name:req.session.user,
		date:date,
		text:req.body.text
	}
	db.find('student','class1',{"name":req.session.user},function(x){	
		user1={
			name:req.session.user,
			date:date,
			text:req.body.text,
			img:x[0].img
		}
		db.insert('comments','comment1',user1,function(a){
			console.log('评论成功！')
			res.send(a)
		})
	})
	
})
app.post('/delcomment',urlencodedParser,(req,res)=>{

	let del = {_id:mongoose.Types.ObjectId(req.body.id)};
	db.delete('comments','comment1',del,function(a){
		console.log('删除成功！')
		res.send(a)
	})
})

app.get('/esc',(req,res)=>{
	req.session.user=''
	res.redirect(302,'http://10.25.160.69:8989/')	
})

app.post('/details',urlencodedParser,(req,res)=>{
	let id={_id:mongoose.Types.ObjectId(req.body.id)};
	db.find('content','content1',id,function(x){	
		console.log(x)
		
		res.send(x)
	
		
	})
	
})

app.post('/login',urlencodedParser,(req,res)=>{
	let user={
		name:req.body.user,
		pass:md5(md5(md5(req.body.pass)))
	}
	db.find('student','class1',user,(a)=>{
		if(a.length==0){
			res.render('login',{url:'http://10.25.160.69:8989/',user:'再来！'})
		}else{
			req.session.user=user.name
			res.redirect(302,'http://10.25.160.69:8989/list')
		}
	})
})

app.get('/updata1',(req,res)=>{
	res.render('updata1',{info:''})
})


app.post('/updata1',urlencodedParser,(req,res)=>{
	var past = {
		"name":req.body.user,
		"pass":md5(md5(md5(req.body.pass1)))
	}
	let pa={"pass":md5(md5(md5(req.body.pass2)))}
	// console.log(user)
	db.find('student','class1',past,(data)=>{	
		console.log(data)
		if(data!=''){
			if(data[0].pass==past.pass){
				console.log(11222)
				db.update('student','class1',past,pa,false,(a)=>{
					res.render('updata1',{info:'修改成功!'})
				})
			}else{
				res.render('updata1',{info:'修改失败!'})
			}
		}else{
			res.render('updata1',{info:'请输入正确的账号密码!'})
		}
		
		
		
	})
})

app.post('/next',urlencodedParser,(req,res)=>{
	let s=Number((req.body.id-1)*10)
	let l=Number(10);
	db.find('content','content1',{},(a)=>{
		res.send(a)
	},s,l,{_id:-1})
})
app.post('/limts',urlencodedParser,(req,res)=>{
	let s=Number((parseInt(req.body.id-1))*10)
	console.log('-----')
	let l=Number(10);
	db.find('content','content1',{},(a)=>{
		res.send(a)
	},s,l,{_id:-1})
})
app.get('/tag',(req,res)=>{
	db.find('content','content1',{},(a)=>{
		res.send(a)
	})
})
app.post('/imgs',urlencodedParser,(req,res)=>{
	let user=req.body.name
	db.find('student','class1',{"name":user},(a)=>{
		console.log(a)
		res.send(a)
	})
})

io.on('connection',(socket)=>{
	console.log('connection');
	socket.on('send',(msg)=>{
		
		io.emit('chat',msg)
	})

})

http.listen('8989','10.25.160.69')