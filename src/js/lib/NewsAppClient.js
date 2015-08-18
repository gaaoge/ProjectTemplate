;(function(window){

var Navigator =(function(){
    var frame,
        androidReg = /Android/gi,
        isAndroid = androidReg.test(navigator.platform) || androidReg.test(navigator.userAgent);
    /**
     * iframe 元素
     *
     * @property {Element} frame
     */
    frame = null;
    /**
     * 创建iframe,帮助解决iOS的UIWebView没有JS API
     *
     * @method getFrame
     * @return {Element} iframe
     */
    function getFrame(src){
        var _frame = document.createElement("iframe");
        _frame.setAttribute("style", "display:none;width:0;height:0;position: absolute;top:0;left:0;border:0;");
        _frame.setAttribute("height","0px");
        _frame.setAttribute("width","0px");
        _frame.setAttribute("frameborder","0");
        if(src){
            _frame.setAttribute("src",src);
        }else{
            document.documentElement.appendChild(_frame);
        }
        return _frame;
    }
    /**
     * 删除iframe
     *
     * @method removeFrame
     * @param {Element} frame 执行的方法
     */
    function removeFrame(frame){
        frame && frame.parentNode.removeChild(frame);
    }
    /**
     * 执行与客户端交互的协议
     *
     * @method protocol
     * @param {String} command 执行的协议及命令
     * @param {boolean} single 是否是使用独立的iframe,默认false
     * @param {boolean} noframe 是否不通过iframe,默认false
     */
   function protocol(command,single,noframe){
        var _frame,timer;
        //不通过iframe
        if(noframe){window.location.href = command;return;}
        //通过iframe
        if(single){
            if(isAndroid){
                _frame = getFrame();
                _frame.setAttribute("src", command);
            }else{
                _frame = getFrame(command);
                document.documentElement.appendChild(_frame);
            }
           timer = setTimeout(function(){
                _frame && removeFrame(_frame);
           },30000);
           _frame.onload = _frame.onreadystatechange = function(){
               timer && clearTimeout(timer);
               _frame && removeFrame(_frame);
           }
        }else{
            frame = frame || getFrame();
            frame.setAttribute("src", command);
        }
    }
    return {
        protocol: protocol
    }
})();
/**
 * 与新闻客户端交互
 */
function NewsApp(protocolHandler){
    var emptyFn = function(){},
        newsAppUA = (/NewsApp/ig).test(navigator.userAgent),
        androidReg = /Android/gi,
        debug = false,
        isAndroid = androidReg.test(navigator.platform) || androidReg.test(navigator.userAgent),
        Callbacks,Protocols;

    Callbacks = {
        afterShare: emptyFn,
        afterUserinfo: emptyFn,
        afterLogin: emptyFn,
        afterUploadImage: emptyFn,
        afterComment: emptyFn,
        afterActionbutton: emptyFn
    }
    Protocols = {
        share: 'share://',
        userinfo: 'userinfo://',
        login: 'login://',
        uploadImageByCamera: 'uploadimage://camera/{W}_{H}',
        uploadImageByAlbum: 'uploadimage://album/{W}_{H}',
        openComment: 'newsapp://comment/{BOARD_ID}/{DOC_ID}/{TITLE}',
        comment: 'comment://',
        copy: 'copy://',
        toolbar: 'docmode://toolbar/{COMMAND}',
        modifytitle: 'docmode://modifytitle/{TITLE}',
        actionbutton: 'docmode://actionbutton/{NAME}'
    }
    function enableDebug(){
        debug = true;
    }
    function isNewsApp(){
        return newsAppUA || debug;
    }
    function protocol(action,callback,failedCallback){
        if(newsAppUA){
            protocolHandler(action,true);
        }else if(failedCallback){
            failedCallback();
        }
        //开启调试
        if(debug && callback){
            var _data = action.match(/[\w]:\/\/(.*)/);
            callback(_data && _data[1]);
        }
    }

    function afterCallback(rs,callback){
        callback = callback || emptyFn;
        callback(rs);
        callback = emptyFn;
    }
    window.__newsapp_userinfo_done = function(rs){
        afterCallback(rs,Callbacks.afterUserinfo);
    }
    window.__newsapp_login_done = function(rs){
        afterCallback(rs,Callbacks.afterLogin);
    }
    window.__newsapp_share_done = function(rs){
        afterCallback(rs,Callbacks.afterShare);
    }
    window.__newsapp_upload_image_done = function(rs){
        afterCallback(rs,Callbacks.afterUploadImage);
    }
    window.__newsapp_browser_actionbutton = function(rs){
        afterCallback(rs,Callbacks.afterActionbutton);
    }
    /**
     * 登录
     * @param {Function} callback 成功回调
     */
    function login(callback){
        Callbacks.afterLogin = callback;
        protocol(Protocols.login,callback);
    }
    /**
     * 获取用户信息
     * @param {Function} callback 成功回调
     */
    function userInfo(callback){
        Callbacks.afterUserinfo = callback;
        protocol(Protocols.userinfo,callback);
    }
    /**
     * 分享
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * platform,分享的平台代码
     *  0或不存在	客户端调用分享平台面板，由用户自己选择。
        200	网易微博
        201	新浪微博
        202	腾讯微博
        203	人人网
        204	QQ空间
        205	易信好友
        206	易信朋友圈
        207	QQ好友
        208	微信好友
        209	微信朋友圈
     * }
     */
    function share(option){
        option = option || {};
        Callbacks.afterShare = option.success;
        protocol(Protocols.share+(option.platform||0),option.success,option.failed);
    }
    function sharePlatform(option,tag){
        option = option || {};
        option.platform = tag;
        share(option);
    }
    /**
     * 分享到 网易微博
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareNetEaseWeibo(option){
        sharePlatform(option,200);
    }
    /**
     * 分享到 新浪微博
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareWeibo(option){
        sharePlatform(option,201);
    }
    /**
     * 分享到 腾讯微博
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareTencentWeibo(option){
        sharePlatform(option,202);
    }
    /**
     * 分享到 人人网
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareRenren(option){
        sharePlatform(option,203);
    }
    /**
     * 分享到 QQ空间
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareQZone(option){
        sharePlatform(option,204);
    }
    /**
     * 分享到 易信好友
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareYiXinChat(option){
        sharePlatform(option,205);
    }
    /**
     * 分享到 易信朋友圈
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareYiXinTimeline(option){
        sharePlatform(option,206);
    }
    /**
     * 分享到 QQ好友
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareQQChat(option){
        sharePlatform(option,207);
    }
    /**
     * 分享到 微信好友
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareWechatChat(option){
        sharePlatform(option,208);
    }
    /**
     * 分享到 微信朋友圈
     * @param option
     * {
     * success,//成功回调
     * failed,失败回调
     * }
     */
    function shareWechatTimeline(option){
        sharePlatform(option,209);
    }

    /**
     * 上传图片 调用摄像头
     * @param {Integer} width 图片宽
     * @param {Integer} height 图片高
     * @param {Function} callback 成功回调
     */
    function uploadImageByCamera(width,height,callback){
        Callbacks.afterUploadImage = callback;
        protocol( Protocols.uploadImageByCamera.replace('{W}',width).replace('{H}',height),callback );
    }
    /**
     * 上传图片 调用图库
     * @param {Integer} width 图片宽
     * @param {Integer} height 图片高
     * @param {Function} callback 成功回调
     */
    function uploadImageByAlbum(width,height,callback){
        Callbacks.afterUploadImage = callback;
        protocol( Protocols.uploadImageByAlbum.replace('{W}',width).replace('{H}',height),callback );
    }
    /**
     * 打开文章跟贴
     * @param {String} boardid 版块ID
     * @param {String} docid 文章ID
     * @param {String} title 文章标题
     */
    function openComment(boardid,docid,title){
        protocol( Protocols.openComment.replace('{BOARD_ID}',boardid).replace('{DOC_ID}',docid).replace('{TITLE}',title||'') );
    }
    /**
     * 直接发表跟贴
     * @param {Function} callback 成功回调
     */
    function comment(callback){
        Callbacks.afterComment = callback;
        protocol( Protocols.comment,callback );
    }
    /**
     * 复制文本到剪贴板
     * @param {String} text
     */
    function copy(text){
        protocol( Protocols.copy+text );
    }
    /**
     * 显示隐藏正文工具栏
     * @param {String} command  show|hide
     */
    function toolbar(command){
        protocol( Protocols.toolbar.replace('{COMMAND}',command) );
    }
    /**
     * 更新标题
     * @param {String} title
     */
    function modifytitle(title){
        document.title = title || document.title;
        protocol( Protocols.modifytitle.replace('{TITLE}',encodeURI(title)) );
    }
    /**
     * 更新右上角功能菜单按钮
     * @param {String} name
     */
    function actionbutton(name,callback){
        Callbacks.afterActionbutton = callback;
        protocol( Protocols.actionbutton.replace('{NAME}',encodeURI(name)),callback );
    }
    return {
        isNewsApp: isNewsApp,
        login: login,
        userInfo: userInfo,
        share: share,
        shareNetEaseWeibo: shareNetEaseWeibo,
        shareWeibo: shareWeibo,
        shareTencentWeibo: shareTencentWeibo,
        shareRenren: shareRenren,
        shareQZone: shareQZone,
        shareYiXinChat: shareYiXinChat,
        shareYiXinTimeline: shareYiXinTimeline,
        shareQQChat: shareQQChat,
        shareWechatChat: shareWechatChat,
        shareWechatTimeline: shareWechatTimeline,
        uploadImageByCamera: uploadImageByCamera,
        uploadImageByAlbum: uploadImageByAlbum,
        openComment: openComment,
        comment: comment,
        copy: copy,
        toolbar: toolbar,
        modifytitle: modifytitle,
        actionbutton: actionbutton,
        enableDebug: enableDebug
    }
}//end newsApp


window.NewsAppClient = NewsApp(Navigator.protocol);
}(window));
