const path = require('path')
const should = require('should')
const fs = require('mz/fs')
const tools = require('../lib/tools')

const { showDirInfo,mkFolder,delFolder,archiveFolder } = require('../core/directory')
const { storagePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')

describe('make one folder', () =>{

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)

    after( async()=>{

        if(await tools.pathIsExist(folderPath)){
            await fs.rmdir(folderPath)
        }
    })

    it('should create a folder named "testDir"', async() =>{
        let result = await mkFolder(dirPath,folderName)
        should(result).have.property('message',SUCCESS.MAKE_FOLDER)
        // should(result).have.property('folderName',folderName)
    })
})

describe('make an exist folder', () =>{

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)

    before( async()=>{
        if(! await tools.pathIsExist(folderPath)){
            await fs.mkdir(folderPath)
        }
    })

    after( async()=>{
        if(await tools.pathIsExist(folderPath)){
            await fs.rmdir(folderPath)
        }
    })

    it('should not create an exist folder', async() =>{
        mkFolder(dirPath,folderName).should.rejectedWith(FAILED.DIR_EXISTED)
    })
})

describe('delete one folder', () =>{

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)

    beforeEach( async()=>{
        if(! await tools.pathIsExist(folderPath)){
            await fs.mkdir(folderPath)
        }
    })

    afterEach( async()=>{
        if(await tools.pathIsExist(folderPath)){
            await fs.rmdir(folderPath)
        }
    })

    it('should delete a folder named "testDir"', async() =>{
        let result = await delFolder(folderPath)
        should(result).have.property('message',SUCCESS.DELETE_FOLDER)
    })

    it('should not delete a folder with invalid path', async() =>{
        let invalidFolderPath = '/ba/la/'
        delFolder(invalidFolderPath).should.rejectedWith(FAILED.DIR_INVALID)
    })

    it('should not delete a folder that does not exist', async() =>{
        let folderPath = path.resolve(dirPath,'notExistDir')
        delFolder(folderPath).should.rejectedWith(FAILED.DIR_NOTEXIST)
    })
})


describe('show dir info',() =>{

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)
    let testFilePath = path.resolve(folderPath,'testFile.txt')

    beforeEach( async()=>{

        if(! await tools.pathIsExist(folderPath)){
            await fs.mkdir(folderPath)
            await fs.writeFile(testFilePath,'lalala')
        }
    })

    afterEach( async()=>{

        if(await tools.pathIsExist(folderPath)){
            await fs.unlink(testFilePath)
            await fs.rmdir(folderPath)
        }
    })

    it('should show a list of dir info', async() =>{
        let result = await showDirInfo(folderPath)
        should(result).have.property('message',SUCCESS.GET_DIRINFO)
    })

    it('should not show a list of dir info that does not exist', async() =>{
        let folderPath = path.resolve(dirPath,'notExistDir')
        showDirInfo(folderPath).should.rejectedWith(FAILED.DIR_NOTEXIST)
    })
})

describe('archive a folder recursively', () => {

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)
    let filePath = path.resolve(folderPath,'file.txt')
    let absZipFolderPath = path.resolve(dirPath,folderName + '.zip')

    beforeEach( async () => {

        if( ! await tools.pathIsExist(folderPath)){
            await fs.mkdir(folderPath)
        }
        if( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'some string')
        }
    })

    afterEach( async () => {

        if(await tools.pathIsExist(folderPath)){
            await delFolder(folderPath)
        }
        if(await tools.pathIsExist(absZipFolderPath)){
            await fs.unlink(absZipFolderPath)
        }
    })

    it('should make a zip file' ,async() =>{

        let result = await archiveFolder(folderPath,absZipFolderPath)
        result.should.have.property('pipe')
    })
})






