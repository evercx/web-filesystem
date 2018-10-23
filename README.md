# web-filesystem
a tiny file system web service

### 开发环境

- Node.js v10.12.0
- npm v6.4.1

### 使用

1. 利用 `git clone ` 命令来下载本项目代码
2. 进入本项目根目录 如：`cd web-filesystem/`
3. 执行 `npm install` 安装项目依赖环境包
4. 执行 `npm start` 或 `node bin/www`  开始运行项目代码


```bash
curl http://127.0.0.1:7000
```

### 自定义

- 该项目默认端口号为本机的 7000 端口，若要自定义启动端口 可自行传参：

```
node bin/www 6666
```

- 本地存储文件夹默认为项目根目录下的`storage`文件夹，若要自定义文件夹可根据项目根目录下的`storage.js` 文件进行编辑

### 开发任务

- [x] 文件夹以及文件预览
- [x] 文件上传 ( stream 方式)
- [x] 文件下载 ( stream 方式)
- [x] 创建文件夹
- [x] 删除文件夹
- [x] 打包下载文件夹 ( 递归遍历文件)
- [x] tools 模块功能 单元测试
- [ ] 文件模块功能 单元测试
- [ ] 文件夹模块功能 单元测试
- [ ] 文件请求模块  单元测试
- [ ] 文件夹请求模块 单元测试

