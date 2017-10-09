/*
 * DOM操作ユーティリティ.
 */

    /**
     * 属性値設定.
     * @description elem要素のattr属性にattrValueを設定する.
     * @param {Element} elem DOM要素.
     * @param {string} attr 属性名.
     * @param {string} attrValue 属性値.
     */
    function changeAttr(elem,attr,attrValue) {
        if (elem != null && attr != null) {
            elem.setAttribute(attr,attrValue);
        }
    }

    /**
     * 属性値設定単体切替.
     * @description elem要素のattr属性にattrValueが含まれれば削除、含まれなければ追加する.
     * @param {Element} elem DOM要素.
     * @param {string} attr 属性名.
     * @param {string} attrValue 属性値.
     */
    function toggleAttr(elem,attr,attrValue) {
        if (elem != null && attr != null) {
            var curAttrList = elem.getAttribute(attr).split(/\s+/);
            var i = 0;
            for (i=0;i<curAttrList.length;i++) {
                if (curAttrList[i]==attrValue) {
                    curAttrList[i] = "";
                    break;
                }
            }
            if (i >= curAttrList.length) {
                curAttrList.push(" "+attrValue);
            }
            elem.setAttribute(attr,curAttrList.join(' ').split(/\s+/).join(' '));
        }
    }

    /**
     * 属性値設定単体更新追加.
     * @description elem要素のattr属性にattrValueが含まれれば何もしない、含まれなければ追加する.
     * @param {Element} elem DOM要素.
     * @param {string} attr 属性名.
     * @param {string} attrValue 属性値.
     */
    function upsertAttr(elem,attr,attrValue) {
        if (elem != null && attr != null) {
            var curAttrList = elem.getAttribute(attr).split(/\s+/);
            var i = 0;
            for (i=0;i<curAttrList.length;i++) {
                if (curAttrList[i]==attrValue) {
                    break;
                }
            }
            if (i >= curAttrList.length) {
                curAttrList.push(" "+attrValue);
            }
            elem.setAttribute(attr,curAttrList.join(' ').split(/\s+/).join(' '));
        }
    }

    /**
     * 属性値設定単体削除.
     * @description elem要素のattr属性にattrValueが含まれれば何もしない、含まれなければ追加する.
     * @param {Element} elem DOM要素.
     * @param {string} attr 属性名.
     * @param {string} attrValue 属性値.
     */
    function deleteAttr(elem,attr,attrValue) {
        if (elem != null && attr != null) {
            var curAttrList = elem.getAttribute(attr).split(/\s+/);
            var i = 0;
            for (i=0;i<curAttrList.length;i++) {
                if (curAttrList[i]==attrValue) {
                    curAttrList[i] = "";
                    break;
                }
            }
            elem.setAttribute(attr,curAttrList.join(' ').split(/\s+/).join(' '));
        }
    }

    /**
     * 属性値含有確認.
     * @description elem要素のattr属性にattrValueが含まれるかどうか.
     * @param {Element} elem DOM要素.
     * @param {string} attr 属性名.
     * @param {string} attrValue 属性値.
     * @return {boolean}
     */
    function hasAttrValue(elem,attr,attrValue) {
        var ret = false;
        if (elem != null && attr != null) {
            var curAttrList = elem.getAttribute(attr).split(/\s+/);
            var i = 0;
            for (i=0;i<curAttrList.length;i++) {
                if (curAttrList[i]==attrValue) {
                    ret = true;
                    break;
                }
            }
        }
        return ret;
    }

    /**
     * DOM要素内テキスト取得.
     * @description elemをStringに変換.
     * @param {Any} elem DOM要素/要素リスト/配列など.
     * @return {string} DOM要素文字列(elemがnullの場合"null"を返す).
     */
    function getElementText(elem) {
        var ret = 'null';
        if (elem instanceof NodeList || elem instanceof Array) {
            ret = '[';
            if (elem.length > 0) {
                ret += getElementText(elem[0]);
                for(var i=1;i < elem.length;i++){
                    ret += ', ' + getElementText(elem[i]);
                }
            }
            ret += ']';
        } else if (elem instanceof Element) {
            ret = elem.textContent;
        } else if (elem != null) {
            ret = elem.toString();
        }
        return ret;
    }

    /**
     * 子要素全削除.
     * @param {Element} elem 対象DOM要素.
     */
    function removeAllChildren(elem) {
        if (elem instanceof Element) {
            while(elem.firstChild){
                elem.removeChild(elem.firstChild);
            }
        }
    }