function _TZT() {
    /*TOOLS中公用的请求
       *@param url {string} - 请求地址 
       *@param obj {object}或{string} - 发送的数据内容
       *@param fn  {function} - 回调函数
       */
    function _reqajax(url, obj, fn) {
        $.ajax({
            type: "post",
            url: url,
            data: obj,
            dataType: "json",
            success: function (oData) {
                fn && fn(oData);
            }
        });
    }
    var TZT = {

        TOOLS: {
            /*@保存信息到本地客户端内存
             *@param obj {object} - 要保存的对象型数据 - 必要性 - Y
             *@param fnSuccess {function} - 成功保存的回调函数 ，可接收一个Boolean类型参数 - 必要性 - N
             *@return void
            */
            saveMapMesg: function (obj, fnSuccess) {
                _reqajax("/reqsavemap?", obj, fnSuccess);
            },
            /*@读取本地客户端内存
            *@param sArray {Array} - 要读取的信息群 - 必要性 - Y 
            *@param fnSuccess {function} - 成功读取的回调函数 ，并把读取的对象型信息作为参数传入该函数 - 必要性 - N
            *@return void
           */
            readMapMesg: function (sArray, fnSuccess) {
                var obj = {};
                for (var x in sArray) {
                    obj[sArray[x]] = '';
                }
                _reqajax("/reqreadmap?", obj, fnSuccess);
            },
            /*
            *@保存信息到本地文件
            *@param saveMesg {string}或{object} 保存数据内容
            *@param:fileName  string  保存数据的模块名称 字符串类型
            *@param:fnSuccess {function} 保存成功的回调函数
           */
            saveFileMesg: function (saveMesg, fileName, fnSuccess) {
                var
                  sMesgType = $.type(saveMesg),
                  sFileType = $.type(fileName),
                  TYPE = '', SAVEDATA = '';
                if (sMesgType === "object") { //C类型
                    TYPE = 'C';
                } else if (sMesgType === "string") {
                    if (sFileType === "function") {
                        return false;//两种情况：传了参数1,3，或者参数2,3 都是非法参数
                    } else if (sFileType == "string") {
                        TYPE = 'D';
                    } else {
                        return false;//非法格式	
                    }
                } else if (sMesgType == "array") {
                    var aThisType = $.type(saveMesg[0]);
                    if (aThisType === "object") {
                        TYPE = 'A';
                    } else {
                        TYPE = 'B';
                    }
                }
                if (TYPE && TYPE == 'A') {
                    for (var x = 0 ; x < saveMesg.length ; x++) {
                        for (var p in saveMesg[x]) {
                            SAVEDATA += p + "|" + saveMesg[x][p] + "|";
                        }
                        SAVEDATA = SAVEDATA.slice(0, -1);
                        SAVEDATA += ",";
                    }
                } else if (TYPE && TYPE == 'B') {
                    SAVEDATA = saveMesg.toString();
                } else if (TYPE && TYPE == 'C') {
                    for (var x in saveMesg) {
                        SAVEDATA += x + '=' + saveMesg[x] + '&';
                    }
                } else if (TYPE && TYPE == 'D') {
                    SAVEDATA = saveMesg;
                } else {
                    return false;
                }
                if (TYPE == 'A' || TYPE == 'C') { SAVEDATA = SAVEDATA.slice(0, -1); }
                SAVEDATA = TYPE + '$$' + SAVEDATA;
                //console.log(SAVEDATA);
                var sSendURL = "/reqsavefile?filename=" + fileName;
                $.ajax({
                    url: sSendURL,
                    type: "POST",
                    data: encodeURI(SAVEDATA),
                    success: function (oData) {
                        fnSuccess && fnSuccess(oData);
                    }
                })
            },
            /*
           *@读取本地缓存文件信息
            *@param:fileName  string  读取文件的文件名
            *@param:fnSuccess {function} 读取成功的回调函数
           */
            readFileMesg: function (fileName, fnSuccess) {
                var sSendURL = "/reqreadfile?filename=" + fileName;
                $.ajax({
                    url: sSendURL,
                    success: function (oData) {
                        if (!oData) {
                            fnSuccess(false);
                        } else {
                            splits(oData);
                        }
                    }
                })
                var MESG, TYPE, READDATA, SPLITDATA;
                function splits(oData) {
                    MESG = decodeURI(oData).split('$$'); TYPE = MESG[0]; READDATA = MESG[1];
                    if (TYPE == 'A') {
                        SPLITDATA = [];
                        var aThisSplit = READDATA.split(',');
                        for (var x = 0; x < aThisSplit.length ; x++) {
                            var oThis = {}, aSecod = aThisSplit[x].split('|');
                            for (var p = 0 ; p < aSecod.length ; p++) {
                                if (p % 2 == 0) {
                                    oThis[aSecod[p]] = aSecod[p + 1];
                                    p++;
                                }
                            }
                            SPLITDATA.push(oThis);
                        }
                    } else if (TYPE == 'B') {
                        SPLITDATA = READDATA.split(',');
                    } else if (TYPE == 'C') {
                        SPLITDATA = {};
                        var aThisSplit = READDATA.split('&');
                        for (var x = 0 ; x < aThisSplit.length ; x++) {
                            var aThis = aThisSplit[x].split('=');
                            SPLITDATA[aThis[0]] = aThis[1];
                        }
                    } else if (TYPE == 'D') {
                        SPLITDATA = READDATA;
                    }
                    fnSuccess && fnSuccess(SPLITDATA);
                }
            },
            /*@读取本地客户端信息
          *@param sArray {Array} - 要读取的信息群 - 必要性 - Y 
          *@param fnSuccess {function} - 成功读取的回调函数 ，并把读取的对象型信息作为参数传入该函数 - 必要性 - N
          *@return void
         */
            getLocalMesg: function (sArray, fnSuccess) {
                var obj = {};
                for (var x in sArray) {
                    obj[sArray[x]] = '';
                }
                _reqajax("/reqlocal?", obj, fnSuccess);
            },
            /*@保存信息到本地客户端
            *@param obj {object} - 要保存的对象型数据 - 必要性 - Y
            *@param fnSuccess {function} - 成功保存的回调函数 ，可接收一个Boolean类型参数 - 必要性 - N
            *@return void
           */
            setLocalMesg: function (obj, fnSuccess) {
                _reqajax("/reqsofttodo?", obj, fnSuccess);
            }
        },
        //常用请求类型
        REQ: {
            XML: '/reqxml?',
            SIGNATURE: '/reqsignature?'
        },
        //常用正则
        REG: {
            //身份证号
            'IDCARD': /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            //中文
            "CHINESE": /^[\u4e00-\u9fa5]+$/i,
            //中文姓名
            "NAME": /^[\u4e00-\u9fa5]{2,8}$/i,
            //手机号码验证
            "PHONE": /^1(33|42|44|46|48|49|53|80|81|89|30|31|32|41|43|45|55|56|85|86|34|35|36|37|38|39|40|47|50|51|52|57|58|59|82|83|84|87|88|77|76|84|78|70)[0-9]{8}$/,
            //六位数字验证
            "SIXNUM": /^\d{6}$/,
            //邮箱地址
            "EMAIL": /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
            //日期验证，格式为 20140221 ,2014/02/21,2014-02-21,2014.02.21
            "DATE": /^(?:(?:1[0-9]|[0-9]{2})[0-9]{2}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00)([-/.]?)0?2\2(?:29))$/
        },
        //获取时间戳
        TAG: function () { return new Date().getTime(); },
        DEVICE: {
            //app信息
            APP: navigator.appVersion,
            //是否是安卓
            ISANDROID: (/android/i).test(navigator.appVersion),
            //ISPLAYBOOK: (/playbook/i).test(navigator.appVersion),
            //ISTOUCHPAD: (/hp-tablet/i).test(navigator.appVersion)，
            //是否是ios
            ISIOS: (/iphone|ipad/i).test(navigator.appVersion)
        },
        //弹出层插件
        dialog: {
            open: function (jdom, type) {
                var jDialog = '<div class="tztdialog" style="position:fixed;left:0;bottom:0;top:0;right:0;z-index:99995;">' +
                    '<div style="position:absolute;left:0;bottom:0;top:0;right:0;z-index:99996;' + (type == '0' ? "" : "background:#000") + ';opacity:0.2;"></div>' +
                    '<div class="tztdialogcontent" style="position:absolute;left:0;bottom:0;top:0;right:0;z-index:99997;margin:auto;"></div>' +
                    '</div>';
                if ($('.tztdialog').length < 1) {
                    $('body').append(jDialog);
                }
                if (jdom) {
                    $('.tztdialogcontent').append(jdom);
                    jdom.show();
                    var _width = jdom.outerWidth();
                    var _height = jdom.outerWidth();
                    $('.tztdialogcontent').css('width', _width + 'px');
                    $('.tztdialogcontent').css('height', _height + 'px');

                }
                $('.tztdialog').fadeIn(100);
            },
            close: function () {
                var content = $('.tztdialogcontent').children();
                if (content.length !== 0) {
                    content.hide();
                    content.appendTo('body');
                }
                $('.tztdialog').remove();
            }
        }
    };
    //获取url传参
    $.getUrlParameter = function (sParamName, sURL) {
        var sURL = decodeURIComponent(sURL || location.search.slice(1));
        var rexUrl = new RegExp("(^|&)" + sParamName + "=([^&]*)(&|$)", "i");
        var aRes = sURL.match(rexUrl);
        return (aRes && aRes[2]) || "";
    }
    /*
     *@notice 通用Ajax请求
     *@params sRequestURL { string } 发起请求的地址
     *@params oSendData { Object } 请求的参数
     *@params fnSuccess { function  } 请求成功后的回调函数
     *@params oConfig { Object } Ajax 的配置项
     */
    $.getData = function (sRequestURL, oSendData, fnSuccess, oConfig) {
        var oDefConfig = {
            type: "POST",
            url: sRequestURL,
            data: oSendData,
            contentType: "application/x-www-form-urlencoded;", //避免乱码
            success: function (oData) {
                var nErrorNO = (+oData.ERRORNO), sErrorMessage = oData.ERRORMESSAGE;
                //判断是否登录
                if (nErrorNO == -204009 || nErrorNO == -204001 || nErrorNO == -204007 || nErrorNO == -207001 && oData.ACTION != '112') {
                    changeURL("http://action:10402/?context=&&url=" + encodeURIComponent("http://action:10090/?loginType=2&&loginKind=0&&url=")); return;
                }
                if (nErrorNO < 0) {
                    //屏蔽任何错误
                    if (oConfig && oConfig.BlockErr === true) {
                        fnSuccess && fnSuccess(oData); return;
                    }
                    alert(sErrorMessage);
                    //提示错误信息后，继续走这个方法
                    oConfig && oConfig.ZeroLeft && oConfig.ZeroLeft(oData);
                } else {
                    fnSuccess && fnSuccess(oData);
                }
            },
            error: function (oErr) {
                switch (oErr) {
                    case 'timeout':
                        alert("请求超时");
                        break;
                    case 'dataerr':
                        alert("数据格式出错");
                        break;
                    default:
                        break;
                }
                return false;
            }
        }, oAjaxParm = {}, oParam = oConfig || {};
        oAjaxParm = $.extend(oParam, oDefConfig);
        $.ajax(oParam);
    }
    return TZT;
}
//设置某个元素的告诉，屏幕高度减去 height参数
$.setHeight = function (jdom, height) {
    var screenHeight = document.documentElement.clientHeight;
    var reduce = screenHeight - height;
    jdom.css('height', reduce + 'px');
};
////********一下是全局方法******//////
//手机页面跳转
window.changeURL = function (str) {
    //关闭Loading
    PopupDestroy();

    var app = window.navigator.appVersion.toLocaleLowerCase();
    if (app.indexOf("windows phone") > 0) {
        window.external.notify(str);
    } else if (app.indexOf("iphone") > 0) {
        window.location.href = str;
    } else if (app.indexOf("android") > 0) {
        window.MyWebView.onJsOverrideUrlLoading(str);
    } else {
        window.location.href = str;
    }
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
//全部替换文字
String.prototype.replaceAll = function (AFindText, ARepText) {
    raRegExp = new RegExp(AFindText, "g");
    return this.replace(raRegExp, ARepText);
}
var TZT = new _TZT();
//列表数组
var A_ARR = [];
//标题
var S_FIELD = '';
//通用列表标题和内容
TZT.getComDom = function (oData, _type) {
    var oRet = {};
    //标题dom
    var TITLE_DOM = '';
    //内容dom
    var COMTENT_DOM = '';
    if (oData.HTMLTITLE) {
        var A_HTMLTITLE = oData.HTMLTITLE.split(',');
        var allTitle = oData.GRID0[0].split('|');
        var oField = {};
        for (var i = 0; i < 4; i++) {
            var A_TITLE = A_HTMLTITLE[i].split('/');
            if (!A_TITLE[1]) {
                oField[i] = {
                    count: 1,
                    index: A_TITLE[0]
                };
                TITLE_DOM += '<div class="">' + allTitle[A_TITLE[0]] + '</div>';
            }
            else {
                oField[i] = {
                    count: 2,
                    index: A_TITLE[0] + '|' + A_TITLE[1]
                };
                TITLE_DOM += '<div>' + allTitle[A_TITLE[0]] + '/' + allTitle[A_TITLE[1]] + '</div>';
            }
        }
        if (_type == pagecount) {
            if (A_ARR) {
                A_ARR = [];
            }
            S_FIELD = oData.GRID0[0];
            oData.GRID0.shift();
        }
        var sjlen = $('.j_chicanglist li').length;
        $.each(oData.GRID0, function (i, item) {
            if (A_ARR) {
                A_ARR.push(item);
            }
            var c_dom = '';
            var infoList = item.split('|');
            for (var b = 0; b < 4; b++) {
                if (oField[b].count == 1) {
                    c_dom += '<div><p class="hightline42">' + infoList[oField[b].index] + '</p></div>';
                }
                else {
                    var aindex = oField[b].index.split('|');
                    c_dom += '<div><p>' + infoList[aindex[0]] + '</p><p>' + infoList[aindex[1]] + '</p></div>';
                }
            }
            var dnum = i;
            if(sjlen){
                dnum = i+sjlen;
            }
            COMTENT_DOM += ('<li data-num="' + dnum + '" class="clear oneli">' + c_dom + '</li>');
        });
    }
    else {
        var allTitle = oData.GRID0[0].split('|');
        TITLE_DOM = "<div>" + allTitle[0] + "/" + allTitle[1] + "</div>";
        TITLE_DOM = TITLE_DOM + "<div>" + allTitle[2] + "/" + allTitle[3] + "</div>";
        TITLE_DOM = TITLE_DOM + "<div>" + allTitle[4] + "/" + allTitle[5] + "</div>";
        TITLE_DOM = TITLE_DOM + "<div>" + allTitle[6] + "/" + allTitle[7] + "</div>";
        if (_type == pagecount) {
            if (A_ARR) {
                A_ARR = [];
            }
            S_FIELD = oData.GRID0[0];
            oData.GRID0.shift();
        }
        var infoHtml = "";
        var sjlen = $('.j_chicanglist li').length;
        $.each(oData.GRID0, function (i, item) {
            if (A_ARR) {
                A_ARR.push(item);
            }
            var infoList = item.split('|');
            var dnum = i;
            if(sjlen){
                dnum = i+sjlen;
            }
            COMTENT_DOM = COMTENT_DOM + '<li data-num="'+dnum+'" class="clear oneli"><div><p>' + infoList[0] + '</p><p>' + infoList[1] + '</p></div>';
            COMTENT_DOM = COMTENT_DOM + '<div><p>' + infoList[2] + '</p><p>' + infoList[3] + '</p></div>';
            COMTENT_DOM = COMTENT_DOM + '<div><p>' + infoList[4] + '</p><p>' + infoList[5] + '</p></div>';
            COMTENT_DOM = COMTENT_DOM + '<div><p>' + infoList[6] + '</p><p>' + infoList[7] + '</p></div></li>';
        })
    }
    oRet.TITLE_DOM = TITLE_DOM;
    oRet.COMTENT_DOM = COMTENT_DOM;
    return oRet;
}
//每页显示条数加上1
var pagecount = 21;
/*华泰天天发移过来的*/
var jtjtool = {
    /*
     * 字符串转换为数组 有标题
     * */
    strToArrs: function (arr) {
        var b = [];
        for (var i = 0, j = arr.length; i < j; i++) {
            var a = arr[i].split('|');
            a.splice(a.length - 1, 1);
            b.push(a);
        }
        return b;
    },
    /*
     * 字符串转换为数组 无标题
     * */
    strToArrNoTitle: function (arr) {
        return this.strToArrs(arr).splice(0, 1);
    },
    /*
     * 字符串转换为数组 只返回标题
     * */
    strToArrTitle: function (arr) {
        return this.strToArrs(arr)[0];
    },
    /*
    * 根据标题位置查早位置显示值
    * arr : array
    * i:number
    * title : string arr
    * */
    strToArrPos:function(arr, i, title){

        if(typeof title  == 'string')
        return arr[i][$.inArray(title ,arr[0])]
        else if(title instanceof Array){
            var arrs = [];
            for(var k= 0,j=title.length; k<j; k++){
                arrs.push(arr[i][$.inArray(title[k] ,arr[0])])
            };
            return arrs;
        }
    }
};