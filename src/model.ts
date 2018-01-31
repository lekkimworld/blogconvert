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
    readonly comments : PostComment[] = []

    constructor(title : string, excerpt : string, date : moment.Moment) {
        super(date)
        this.title = title
        this.excerpt = excerpt
    }
    addComment(c : PostComment) : Post {
        this.comments.push(c)
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
export class PostComment extends DateObject {
    readonly title : string
    readonly author : string
    readonly email : string
    readonly website : string
    readonly ip : string
    readonly state : string
    readonly body : string

    constructor(title : string, author : string, email : string, website : string, ip : string, date : moment.Moment, state : string, body : string) {
        super(date)
        this.title = title
        this.author = author
        this.email = email
        this.website = website
        this.ip = ip
        this.state = state
        this.body = body
    }
}
