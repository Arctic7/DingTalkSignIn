//全局变量
//计划启动时间，默认是从9点10分开始，在之后的18分钟内随机触发一次
var initHour = 9;
var initMinute = 10;
var initMaxRandom = 18;
//轮询间隔，默认每分钟轮询一次
var loopInterval = 1000*60;
//是否启动任务，任务在执行中时应该把此变量改成false从而阻止多个任务执行
var runFlag = true;

//唤醒屏幕
function screenWake(){
	device.wakeUp();
	sleep(1000);
	var result = device.isScreenOn();
	if(result==false){
		screenWake();
	}
	device.keepScreenDim(1000*600);
}

//模拟点击，默认按下400毫秒，间隔200毫秒
function pressBtn(x,y){
	press(x,y,400);
	sleep(200);
}

//解锁
function unlock(){
	//设定屏幕基准尺寸，默认是18:9屏幕，宽1080，高2160
	setScreenMetrics(1080, 2160);
	//上划解锁
	swipe(540,1850,540,500,500);
	sleep(1000);
	inputPassword();
}
//输入解锁密码
function inputPassword(){
	//解锁密码输入框，锁屏界面下，上边界Y是1270，每行高222.5，每个数字宽360
	//计算出的123456789坐标中间点如下，格式：数字-X-Y
	//1-180-1382；2-540-1382；3-900-1382
	pressBtn(180,1382);
	pressBtn(180,1382);
	pressBtn(180,1382);
	pressBtn(900,1382);
}

//启动钉钉，要求钉钉不能输入密码，且开启极速打卡功能，并一直在后台保持登陆状态
//若开启成功会返回true
function openDingTalk(){
	sleep(500);
	var result = launch("com.alibaba.android.rimet");
	sleep(6000);
	device.cancelKeepingAwake();
	return result;
}

//单次执行全流程的方法,若执行成功会返回true
function jobRun(delay){
	var result = false;
	sleep(parseInt(delay));
	//点亮屏幕
	screenWake();
	unlock();
	return openDingTalk();
}

//执行计划任务，主方法
function jobSchedule(){
	console.show();
	//轮询
	while(true){
		console.log('开始轮询');
		var date = new Date();
		//获取当前星期，0-周日，1~6-周一到周六
		var dayOfWeek = date.getDay();
		//获取当前时间
		var hour = date.getHours();
		var minute = date.getMinutes();
		if(runFlag&&dayOfWeek>=1&&dayOfWeek<=5&&hour==initHour&&minute>=initMinute&&minute<=initMinute+2){
			console.log('开始执行任务');
			runFlag = false;
			var initMinRandom = minute - initMinute + 1;
			var r = random(initMinRandom,initMaxRandom);
			var result = jobRun(1000*60*r);
			if(result==false){
				console.log('脚本执行失败');
			}else{
				console.log('脚本执行成功');
				//一定间隔后可以再次执行任务
				sleep(1000*60*30);
				runFlag = true;
				console.log('下次任务执行权限已开启');
			}
		}else{
			console.log('任务执行条件未满足');
		}
		sleep(loopInterval);
	}
}

jobSchedule();