const router = require('koa-router')()
const {uploadFile} = require('../api/uploadFile')
const {downloadFile} = require('../api/downloadFile')
const {makeOneFolder,deleteFolder,getFolderInfo} = require('../api/folderAPI')
const { deleteFile,uploadFileStream} = require('../api/fileAPI')


router.prefix('/api')

router.get('/info', getFolderInfo)
router.get('/file/*', downloadFile)
router.post('/upload', uploadFile)
router.post('/file',uploadFileStream)
router.post('/folder', makeOneFolder)
router.delete('/folder/*', deleteFolder)
router.delete('/file/*', deleteFile)



module.exports = router
