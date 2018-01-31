import * as moment from 'moment'

export class Tag {
    readonly name: string
    constructor(name : string) {
        this.name = name
    }
}
class DateObject {
    readonly date : moment.Moment
    readonly pubDate : string
    readonly postDate : string
    readonly postDateUtc : string

    constructor(date : moment.Moment) {
        this.date = date
        this.pubDate = date.format('ddd, DD MMM YYYY HH:mm:ss Z')
        this.postDate = date.format('YYYY-MM-DD HH:mm:ss')
        this.postDateUtc = date.utc().format('YYYY-MM-DD HH:mm:ss')
    }
}
export class Post extends DateObject {
    readonly title : string
    body : string
    readonly excerpt : string
    readonly tags : Tag[] = []
    readonly postImages : PostImage[] = []

    constructor(title : string, excerpt : string, date : moment.Moment) {
        super(date)
        this.title = title
        this.excerpt = excerpt
    }
    addPostImage(img : PostImage) : Post {
        this.postImages.push(img)
        return this
    }
    addTag(tag : Tag) : Post {
        this.tags.push(tag)
        return this
    }
}
export class PostImage extends DateObject {
    readonly oldUrl : string
    readonly newUrl : string
    readonly path : string
    readonly name : string
    constructor(path : string, oldUrl : string, newUrl : string, date : moment.Moment) {
        super(date)
        this.oldUrl = oldUrl
        this.newUrl = newUrl
        this.path = path
        this.name = path.split('/').slice(-1)[0]
    }
}

