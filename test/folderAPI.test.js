const supertest = require('supertest')
const should = require('should')
const path = require('path')
const fs = require('mz/fs')
const tools = require('../lib/tools')
const app = require('../app')

const { showDirInfo,mkFolder,delFolder,archiveFolder } = require('../core/directory')
const { storagePath } = require('../storage.js')

function request(){
    return supertest(app.listen())
}

describe('request folderAPI',() => {

    describe('GET /api/info',() => {

        it('should return 200',(done) =>{
            request()
                .get('/api/info')
                .expect(200)
                .end((err,res) => {
                    if(err) return done(err)
                    should(res.body).be.a.Array()
                    done()
                })
        })

        let targetDirPath = './'
        let folderName = 'balabalanotexists'
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
        let folderAbsPath = tools.getAbsPath(targetDirPath+folderName)

        after( async()=>{
            if(await tools.pathIsExist(folderAbsPath)){
                await fs.rmdir(folderAbsPath)
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
                    should(res.body).have.property('msg','文件夹创建成功')
                    done()
                })
        })
    })

    describe('DELETE /api/folder/*', () => {

        let targetDirPath = './'
        let folderName = 'testDir'
        let folderAbsPath = tools.getAbsPath(targetDirPath+folderName)

        beforeEach( async() => {
            if( ! await tools.pathIsExist(folderAbsPath)){
                await fs.mkdir(folderAbsPath)
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
                    should(res.body).have.property('msg','文件夹删除成功')
                    done()
                })
        })
    })
})