const supertest = require('supertest')
const should = require('should')
const path = require('path')
const fs = require('mz/fs')
const tools = require('../lib/tools')
const app = require('../app')

const { delFolder } = require('../core/directory')
const { storagePath } = require('../storage.js')
const { SUCCESS,FAILED } = require('../lib/message')

function request(){
    return supertest(app.listen())
}


describe('GET /api/info',() => {

    it('should return 200',(done) =>{
        request()
            .get('/api/info')
            .expect(200)
            .end((err,res) => {
                if(err) return done(err)
                should(res.body.result.dirInfo).be.a.Array()
                should(res.body).have.property('message',SUCCESS.GET_DIRINFO)
                done()
            })
    })

    let targetDirPath = './'
    let folderName = 'notExistFolder'
    let folderAbsPath = tools.getAbsPath(targetDirPath+folderName)

    beforeEach( async() => {
        if( await tools.pathIsExist(folderAbsPath)){
            await fs.rmdir(folderAbsPath)
        }
    })

    it('should return 404',(done) =>{
        request()
            .get('/api/info/'+folderName)
            .expect(404,done)
    })
})


describe('POST /api/folder', ()=> {

    let targetDirPath = './'
    let folderName = 'testDir'
    let existFolderName = 'existDir'
    let folderAbsPath = tools.getAbsPath(targetDirPath + folderName)
    let existFolderAbsPath = tools.getAbsPath(targetDirPath + existFolderName)

    beforeEach( async () => {
        if (! await tools.pathIsExist(existFolderAbsPath)){
            await fs.mkdir(existFolderAbsPath)
        }

    })

    afterEach( async()=>{
        if(await tools.pathIsExist(folderAbsPath)){
            await fs.rmdir(folderAbsPath)
        }
        if(await tools.pathIsExist(existFolderAbsPath)){
            await fs.rmdir(existFolderAbsPath)
        }
    })

    it('should return 200 and make a folder',(done) => {
        request()
            .post('/api/folder')
            .set('Content-Type','application/json')
            .send({targetDirPath,folderName})
            .expect(200)
            .end((err,res) => {
                if(err) return done(err)
                should(res.body).have.property('message',SUCCESS.MAKE_FOLDER)
                done()
            })
    })

    it('should return 404 because of an existing folder',(done) => {
        request()
            .post('/api/folder')
            .set('Content-Type','application/json')
            .send({targetDirPath,folderName:existFolderName})
            .expect(404,done)
    })
})

describe('DELETE /api/folder/*', () => {

    let targetDirPath = './'
    let folderName = 'testDir'
    let folderAbsPath = tools.getAbsPath(targetDirPath + folderName)
    let notExistFolderName = "notExistDir"
    let notExistFolderAbsPath = tools.getAbsPath(targetDirPath + notExistFolderName)

    beforeEach( async() => {
        if( ! await tools.pathIsExist(folderAbsPath)){
            await fs.mkdir(folderAbsPath)
        }

        if( await tools.pathIsExist(notExistFolderAbsPath)){
            await fs.rmdir(notExistFolderAbsPath)
        }
    })

    afterEach( async()=>{
        if(await tools.pathIsExist(folderAbsPath)){
            await fs.rmdir(folderAbsPath)
        }
    })

    it('should return 200 and delete a folder',(done) => {

        request()
            .delete('/api/folder/'+folderName)
            .expect(200)
            .end((err,res) => {
                if(err) return done(err)
                should(res.body).have.property('message',SUCCESS.DELETE_FOLDER)
                done()
            })
    })

    it('should return 404 because of requesting "/"',(done) => {

        request()
            .delete('/api/folder/')
            .expect(404,done)
    })

    it('should return 404 because of a folder that does not exist',(done) => {

        request()
            .delete('/api/folder/' + notExistFolderName)
            .expect(404,done)
    })
})


describe('GET /api/archive/*', () => {

    let dirPath = storagePath
    let folderName = 'testDir'
    let folderPath = path.resolve(dirPath,folderName)
    let filePath = path.resolve(folderPath,'file.txt')
    let absZipFolderPath = path.resolve(dirPath,folderName + '.zip')
    let notExistFolderName = "notExistDir"
    let notExistFolderAbsPath = tools.getAbsPath(dirPath + notExistFolderName)


    beforeEach( async () => {

        if( ! await tools.pathIsExist(folderPath)){
            await fs.mkdir(folderPath)
        }
        if( ! await tools.pathIsExist(filePath)){
            await fs.writeFile(filePath,'some string')
        }
        if( await tools.pathIsExist(notExistFolderAbsPath)){
            await fs.rmdir(notExistFolderAbsPath)
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

    it('should return 200 and return a zip file',(done) => {

        request()
            .get('/api/archive/' + folderName)
            .expect(200,done)
            // .end((err,res) => {
            //     if(err) return done(err)
            //     should(res.body).have.property('length')
            //     done()
            // })
    })

    it('should return 404 because of a folder that does not exist',(done) => {

        request()
            .get('/api/archive/' + notExistFolderName)
            .expect(404,done)
    })
})
