export default class Likes {
    constructor() {
        this.likes = [];
    }

    // create a new Like and add into the array.
    addLike(id, title, author, img) {
        const like = {
            id,
            title,
            author,
            img
        };
        this.likes.push(like);

        // persist data in localStorage
        this.persistData();

        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        // persist data in localStorage
        this.persistData();
    }

    // return true or false depends on whether the like is in the list or not.
    // matched like in the list => true
    // no matched like => false
    isLiked(id) {
        // to check if it is a liked element, if not existed, then return -1
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        // storing in JSON string
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));

        // restore the likes list if it is not empty in localStorage
        if (storage) {
            this.likes = storage;
        }

    }
}