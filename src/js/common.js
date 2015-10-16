/**
 * Created by GG on 15/8/18.
 */

(function () {
    'use strict';

    var $commonLandscape, $commonShare;

    //主函数
    function main() {
        init();
        landscapeSetting();
        shareSetting();
    }

    //初始化
    function init() {
        $commonLandscape = $('#common-landscape');
        $commonShare = $('#common-share');
    }

    //通用横屏提示设置
    function landscapeSetting() {
        var handler = function () {
            switch (window.orientation) {
                case 0:
                case 180:
                    $commonLandscape.hide();
                    break;
                case -90:
                case 90:
                    $commonLandscape.show();
                    break;
            }
            if (!$.os.phone && !$.os.tablet) {
                $commonLandscape.show();
            }
        };

        handler();
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", handler, false);
    }

    //通用分享设置
    function shareSetting() {
        window.NewsAppShare = {
            shareData: {
                title: '',
                desc: '',
                img_url: '',
                link: ''
            },
            update: function (data) {
                for (var i in data) {
                    if (this.shareData.hasOwnProperty(i)) {
                        this.shareData[i] = data[i];
                    }
                }
                document.getElementById('__newsapp_sharetext').innerHTML = this.shareData.title + ' ' + this.shareData.link;
                document.getElementById('__newsapp_sharephotourl').innerHTML = this.shareData.img_url;
                document.getElementById('__newsapp_sharewxtitle').innerHTML = this.shareData.title;
                document.getElementById('__newsapp_sharewxtext').innerHTML = this.shareData.desc;
                document.getElementById('__newsapp_sharewxthumburl').innerHTML = this.shareData.img_url;
                document.getElementById('__newsapp_sharewxurl').innerHTML = this.shareData.link;
            },
            show: function () {
                if (NewsAppClient.isNewsApp()) {
                    NewsAppClient.share();
                } else {
                    $commonShare.fadeIn(300);
                    setTimeout(function () {
                        $commonShare.fadeOut(300);
                    }, 2000);
                }
            },
            getAbsPath: function (url) {
                var a = document.createElement('a');
                a.href = url;
                return a.href;
            }
        };

        //初始化分享数据
        NewsAppShare.update({
            title: '分享标题',
            desc: '分享描述',
            img_url: NewsAppShare.getAbsPath('other/share-icon.png'),
            link: NewsAppShare.getAbsPath('/')
        });

        //微信分享设置
        document.addEventListener('WeixinJSBridgeReady', function () {
            WeixinJSBridge.on('menu:share:timeline', function () {
                WeixinJSBridge.invoke('shareTimeline', NewsAppShare.shareData, function () {
                });
            });
            WeixinJSBridge.on('menu:share:appmessage', function () {
                WeixinJSBridge.invoke('sendAppMessage', NewsAppShare.shareData, function () {
                });
            });
        }, false);
    }

    $(main);
}());