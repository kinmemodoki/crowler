system = require('system');
var process = require("child_process");
var execFile = process.execFile;
var fs = require('fs');

const accessList = [
"http://kinmemodoki.net",
"http://www.az.inf.uec.ac.jp",
"https://www.google.co.jp/"
]

//------------------------------------
resultValue = {
	'final' : null,
	'trace' : Array()
};

var page = require('webpage').create();

var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3'; //偽装するUA

//ヘッダのセット
page.customHeaders = {
	'Connection' : 'keep-alive',
	'Accept-Charset' : 'Shift_JIS,utf-8;q=0.7,*;q=0.3',
	'Accept-Language' : 'ja,en-US;q=0.8,en;q=0.6',
	'Cache-Control' : 'no-cache',
	'User-Agent' : userAgent
};

page.onResourceRequested = function(requestData, networkRequest) {
  //console.log(JSON.stringify(requestData,undefined,4));

  if ( requestData.url.match(/^http/i)) {
		var removedProtcol = requestData.url.split("//")[1];
	}else{
		var removedProtcol = requestData.url;
	}

	var requestHeaders = [];
	var headers = requestData.headers;
	for (var i = 0; i < headers.length; i++){
		requestHeaders.push("-H");
		requestHeaders.push("["+headers[i].name+":"+headers[i].value+"]");
	}
	requestHeaders.push(requestData.url);
  	
  execFile("curl", requestHeaders, null, function (err, stdout, stderr) {
  	path = './data/'+tergetHost+'/'+removedProtcol+"_";
  	//console.log(err);
  	//console.log(path);
  	//console.log(stderr);
  	fs.write(path, stdout, 'w');
	});
	
};

// レスポンスを受け取った時
page.onResourceReceived = function(res){
	//console.log(res.url);
	currentURL = res.url;
	resultValue.trace.push(res);
};

//ページ初期化時
page.onInitialized = function(status){
	//navigator.UserAgent更新
	var agent = page.evaluate( function (userAgent) {
		var newNavigator = Object.create(window.navigator);
		newNavigator.userAgent = userAgent;
		window.navigator = newNavigator;
	},userAgent);
	setExit(1300);
}

//ページ遷移があった場合
page.onUrlChanged = function(targetUrl) {
	setExit(1300); //タイマー初期化
};

//エラー吐いたら終了
phantom.onError = function(msg) {
	resultValue.error = msg;
	setExit(0);
};

//------------------------------------
var tergetHost;
var accessNumber = 0;
var timer; //呼び出されるたびにリセットされる
/*
一定時間アクションがなかった場合に結果を返す
*/
var setExit = function(time){
	clearTimeout(timer);
	timer = setTimeout(function(){
		resultValue.final =currentURL;
		console.log(JSON.stringify(resultValue,undefined,4));
		fs.write('./data/'+tergetHost+'/crowlingHeaders.txt', JSON.stringify(resultValue,undefined,4), 'w');
		if(accessList[accessNumber+1]){
			accessNumber++;
			tergetHost = accessList[accessNumber].split("/")[2]; //URLのホスト
			console.log("access to :",accessList[accessNumber]);
			page.open(accessList[accessNumber], function(event){
				setExit(1300);
			});
		}else{
			phantom.exit();
		}
	},time);
}

/* 本体 */
console.log("access to :",accessList[accessNumber]);
tergetHost = accessList[accessNumber].split("/")[2]; //URLのホスト
page.open(accessList[accessNumber], function(event){
	setExit(1300);
});