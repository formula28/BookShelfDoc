/** ファイル/ディレクトリのドロップ領域. */
var files_drop_area = document.querySelector("#files_drop_area");
/** コンテンツ表示領域 */
var contents_area = document.querySelector("#contents");
/** 本棚データ. */
var book_shelf = new BookSeriesData("本棚", [], []);


files_drop_area.ondragenter = function(evt) {
    console.log("files_drop_area ondragenter enter");
    upsertAttr(files_drop_area, 'class', 'drag');
    deleteAttr(files_drop_area, 'class', 'normal');
    console.log("files_drop_area ondragenter leave");
}
files_drop_area.ondragleave = function(evt) {
    console.log("files_drop_area ondragleave enter");
    deleteAttr(files_drop_area, 'class', 'drag');
    upsertAttr(files_drop_area, 'class', 'normal');
    console.log("files_drop_area ondragleave leave");
}
/**
 * ドロップ領域上にドラッグ時の処理.
 */
files_drop_area.ondragover = function(evt) {
    console.log("files_drop_area ondragover enter");
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    console.log("files_drop_area ondragover leave");
}

/**
 * ドロップ領域上にドロップ時の処理.
 */
files_drop_area.ondrop = function(evt) {
    console.log("files_drop_area ondrop enter");
    evt.stopPropagation();
    evt.preventDefault();
    deleteAttr(files_drop_area, 'class', 'drag');
    upsertAttr(files_drop_area, 'class', 'normal');

    // 本棚空にする.
    book_shelf.book_list = [];
    book_shelf.child_series_list = [];

    var dttrfr = evt.dataTransfer;
    if (dttrfr && dttrfr.items) {
        // ドロップされたアイテムからディレクトリのみ抽出.
        var items = dttrfr.items;
        var entries = [];
        for (var i=0;i<items.length;i++) {
            var entry;
            if (items[i].getAsEntry) {
                entry = items[i].getAsEntry();
            } else if (items[i].webkitGetAsEntry) {
                entry = items[i].webkitGetAsEntry();
            }
            if (entry && entry.isDirectory) {
                entries.push(entry);
            }
        }
        entries.sort(function(a,b){
            var ret = 0;
            if (a.name < b.name) {
                ret = -1;
            } else {
                ret = 1;
            }
        });

        // エントリーから書籍情報構築.
        Promise.all(
            entries.map(function(value) {
                return buildBookShelfDataAsync(value, null);
            })
        ).then(function(){
            console.log(book_shelf);
            appendBookContents(book_shelf);
        }).catch(function(){
            appendBookContents(null);
        });
    }

    console.log("files_drop_area ondrop leave");
}

/**
 * 本棚データ構築.
 * @param {FileSystemEntry} aTargetEntry 対象エントリー.
 * @param {FileSystemEntry} aParentEntry 親エントリー.
 */
function buildBookShelfDataAsync(aTargetEntry, aParentEntry) {
    let targetEntry = aTargetEntry;
    let parentEntry = aParentEntry;
    return new Promise(function(resolve, reject) {
        console.log("buildBookShelfDataAsync enter");
        buildBookShelfDataAsyncInner(targetEntry, parentEntry, resolve, reject);
        console.log("buildBookShelfDataAsync leave");
    });
}
/**
 * 本棚データ構築.
 * @param {FileSystemEntry} targetEntry 対象エントリー.
 * @param {FileSystemEntry} parentEntry 親エントリー.
 * @param {Function} resolve 非同期処理成功時コールバック.
 * @param {Function} reject 非同期処理失敗時コールバック.
 */
function buildBookShelfDataAsyncInner(targetEntry, parentEntry, resolve, reject) {
    // 対象エントリーが書籍ディレクトリかどうか判定して、
    // 書籍ディレクトリなら、本棚に追加する.

    if (targetEntry.isDirectory) {
        var reader = targetEntry.createReader();
        // ディレクトリ内容の読み取り
        reader.readEntries(
            // 読み取り成功
            function(entries) {
                console.log("buildBookShelfDataAsyncInner readEntries success enter");

                // ループ終了時処理.
                var loopFinish = function(isBookDir) {
                    console.log("buildBookShelfDataAsyncInner readEntries success loopFinish enter", isBookDir);

                    if (!isBookDir) {
                        // 再帰.
                        entries.forEach(function(entry){
                            buildBookShelfDataAsyncInner(entry, targetEntry, resolve, reject);
                        });
                    }

                    console.log("buildBookShelfDataAsyncInner readEntries success loopFinish leave");
                    resolve();
                }
                // ループ処理.
                var loop = function(i) {
                    console.log("buildBookShelfDataAsyncInner readEntries success loop enter", i);

                    if (0<=i && i<entries.length) {
                        // 範囲内ならループ処理続行.
                        if (entries[i].isFile) {
                            entries[i].file(function(file){
                                // なぜかfile.typeが空になっているため、正しく画像かどうか判定できない.
                                // if (file.type.match(/image/)) {
                                    // 画像なら書籍データを本棚に追加.
                                    if (!book_shelf.containsBook(targetEntry.name)) {
                                        book_shelf.push(new BookData(
                                            targetEntry.name
                                            , targetEntry.fullPath
                                            , entries[i].fullPath
                                            , file
                                            , parentEntry?parentEntry.name:null
                                        ));
                                    }
                                    loopFinish(true);
                                // } else {
                                //     // 画像でなければ次のループ.
                                //     loop(i+1);
                                // }
                            }, function(err){
                                console.log(err);
                                loop(i+1);
                            });
                        } else {
                            // ファイルでなければ次のループ.
                            loop(i+1);
                        }
                    } else {
                        // 範囲外ならループ処理終了.
                        loopFinish(false);
                    }

                    console.log("buildBookShelfDataAsyncInner readEntries success loop leave", i);
                }

                // ループ開始.
                loop(0);

                console.log("buildBookShelfDataAsyncInner readEntries leave");
            },
            // 読み取り失敗
            function(error) {
                console.log("buildBookShelfDataAsyncInner readEntries error enter");
                reject();
                console.log("buildBookShelfDataAsyncInner readEntries error leave");
            }
        );
    }
}

/**
 * 書籍コンテンツDOM追加.
 * @param {BookInfoBase} data 書籍情報.
 */
function appendBookContents(data) {
    console.log("appendBookContents enter");
    removeAllChildren(contents_area);
    appendBookContentsInner(data);
    console.log("appendBookContents leave");
}

/**
 * 書籍コンテンツDOM追加.
 * @param {BookInfoBase} data 書籍情報.
 */
function appendBookContentsInner(data) {
    console.log("appendBookContentsInner enter");
        
    if (BookData.isBookData(data)) {
        // サムネイル画像読み込み + DOM追加.
        var reader = new FileReader();
        reader.onload = function(evt) {
            var html = `<!--
         --><div class="book_item">
                <img class="thumb" src="${this.result}" /><!--
             --><div class="book_title">${data.title}</div>
            </div>`;
            contents_area.insertAdjacentHTML("beforeend", html);
        }
        reader.readAsDataURL(data.thumbFile);
    } else if (BookSeriesData.isBookSeriesData(data)) {
        if (data.book_list) {
            data.book_list.forEach(function(item){
                appendBookContentsInner(item);
            });
        }
        if (data.child_series_list) {
            data.child_series_list.forEach(function(item){
                appendBookContentsInner(item);
            });
        }
    } else {
        var html = `
            <span class="nodata">No Data.</span>
        `;
        contents_area.insertAdjacentHTML("beforeend", html);
    }

    console.log("appendBookContentsInner leave");
}