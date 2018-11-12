const axios = require('axios')
const util = require('util')
const fs = require('mz/fs')
const writeFile = util.promisify(fs.writeFile)


let downloadOneFile = async function(){

    let chunkSize = 10 * 1024 * 1024
    let fileSize = 25529289

    let Url = "http://localhost:7000/api/chunk/file/newdir/?fileMd5=be866a21dca77b6cccd2af066071b5d3"

    let range1 = 'bytes=0-' + '2048'
    // let range2 = 'bytes=' + String(chunkSize+1) + '-' + String(fileSize)

    let getResult = await axios.get(Url,{
        headers:{Range: range1}
    })

    let dataBuffer = Buffer.from(getResult.data)
    await fs.writeFile('data.file',getResult.data)

    console.log(getResult.headers)
    console.log(getResult.status)
    console.log(dataBuffer.length)

    // let getResult2 = await axios.get(Url,{
    //   headers:{Range: range2}
    // })
    // console.log(getResult2.headers)
    // console.log(getResult2.status)

}()