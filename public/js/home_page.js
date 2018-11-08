
function getUrlRelativePath() {

    var url = document.location.toString();
    var arrUrl = url.split("//")
    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start)//stop省略，截取从start开始到结尾的所有字符

    if(relUrl.indexOf("?") != -1){
        relUrl = relUrl.split("?")[0]
    }

    return formatPath(relUrl)
}

// 将 path 中第一个字符 '/' 改成 '.'
function formatPath(path){

    path === '/' ? path = '.':path
    path[0] === '/' ? path = path.substring(1):path
    path[path.length - 1] !== '/' ? path += "/" : path

    return path
}

let deleteDir = function(obj) {

    let currentPath = getUrlRelativePath()
    let delUrl = '/api/folder/' + currentPath + obj.value

    console.log("delUrl",delUrl)
    // delUrl = encodeURIComponent(delUrl)

    console.log("delUrl",delUrl)

    let c = confirm("Sure?")
    if(c){
        $.ajax({
            url: delUrl,
            type: "DELETE",
            success: function (data) {
                alert(data.message);
                window.location.reload()
            }
        });
    }
}

let deleteFile = function(obj) {

    let currentPath = getUrlRelativePath()
    let delUrl = '/api/file/' + currentPath + obj.value

    let c = confirm("Sure?")
    if(c){
        $.ajax({
            url: delUrl,
            type: "DELETE",
            success: function (data) {
                alert(data.message);
                window.location.reload()
            }
        });
    }

}

$(function(){

    let currentPath = getUrlRelativePath()


    $.ajax({
        url:'/api/info',
        method:'GET',
        contentType: "application/json; charset=utf-8",
        data:{curDirPath:currentPath},
        success:function(data){

            console.log(data)

            let dirInfo = data.result.dirInfo

            $('#fileList').empty()
            let appendStr = ''
            for (item of dirInfo){
                appendStr += '<li>'
                let itemPath = '/' + currentPath + encodeURIComponent(item.name)

                let encodedName = encodeURIComponent(item.name)

                if (item.type === 'dir'){
                    appendStr += '<a href='+itemPath+'>' + item.name + '/</a>'
                    appendStr += '&nbsp;&nbsp;&nbsp; <button class="btn btn-danger" onclick=deleteDir(this) value='+encodedName +'>' + '删除文件夹' + '</button>'
                    // appendStr += '&nbsp;&nbsp;&nbsp;<button  id='+itemPath+' class="btn btn-danger" name="delDirBtn">' + '删除文件夹' + '</button>'
                }else {
                    let downloadUrl = '/api/file' + itemPath
                    appendStr += '<a href='+downloadUrl+'>' + item.name + '</a>'
                    appendStr += '&nbsp;&nbsp;&nbsp;<button  class="btn btn-danger" onclick=deleteFile(this) value='+encodedName+'>' + '删除文件' + '</button>'
                }
                appendStr += '</li><br>'
            }
            $('#fileList').append(appendStr)
        }

    })


    $("#uploadFileBtn").click(function(){
        let c = confirm("Sure?")
        if(c){

            let formData = new FormData($("#fileinfo")[0]);
            console.log()
            let currentPath = encodeURIComponent(getUrlRelativePath())
            let url = '/api/upload/' + currentPath

            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                contentType:false,
                //contentType: 'multipart/form-data; boundary=string',
                processData: false,
                success: function (data) {
                    alert(data.message);
                    window.location.reload()
                }
            });

        }
    })

    $("#mkDirBtn").click(function(){
        let folderName = prompt("输入文件夹名称")
        if(folderName){

            let targetDirPath = getUrlRelativePath()
            let postData = {
                targetDirPath:targetDirPath,
                folderName:folderName
            }
            $.ajax({
                url: "/api/folder",
                type: "POST",
                data: JSON.stringify(postData),
                contentType:'application/json',
                success: function (data) {
                    alert(data.message);
                    window.location.reload()
                }
            });

        }
    })


    $("#downloadDirBtn").click(function(){

        let currentPath = getUrlRelativePath()
        console.log(currentPath)

        let url = '/api/archive/' + encodeURIComponent(currentPath)

        // $.ajax({
        //     url:url,
        //     method:"GET"
        // })
        window.location.href = url

    })


    $("#uploadBigFileBtn").click(function(){
        let c = confirm("Sure?")
        if(c){

            let f = $("#input-file")[0].files[0]
            console.log(f.slice(0,1024*1024*20))








        }
    })







































})

