import * as fs from 'fs'
const walk : any = require('walk-folder-tree')

let blogCounter : number = 0
let imageCounter : number = 0
let fileCounter : number = 0

walk("/Users/mheisterberg/Downloads/lekkimworld-backup-20170908", {
    
}, (params:any, cb:any) => {
    const path : string = params.path

    if (path.indexOf('templates') === 0 || 
        path.indexOf('pages') === 0 || 
        path.indexOf('drafts') === 0 || 
        path.indexOf('theme') === 0 || 
        path.indexOf('indexes') === 0 || 
        path.indexOf('index') === 0) return cb()
    if (path.indexOf('.DS_Store') >= 0) return cb()
    if (path.indexOf('.xml.bak') > 0) return cb()
    
    if (path.match(/^\d{4}((\/\d{2})?((\/\d{2})?\/\d{13})?)?/im)) {
        // blog directory
        if (path.indexOf('.xml') > 0) {
            // blog post
            blogCounter++
        }
    } else if (path.indexOf('files/') === 0 && !params.directory) {
        // file
        fileCounter++
    } else if (path.indexOf('images/') === 0 && !params.directory) {
        // image
        imageCounter++
    }
    cb();
}).then(() => {
    console.log(`Blog counter: ${blogCounter}`)
    console.log(`File counter: ${fileCounter}`)
    console.log(`Image counter: ${imageCounter}`)
})
