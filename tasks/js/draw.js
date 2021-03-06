/* draw STAP-compliant task that can run
	- in-browser
		use this script alongside stap.js api2gui library, e.g.
			<html><head><script src=location/of/stap.js><script src=location/of/helloworld.js></head><body /></html>
		OR write your own in-browser GUI
			* must overload task.display to process display changes
			* must call task.userAction for each user event/input
			* must call task.start() to start task
			* optionally overload task.end (it will be called at the end of the task)
	- as a console app, which can pipe io to agent (or serve via server like servep, websocketd, netcat)
		* in console, type "node helloworld.js"
	- as a node.js module
		* must overload task.display to process display changes
		* must call task.userAction for each user event/input
		* must call task.start() to start task
		* optionally overload task.end (it will be called at the end of the task)
*/


var task = {
	
	start: function(){
		task.pathId=-1;
		task.mouseDown=false;
		task.display({
			require:{options:['w','h',"onmousedown","onmouseup","onmousemove","onmouseleave"]},
			template:"#draw {border:solid 1px gray}"
		});
		task.display([ {
				id:"draw",title:"Draw a smiley face",w:400,h:400,
				onmousedown:{R:[1,'mouseX','mouseY']},
				onmousemove:{R:[2,'mouseX','mouseY']},
				onmouseup:{R:[0,'mouseX','mouseY']},
				onmouseleave:{R:[0,'mouseX','mouseY']}
		} ]);
	},
	
	userAction: function(time,id,val){
		if(val.constructor===Array){
			if(val[0]===1){						//mouseDown event
				task.newPath(val);
				task.mouseDown=true;
			}
			if(task.mouseDown){
				if(val[0]===0){					//mouseUp or mouseLeave event
					task.lineTo(val);
					task.mouseDown=false;
				}else if(val[0]===2){			//mouseMove event
					task.lineTo(val);
				}
			}
		}
	},
	
	newPath: function(val){
		task.display([ {id:"draw",v:[{type:"ln",w:400,h:400,x:0,y:0,v:[{x:val[1],y:val[2]}]}]} ]);
		task.pathId++;
	},
	
	lineTo: function(val){
		task.display([ {_:["draw",task.pathId],v:[{x:val[1],y:val[2]}]} ]);
	}

}


////////////////////////////////////////////////////////////////
// line below added for node.js
if(typeof(window)==='undefined'){task.end=function(){process.exit()};if(require.main===module){task.display=function(data){console.log(JSON.stringify(data))};process.stdin.on("data",function(s){let data;try{data=JSON.parse(s)}catch(e){console.log('{"error":"invalid JSON string"}');return}if(data.constructor!==Array||data.length!=3){console.log('{"error":"Invalid STAP 7 response. Expected [time,id,value]"}');return}task.userAction(data[0],data[1],data[2])});task.start()}else{exports.task=task}}
////////////////////////////////////////////////////////////////
