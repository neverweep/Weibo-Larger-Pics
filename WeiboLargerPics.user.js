// ==UserScript==
// @name           Weibo Larger Pics
// @namespace      http://xiaoxia.de/
// @description    Easily view larger pics on Weibo.com
// @version        0.04
// @author         xiaoxia
// @include        http://t.sina.com.cn/*
// @include        http://weibo.com/*
// @include        http://www.weibo.com/*
// @include        http://e.weibo.com/*
// @exclude        http://hot.weibo.com/*
// @exclude        http://s.weibo.com/*
// @exclude        http://weibo.com/app/*
// @exclude        http://weibo.com/app
// @updateinfo     增加企业版微博支持
// ==/UserScript==

//version for auto update
var tsinam_version = "0.04";
var t_rdate = "2013-07-16";

var isFirefox = navigator.userAgent.toLowerCase().match('firefox');
var enterprise = false;

//判断页面类型
if(document.getElementById('pl_content_homeFeed') != null){
    //本人时间线
    var nodeListen = document.getElementById('pl_content_homeFeed');
    entryMain(nodeListen);
}else if(document.getElementById('pl_content_hisFeed') != null){
    //他人时间线
    if(window.location.host == 'e.weibo.com'){
        //判断企业版
        enterprise = true;
    }
    var nodeListen = document.getElementById('pl_content_hisFeed');
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
    iElement.className = 'W_vline';
    iElement.innerHTML = symbol;
    node.appendChild(iElement);
}

//
function entryMain(nodeMain){

    nodeMain.addEventListener('DOMSubtreeModified',function(e){entrySub(e)});//需要监听 dom

    function entrySub(e){
    try{
        var that = e.target || event.target;

        //console.log(that);

        //判断 event 节点是否符合要求
        if(typeof(that.children) != 'undefined' && that.children.length > 0){

            //火狐修正
            if(isFirefox){
                var browserTest  = (that.className.match('WB_media_expand') != null && (that.className.match('SW_fun2') != null || that.className.match('SW_fun') != null) && that.style.display != "none") || (that.className == 'expand' && (that.parentNode.style.display != "none" && that.style.display != "none")) || (that.getAttribute('node-type') == 'imagesBox' && that.style.display != "none") || (that.className.match('comment') && that.className.match('W_textc') && that.style.display != "none");
            }else{
                var browserTest = (that.className.match('WB_media_expand') != null && (that.className.match('SW_fun2') != null || that.className.match('SW_fun') != null)) || that.className == 'expand' || that.getAttribute('node-type') == 'imagesBox' || (that.className.match('comment') && that.className.match('W_textc'));
            }

            //企业版修正节点
            if(enterprise){
                //是否为引用图
                var quote = (that.className == 'expand');
                if(!quote){
                    that = that.getElementsByClassName('expand')[0];
                }
            }

            //判断 event dom 是否为需要操作的 dom，that.getAttribute('node-type') == 'imagesBox' 为非转发多图的状态。
            if(browserTest){

                //判断是否为多图模式
                var multiPics = false;
                if(typeof(that.children[0].getAttribute('node-type')) == 'string'){
                    that = that.children[0];
                    multiPics = true;
                }

                var attr = that.children[1].getAttribute('action-type');
                var cls = that.children[1].className;
                attr = attr != null ? attr : '';
                cls = cls != null ? cls : '';

                //继续判断是否为需要操作的 dom
                if(attr.match('img') || cls.match('pic_list_view')){
                    var uid, pid, mid, format, para, cdn;

                    if(!multiPics && that.getAttribute('node-type') != 'imagesBox'){
                        //单图
                        format = that.children[1].children[0].src.replace(/.*(\....)$/,'$1');//图片格式
                        cdn = that.children[1].children[0].src.replace(/^.*?\/\/ww(.).*/,'$1');//图片 CDN 地址
                    }else{
                        //多图
                        format = that.children[1].children[0].children[0].children[0].children[0].src.replace(/.*(\....)$/,'$1');
                        cdn = that.children[1].children[0].children[0].children[0].children[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                        //多图情况下，对更换图片事件进行监听
                        that.children[0].addEventListener('mouseover',function(){
                            var format = that.children[1].children[0].children[0].children[0].children[0].src.replace(/.*(\....)$/,'$1');
                            var cdn = that.children[1].children[0].children[0].children[0].children[0].src.replace(/^.*?\/\/ww(.).*/,'$1');
                            var para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(/[upm]id=/g,'').split('&');
                            var pid = para[0];
                            var mid = para[1];
                            var uid = para[2];
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
                    }else{
                        //普通版
                        para = that.children[0].getElementsByClassName('show_big')[0].getAttribute('action-data').replace(/[upm]id=/g,'').split('&');
                        pid = para[0];
                        mid = para[1];
                        uid = para[2];
                    }

                    //大图地址
                    insertI(that.children[0],'<');
                    insertA(that.children[0], 'http://photo.weibo.com/' + uid + '/wbphotos/large/mid/' + mid + '/pid/' + pid, '进入相册大图页面', '图');

                    //相册详情，多图模式下无法获得 mid，所以不显示
                    if(!multiPics){
                        insertI(that.children[0], '|');
                        insertA(that.children[0], 'http://photo.weibo.com/' + uid + '/talbum/detail/photo_id/' + mid, '进入相册详情页面', '详');
                    }

                    //原图地址
                    insertI(that.children[0], '|');
                    insertA(that.children[0], 'http://ww' + cdn + '.sinaimg.cn/large/' + pid + format, '大图原始地址，在此点击右键可以另存图像或复制地址', '源')
                    insertI(that.children[0], '>');
                }
            }
        }
        delete that;

    }catch(err){}
    }
}