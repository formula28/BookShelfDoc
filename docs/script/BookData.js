/**
 * 書籍情報基底クラス.
 */
class BookInfoBase {
    constructor(type){
        this.type = type;
    }
    static isBookInfo(obj, type){
        if(!BookInfoBase.prototype.isPrototypeOf(obj)){
            return false;
        }
        return type ? obj.type === type : true;
    }
}

/**
 * 書籍データクラス.
 */
class BookData extends BookInfoBase {
    constructor(title, path, thumbPath, thumbFile, series) {
        super("BookData");

        /**
         * 書籍のタイトル.
         * @type {string}
         */
        this.title = title;
        /**
         * 書籍ディレクトリパス.
         * @type {string}
         */
        this.path = path;
        /**
         * サムネイルパス.
         * @type {string}
         */
        this.thumbPath = thumbPath;
        /**
         * サムネイルファイル.
         * @type {File}
         */
        this.thumbFile = thumbFile;
        /**
         * シリーズ名.
         * @type {string}
         */
        this.series = series;
    }
    static isBookData(obj) {
        return BookInfoBase.isBookInfo(obj, "BookData");
    }
}

/**
 * 書籍シリーズデータクラス.
 */
class BookSeriesData extends BookInfoBase {
    constructor(title, book_list, child_series_list, series) {
        super("BookSeriesData");

        // シリーズ名.
        this.title = title;
        // 書籍のリスト.
        if (Array.isArray(book_list)) {
            this.book_list = book_list;
        } else {
            this.book_list = [];
        }
        // 子シリーズのリスト.
        if (Array.isArray(child_series_list)) {
            this.child_series_list = child_series_list;
        } else {
            this.child_series_list = [];
        }
        // 親シリーズ名.
        this.series = series;
    }
    /**
     * リストに追加.
     * @param {BookInfoBase} itme BookInfoBaseのアイテム.
     * @param {boolean} isRoot 再起呼び出しルートかどうか.
     */
    push(item, isRoot=true) {
        var isPushSuccess = false;

        if (this.title === item.series) {
            // 自身のシリーズ名と追加対象の親シリーズ名が一致する場合.
            if (BookData.isBookData(item)) {
                // 書籍の場合.
                // 直下の書籍リストに追加.
                this.book_list.push(item);
                isPushSuccess = true;
            } else if (BookSeriesData.isBookSeriesData(item)) {
                // 書籍シリーズの場合.
                // 直下の書籍シリーズリストに追加.
                this.child_series_list.push(item);
                isPushSuccess = true;
            }
        } else if (!item.series) {
            // 追加対象の親シリーズ名がない場合.
            // 直下の書籍リストに追加.
            item.series = this.title;
            this.book_list.push(item);
            isPushSuccess = true;
        } else {
            // 自身のシリーズ名と追加対象の親シリーズ名が一致しない場合.
            // 子シリーズに追加トライ.
            isPushSuccess = this.child_series_list.some(function(child_series){
                return child_series.push(item, false);
            });
        }

        if (!isPushSuccess && isRoot) {
            // 自身にも、子シリーズにも一致するシリーズがない場合は、子シリーズ新規作成.
            if (BookData.isBookData(item)) {
                this.child_series_list.push(new BookSeriesData(item.series, [item], [], this.title));
                isPushSuccess = true;
            } else if (BookSeriesData.isBookSeriesData(item)) {
                this.child_series_list.push(new BookSeriesData(item.series, [], [item], this.title));
                isPushSuccess = true;
            }
        }

        return isPushSuccess;
    }
    /**
     * 引数のタイトルに一致する書籍を含むか.
     * @param {string} title 書籍タイトル.
     */
    containsBook(title) {
        var ret = this.book_list.some(function(item) {
            return item.title === title;
        });
        if (!ret) {
            ret = this.child_series_list.some(function(child_series){
                return child_series.containsBook(title);
            });
        }
        return ret;
    }
    static isBookSeriesData(obj) {
        return BookInfoBase.isBookInfo(obj, "BookSeriesData");
    }
}
