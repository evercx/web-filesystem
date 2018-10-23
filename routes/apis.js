const router = require('koa-router')()
const { makeOneFolder,deleteFolder,getFolderInfo,archFolder } = require('../api/folderAPI')
const { deleteFile,uploadFileStream,downloadFile } = require('../api/fileAPI')


router.prefix('/api')

router.get('/info', getFolderInfo)
router.get('/file/*', downloadFile)
router.get('/archive/*', archFolder)
router.post('/upload/*', uploadFileStream)
router.post('/file',uploadFileStream)
router.post('/folder', makeOneFolder)
router.delete('/folder/*', deleteFolder)
router.delete('/file/*', deleteFile)

module.exports = router
