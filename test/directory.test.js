const path = require('path')
const should = require('should')
const fs = require('mz/fs')
const tools = require('../lib/tools')

const { showDirInfo,mkFolder,delFolder,archiveFolder } = require('../core/directory')
const { storagePath } = require('../storage.js')


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
        should(result).have.property('folderName',folderName)
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
        mkFolder(dirPath,folderName).should.rejectedWith('目录已存在')
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
        should(result).have.property('path',folderPath)
    })

    it('should not delete a folder with invalid path', async() =>{
        let invalidFolderPath = '/ba/la/'
        delFolder(invalidFolderPath).should.rejectedWith('目录不合法')
    })

    it('should not delete a folder that does not exist', async() =>{
        let folderPath = path.resolve(dirPath,'notExistDir')
        delFolder(folderPath).should.rejectedWith('该目录不存在')
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
        should(result).have.property('msg','success')
    })

    it('should not show a list of dir info that does not exist', async() =>{
        let folderPath = path.resolve(dirPath,'notExistDir')
        showDirInfo(folderPath).should.rejectedWith('目录不存在')
    })
})





