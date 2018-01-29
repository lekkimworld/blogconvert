import * as moment from 'moment'

export class Tag {
    readonly name: string
    constructor(name : string) {
        this.name = name
    }
}
export class Post {
    readonly title : string
    readonly body : string
    readonly excerpt : string
    readonly date : moment.Moment
    readonly tags : Tag[] = []
    readonly postImages : PostImage[] = []

    constructor(title : string, excerpt : string, body : string, date : moment.Moment) {
        this.title = title
        this.excerpt = excerpt
        this.body = body
        this.date = date
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
export class PostImage {
    readonly url : string
    readonly path : string

    constructor(url : string, path : string) {
        this.url = url
        this.path = path
    }
}

