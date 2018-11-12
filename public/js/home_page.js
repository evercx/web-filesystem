

const chunkSize = 10 * 1024 * 1024


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

 let deleteChunkFile = function(obj) {

     let currentPath = getUrlRelativePath()
     let delUrl = '/api/chunk/file/' + currentPath + '?fileMd5=' + obj.value

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




 function md5File(file) {
     return new Promise((resolve, reject) => {
         var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
             //chunkSize = 2097152, // Read in chunks of 2MB
             chunkSize = file.size / 100,
             //chunks = Math.ceil(file.size / chunkSize),
             chunks = 100,
             currentChunk = 0,
             spark = new SparkMD5.ArrayBuffer(),
             fileReader = new FileReader();

         fileReader.onload = function (e) {
             // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
             spark.append(e.target.result); // Append array buffer
             currentChunk++;

             if (currentChunk < chunks) {
                 loadNext();
             } else {
                 console.log('finished loading');
                 let result = spark.end()
                 resolve(result)
             }
         };

         fileReader.onerror = function () {
             console.warn('oops, something went wrong.');
         };

         function loadNext() {
             var start = currentChunk * chunkSize,
                 end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
             fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
         }

         loadNext();
     })
 }


 function uploadChunk(i, file,fileMeta) {

     let currentPath = encodeURIComponent(getUrlRelativePath())
     let url = '/api/chunk/upload/' + currentPath +  "?chunk=" + String(i) + "&fileMd5=" + fileMeta.fileMd5Value
     return new Promise((resolve, reject) => {
         //构造一个表单，FormData是HTML5新增的
         let end = (i + 1) * fileMeta.chunkSize >= file.size ? file.size : (i + 1) * fileMeta.chunkSize
         let form = new FormData()
         let piece = file.slice(i * fileMeta.chunkSize, end)
         form.append("data", piece) //file对象的slice方法用于切出文件的一部分

         form.append("total", fileMeta.chunks) //总片数
         form.append("index", i) //当前是第几片
         form.append("fileMd5Value", fileMeta.fileMd5Value)

         console.log("i",i)
         $.ajax({
             url: url,
             type: "POST",
             data: form, //刚刚构建的form数据对象
             async: true, //异步
             processData: false, //很重要，告诉jquery不要对form进行处理
             contentType: false, //很重要，指定为false才能形成正确的Content-Type
             success: function (data) {
                 console.log("success",data)
                 resolve(data)
             }
         })
     })
 }

 function finalRequestChunk(fileMeta) {

     let currentPath = encodeURIComponent(getUrlRelativePath())
     let url = '/api/chunk/upload/' + currentPath + "?fileMd5=" + fileMeta.fileMd5Value
     return new Promise((resolve, reject) => {
         // //构造一个表单，FormData是HTML5新增的
         // let end = (i + 1) * fileMeta.chunkSize >= file.size ? file.size : (i + 1) * fileMeta.chunkSize
         // let form = new FormData()
         // let piece = file.slice(i * fileMeta.chunkSize, end)
         // form.append("data", piece) //file对象的slice方法用于切出文件的一部分
         //
         // form.append("total", fileMeta.chunks) //总片数
         // form.append("index", i) //当前是第几片
         // form.append("fileMd5Value", fileMeta.fileMd5Value)

         $.ajax({
             url: url,
             type: "POST",
             // data: form, //刚刚构建的form数据对象
             // async: true, //异步
             // processData: false, //很重要，告诉jquery不要对form进行处理
             // contentType: false, //很重要，指定为false才能形成正确的Content-Type
             success: function (data) {
                 console.log("success",data)
                 resolve(data)
             }
         })
     })
 }


 function createChunkInfo(file,fileMd5Value){

     let currentPath = encodeURIComponent(getUrlRelativePath())
     let url = '/api/chunk/' + currentPath

     let postData = {
         fileName:file.name,
         fileSize:file.size,
         fileMd5Value:fileMd5Value
     }

    return new Promise((resolve,reject) => {

        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(postData),
            contentType:'application/json',
            success: function (data) {
                resolve(data)
            }
        });
    })
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
                }else if (item.type === 'file'){
                    let downloadUrl = '/api/file' + itemPath
                    appendStr += '<a href='+downloadUrl+'>' + item.name + '</a>'
                    appendStr += '&nbsp;&nbsp;&nbsp;<button  class="btn btn-danger" onclick=deleteFile(this) value='+encodedName+'>' + '删除文件' + '</button>'
                }else if (item.type === 'chunk'){
                    let downloadUrl = '/api/chunk/file/' + currentPath +  '?fileMd5=' + item.fileMd5Value
                    appendStr += '<a href='+downloadUrl+'>' + item.name + '</a>'
                    appendStr += '&nbsp;&nbsp;&nbsp;<button  class="btn btn-danger" onclick=deleteChunkFile(this) value='+item.fileMd5Value+'>' + '删除文件' + '</button>'
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


    $("#uploadBigFileBtn").click(async function(){
        let c = confirm("Sure?")
        if(c){
            let file = $("#input-file")[0].files[0]
            let fileMd5Value = await md5File(file)
            let data = await createChunkInfo(file,fileMd5Value)
            let fileMeta = data.result.fileMeta

            console.log(data)

            if( fileMeta.uploadedChunks.length === fileMeta.chunks){
                alert("文件上传完毕")
                return
            }

            for(let i = 0;i < fileMeta.chunks;i++){

                // console.log(`第${i}次循环`,i)
                let exist = fileMeta.uploadedChunks.indexOf(i) > -1

                if(!exist){
                    let result = await uploadChunk(i,file,fileMeta)
                    console.log(result)
                }
            }

            let result = await finalRequestChunk(fileMeta)
            alert(result.message)
        }
    })







































})

