// ==UserScript==
// @name           Weibo Larger Pics 新浪微博之我要看大图
// @namespace      http://xiaoxia.de/
// @description    Easily view larger pics on Weibo.com 快速进入大图页面、图片详情页面和原始地址。
// @version        1.0.7
// @author         xiaoxia
// @include        http://t.sina.com.cn/*
// @include        http://weibo.com/*
// @include        http://www.weibo.com/*
// @include        http://e.weibo.com/*
// @include        http://media.weibo.com/*
// @include        http://s.weibo.com/*
// @include        http://hot.weibo.com/*
// @include        http://huati.weibo.com/*
// @exclude        http://s.weibo.com/user/*
// @exclude        http://s.weibo.com/pic/*
// @exclude        http://weibo.com/app/*
// @exclude        http://weibo.com/app
// @updateURL      https://userscripts.org/scripts/source/173273.meta.js
// @downloadURL    https://userscripts.org/scripts/source/173273.user.js
// @updateinfo     修正 ajax 后失效的问题；
// ==/UserScript==


window.setTimeout(function(){ //匿名函数延时 500ms 执行，避免执行时 dom 还未创建。

var isFirefox = navigator.userAgent.toLowerCase().match('firefox') != null; //判断是否为 firefox，firefox 似乎会在 dom 改变之前响应事件，别的浏览器都是在 dom 改变之后。
var enterprise = window.location.host == 'e.weibo.com'; //判断企业版微博
var media = window.location.host == 'media.weibo.com'; //判断媒体版微博
var search = window.location.host == 's.weibo.com'; //判断搜索页面
var hot = window.location.host == 'hot.weibo.com'; //判断热门页面
var huati = window.location.host == 'huati.weibo.com'; //判断话题页面

//判断页面类型
if(document.getElementById('pl_content_homeFeed') != null){
    //本人时间线
    var nodeListen = document.getElementsByClassName('W_main')[0];
    entryMain(nodeListen);
}else if(document.getElementById('pl_content_hisFeed') != null){
     //他人时间线 包含企业版和普通用户
    var nodeListen = document;
    entryMain(nodeListen);
}else if(document.getElementById('pl_weibo_feedlist') != null && search){
    //搜索页面
    var nodeListen = document.getElementById('pl_weibo_feedlist');
    entryMain(nodeListen);
}else if(document.getElementById('pl_plaza_hotWeiboFeed') != null && hot){
    //热门页面
    var nodeListen = document.getElementById('pl_plaza_hotWeiboFeed');
    entryMain(nodeListen);
}else if(document.getElementById('epfeedlist') != null && media){
    //媒体版页面
    var nodeListen = document.getElementById('epfeedlist');
    entryMedia(nodeListen); //媒体版差异（可能）较大，使用独立的入口
}else if(document.getElementById('pl_content_topicHotFeed') != null && huati){
    //话题
    var nodeListen_1 = document.getElementById('pl_content_topicHotFeed');//相关话题里面的热门微博
    var nodeListen_2 = document.getElementById('pl_content_topicFeed');//相关话题的普通微博
    if(document.getElementById('pl_content_topicCite') != null){
        var nodeListen_3 = document.getElementById('pl_content_topicCite');//相关话题的置顶微博
        entryHuati(nodeListen_3); //使用独立入口
    }
    entryHuati(nodeListen_1); //使用独立入口
    entryHuati(nodeListen_2); //使用独立入口
}else if(document.getElementById('plc_main') != null){
    //另外一种媒体版页面，域名不带 media，结构和普通版基本一样，如北京青年报
    var nodeListen = document.getElementById('plc_main');
    entryMain(nodeListen);
}

//插入 a 标签
function insertA(node, href, title, inner){
    var aElement = document.createElement('a');
    aElement.href = href;
    aElement.target = '_blank';
    aElement.innerHTML = inner;
    aElement.title = title;
    node.appendChild(aElement);
}

//插入 i 标签
function insertI(node, symbol){
    var iElement = document.createElement('i');
    iElement.className = 'W_vline W8_vline';
    iElement.innerHTML = symbol;
    node.appendChild(iElement);
}

//插入按钮
function insertEls(node, uid, mid, pid, format, cdn, multiPics){
    //大图地址
    insertI(node,'<');
    insertA(node, 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid, '进入相册大图页面', '图');

    //相册详情，多图模式下无法获得 mid，所以不显示
    if(!multiPics){
        insertI(node, '|');
        insertA(node, 'http://photo.weibo.com/' + uid + '/talbum/detail/photo_id/' + mid, '进入相册详情页面', '详');
    }

    //原图地址
    insertI(node, '|');
    insertA(node, 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format, '大图原始地址，在此点击右键可以另存图像或复制地址', '源');
    insertI(node, '>');
}

//主入口
function entryMain(nodeMain){

    nodeMain.addEventListener('DOMSubtreeModified',function(e){entrySub(e)}); //需要监听 dom

    //子入口
    function entrySub(e){
    try{
        var that = e.target || event.target;

        //console.log(that);

        //判断 event 节点是否符合要求
        if(typeof(that.children) != 'undefined' && that.children.length > 0){

            //火狐修正
            if(isFirefox){
                var browserTest  = (that.className.match('WB_media_expand') != null && (that.className.match('SW_fun2') != null || that.className.match('SW_fun') != null) && that.style.display != "none") || (that.className == 'expand' && (that.parentNode.style.display != "none" && that.style.display != "none")) || (that.getAttribute('node-type') == 'imagesBox' && that.style.display != "none") || (that.className.match('comment') != null && that.className.match('W_textc') != null && that.style.display != "none") || (that.className.match('comment') != null && search && that.style.display != "none");
            }else{
                var browserTest = (that.className.match('WB_media_expand') != null && (that.className.match('SW_fun2') != null || that.className.match('SW_fun') != null)) || that.className == 'expand' || that.getAttribute('node-type') == 'imagesBox' || (that.className.match('comment') != null && that.className.match('W_textc') != null) || (that.className.match('comment') != null && search);
            }

            //判断 event dom 是否为需要操作的 dom
            if(browserTest){

                //企业版和搜索页面修正节点
                if(enterprise){
                    //是否为引用图
                    var quote = that.className == 'expand';
                    if(!quote){
                        that = that.getElementsByClassName('expand')[0];
                    }
                }else if(search){
                    var quote = that.className == 'expand';
                    if(!quote && that.getElementsByClassName('expand').length > 0){
                        that = that.getElementsByClassName('expand')[0];
                    }
                }else if(hot){
                    var quote = that.children.length == 1;
                }

                //判断是否为多图模式，企业版不支持发布多图真是极好的，that.getAttribute('node-type') == 'imagesBox' 为非转发多图的状态。
                var multiPics = false;
                if(typeof(that.children[0].getAttribute('node-type')) == 'string'){
                    if(that.children[0].getAttribute('node-type') == 'imagesBox'){
                        multiPics = true;
                    }
                    that = that.children[0];
                }

                //继续判断是否为需要操作的 dom
                var attr = that.children[1].getAttribute('action-type');
                var cls = that.children[1].className;
                attr = attr != null ? attr : '';
                cls = cls != null ? cls : '';
                if(attr.match('img') || cls.match('pic_list_view')){
                    var uid, pid, mid, format, para, cdn;

                    if(!multiPics && that.getAttribute('node-type') != 'imagesBox'){
                        //单图
                        format = that.children[1].children[0].src.replace(/.*(\....)$/,'$1');//图片格式
                        cdn = that.children[1].children[0].src.replace(/^.*?\/\/ww(.).*/,'$1');//图片 CDN 地址
                    }else{
                        //多图
                        format = that.getElementsByTagName('IMG')[0].src.replace(/.*(\....)$/,'$1');
                        cdn = that.getElementsByTagName('IMG')[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                        //多图情况下，对更换图片事件进行监听
                        that.children[0].addEventListener('mouseover',function(){
                            var format = that.getElementsByTagName('IMG')[0].src.replace(/.*(\....)$/,'$1');
                            var cdn = that.getElementsByTagName('IMG')[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                            if(search){
                                //搜索多图
                                var para = that.children[0].getElementsByClassName('show_big')[0].href;
                                var pid = para.replace(/.*\/pid\/(.*)\?.*/,'$1');
                                var mid = para.replace(/.*\/mid\/(.*?)\/.*/,'$1');
                                var uid = para.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                            }else if(hot){
                                //热门多图
                                var para = that.getElementsByClassName('show_big')[0].href;
                                var pid = para.replace(/.*\/pid\/(.*)\?.*/,'$1');
                                var mid = para.replace(/.*\/mid\/(.*?)\/.*/,'$1');
                                var uid = para.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                            }else{
                                //其他情况
                                var para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(/[upm]id=/g,'').split('&');
                                var pid = para[0];
                                var mid = para[1];
                                var uid = para[2];
                            }
                            that.children[0].children[8].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
                            that.children[0].children[10].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
                        });
                    }

                    //获取图片参数
                    if(enterprise){
                        //企业版
                        if(!quote){
                            //企业版非引用
                            para = that.parentNode.parentNode.getElementsByClassName('info')[0].children[0].children[0].getAttribute('action-data');
                            uid = para.replace(/.*uid=(\d*)&?.*/,'$1');
                            mid = para.replace(/.*mid=(\d*)&?.*/,'$1');
                        }else{
                            //企业版引用
                            para = that.parentNode.parentNode.children[3].children[0].children[0].getAttribute('action-data');
                            uid = para.replace(/.*rootuid=(\d*)&?.*/,'$1');
                            mid = para.replace(/.*rootmid=(\d*)&?.*/,'$1');
                        }
                        pid = para.replace(/.*pid=(\w*)&?.*/,'$1');
                    }else if(search){
                        //搜索页面
                        if(!quote){
                            para = that.parentNode.parentNode.getElementsByClassName('info')[0].children[0].children[2].getAttribute('action-data');
                            uid = para.replace(/.*uid=(\d*)&?.*/,'$1');
                            mid = para.replace(/.*mid=(\d*)&?.*/,'$1');
                        }else{
                            //搜索多图
                            if(multiPics){
                                para = that.parentNode.parentNode.parentNode.getElementsByClassName('info')[1].children[0].children[2].getAttribute('action-data');
                            }else{
                                para = that.parentNode.parentNode.children[2].children[0].children[2].getAttribute('action-data');
                            }
                            uid = para.replace(/.*rootuid=(\d*)&?.*/,'$1');
                            mid = para.replace(/.*rootmid=(\d*)&?.*/,'$1');
                        }
                        pid = para.replace(/.*pid=(\w*)&?.*/,'$1');
                    }else if(hot){
                        //热门页面
                        if(!quote){
                            para = that.parentNode.children[4].getElementsByClassName('WB_handle')[0].children[0].getAttribute('action-data');
                            uid = para.replace(/.*uid=(\d*)&?.*/,'$1');
                            mid = para.replace(/.*mid=(\d*)&?.*/,'$1');
                            pid = para.replace(/.*pid=(\w*)&?.*/,'$1');
                        }else{
                            //热门多图
                            if(multiPics){
                                para = that.children[0].children[2].href;
                                pid = para.replace(/.*\/pid\/(.*)\?.*/,'$1');
                                mid = para.replace(/.*\/mid\/(.*?)\/.*/,'$1');
                                uid = para.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                            }else{
                                //没有条件测试
                            }
                        }
                    }else{
                        //普通版
                        para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(/[upm]id=/g,'').split('&');
                        pid = para[0];
                        mid = para[1];
                        uid = para[2];
                    }

                    insertEls(that.children[0], uid, mid, pid, format, cdn, multiPics);
                }
            }
        }
        delete that;
    }catch(err){}
    }
}

//媒体版主入口
function entryMedia(nodeMain){

    nodeMain.addEventListener('DOMSubtreeModified',function(e){entrySub(e)}); //需要监听 dom

    //子入口
    function entrySub(e){
    try{
        var that = e.target || event.target;

        //console.log(that);

        //判断 event 节点是否符合要求
        if(typeof(that.children) != 'undefined' && that.children.length > 0){

            //火狐修正
            if(isFirefox){
                var browserTest = (that.className.match('MIB_assign') != null || that.className.match('blogPicOri') != null) && that.style.display != 'none';
            }else{
                var browserTest = that.className.match('MIB_assign') != null || that.className.match('blogPicOri') != null;
            }

            //判断 event dom 是否为需要操作的 dom
            if(browserTest){
                if(that.className == 'MIB_assign' && that.id.match('disp_')){
                    that = that.children[0].children[1].children[0];
                    var mid = that.parentNode.parentNode.parentNode.id.replace('disp_','');
                    var uid = that.parentNode.parentNode.parentNode.parentNode.children[3].children[0].children[0].children[0].href.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                }else if(that.className == 'blogPicOri' && that.children.length > 1){
                    that = that.children[1];
                    var mid = that.parentNode.id.replace('disp_','');
                    var uid = that.parentNode.parentNode.children[0].getElementsByClassName('source_att')[0].children[0].href.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                    var rid = that.parentNode.parentNode.children[0].getElementsByClassName('source_att')[0].children[0].children[1].getAttribute('rid'); //怎么特么又跑出来个 rid
                    mid = rid; //用 rid 替换掉 mid，下面就不用在替换了
                }

                var format = that.children[1].src.replace(/.*(\....)$/,'$1');//图片格式
                var cdn = that.children[1].src.replace(/^.*?\/\/ww(.).*/,'$1');
                var pid = that.children[1].src.replace(/.*\/([\w]+)\..../,'$1');

                insertEls(that.children[0], uid, mid, pid, format, cdn, false);
            }
        }
        delete that;
    }catch(err){}
    }
}

//话题主入口
function entryHuati(nodeMain){

    nodeMain.addEventListener('DOMSubtreeModified',function(e){entrySub(e)}); //需要监听 dom

    //子入口
    function entrySub(e){
    try{
        var that = e.target || event.target;

        //console.log(that);

        //判断 event 节点是否符合要求
        if(typeof(that.children) != 'undefined' && that.children.length > 0){

            //火狐修正
            if(isFirefox){
                var browserTest = that.className.match('media_bigbox') != null && that.children.length > 0 && that.style.display != 'none';
            }else{
                var browserTest = that.className.match('media_bigbox') != null && that.children.length > 0;
            }

            //判断 event dom 是否为需要操作的 dom
            if(browserTest){

                if(that.className.match('media_bigbox') != null && that.children[0].getAttribute('node-type') != 'imagesBox'){
                    that = that.children[0];
                    var para = that.parentNode.parentNode.parentNode.getElementsByClassName('con_opt')[0].children[1].children[0].children[2].getAttribute('action-data');
                    var format = that.children[0].children[4].href.replace(/.*(\....)$/,'$1');
                    var cdn = that.children[0].children[4].href.replace(/^.*?\/\/ww(.).*/,'$1');
                    var pid = that.children[0].children[4].href.replace(/.*large\/([\w]+)\..../,'$1');
                    var mid = para.replace(/.*mid=(\d*)&?.*/,'$1');
                    var uid = para.replace(/.*uid=(\d*)&?.*/,'$1');
                    insertEls(that.children[0], uid, mid, pid, format, cdn, false);
                }else{
                    that = that.children[0];
                    var para = that.children[0].children[4].href;
                    var format = that.getElementsByTagName('IMG')[0].src.replace(/.*(\....)$/,'$1');
                    var cdn = that.getElementsByTagName('IMG')[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                    var pid = para.replace(/.*\/pid\/(.*)\?.*/,'$1');
                    var mid = para.replace(/.*\/mid\/(.*?)\/.*/,'$1');
                    var uid = para.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                    that.children[0].addEventListener('mouseover',function(){
                        var para = that.children[0].children[4].href;
                        var format = that.getElementsByTagName('IMG')[0].src.replace(/.*(\....)$/,'$1');
                        var cdn = that.getElementsByTagName('IMG')[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                        var pid = para.replace(/.*\/pid\/(.*)\?.*/,'$1');
                        var mid = para.replace(/.*\/mid\/(.*?)\/.*/,'$1');
                        var uid = para.replace(/.*weibo.com\/(.*?)\/.*/,'$1');
                        that.children[0].children[12].href = 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid;
                        that.children[0].children[14].href = 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format;
                    });
                    insertEls(that.children[0], uid, mid, pid, format, cdn, true);
                }
            }
        }
        delete that;
    }catch(err){}
    }
}
}, 500);