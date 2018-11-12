const router = require('koa-router')()
const { makeOneFolder,deleteFolder,getFolderInfo,archFolder } = require('../api/directoryAPI')
const { deleteFile,uploadFileStream,downloadFile } = require('../api/fileAPI')
const { createChunkInfo,uploadChunk,downloadChunkFile,deleteChunkFile } = require('../api/chunksAPI')


router.prefix('/api')

router.get('/info', getFolderInfo)
router.get('/file/*', downloadFile)
router.get('/chunk/file/*',downloadChunkFile)
router.get('/archive/*', archFolder)
router.post('/upload/*', uploadFileStream)
router.post('/chunk/upload/*',uploadChunk)
router.post('/chunk/*',createChunkInfo)
router.post('/folder', makeOneFolder)
router.delete('/folder/*', deleteFolder)
router.delete('/file/*', deleteFile)
router.delete('/chunk/file/*', deleteChunkFile)

module.exports = router
