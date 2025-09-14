/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var cc = cc || {};

/** @expose */
window._p;
_p = window;
/** @expose */
_p.gl;
/** @expose */
_p.WebGLRenderingContext;
/** @expose */
_p.DeviceOrientationEvent;
/** @expose */
_p.DeviceMotionEvent;
/** @expose */
_p.AudioContext;
/** @expose */
_p.webkitAudioContext;
/** @expose */
_p.mozAudioContext;
_p = Object.prototype;
/** @expose */
_p._super;
/** @expose */
_p.ctor;
delete window._p;

//is nodejs ? Used to support node-webkit.
cc._isNodeJs = typeof require !== 'undefined' && require("fs");

/**
 * Iterate over an object or an array, executing a function for each matched element.
 * @param {object|array} obj
 * @param {function} iterator
 * @param [{object}] context
 */
cc.each = function(obj, iterator, context){
    if(!obj) return;
    if(obj instanceof Array){
        for(var i = 0, li = obj.length; i < li; i++){
            if(iterator.call(context, obj[i], i) === false) return;
        }
    }else{
        for (var key in obj) {
            if(iterator.call(context, obj[key], key) === false) return;
        }
    }
};


//+++++++++++++++++++++++++something about async begin+++++++++++++++++++++++++++++++
cc.async = {
    /**
     * Counter for cc.async
     * @param err
     */
    _counterFunc : function(err){
        var counter = this.counter;
        if(counter.err) return;
        var length = counter.length;
        var results = counter.results;
        var option = counter.option;
        var cb = option.cb, cbTarget = option.cbTarget, trigger = option.trigger, triggerTarget = option.triggerTarget;
        if(err) {
            counter.err = err;
            if(cb) return cb.call(cbTarget, err);
            return;
        }
        var result = Array.apply(null, arguments).slice(1);
        var l = result.length;
        if(l == 0) result = null;
        else if(l == 1) result = result[0];
        else result = result;
        results[this.index] = result;
        counter.count--;
        if(trigger) trigger.call(triggerTarget, result, length - counter.count, length);
        if(counter.count == 0 && cb) cb.apply(cbTarget, [null, results]);
    },

    /**
     * Empty function for async.
     * @private
     */
    _emptyFunc : function(){},
    /**
     * Do tasks parallel.
     * @param tasks
     * @param option
     * @param cb
     */
    parallel : function(tasks, option, cb){
        var async = cc.async;
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
            option.cb = cb || option.cb;
        }
        else if(l == 2){
            if(typeof option == "function") option = {cb : option};
        }else if(l == 1) option = {};
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};

        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter : counter, index : index});//bind counter and index
            task(counterFunc, index);
        });
    },

    /**
     * Do tasks by iterator.
     * @param tasks
     * @param {{cb:{function}, target:{object}, iterator:{function}, iteratorTarget:{function}}|function} option
     * @param cb
     */
    map : function(tasks, option, cb){
        var self = this;
        var l = arguments.length;
        if(typeof option == "function") option = {iterator : option};
        if(l == 3) option.cb = cb || option.cb;
        else if(l == 2);
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};
        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb ? self._emptyFunc : self._counterFunc.bind({counter : counter, index : index});//bind counter and index
            option.iterator.call(option.iteratorTarget, task, index, counterFunc);
        });
    }
};
//+++++++++++++++++++++++++something about async end+++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about path begin++++++++++++++++++++++++++++++++
cc.path = {
    /**
     * Join strings to be a path.
     * @example
     cc.path.join("a", "b.png");//-->"a/b.png"
     cc.path.join("a", "b", "c.png");//-->"a/b/c.png"
     cc.path.join("a", "b");//-->"a/b"
     cc.path.join("a", "b", "/");//-->"a/b/"
     cc.path.join("a", "b/", "/");//-->"a/b/"
     * @returns {string}
     */
    join : function(){
        var l = arguments.length;
        var result = "";
        for(var i = 0; i < l; i++) {
            result = (result + (result == "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },

    /**
     * Get the ext name of a path.
     * @example
     cc.path.extname("a/b.png");//-->".png"
     cc.path.extname("a/b.png?a=1&b=2");//-->".png"
     cc.path.extname("a/b");//-->null
     cc.path.extname("a/b?a=1&b=2");//-->null
     * @param pathStr
     * @returns {*}
     */
    extname : function(pathStr){
        var temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
        return temp ? temp[1] : null;
    },

    /**
     * Get the file name of a file path.
     * @example
     cc.path.basename("a/b.png");//-->"b.png"
     cc.path.basename("a/b.png?a=1&b=2");//-->"b.png"
     cc.path.basename("a/b.png", ".png");//-->"b"
     cc.path.basename("a/b.png?a=1&b=2", ".png");//-->"b"
     cc.path.basename("a/b.png", ".txt");//-->"b.png"
     * @param pathStr
     * @param extname
     * @returns {*}
     */
    basename : function(pathStr, extname){
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        var reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        var result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if(!result) return null;
        var baseName = result[2];
        if(extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() == extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },

    /**
     * Get ext name of a file path.
     * @example
     cc.path.driname("a/b/c.png");//-->"a/b"
     cc.path.driname("a/b/c.png?a=1&b=2");//-->"a/b"
     * @param {String} pathStr
     * @returns {*}
     */
    dirname : function(pathStr){
        return pathStr.replace(/(\/|\\\\)$/, "").replace(/(\/|\\\\)[^(\/|\\\\)]+$/, "");
    },

    /**
     * Change extname of a file path.
     * @example
     cc.path.changeExtname("a/b.png", ".plist");//-->"a/b.plist"
     cc.path.changeExtname("a/b.png?a=1&b=2", ".plist");//-->"a/b.plist?a=1&b=2"
     * @param pathStr
     * @param extname
     * @returns {string}
     */
    changeExtname : function(pathStr, extname){
        extname = extname || "";
        var index = pathStr.indexOf("?");
        var tempStr = "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf(".");
        if(index < 0) return pathStr + extname + tempStr;
        return pathStr.substring(0, index) + extname + tempStr;
    },
    /**
     * Change file name of a file path.
     * @example
     cc.path.changeBasename("a/b/c.plist", "b.plist");//-->"a/b/b.plist"
     cc.path.changeBasename("a/b/c.plist?a=1&b=2", "b.plist");//-->"a/b/b.plist?a=1&b=2"
     cc.path.changeBasename("a/b/c.plist", ".png");//-->"a/b/c.png"
     cc.path.changeBasename("a/b/c.plist", "b");//-->"a/b/b"
     cc.path.changeBasename("a/b/c.plist", "b", true);//-->"a/b/b.plist"
     * @param {String} pathStr
     * @param {String} basename
     * @param [{Boolean}] isSameExt
     * @returns {string}
     */
    changeBasename : function(pathStr, basename, isSameExt){
        if(basename.indexOf(".") == 0) return this.changeExtname(pathStr, basename);
        var index = pathStr.indexOf("?");
        var tempStr = "";
        var ext = isSameExt ? this.extname(pathStr) : "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index+1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    }
};
//+++++++++++++++++++++++++something about path end++++++++++++++++++++++++++++++++

//Compatibility with IE9
var Uint8Array = Uint8Array || Array;

if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    var IEBinaryToArray_ByteStr_Script =
        "<!-- IEBinaryToArray_ByteStr -->\r\n" +
            //"<script type='text/vbscript'>\r\n" +
            "Function IEBinaryToArray_ByteStr(Binary)\r\n" +
            "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n" +
            "End Function\r\n" +
            "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n" +
            "   Dim lastIndex\r\n" +
            "   lastIndex = LenB(Binary)\r\n" +
            "   if lastIndex mod 2 Then\r\n" +
            "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n" +
            "   Else\r\n" +
            "       IEBinaryToArray_ByteStr_Last = " + '""' + "\r\n" +
            "   End If\r\n" +
            "End Function\r\n";// +
    //"</script>\r\n";

    // inject VBScript
    //document.write(IEBinaryToArray_ByteStr_Script);
    var myVBScript = document.createElement('script');
    myVBScript.type = "text/vbscript";
    myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
    document.body.appendChild(myVBScript);

    // helper to convert from responseBody to a "responseText" like thing
    cc._convertResponseBodyToText = function (binary) {
        var byteMapping = {};
        for (var i = 0; i < 256; i++) {
            for (var j = 0; j < 256; j++) {
                byteMapping[ String.fromCharCode(i + j * 256) ] =
                    String.fromCharCode(i) + String.fromCharCode(j);
            }
        }
        var rawBytes = IEBinaryToArray_ByteStr(binary);
        var lastChr = IEBinaryToArray_ByteStr_Last(binary);
        return rawBytes.replace(/[\s\S]/g,
            function (match) {
                return byteMapping[match];
            }) + lastChr;
    };
}


//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++
cc.loader = {

    _jsCache : {},//cache for js
    _register : {},//register of loaders
    _langPathCache : {},//cache for lang path
    _aliases : {},//aliases for res url

    resPath : "",//root path of resource
    audioPath : "",//root path of audio
    cache : {},//cache for data loaded

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest : function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    },


    //@MODE_BEGIN DEV

    _getArgs4Js : function(args){
        var a0 = args[0], a1 = args[1], a2 = args[2], results = ["", null, null];

        if(args.length == 1){
            results[1] = a0 instanceof Array ? a0 : [a0];
        }else if(args.length == 2){
            if(typeof a1 == "function"){
                results[1] = a0 instanceof Array ? a0 : [a0];
                results[2] = a1;
            }else{
                results[0] = a0 || "";
                results[1] = a1 instanceof Array ? a1 : [a1];
            }
        }else if(args.length == 3){
            results[0] = a0 || "";
            results[1] = a1 instanceof Array ? a1 : [a1];
            results[2] = a2;
        }else throw "arguments error to load js!";
        return results;
    },
    /**
     * Load js files.
     * @param {?string=} baseDir   The pre path for jsList.
     * @param {array.<string>} jsList    List of js path.
     * @param {function} cb        Callback function
     *
     *      If the arguments.length == 2, then the baseDir turns to be "".
     * @returns {*}
     */
    loadJs : function(baseDir, jsList, cb){
        var self = this, localJsCache = self._jsCache,
            args = self._getArgs4Js(arguments);

        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            self._loadJs4Dependency(args[0], args[1], 0, args[2]);
        } else {
            cc.async.map(args[1], function(item, index, cb1){
                var jsPath = cc.path.join(args[0], item);
                if(localJsCache[jsPath]) return cb1(null);
                self._createScript(jsPath, false, cb1);
            }, args[2]);
        }
    },
    /**
     * Load js width loading image.
     * @param {?string} baseDir
     * @param {array} jsList
     * @param {function} cb
     */
    loadJsWithImg : function(baseDir, jsList, cb){
        var self = this, jsLoadingImg = self._loadJsImg(),
            args = self._getArgs4Js(arguments);
        this.loadJs(args[0], args[1], function(err){
            if(err) throw err;
            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
            if(args[2]) args[2]();
        });
    },
    _createScript : function(jsPath, isAsync, cb){
        var d = document, self = this, s = d.createElement('script');
        s.async = isAsync;
        s.src = jsPath;
        self._jsCache[jsPath] = true;
        s.addEventListener('load',function(){
            this.removeEventListener('load', arguments.callee, false);
            cb();
        },false);
        s.addEventListener('error',function(){
            cb("Load " + jsPath + " failed!");
        },false);
        d.body.appendChild(s);
    },
    _loadJs4Dependency : function(baseDir, jsList, index, cb){
        if(index >= jsList.length) {
            if(cb) cb();
            return;
        }
        var self = this;
        self._createScript(cc.path.join(baseDir, jsList[index]), false, function(err){
            if(err) return cb(err);
            self._loadJs4Dependency(baseDir, jsList, index+1, cb);
        });
    },
    _loadJsImg : function(){
        var d = document, jsLoadingImg = d.getElementById("cocos2d_loadJsImg");
        if(!jsLoadingImg){
            jsLoadingImg = d.createElement('img');
            jsLoadingImg.src = "data:image/gif;base64,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";

            var canvasNode = d.getElementById(cc.game.config["id"]);
            canvasNode.style.backgroundColor = "transparent"; //backgroundColor = "white";// "black";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle?getComputedStyle(canvasNode):canvasNode.currentStyle;
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width)/2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height)/2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    },
    //@MODE_END DEV

    /**
     * Load a single resource as txt.
     * @param {!string} url
     * @param {function} cb arguments are : err, txt
     */
    loadTxt : function(url, cb){
        if(!cc._isNodeJs){
            var xhr = this.getXMLHttpRequest(),
                errInfo = "load " + url + " failed!";
            xhr.open("GET", url, true);
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                // IE-specific logic here
                xhr.setRequestHeader("Accept-Charset", "utf-8");
                xhr.onreadystatechange = function () {
                    xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
                };
            } else {
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
                xhr.onload = function () {
                    xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
                };
            }
            xhr.send(null);
        }else{
            var fs = require("fs");
            fs.readFile(url, function(err, data){
                err ? cb(err) : cb(null, data.toString());
            });
        }
    },
    _loadTxtSync : function(url){
        if(!cc._isNodeJs){
            var xhr = this.getXMLHttpRequest();
            xhr.open("GET", url, false);
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                // IE-specific logic here
                xhr.setRequestHeader("Accept-Charset", "utf-8");
            } else {
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            }
            xhr.send(null);
            if (!xhr.readyState == 4 || xhr.status != 200) {
                return null;
            }
            return xhr.responseText;
        }else{
            var fs = require("fs");
            return fs.readFileSync(url).toString();
        }
    },

    /**
     * Load a single resource as json.
     * @param {!string} url
     * @param {function} cb arguments are : err, json
     */
    loadJson : function(url, cb){
        this.loadTxt(url, function(err, txt){
            try{
                err ? cb(err) : cb(null, JSON.parse(txt));
            }catch(e){
                throw e;
                cb("load json [" + url + "] failed : " + e);
            }
        });
    },

    /**
     * Load a single image.
     * @param {!string} url
     * @param [{object}] option
     * @param {function} cb
     * @returns {Image}
     */
    loadImg : function(url, option, cb){
        var l = arguments.length;
        var opt = {
            isCrossOrigin : true
        };
        if(l == 3) {
            opt.isCrossOrigin = option.isCrossOrigin == null ? opt.isCrossOrigin : option.isCrossOrigin;
        }
        else if(l == 2) cb = option;

        var img = new Image();
        if(opt.isCrossOrigin) img.crossOrigin = "Anonymous";

        img.addEventListener("load", function () {
            this.removeEventListener('load', arguments.callee, false);
            this.removeEventListener('error', arguments.callee, false);
            if(cb) cb(null, img);
        });
        img.addEventListener("error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if(cb) cb("load image failed");
        });
        img.src = url;
        return img;
    },

    _str2Uint8Array : function(strData){
        if (!strData)
            return null;

        var arrData = new Uint8Array(strData.length);
        for (var i = 0; i < strData.length; i++) {
            arrData[i] = strData.charCodeAt(i) & 0xff;
        }
        return arrData;
    },
    /**
     * Load binary data by url.
     * @param {String} url
     * @param {Function} cb
     */
    loadBinary : function(url, cb){
        var self = this;
        var xhr = this.getXMLHttpRequest(),
            errInfo = "load " + url + " failed!";
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4 && xhr.status == 200){
                    var fileContents = cc._convertResponseBodyToText(xhr["responseBody"]);
                    cb(null, self._str2Uint8Array(fileContents));
                } else cb(errInfo);
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=x-user-defined");
            xhr.onload = function () {
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, self._str2Uint8Array(xhr.responseText)) : cb(errInfo);
            };
        }
        xhr.send(null);
    },
    loadBinarySync : function(url){
        var self = this;
        var req = this.getXMLHttpRequest();
        var errInfo = "load " + url + " failed!";
        req.open('GET', url, false);
        var arrayInfo = null;
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            req.setRequestHeader("Accept-Charset", "x-user-defined");
            req.send(null);
            if (req.status != 200) {
                cc.log(errInfo);
                return null;
            }

            var fileContents = cc._convertResponseBodyToText(req["responseBody"]);
            if (fileContents) {
                arrayInfo = self._str2Uint8Array(fileContents);
            }
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status != 200) {
                cc.log(errInfo);
                return null;
            }

            arrayInfo = this._str2Uint8Array(req.responseText);
        }
        return arrayInfo;
    },

    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} cb
     * @returns {*}
     * @private
     */
    _loadResIterator : function(item, index, cb){
        var self = this, url = null;
        var type = item.type;
        if(type){
            type = "." + type.toLowerCase();
            url = item.name + type;
        }else{
            url = item;
            type = cc.path.extname(url);
        }

        var obj = self.cache[url];
        if(obj) return cb(null, obj);
        var loader = self._register[type.toLowerCase()];
        if(!loader) return cb("loader for [" + type + "] not exists!");
        var basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        var realUrl = self.getUrl(basePath, url);
        loader.load(realUrl, url, item, function(err, data){
            if(err){
                cc.log(err);
                self.cache[url] = null;
                cb();
            }else{
                self.cache[url] = data;
                cb(null, data);
            }
        });
    },

    /**
     * Get url with basePath.
     * @param [{string}] basePath
     * @param {string} url
     * @returns {*}
     */
    getUrl : function(basePath, url){
        var self = this, langPathCache = self._langPathCache, path = cc.path;
        if(arguments.length == 1){
            url = basePath;
            var type = path.extname(url);
            type = type ? type.toLowerCase() : "";
            var loader = self._register[type];
            if(!loader) basePath = self.resPath;
            else basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        }
        url = cc.path.join(basePath || "", url)
        if(url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)){
            if(langPathCache[url]) return langPathCache[url];
            var extname = path.extname(url) || "";
            url = langPathCache[url] = url.substring(0, url.length - extname.length) + "_" + cc.sys.language + extname;
        }
        return url;
    },

    /**
     * Load resources then call the callback.
     * @param {[string]} res
     * @param [{function}|{}] option
     * @param {function} cb :
     */
    load : function(res, option, cb){
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
        }
        else if(l == 2){
            if(typeof option == "function") {
                cb = option;
                option = {};
            }
        }else if(l == 1) option = {};
        else throw "arguments error!";
        option.cb = function(err, results){
            if(err) cc.log(err);
            if(cb) cb(results);
        };
        if(!(res instanceof Array)) res = [res];
        option.iterator = this._loadResIterator;
        option.iteratorTarget = this;
        cc.async.map(res, option);
    },

    _handleAliases : function(fileNames, cb){
        var self = this, aliases = self._aliases;
        var resList = [];
        for (var key in fileNames) {
            var value = fileNames[key];
            aliases[key] = value;
            resList.push(value);
        }
        this.load(resList, cb);
    },

    /**
     * <p>
     *     Loads alias map from the contents of a filename.                                        <br/>
     *                                                                                                                 <br/>
     *     @note The plist file name should follow the format below:                                                   <br/>
     *     <?xml version="1.0" encoding="UTF-8"?>                                                                      <br/>
     *         <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  <br/>
     *             <plist version="1.0">                                                                               <br/>
     *                 <dict>                                                                                          <br/>
     *                     <key>filenames</key>                                                                        <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>sounds/click.wav</key>                                                             <br/>
     *                         <string>sounds/click.caf</string>                                                       <br/>
     *                         <key>sounds/endgame.wav</key>                                                           <br/>
     *                         <string>sounds/endgame.caf</string>                                                     <br/>
     *                         <key>sounds/gem-0.wav</key>                                                             <br/>
     *                         <string>sounds/gem-0.caf</string>                                                       <br/>
     *                     </dict>                                                                                     <br/>
     *                     <key>metadata</key>                                                                         <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>version</key>                                                                      <br/>
     *                         <integer>1</integer>                                                                    <br/>
     *                     </dict>                                                                                     <br/>
     *                 </dict>                                                                                         <br/>
     *              </plist>                                                                                           <br/>
     * </p>
     * @param {String} filename  The plist file name.
     * @param {Function} cb     callback
     */
    loadAliases : function(url, cb){
        var self = this, dict = self.getRes(url);
        if(!dict){
            self.load(url, function(results){
                self._handleAliases(results[0]["filenames"], cb);
            });
        }else self._handleAliases(dict["filenames"], cb);
    },

    /**
     * Register a resource loader into loader.
     * @param {string} extname
     * @param {load : function} loader
     */
    register : function(extNames, loader){
        if(!extNames || !loader) return;
        var self = this;
        if(typeof extNames == "string") return this._register[extNames.trim().toLowerCase()] = loader;
        for(var i = 0, li = extNames.length; i < li; i++){
            self._register["." + extNames[i].trim().toLowerCase()] = loader;
        }
    },

    /**
     * Get resource data by url.
     * @param url
     * @returns {*}
     */
    getRes : function(url){
        return this.cache[url] || this.cache[this._aliases[url]];
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release : function(url){
        var cache = this.cache, aliases = this._aliases;
        delete cache[url];
        delete cache[aliases[url]];
        delete aliases[url];
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll : function(){
        var locCache = this.cache, aliases = this._aliases;
        for (var key in locCache) {
            delete locCache[key];
        }
        for (var key in aliases) {
            delete aliases[key];
        }
    }

};
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++


//+++++++++++++++++++++++++something about window events begin+++++++++++++++++++++++++++
(function(){
    var win = window, hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    var onHidden = function(){
        if(cc.eventManager)
            cc.eventManager.dispatchEvent(cc.game._eventHide);
    };
    var onShow = function(){
        if(cc.eventManager)
            cc.eventManager.dispatchEvent(cc.game._eventShow);
    };

    if (typeof document.addEventListener !== "undefined" && hidden) {
        document.addEventListener(visibilityChange, function(){
            if (document[hidden]) onHidden();
            else onShow();
        }, false);
    }else{
        win.addEventListener("blur", onHidden, false);
        win.addEventListener("focus", onShow, false);
    }
    win = null;
    visibilityChange = null;
})();
//+++++++++++++++++++++++++something about window events end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about log start++++++++++++++++++++++++++++

cc._logToWebPage = function (msg) {
    if(!cc._canvas)
        return;

    var logList = cc._logList;
    var doc = document;
    if(!logList){
        var logDiv = doc.createElement("Div");
        var logDivStyle = logDiv.style;

        logDiv.setAttribute("id", "logInfoDiv");
        cc._canvas.parentNode.appendChild(logDiv);
        logDiv.setAttribute("width", "200");
        logDiv.setAttribute("height", cc._canvas.height);
        logDivStyle.zIndex = "99999";
        logDivStyle.position = "absolute";
        logDivStyle.top = "0";
        logDivStyle.left = "0";

        logList = cc._logList = doc.createElement("textarea");
        var logListStyle = logList.style;

        logList.setAttribute("rows", "20");
        logList.setAttribute("cols", "30");
        logList.setAttribute("disabled", true);
        logDiv.appendChild(logList);
        logListStyle.backgroundColor = "transparent";
        logListStyle.borderBottom = "1px solid #cccccc";
        logListStyle.borderRightWidth = "0px";
        logListStyle.borderLeftWidth = "0px";
        logListStyle.borderTopWidth = "0px";
        logListStyle.borderTopStyle = "none";
        logListStyle.borderRightStyle = "none";
        logListStyle.borderLeftStyle = "none";
        logListStyle.padding = "0px";
        logListStyle.margin = 0;

    }
    msg = typeof msg == "string" ? msg : JSON.stringify(msg);
    logList.value = logList.value + msg + "\r\n";
    logList.scrollTop = logList.scrollHeight;
};


//to make sure the cc.log, cc.warn, cc.error and cc.assert would not throw error before init by debugger mode.
if(console.log){
    cc.log = console.log.bind(console);
    cc.warn = console.warn.bind(console);
    cc.error = console.error.bind(console);
    cc.assert = console.assert.bind(console);
}else{
    cc.log = cc.warn = cc.error = cc.assert = function(){};
}
/**
 * Init Debug setting.
 * @function
 */
cc._initDebugSetting = function (mode) {
    var ccGame = cc.game;

    //log
    if(mode == ccGame.DEBUG_MODE_INFO && console.log) {
    }else if((mode == ccGame.DEBUG_MODE_INFO && !console.log)
        || mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE){
        cc.log = cc._logToWebPage.bind(cc);
    }else cc.log = function(){}

    //warn
    if(!mode || mode == ccGame.DEBUG_MODE_NONE
        || mode == ccGame.DEBUG_MODE_ERROR
        || mode == ccGame.DEBUG_MODE_ERROR_FOR_WEB_PAGE) cc.warn = function(){};
    else if(mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_WARN_FOR_WEB_PAGE
        || !console.warn) {
        cc.warn = cc._logToWebPage.bind(cc);
    }

    //error and assert
    if(!mode || mode == ccGame.DEBUG_MODE_NONE) {
        cc.error = function(){};
        cc.assert = function(){};
    }
    else if(mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_WARN_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_ERROR_FOR_WEB_PAGE
        || !console.error){
        cc.error = cc._logToWebPage.bind(cc);
        cc.assert = function(cond, msg){
            if(!cond && msg) cc._logToWebPage(msg);
        }
    }
};
//+++++++++++++++++++++++++something about log end+++++++++++++++++++++++++++++

/**
 * create a webgl context
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opt_attribs
 * @return {WebGLRenderingContext}
 */
cc.create3DContext = function (canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) {
        }
        if (context) {
            break;
        }
    }
    return context;
};
//+++++++++++++++++++++++++something about sys begin+++++++++++++++++++++++++++++
cc._initSys = function(config, CONFIG_KEY){
    /**
     * Canvas of render type
     * @constant
     * @type Number
     */
    cc._RENDER_TYPE_CANVAS = 0;

    /**
     * WebGL of render type
     * @constant
     * @type Number
     */
    cc._RENDER_TYPE_WEBGL = 1;

    var sys = cc.sys = {};

    /**
     * English language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ENGLISH = "en";

    /**
     * Chinese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_CHINESE = "zh";

    /**
     * French language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_FRENCH = "fr";

    /**
     * Italian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ITALIAN = "it";

    /**
     * German language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_GERMAN = "de";

    /**
     * Spanish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_SPANISH = "es";

    /**
     * Russian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_RUSSIAN = "ru";

    /**
     * Korean language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_KOREAN = "ko";

    /**
     * Japanese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_JAPANESE = "ja";

    /**
     * Hungarian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_HUNGARIAN = "hu";

    /**
     * Portuguese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_PORTUGUESE = "pt";

    /**
     * Arabic language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ARABIC = "ar";

    /**
     * Norwegian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_NORWEGIAN = "no";

    /**
     * Polish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_POLISH = "pl";

    /**
     * @constant
     * @type {string}
     */
    sys.OS_WINDOWS = "Windows";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_IOS = "iOS";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_OSX = "OS X";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_UNIX = "UNIX";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_LINUX = "Linux";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_ANDROID = "Android";
    sys.OS_UNKNOWN = "Unknown";

    sys.BROWSER_TYPE_WECHAT = "wechat";
    sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    sys.BROWSER_TYPE_IE = "ie";
    sys.BROWSER_TYPE_QQ = "qqbrowser";
    sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    sys.BROWSER_TYPE_UC = "ucbrowser";
    sys.BROWSER_TYPE_360 = "360browser";
    sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    sys.BROWSER_TYPE_MAXTHON = "maxthon";
    sys.BROWSER_TYPE_OPERA = "opera";
    sys.BROWSER_TYPE_MIUI = "miuibrowser";
    sys.BROWSER_TYPE_FIREFOX = "firefox";
    sys.BROWSER_TYPE_SAFARI = "safari";
    sys.BROWSER_TYPE_CHROME = "chrome";
    sys.BROWSER_TYPE_UNKNOWN = "unknown";

    /**
     * Is native ? This is set to be true in jsb auto.
     * @constant
     * @type Boolean
     */
    sys.isNative = false;

    /**
     * WhiteList of browser for WebGL.
     * @constant
     * @type Array
     */
    var webglWhiteList = [sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME, sys.BROWSER_TYPE_SAFARI];
    var multipleAudioWhiteList = [
        sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME,
        sys.BROWSER_TYPE_SAFARI, sys.BROWSER_TYPE_UC, sys.BROWSER_TYPE_QQ, sys.BROWSER_TYPE_MOBILE_QQ, sys.BROWSER_TYPE_IE
    ];

    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    sys.isMobile = ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1;

    var currLanguage = nav.language;
    currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;
    sys.language = currLanguage;

    /** The type of browser */

    var browserType = sys.BROWSER_TYPE_UNKNOWN;
    var browserTypes = ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|trident|opera|miuibrowser|firefox/i)
        || ua.match(/chrome|safari/i);
    if (browserTypes && browserTypes.length > 0) {
        browserType = browserTypes[0].toLowerCase();
        if (browserType == 'micromessenger') {
            browserType = sys.BROWSER_TYPE_WECHAT;
        }else if( browserType === "safari" && (ua.match(/android.*applewebkit/)))
            browserType = sys.BROWSER_TYPE_ANDROID;
        else if(browserType == "trident") browserType = sys.BROWSER_TYPE_IE;
    }
    sys.browserType = browserType;

    sys._supportMultipleAudio = multipleAudioWhiteList.indexOf(sys.browserType) > -1;

    //++++++++++++++++++something about cc._renderTYpe and cc._supportRender begin++++++++++++++++++++++++++++
    var userRenderMode = parseInt(config[CONFIG_KEY.renderMode]);
    var renderType = cc._RENDER_TYPE_WEBGL;
    var tempCanvas = document.createElement("Canvas");
    cc._supportRender = true;
    var notInWhiteList = webglWhiteList.indexOf(sys.browserType) == -1;
    if(userRenderMode === 1 || (userRenderMode === 0 && (sys.isMobile || notInWhiteList))){
        renderType = cc._RENDER_TYPE_CANVAS;
    }


    if(renderType == cc._RENDER_TYPE_WEBGL){
        if(!win.WebGLRenderingContext
            || !cc.create3DContext(tempCanvas, {'stencil': true, 'preserveDrawingBuffer': true })){
            if(userRenderMode == 0) renderType = cc._RENDER_TYPE_CANVAS;
            else cc._supportRender = false;
        }
    }

    if(renderType == cc._RENDER_TYPE_CANVAS){
        try {
            tempCanvas.getContext("2d");
        } catch (e) {
            cc._supportRender = false;
        }
    }
    cc._renderType = renderType;
    //++++++++++++++++++something about cc._renderTYpe and cc._supportRender end++++++++++++++++++++++++++++++


    // check if browser supports Web Audio
    // check Web Audio's context
    try {
        sys._supportWebAudio = !!(new (win.AudioContext || win.webkitAudioContext || win.mozAudioContext)());
    } catch (e) {
        sys._supportWebAudio = false;
    }

    /** LocalStorage is a local storage component.
     */
    try{
        var localStorage = sys.localStorage = win.localStorage;
        localStorage.setItem("storage", "");
        localStorage.removeItem("storage");
        localStorage = null;
    }catch(e){
        if( e.name === "SECURITY_ERR" || e.name === "QuotaExceededError" ) {
            cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
        }
        sys.localStorage = function(){};
    }


    var capabilities = sys.capabilities = {"canvas":true};
    if(cc._renderType == cc._RENDER_TYPE_WEBGL)
        capabilities["opengl"] = true;
    if( docEle['ontouchstart'] !== undefined || nav.msPointerEnabled)
        capabilities["touches"] = true;
    else if( docEle['onmouseup'] !== undefined )
        capabilities["mouse"] = true;
    if( docEle['onkeyup'] !== undefined )
        capabilities["keyboard"] = true;
    if(win.DeviceMotionEvent || win.DeviceOrientationEvent)
        capabilities["accelerometer"] = true;

    /** Get the os of system */
    var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
    var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
    var osName = sys.OS_UNKNOWN;
    if (nav.appVersion.indexOf("Win")!=-1) osName=sys.OS_WINDOWS;
    else if( iOS ) osName = sys.OS_IOS;
    else if (nav.appVersion.indexOf("Mac")!=-1) osName=sys.OS_OSX;
    else if (nav.appVersion.indexOf("X11")!=-1) osName=sys.OS_UNIX;
    else if (nav.appVersion.indexOf("Linux")!=-1) osName=sys.OS_LINUX;
    else if( isAndroid ) osName = sys.OS_ANDROID;
    sys.os = osName;

    // Forces the garbage collector
    sys.garbageCollect = function() {
        // N/A in cocos2d-html5
    };

    // Dumps rooted objects
    sys.dumpRoot = function() {
        // N/A in cocos2d-html5
    };

    // restarts the JS VM
    sys.restartVM = function() {
        // N/A in cocos2d-html5
    };

    sys.dump = function(){
        var self = this;
        var str = "";
        str += "isMobile : " + self.isMobile + "\r\n";
        str += "language : " + self.language + "\r\n";
        str += "browserType : " + self.browserType + "\r\n";
        str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
        str += "os : " + self.os + "\r\n";
        cc.log(str);
    }
};

//+++++++++++++++++++++++++something about sys end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about CCGame begin+++++++++++++++++++++++++++

/**
 * Device oriented vertically, home button on the bottom
 * @constant
 * @type Number
 */
cc.ORIENTATION_PORTRAIT = 0;

/**
 * Device oriented vertically, home button on the top
 * @constant
 * @type Number
 */
cc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;

/**
 * Device oriented horizontally, home button on the right
 * @constant
 * @type Number
 */
cc.ORIENTATION_LANDSCAPE_LEFT = 2;

/**
 * Device oriented horizontally, home button on the left
 * @constant
 * @type Number
 */
cc.ORIENTATION_LANDSCAPE_RIGHT = 3;

/**
 * drawing primitive of game engine
 * @type cc.DrawingPrimitive
 */
cc._drawingUtil = null;

/**
 * main Canvas 2D/3D Context of game engine
 * @type CanvasRenderingContext2D|WebGLRenderingContext
 */
cc._renderContext = null;

/**
 * main Canvas of game engine
 * @type HTMLCanvasElement
 */
cc._canvas = null;

/**
 * This Div element contain all game canvas
 * @type HTMLDivElement
 */
cc._gameDiv = null;

cc._rendererInitialized = false;
/**
 * <p>
 *   setup game main canvas,renderContext,gameDiv and drawingUtil with argument  <br/>
 *   <br/>
 *   can receive follow type of arguemnt: <br/>
 *      - empty: create a canvas append to document's body, and setup other option    <br/>
 *      - string: search the element by document.getElementById(),    <br/>
 *          if this element is HTMLCanvasElement, set this element as main canvas of engine, and set it's ParentNode as cc._gameDiv.<br/>
 *          if this element is HTMLDivElement, set it's ParentNode to cc._gameDiv， and create a canvas as main canvas of engine.   <br/>
 * </p>
 * @function
 * @example
 * //setup with null
 * cc._setup();
 *
 * // setup with HTMLCanvasElement, gameCanvas is Canvas element
 * // declare like this: <canvas id="gameCanvas" width="800" height="450"></canvas>
 * cc._setup("gameCanvas");
 *
 * //setup with HTMLDivElement, gameDiv is Div element
 * // declare like this: <div id="Cocos2dGameContainer" width="800" height="450"></div>
 * cc._setup("Cocos2dGameContainer");
 */
cc._setup = function (el, width, height) {
    var win = window;
    win.requestAnimFrame = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame;

    var element = cc.$(el) || cc.$('#' + el);
    var localCanvas, localContainer, localConStyle;
    if (element.tagName == "CANVAS") {
        width = width || element.width;
        height = height || element.height;

        //it is already a canvas, we wrap it around with a div
        localContainer = cc.container = cc.$new("DIV");
        localCanvas = cc._canvas = element;
        localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        localCanvas.appendTo(localContainer);
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
    } else {//we must make a new canvas and place into this element
        if (element.tagName != "DIV") {
            cc.log("Warning: target element is not a DIV or CANVAS");
        }
        width = width || element.clientWidth;
        height = height || element.clientHeight;
        localContainer = cc.container = element;
        localCanvas = cc._canvas = cc.$new("CANVAS");
        element.appendChild(localCanvas);
    }

    localCanvas.addClass("gameCanvas");
    localCanvas.setAttribute("width", width || 480);
    localCanvas.setAttribute("height", height || 320);
    localConStyle = localContainer.style;
    localConStyle.width = (width || 480) + "px";
    localConStyle.height = (height || 320) + "px";
    localConStyle.margin = "0 auto";

    localConStyle.backgroundColor = "transparent";

    localConStyle.position = 'relative';
    localConStyle.overflow = 'hidden';
    localContainer.top = '100%';

    if (cc._renderType == cc._RENDER_TYPE_WEBGL)
        cc._renderContext = cc.webglContext = cc.create3DContext(localCanvas,{
            'stencil': true,
            'preserveDrawingBuffer': true,
            'antialias': !cc.sys.isMobile,
            'alpha': false});
    if(cc._renderContext){
        win.gl = cc._renderContext; // global variable declared in CCMacro.js
        cc._drawingUtil = new cc.DrawingPrimitiveWebGL(cc._renderContext);
        cc._rendererInitialized = true;
        cc.textureCache._initializingRenderer();
        cc.shaderCache._init();
    } else {
        cc._renderContext = localCanvas.getContext("2d");
        cc._mainRenderContextBackup = cc._renderContext;
        cc._renderContext.translate(0, localCanvas.height);
        cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(cc._renderContext) : null;
    }

    cc._gameDiv = localContainer;

    cc.log(cc.ENGINE_VERSION);

    cc._setContextMenuEnable(false);

    if(cc.sys.isMobile){
        var fontStyle = document.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);

        fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
            +"-webkit-tap-highlight-color:rgba(0,0,0,0);}";
    }

	// Init singletons

	// View
	cc.view = cc.EGLView._getInstance();
	// register system events
	cc.inputManager.registerSystemEvent(cc._canvas);

	// Director
	cc.director = cc.Director._getInstance();
	cc.director.setOpenGLView(cc.view);
    cc.winSize = cc.director.getWinSize();

	// Parsers
	cc.saxParser = new cc.SAXParser();
	cc.plistParser = new cc.PlistParser();
};


cc._isContextMenuEnable = false;
/**
 * enable/disable contextMenu for Canvas
 * @param {Boolean} enabled
 */
cc._setContextMenuEnable = function (enabled) {
    cc._isContextMenuEnable = enabled;
    cc._canvas.oncontextmenu = function () {
        if(!cc._isContextMenuEnable) return false;
    };
};

/**
 * An object to boot the game.
 */
cc.game = {
    DEBUG_MODE_NONE : 0,
    DEBUG_MODE_INFO : 1,
    DEBUG_MODE_WARN : 2,
    DEBUG_MODE_ERROR : 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE : 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE : 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE : 6,

    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    _eventHide: null,
    _eventShow: null,
    _onBeforeStartArr : [],

    /**
     * Key of config
     * @constant
     * @type Object
     */
    CONFIG_KEY : {
        engineDir : "engineDir",
        dependencies : "dependencies",
        debugMode : "debugMode",
        showFPS : "showFPS",
        frameRate : "frameRate",
        id : "id",
        renderMode : "renderMode",
        jsList : "jsList",
        classReleaseMode : "classReleaseMode"
    },

    _prepareCalled : false,//whether the prepare function has been called
    _prepared : false,//whether the engine has prepared
    _paused : true,//whether the game is paused

    _intervalId : null,//interval target of main

    /**
     * Config of game
     * @type Object
     */
    config : null,

    /**
     * Callback when the scripts of engine have been load.
     * @type Function
     */
    onStart : null,

    /**
     * Callback when game exits.
     * @type Function
     */
    onStop : null,

    /**
     * Set frameRate of game.
     * @param frameRate
     */
    setFrameRate : function(frameRate){
        var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
        config[CONFIG_KEY.frameRate] = frameRate;
        if(self._intervalId) clearInterval(self._intervalId);
        self._paused = true;
        self._runMainLoop();
    },
    /**
     * Run game.
     * @private
     */
    _runMainLoop : function(){
        var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
            win = window, frameRate = config[CONFIG_KEY.frameRate],
            director = cc.director;
        director.setDisplayStats(config[CONFIG_KEY.showFPS]);
        if (win.requestAnimFrame && frameRate == 60) {
            callback = function () {
                if(!self._paused){
                    director.mainLoop();
                    win.requestAnimFrame(callback);
                }
            };
            win.requestAnimFrame(callback);
        } else {
            callback = function () {
                director.mainLoop();
            };
            self._intervalId = setInterval(callback, 1000.0/frameRate);
        }
        self._paused = false;
    },


    /**
     * Run game.
     */
    run : function(){
        var self = this;
        if(!self._prepareCalled){
            self.prepare(function(){
                if(cc._supportRender) {
                    cc._setup(self.config[self.CONFIG_KEY.id]);
                    self._runMainLoop();
                    self._eventHide = self._eventHide || new cc.EventCustom(self.EVENT_HIDE);
                    self._eventHide.setUserData(self);
                    self._eventShow = self._eventShow || new cc.EventCustom(self.EVENT_SHOW);
                    self._eventShow.setUserData(self);
                    self.onStart();
                }
            });
        }else{
            if(cc._supportRender) {
                self._checkPrepare = setInterval(function(){
                    if(self._prepared){
                        cc._setup(self.config[self.CONFIG_KEY.id]);
                        self._runMainLoop();
                        self._eventHide = self._eventHide || new cc.EventCustom(self.EVENT_HIDE);
                        self._eventHide.setUserData(self);
                        self._eventShow = self._eventShow || new cc.EventCustom(self.EVENT_SHOW);
                        self._eventShow.setUserData(self);
                        self.onStart();
                        clearInterval(self._checkPrepare);
                    }
                }, 10);
            }
        }
    },
    /**
     * Init config.
     * @param cb
     * @returns {*}
     * @private
     */
    _initConfig : function(){
        var self = this, CONFIG_KEY = self.CONFIG_KEY;
        var _init = function(cfg){
            cfg[CONFIG_KEY.engineDir] = cfg[CONFIG_KEY.engineDir] || "libs/cocos2d-html5";
            cfg[CONFIG_KEY.debugMode] = cfg[CONFIG_KEY.debugMode] || 0;
            cfg[CONFIG_KEY.frameRate] = cfg[CONFIG_KEY.frameRate] || 60;
            cfg[CONFIG_KEY.renderMode] = cfg[CONFIG_KEY.renderMode] || 0;
            return cfg;
        };
        if(document["ccConfig"]){
            self.config = _init(document["ccConfig"]);
        }else{
            try{
                var txt = cc.loader._loadTxtSync("project.xml");
                var data = JSON.parse(txt);
                self.config = _init(data || {});
            }catch(e){
                self.config = _init({});
            }
        }
        cc._initDebugSetting(self.config[CONFIG_KEY.debugMode]);
        cc._initSys(self.config, CONFIG_KEY);
    },

    //cache for js and module that has added into jsList to be loaded.
    _jsAddedCache : {},
    _getJsListOfModule : function(moduleMap, moduleName, dir){
        var jsAddedCache = this._jsAddedCache;
        if(jsAddedCache[moduleName]) return null;
        dir = dir || "";
        var jsList = [];
        var tempList = moduleMap[moduleName];
        if(!tempList) throw "can not find module [" + moduleName + "]";
        var ccPath = cc.path;
        for(var i = 0, li = tempList.length; i < li; i++){
            var item = tempList[i];
            if(jsAddedCache[item]) continue;
            var extname = ccPath.extname(item);
            if(!extname) {
                var arr = this._getJsListOfModule(moduleMap, item, dir);
                if(arr) jsList = jsList.concat(arr);
            }else if(extname.toLowerCase() == ".js") jsList.push(ccPath.join(dir, item));
            jsAddedCache[item] = 1;
        }
        return jsList;
    },
    /**
     * Prepare game.
     * @param cb
     */
    prepare : function(cb){
        var self = this;
        var config = self.config, CONFIG_KEY = self.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = cc.loader;
        if(!cc._supportRender){
            cc.error("Can not support render!")
            return;
        }
        self._prepareCalled = true;

        var jsList = config[CONFIG_KEY.jsList] || [];
        if(cc.Class){//is single file
            //load user's jsList only
            loader.loadJsWithImg("", jsList, function(err){
                if(err) throw err;
                self._prepared = true;
                if(cb) cb();
            });
        }else{
            //load cc's jsList first
            var ccModulesPath = cc.path.join(engineDir, "moduleConfig.xml");
            loader.loadJson(ccModulesPath, function(err, modulesJson){
                if(err) throw err;
                var modules = config["modules"] || [];
                var moduleMap = modulesJson["module"];
                var newJsList = [];
                if(cc._renderType == cc._RENDER_TYPE_WEBGL) modules.splice(0, 0, "shaders");
                else if(modules.indexOf("core") < 0) modules.splice(0, 0, "core");
                for(var i = 0, li = modules.length; i < li; i++){
                    var arr = self._getJsListOfModule(moduleMap, modules[i], engineDir);
                    if(arr) newJsList = newJsList.concat(arr);
                }
                newJsList = newJsList.concat(jsList);
                cc.loader.loadJsWithImg(newJsList, function(err){
                    if(err) throw err;
                    self._prepared = true;
                    if(cb) cb();
                });
            });
        }
    }
};
cc.game._initConfig();
//+++++++++++++++++++++++++something about CCGame end+++++++++++++++++++++++++++++
