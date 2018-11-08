# web-filesystem
a tiny file system web service

### Dev Environment

- Node.js v10.12.0
- npm v6.4.1

### Usage

1. use  `git clone `  to download the project code.
2. `cd web-filesystem/`
3. use `npm install`  to install node_modules
4. use `npm start`  or  `node bin/www`  to start the server


```bash
curl http://127.0.0.1:7000
```

### Customization

- The server listens on the port 7000 by default, you can pass it by yourself when typing start command.

```
node bin/www 6666
```

- All the files and directories are storaged in the `storage` folder by default. You can change this path by editing the `storage.js` file.

### Test

```bash
cd test
npm run test
```

### Todo Task

- [x] preview files and directories
- [x] upload file ( using stream )
- [x] download file ( using stream )
- [x] make folder
- [x] delete folder
- [x] archive directory ( using recursive method)
- [x] tools unit test
- [x] file unit test
- [x] directory unit test
- [x] fileAPI unit test
- [x] directoryAPI unit test
- []  chunk file upload
- []  chunk file download

