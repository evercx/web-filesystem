const path = require('path')
const should = require('should')
const fs = require('mz/fs')
const {storagePath} = require('../storage.js')

const tools = require('../lib/tools')


describe('decode a URI safely',() =>{

    it('should decode a URI safely',() =>{
        let str = "%2F%E4%B8%AD%E6%96%87%E8%B7%AF%E5%BE%84%2F%E4%B8%AD%E6%96%87%E6%96%87%E4%BB%B6%E5%A4%B9%2F"
        let resultStr = tools.safeDecodeURIComponent(str)
        resultStr.should.be.exactly('/中文路径/中文文件夹/')
    })

    it('should decode a URI safely with "%"',() =>{
        let str = '%'
        let resultStr = tools.safeDecodeURIComponent(str)
        resultStr.should.be.exactly('%')
    })
})

describe('format a given path',() =>{

    it('should format " " to "./" ',() => {
        tools.formatPath('').should.be.exactly('./')
    })

    it('should format "/" to "./" ',() => {
        tools.formatPath('/').should.be.exactly('./')
    })

    it('should remove "/" from the first char ',() => {
        tools.formatPath('/abc/def').should.be.exactly('abc/def/')
        tools.formatPath('ghi/jkl').should.be.exactly('ghi/jkl/')
    })

    it('should add "/" to the last char ',() => {
        tools.formatPath('abc/def').should.be.exactly('abc/def/')
        tools.formatPath('ghi/jkl/').should.be.exactly('ghi/jkl/')
    })
})

describe('get absolute path from a relative path', () => {

    it('should get root dir absolute path',() => {
        let relPath = './'
        let absPath = path.resolve(storagePath,relPath)
        tools.getAbsPath(relPath).should.be.exactly(absPath)

        relPath = 'dsa/weqdxds/wqdsa'
        absPath = path.resolve(storagePath,relPath)
        tools.getAbsPath(relPath).should.be.exactly(absPath)
    })
})


describe('determine whether a path exists.',()=>{

    let existDirPath = tools.getAbsPath('existDir')
    let existFilePath = tools.getAbsPath('existFile.file')
    let notExistDirPath = tools.getAbsPath('notExistDir')
    let notExistFilePath = tools.getAbsPath('notExistFile.file')

    beforeEach( async () => {
        try{
            await fs.access(existDirPath,fs.constants.F_OK)
        }catch (e) {
            await fs.mkdir(existDirPath)
        }

        try{
            await fs.access(existFilePath,fs.constants.F_OK)
        }catch (e) {
            await fs.writeFile(existFilePath,'some string')
        }

        try{
            await fs.access(notExistDirPath,fs.constants.F_OK)
            await fs.rmdir(notExistDirPath)
        }catch (e) {}

        try{
            await fs.access(notExistFilePath,fs.constants.F_OK)
            await fs.unlink(notExistFilePath)
        }catch (e) {}
    })

    afterEach( async () => {
        try{
            await fs.access(existDirPath,fs.constants.F_OK)
            await fs.rmdir(existDirPath)
        }catch (e) {}

        try{
            await fs.access(existFilePath,fs.constants.F_OK)
            await fs.unlink(existFilePath)
        }catch (e) {}

        try{
            await fs.access(notExistDirPath,fs.constants.F_OK)
            await fs.rmdir(notExistDirPath)
        }catch (e) {}

        try{
            await fs.access(notExistFilePath,fs.constants.F_OK)
            await fs.unlink(notExistFilePath)
        }catch (e) {}
    })

    it('should exist a dir',async() => {
        let result = await tools.pathIsExist(existDirPath)
        result.should.be.exactly(true)
    })

    it('should exist a file',async() => {
        let result = await tools.pathIsExist(existFilePath)
        result.should.be.exactly(true)
    })

    it('should not exist a dir',async() => {
        let result = await tools.pathIsExist(notExistDirPath)
        result.should.be.exactly(false)
    })

    it('should not exist a file',async() => {
        let result = await tools.pathIsExist(notExistFilePath)
        result.should.be.exactly(false)
    })
})


