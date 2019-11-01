var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
// 引入模块和地址

// 连接数据文件
function connect(callback){
	MongoClient.connect(url, { useNewUrlParser: true }, function(err,db) {
	    if (err) throw err;
	    callback(db)
	});
}

// 增加
module.exports.insert=function(db,col,obj,callback){
	connect(function(a){
		 var dbo = a.db(db);
		// db(数据文件).db数据库不能修改
	    // var myobj = { name: "zs", url: "www.runoob" };
	    // 存储数据
	    if(!(obj instanceof Array)){
	    	obj=[obj]
	    }
	    dbo.collection(col).insertMany(obj, function(err, res1) {
	    	// 插入数据
	        if (err) throw err;
	        // console.log(res1);
	        a.close();
	        callback(res1.ops)
	    });
	})
}

module.exports.find=function(db,col,obj={},callback,s=0,l=0,mysort={}){
	// skip  limit sort 条件限制
	connect(function(a){
		var dbo = a.db(db);
		var mySort={
			"score.math":1
		}
	    dbo.collection(col).find(obj).sort(mysort).skip(s).limit(l).toArray(function(err, result) { // 返回集合中所有数据
	        if (err) throw err;
	        a.close();
	        callback(result)
	    });
	})
}

module.exports.update=function(db,col,b,f,d,callback){	
	connect(function(a){
		var dbo=a.db(db);
		var x={$set:f}
		if(d==false){
			dbo.collection(col).updateOne(b,x,function(err,res){
				if(err) throw err
				a.close();
				callback(res)
			})
		}else if(d==true){
			dbo.collection(col).updateMany(b,x,function(err,res){
				if(err) throw err
				console.log(res.result)
				a.close();
				callback(res)
			})
		}
		
	})
}

module.exports.delete=function(db,col,obj,callback){
	connect((a)=>{
		 var dbo = a.db(db);
	    var whereStr = {"name":'菜鸟教程'};  // 查询条件
	    dbo.collection(col).deleteOne(obj, function(err, result) {
	        if (err) throw err;
	        console.log("文档删除成功");
	        a.close();
	        callback(result)
	    });
	})
}