import * as moment from 'moment'

export class Tag {
    readonly name: string
    constructor(name : string) {
        this.name = name
    }
}
export class Post {
    readonly title : string
    body : string
    readonly excerpt : string
    readonly date : moment.Moment
    readonly tags : Tag[] = []
    readonly postImages : PostImage[] = []

    constructor(title : string, excerpt : string, date : moment.Moment) {
        this.title = title
        this.excerpt = excerpt
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
    readonly oldUrl : string
    readonly newUrl : string
    readonly path : string
    readonly name : string
    constructor(path : string, oldUrl : string, newUrl : string) {
        this.oldUrl = oldUrl
        this.newUrl = newUrl
        this.path = path
        this.name = path.split('/').slice(-1)[0]
    }
}

