const path = require('path')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)
const unlink = util.promisify(fs.unlink)
const access = util.promisify(fs.access)
const mkdir = util.promisify(fs.mkdir)
const rmdir = util.promisify(fs.rmdir)

module.exports = {
    readdir,
    readFile,
    stat,
    unlink,
    access,
    mkdir,
    rmdir
}

