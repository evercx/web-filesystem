const path = require('path')
const fs = require('mz/fs')
const {storagePath} = require('../storage.js')

/**
 * 函数功能简述
 *
 * 对 URI 进行 Decode 操作
 *
 * @param    {string}  str    URI 字符串
 * @returns  {string}
 *
 */

exports.safeDecodeURIComponent = function (str) {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return String(str)
    }
}

/**
 * 函数功能简述
 *
 * 对 路径地址 进行格式化操作
 *
 * @param    {string}  path    路径字符串
 * @returns  {string}
 *
 */
exports.formatPath = function(path){

    path === '' ? path = '.':path
    path === '/' ? path = '.':path
    path[0] === '/' ? path = path.substring(1):path
    path[path.length - 1] !== '/' ? path += "/" : path

    return path
}


/**
 * 函数功能简述
 *
 * 根据相对路径获取存储文件夹的绝对路径
 *
 * @param    {string}  relPath    相对路径字符串
 * @returns  {string}
 *
 */
exports.getAbsPath = function(relPath){

    relPath = this.formatPath(relPath)
    return path.resolve(storagePath,relPath)
}

/**
 * 函数功能简述
 *
 * 判断给定路径的文件或者目录是否存在
 *
 * @param    {string}  absPath    绝对路径字符串
 * @returns  {boolean}
 *
 */

exports.pathIsExist = async function(absPath){

    let isExist

    try{
        await fs.access(absPath,fs.constants.F_OK)
        isExist = true
    }catch (e) {
        isExist = false
    }

    return isExist
}


