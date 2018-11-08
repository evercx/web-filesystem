const path = require('path')

//const PROJ_HOME = path.resolve(process.cwd(),'..')
const PROJ_HOME = path.resolve(__dirname)
const STORAGE_FOLDER = 'storage'
const CHUNKS_STORAGE_FOLDER = 'chunkStorage'

module.exports = {
    storagePath:path.resolve(PROJ_HOME,STORAGE_FOLDER),
    storageFolder:STORAGE_FOLDER,
    chunkStoragePath:path.resolve(PROJ_HOME,CHUNKS_STORAGE_FOLDER),
    chunkStorageFolder:CHUNKS_STORAGE_FOLDER
}

