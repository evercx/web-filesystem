const path = require('path')
const should = require('should')
const fs = require('mz/fs')
const tools = require('../lib/tools')

const { getFileStream,delOneFile } = require('../core/file')
const { storagePath } = require('../storage.js')


describe('delete one file' , () => {

    let dirPath = storagePath
    let fileName = 'testFile.txt'
    let filePath = path.resolve(dirPath,fileName)

    before( async () => {
        if ( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'balabala')
        }
    })

    after( async () => {
        if (await tools.pathIsExist(filePath)){
            await fs.unlink(filePath)
        }
    })

    it('should delete one file',async () => {
        let result = await delOneFile(filePath)
        should(result).have.property('path',filePath)
    })

    it('should not delete a file that does not exist', async() =>{
        let notExistFilePath = path.resolve(dirPath,'notExistFileName.txt')
        try {
            await delOneFile(notExistFilePath)
        }catch (e) {
            e.message.should.be.exactly('文件不存在')
        }
    })

    it('should not delete a file with invalid path',async () =>{
        let invalidFilePath = "/ba/la/file.txt"
        try{
            await delOneFile(invalidFilePath)
        }catch (e) {
            e.message.should.be.exactly('文件地址不合法')
        }
    })
})

describe('get file stream',() => {
    let dirPath = storagePath
    let fileName = 'testFile.txt'
    let filePath = path.resolve(dirPath,fileName)

    before( async () => {
        if ( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'balabala')
        }
    })

    after( async () => {
        if (await tools.pathIsExist(filePath)){
            await fs.unlink(filePath)
        }
    })

    it('should return a file readable stream',async () =>{

        let result =  await getFileStream(filePath)
        should(result).have.property('pipe')
    })

    it('should not return a file stream that does not exist',async ()=>{
        let notExistFilePath = path.resolve(dirPath,'notExistFileName.txt')
        try {
            await getFileStream(notExistFilePath)
        }catch (e) {
            e.message.should.be.exactly('文件不存在')
        }
    })
})