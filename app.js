var fs=require('fs');
var cheerio=require('cheerio');
var request=require('request');
var async=require('async');

var startUrl='http://jandan.net/ooxx';

var page=5;

function getName(src){
	var reg=/(\w)+.(jpg|gif|png)/g;
	var result=src.match(reg);
	if(result){
		return result[0];
	}
	return parseInt(Math.random()*1000)+'.jpg';
}
request(startUrl,function(err,response){
	if(err){
		console.log(err);
	}

	var $=cheerio.load(response.body);
	var amout=parseInt($('.current-comment-page').text().match(/(\d)+/g)[0]);
	var pageUrl=[];

	for(var i=amout;i>=amout-page+1;i--){
		pageUrl.push('http://jandan.net/ooxx/page-'+i+'#comments');
	}

	async.mapLimit(pageUrl,5,function(page,callback){
       request(page,function(err,response){
		   if(err){
			   console.log(err)
		   }

		   var $=cheerio.load(response.body);
		   var links=$('a.view_img_link');
           
		   var imgArr=[];

		   links.each(function(){
			   imgArr.push('http:'+$(this).attr('href'));
		   });
          
		   async.mapLimit(imgArr,5,function(src,callback){
			   var name=getName(src);
               request(src).pipe(fs.createWriteStream('img/'+name))
			       .on('close',function(){
					   console.log(name+'下载成功');
					   callback();
				   });
		   });
		   callback();
		   
	   })
	});
	
})
