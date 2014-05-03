function loadOthers() {
	include_once("config.js");
	include_once("lib/jquery-1.11.1.min.js");
}

console.log("common.js");
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
// script.onreadystatechange = function() {
// 	console.log(this.readyState);
//     if (this.readyState == 'complete') loadOthers();
// }
script.onload = loadOthers;

script.type = 'text/javascript';
script.src = 'lib/include_once.js';
head.appendChild(script);

