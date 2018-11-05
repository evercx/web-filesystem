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



describe('GET /',() =>{

    it('should return 200',(done)=>{

        request().get('/')
            .expect(200,done)
    })


})