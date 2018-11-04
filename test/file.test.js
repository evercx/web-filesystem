const path = require('path')
const should = require('should')
const fs = require('mz/fs')
const tools = require('../lib/tools')

const { getFileStream,delOneFile } = require('../core/file')
const { storagePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')


describe('delete one file' , () => {

    let dirPath = storagePath
    let fileName = 'testFile.txt'
    let filePath = path.resolve(dirPath,fileName)

    beforeEach( async () => {
        if ( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'balabala')
        }
    })

    afterEach( async () => {
        if (await tools.pathIsExist(filePath)){
            await fs.unlink(filePath)
        }
    })

    it('should delete one file',async () => {
        let result = await delOneFile(filePath)
        should(result).have.property('message',SUCCESS.DELETE_FILE)
    })

    it('should not delete a file that does not exist', async () =>{
        let notExistFilePath = path.resolve(dirPath,'notExistFileName.txt')
        delOneFile(notExistFilePath).should.rejectedWith(FAILED.FILE_NOTEXIST)
    })

    it('should not delete a file with invalid path',async () =>{
        let invalidFilePath = "/ba/la/file.txt"
        delOneFile(invalidFilePath).should.rejectedWith(FAILED.FILE_INVALID)
    })
})

describe('get file stream',() => {
    let dirPath = storagePath
    let fileName = 'testFile.txt'
    let filePath = path.resolve(dirPath,fileName)

    beforeEach( async () => {

        if ( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'balabala')
        }
    })

    afterEach( async () => {

        if (await tools.pathIsExist(filePath)){
            await fs.unlink(filePath)
        }
    })

    it('should return a file readable stream',async () =>{
        let result = await getFileStream(filePath)
        should(result).have.property('pipe')
    })

    it('should not return a file stream that does not exist',async ()=>{
        let notExistFilePath = path.resolve(dirPath,'notExistFileName.txt')
        getFileStream(notExistFilePath).should.rejectedWith(FAILED.FILE_NOTEXIST)
    })
})