const path = require('path')
const fs = require('fs')
const fsPromise = require('./fsPromise')
const {storagePath} = require('../storage.js')


exports.safeDecodeURIComponent = function (str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return String(str)
    }
}

exports.formatPath = function(path){

    path === '' ? path = '.':path
    path === '/' ? path = '.':path
    path[0] === '/' ? path = path.substring(1):path
    path[path.length - 1] !== '/' ? path += "/" : path

    return path
}

exports.getAbsPath = function(relPath){

    relPath = this.formatPath(relPath)
    return path.resolve(storagePath,relPath)

}

exports.pathIsExist = async function(absPath){

    let isExist

    try{
        await fsPromise.access(absPath,fs.constants.F_OK)
        isExist = true
    }catch (e) {
        isExist = false
    }

    return isExist
}


