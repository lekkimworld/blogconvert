import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as model from './model'
const walk : any = require('walk-folder-tree')
const et : any = require('elementtree')

let blogCounter : number = 0
let blogError : Error[] = []
let imageCounter : number = 0
let fileCounter : number = 0
let posts : model.Post[] = []
const basepath = "/Users/mheisterberg/Downloads/lekkimworld-backup-20170908"

walk(basepath, {
    
}, (params:any, cb:any) => {
    const filepath : string = params.path
    const fullpath = path.join(basepath, filepath)

    if (filepath.indexOf('templates') === 0 || 
        filepath.indexOf('pages') === 0 || 
        filepath.indexOf('drafts') === 0 || 
        filepath.indexOf('theme') === 0 || 
        filepath.indexOf('indexes') === 0 || 
        filepath.indexOf('index') === 0) return cb()
    if (filepath.indexOf('.DS_Store') >= 0) return cb()
    if (filepath.indexOf('.xml.bak') > 0) return cb()
    
    if (filepath.match(/^\d{4}((\/\d{2})?((\/\d{2})?\/\d{13})?)?/im)) {
        // blog directory
        if (filepath.indexOf('.xml') > 0) {
            // blog post
            blogCounter++
            fs.readFile(fullpath, (err:Error, data:Buffer) => {
                if (err) {
                    blogError.push(err)
                    return cb()
                }
                
                // parse file
                const etree : any = et.parse(data.toString())
                const title : string = etree.findtext('./title')
                let body : string = etree.findtext('./body')
                const excerpt : string = etree.findtext('./excerpt')
                const tags : string[] = (function(tags) : string[] {
                    if (tags && tags.length) return tags.split(' ')
                    return []
                })(etree.findtext('./tags'))
                const date : moment.Moment = moment(etree.findtext('./date'), 'DD MMM YYYY HH:mm:ss:SSS Z')

                // create post object and push into array
                let post : model.Post = new model.Post(title, excerpt, body, date)
                tags.forEach(t => post.addTag(new model.Tag(t)))
                posts.push(post)

                // replace internal links with dummy link
                const internalLinkRegex = /<a href="(\/[-_.\/\w\d]+)"|<a href="http:\/\/lekkimworld\.com[-_.\/\w\d]+"|<a href="\.\/[-_.\/\w\d]+"/gm
                if (internalLinkRegex.test(body)) {
                    body = body.replace(internalLinkRegex, '<a href="javascript:void(0)"')
                }

                // look for internal images and replace
                const internalImagesRegex = /<img src="((?:\.?|http:\/\/lekkimworld\.com)(?:\/([-_.\w\d]+))+)"/gm
                let result
                while ((result = internalImagesRegex.exec(body)) !== null) {
                    let imageFilename = result[2]
                    let fullLink = result[1]
                    let imagePath = result[1]
                    if (fullLink.indexOf('http://') === 0) {
                        // absolute link
                        imagePath = fullLink.substring(22)
                    } else if (fullLink.charAt(0) === '.') {
                        // starts with .
                        fullLink = `http://lekkimworld.com/${fullLink.substring(1)}`
                        imagePath = fullLink.substring(1)
                    } else {
                        // starts with /
                        imagePath = fullLink.slice(0)
                        fullLink = `http://lekkimworld.com/${fullLink}`
                    }
                    let newLink = `https://lekkimworld.files.wordpress.com/${date.year()}/${date.month() < 9 ? '0' + (date.month()+1) : (date.month()+1)}/${imageFilename}`
                    internalImagesRegex.lastIndex += (newLink.length - result[0].length)
                    body = body.substring(0, result.index) + `<img src="${newLink}"` + body.substring(result.index+result[0].length)

                    // add image ref into post
                    post.addPostImage(new model.PostImage(fullLink, imagePath))
                }
                
                // write resulting Wordpress blog post
                const xml = `<item>
                    <title>${title}</title>
                    <pubDate>${date.format('DDD, DD MMM YYYY HH:mm:ss Z')}</pubDate>
                    <dc:creator>107823713</dc:creator>
                    <description/>
                    <content:encoded><![CDATA[${body}]]></content:encoded>
                    <excerpt:encoded><![CDATA[${excerpt}]]></excerpt:encoded>
                    <wp:post_id>${blogCounter}</wp:post_id>
                    <wp:post_date>${date.format('YYYY-MM-DD HH:mm:ss')}</wp:post_date>
                    <wp:post_date_gmt>${date.utc().format('YYYY-MM-DD HH:mm:ss')}</wp:post_date_gmt>
                    <wp:comment_status>closed</wp:comment_status>
                    <wp:ping_status>closed</wp:ping_status>
                    <wp:post_name>${title}</wp:post_name>
                    <wp:status>publish</wp:status>
                    <wp:post_parent>0</wp:post_parent>
                    <wp:menu_order>1</wp:menu_order>
                    <wp:post_type>post</wp:post_type>
                    <wp:post_password/>
                    <wp:is_sticky>0</wp:is_sticky>
                    <wp:postmeta>
                        <wp:meta_key>_wp_page_template</wp:meta_key>
                        <wp:meta_value><![CDATA[default]]></wp:meta_value>
                    </wp:postmeta>
                </item>`
                

                // callback to signal processed
                return cb()
            })
        }
    } else if (filepath.indexOf('files/') === 0 && !params.directory) {
        // file
        fileCounter++
    } else if (filepath.indexOf('images/') === 0 && !params.directory) {
        // image
        imageCounter++
    }
    cb()

}).then(() => {
    console.log(`Blog counter: ${blogCounter}`)
    console.log(`Blog errors: ${blogError.length}`)
    console.log(`File counter: ${fileCounter}`)
    console.log(`Image counter: ${imageCounter}`)

    
})
