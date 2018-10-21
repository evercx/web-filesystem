/***********************************************************
  Author:lmj    Date:2016/06/12
  Description:     // 公共函数
***********************************************************/

function getQueryString(name){

     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}


function getJsonLength(jsonData){

	var jsonLength = 0;
	for(var item in jsonData){ 
		jsonLength++; 
	} 
	return jsonLength; 
}