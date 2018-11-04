const path = require('path')

//const PROJ_HOME = path.resolve(process.cwd(),'..')
const PROJ_HOME = path.resolve(__dirname)
const STORAGE_FOLDER = 'storage'

module.exports = {
    storagePath:path.resolve(PROJ_HOME,STORAGE_FOLDER),
    storageFolder:STORAGE_FOLDER
}

