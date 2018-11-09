
let fs = require('mz/fs')
const Transform = require('stream').Transform

let doThing = async ()=> {

    let end = function(stream){

        return new Promise((resolve,reject) => {

            stream.on('end',()=>{
                resolve('end')
            })
        })
    }

    let targe = "dsad.pdf"
    let name1 = '0.chunk'
    let name2 = '1.chunk'

    let write = fs.createWriteStream('dadasa.pdf')
    let read1 = fs.createReadStream(name1)
    let read2 = fs.createReadStream(name2)

    read1.pipe(write,{end:false})
    await end(read1)
    read2.pipe(write)





    // let read1 = await fs.readFile(name1)
    // let read2 = await fs.readFile(name2)
    // let result = Buffer.concat([read1,read2])
    // await fs.writeFile('r.pdf',result)


}

doThing()