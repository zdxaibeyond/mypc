var fs=require('fs');
var cheerio=require('cheerio');
var request=require('request');
var async=require('async');

var startUrl='http://www.qiubaichengren.com';

var page=2;

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
//	var amout=parseInt($('.current-comment-page').text().match(/(\d)+/g)[0]);
	var pageUrl=[];

	for(var i=1;i<page;i++){
		pageUrl.push('http://www.qiubaichengren.com/'+i+'.html');
	}
   
	async.mapLimit(pageUrl,5,function(page,callback){
       request(page,function(err,response){
		   if(err){
			   console.log(err)
		   }

		   var $=cheerio.load(response.body);
		   var links=$('.ui-main img');
		   var imgArr=[];
           console.log(imgArr)
		   links.each(function(){
			   imgArr.push($(this).attr('src'));
		   });
          
		   async.mapLimit(imgArr,5,function(src,callback){
			   var name=getName(src);
               console.log(src);
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
