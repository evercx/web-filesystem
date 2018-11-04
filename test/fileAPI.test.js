const supertest = require('supertest')
const should = require('should')
const fs = require('mz/fs')
const tools = require('../lib/tools')
const app = require('../app')

const { delFolder } = require('../core/directory')
const { SUCCESS,FAILED } = require('../lib/message')

function request(){
    return supertest(app.listen())
}


describe('GET /api/file/*', () => {

    let fileName = 'file.txt'
    let notExistFileName = 'notExistFile.txt'
    let fileAbsPath = tools.getAbsPath('./' + fileName)
    let notExistFileAbsPath = tools.getAbsPath('./' + notExistFileName)

    beforeEach( async() => {

        if( ! await tools.pathIsExist(fileAbsPath)){
            await fs.writeFile(fileAbsPath,'some string')
        }
        if( await tools.pathIsExist(notExistFileAbsPath)){
            await fs.unlink(notExistFileAbsPath)
        }
    })

    afterEach( async() => {

        if( await tools.pathIsExist(fileAbsPath)){
            await fs.unlink(fileAbsPath)
        }
        if( await tools.pathIsExist(notExistFileAbsPath)){
            await fs.unlink(notExistFileAbsPath)
        }
    })

    it('should return 200 and download a file',(done) => {
        // request()
        //     .get('/api/file/' + fileName)
        //     .expect(200)
        //     .end( (err,res) => {
        //         if(err) return done(err)
        //         should(res.body).have.property('length')
        //         done()
        //     })

        request()
            .get('/api/file/' + fileName)
            .expect(200,done)
    })

    it('should return 404 because of a file that does not exist',(done) => {
        request()
            .get('/api/file/' + notExistFileName)
            .expect(404,done)
    })
})

describe('DELETE /api/file/*', () => {

    let fileName = 'file.txt'
    let notExistFileName = 'notExistFile.txt'
    let fileAbsPath = tools.getAbsPath('./' + fileName)
    let notExistFileAbsPath = tools.getAbsPath('./' + notExistFileName)

    beforeEach( async() => {

        if( ! await tools.pathIsExist(fileAbsPath)){
            await fs.writeFile(fileAbsPath,'some string')
        }
        if( await tools.pathIsExist(notExistFileAbsPath)){
            await fs.unlink(notExistFileAbsPath)
        }
    })

    afterEach( async() => {

        if( await tools.pathIsExist(fileAbsPath)){
            await fs.unlink(fileAbsPath)
        }
        if( await tools.pathIsExist(notExistFileAbsPath)){
            await fs.unlink(notExistFileAbsPath)
        }
    })

    it('should return 200 and delete a file',(done) => {
        request()
            .delete('/api/file/' + fileName)
            .expect(200)
            .end( (err,res) => {
                if(err) return done(err)
                should(res.body).have.property('message',SUCCESS.DELETE_FILE)
                should(res.body.result).have.property('path',fileAbsPath)
                done()
            })
    })

    it('should return 404 because of a file that does not exist',(done) => {
        request()
            .delete('/api/file/' + notExistFileName)
            .expect(404,done)
    })
})


describe('POST /api/upload/*', () => {

    let fileOriginalName = 'fileOriginal.txt'
    let fileSavedDir = 'fileSavedDir'
    let fileOriginalAbsPath = tools.getAbsPath('./' + fileOriginalName)
    let fileSavedDirAbsPath = tools.getAbsPath('./' + fileSavedDir)

    beforeEach( async() => {

        if( ! await tools.pathIsExist(fileSavedDirAbsPath)){
            await fs.mkdir(fileSavedDirAbsPath)
        }
        if( ! await tools.pathIsExist(fileOriginalAbsPath)){
            await fs.writeFile(fileOriginalAbsPath,'some string')
        }
    })

    afterEach( async() => {

        if( await tools.pathIsExist(fileSavedDirAbsPath)){
            await delFolder(fileSavedDirAbsPath)
        }
        if( await tools.pathIsExist(fileOriginalAbsPath)){
            await fs.unlink(fileOriginalAbsPath)
        }
    })

    it('should return 200 and make a file',(done) => {
        request()
            .post('/api/upload/'+fileSavedDir)
            .type('multipart/form-data')
            .attach('txt',fileOriginalAbsPath )
            .expect(200)
            .end( (err,res) => {
                if(err) return done(err)
                should(res.body).have.property('message',SUCCESS.UPLOAD_FILE)
                done()
            })
    })
})




