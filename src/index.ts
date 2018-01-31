import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as model from './model'
const BLOG_CREATOR_ID : string = '107823713'
const BLOG_CREATOR_EMAIL : string = 'mikkel@heisterberg.dk'
const BLOG_CREATOR_LOGIN : string = 'lekkimworld'
const BLOG_CREATOR_DISPNAME : string = 'lekkim'
const BLOG_CREATOR_FN : string = 'Mikkel Flindt'
const BLOG_CREATOR_LN : string = 'Heisterberg'
const walk : any = require('walk-folder-tree')
const et : any = require('elementtree')
const uuid : any = require('uuid/v1')

let blogCounter : number = 0
let blogError : Error[] = []
let postImage : number = 0
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
                const state : string = etree.findtext('./state')

                // if unpublished ignore
                if (state !== 'published') return cb()

                // get data
                const title : string = etree.findtext('./title')
                let body : string = etree.findtext('./body')
                const excerpt : string = etree.findtext('./excerpt')
                const tags : string[] = (function(tags) : string[] {
                    if (tags && tags.length) return tags.split(' ')
                    return []
                })(etree.findtext('./tags'))
                const date : moment.Moment = moment(etree.findtext('./date'), 'DD MMM YYYY HH:mm:ss:SSS Z')

                // create post object
                let post : model.Post = new model.Post(title, excerpt, date)
                tags.forEach(t => post.addTag(new model.Tag(t)))

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
                        imagePath = fullLink.substring(1)
                        fullLink = `http://lekkimworld.com${fullLink.substring(1)}`
                    } else {
                        // starts with /
                        imagePath = fullLink.slice(0)
                        fullLink = `http://lekkimworld.com${fullLink}`
                    }
                    let newLink = `https://lekkimworld.files.wordpress.com/${date.year()}/${date.month() < 9 ? '0' + (date.month()+1) : (date.month()+1)}/${imageFilename}`
                    internalImagesRegex.lastIndex += (newLink.length - result[0].length)
                    body = body.substring(0, result.index) + `<img src="${newLink}"` + body.substring(result.index+result[0].length)

                    // add image ref into post
                    post.addPostImage(new model.PostImage(imagePath, fullLink, newLink))
                    postImage++
                }
                if (post.postImages.length === 0) return cb()

                // push into array
                post.body = body
                posts.push(post)
                
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
    console.log(`Post counter: ${blogCounter}`)
    console.log(`Post images: ${postImage}`)
    console.log(`Blog errors: ${blogError.length}`)
    console.log(`File counter: ${fileCounter}`)
    console.log(`Image counter: ${imageCounter}`)

    // loop posts and build resulting document
    let resultPath : string = path.join(__dirname, '..', 'result.xml')
    fs.exists(resultPath, (exists : boolean) => {
        if (exists) fs.unlinkSync(resultPath)
        
        // create output stream
        let xmlStream : fs.WriteStream = fs.createWriteStream(resultPath)

        // start document
        xmlStream.write(`<?xml version="1.0" ?>
        <rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" 
            xmlns:content="http://purl.org/rss/1.0/modules/content/" 
            xmlns:wfw="http://wellformedweb.org/CommentAPI/" 
            xmlns:dc="http://purl.org/dc/elements/1.1/" 
            xmlns:wp="http://wordpress.org/export/1.2/">
          <channel>
            <title>lekkimworld.com</title>
            <link>http://lekkimworld.com</link>
            <description>Blog import from lekkimworld.com</description>
            <pubDate>Fri, 19 Feb 2018 13:36:26 +0000</pubDate>
            <language>en</language>
            <wp:wxr_version>1.2</wp:wxr_version>
            <wp:base_site_url>http://wordpress.com/</wp:base_site_url>
            <wp:base_blog_url>http://wpthemetestdata.wordpress.com</wp:base_blog_url>
            <generator>http://lekkimworld.com/</generator>
        
            <!-- authors -->
            <wp:author><wp:author_id>${BLOG_CREATOR_ID}</wp:author_id><wp:author_login><![CDATA[${BLOG_CREATOR_LOGIN}]]></wp:author_login><wp:author_email><![CDATA[${BLOG_CREATOR_EMAIL}]]></wp:author_email><wp:author_display_name><![CDATA[${BLOG_CREATOR_DISPNAME}]]></wp:author_display_name><wp:author_first_name><![CDATA[${BLOG_CREATOR_FN}]]></wp:author_first_name><wp:author_last_name><![CDATA[${BLOG_CREATOR_LN}]]></wp:author_last_name></wp:author>
        `)

        // add posts
        posts.forEach((post, idx) => {
            // write resulting Wordpress blog post
            const pubDate : string = post.date.format('ddd, DD MMM YYYY HH:mm:ss Z')
            const postDate : string = post.date.format('YYYY-MM-DD HH:mm:ss')
            const postDateUtc : string = post.date.utc().format('YYYY-MM-DD HH:mm:ss')
            const xml = `<item>
                <title>${post.title} ${new Date().getTime()}</title>
                <pubDate>${pubDate}</pubDate>
                <dc:creator>${BLOG_CREATOR_ID}</dc:creator>
                <description/>
                <content:encoded><![CDATA[${post.body}]]></content:encoded>
                <excerpt:encoded><![CDATA[${post.excerpt}]]></excerpt:encoded>
                <wp:post_id>${uuid()}</wp:post_id>
                <wp:post_date>${postDate}</wp:post_date>
                <wp:post_date_gmt>${postDateUtc}</wp:post_date_gmt>
                <wp:comment_status>closed</wp:comment_status>
                <wp:ping_status>closed</wp:ping_status>
                <wp:post_name>${post.title}</wp:post_name>
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
            </item>
            `
            xmlStream.write(xml)

            // loop any post image and add to document
            post.postImages.forEach(img => {
                const xml = `<item>
                    <title>${img.name}</title>
                    <link>${img.oldUrl}</link>
                    <pubDate>${pubDate}</pubDate>
                    <dc:creator>${BLOG_CREATOR_ID}</dc:creator>
                    <guid isPermaLink="false">${img.newUrl}</guid>
                    <description></description>
                    <wp:post_id>${uuid()}</wp:post_id>
                    <wp:post_date>${postDate}</wp:post_date>
                    <wp:post_date_gmt>${postDateUtc}</wp:post_date_gmt>
                    <wp:comment_status>closed</wp:comment_status>
                    <wp:ping_status>closed</wp:ping_status>
                    <wp:post_name>${img.name}</wp:post_name>
                    <wp:status>publish</wp:status>
                    <wp:post_parent>0</wp:post_parent>
                    <wp:menu_order>1</wp:menu_order>
                    <wp:post_type>attachment</wp:post_type>
                    <wp:post_password/>
                    <wp:is_sticky>0</wp:is_sticky>
                    <wp:attachment_url>${img.oldUrl}</wp:attachment_url>
                </item>
                `
                xmlStream.write(xml)
            })
        })
        

        // close document and stream
        xmlStream.write('</rss>\n')
        xmlStream.close()
    })

})
