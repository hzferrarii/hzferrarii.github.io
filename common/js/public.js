//全部替换文字
String.prototype.replaceAll = function (AFindText, ARepText) {
    raRegExp = new RegExp(AFindText, "g");
    return this.replace(raRegExp, ARepText);
}


//转换日期格式
function DateFormat(value)
{
    if(value == null || value == 0 || value == "")
        return "--";
    else
        return value.substr(0, 4) + "-" + value.substr(4, 2) + "-" + value.substr(6, 2);
}


//页面重定向
function ChangeURL(str) {
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


//异步发送请求带loading状态
function AjaxPost(sRequestURL, oSendData, fnSuccess)
{
   
    $.ajax({
        type: "POST",
        url: sRequestURL,
        data: oSendData,
        contentType: "application/x-www-form-urlencoded;", //避免乱码
        beforeSend: PopupCreate({ sClass : "loading" }),
        success: function (oData) {

        	var result = eval("(" + oData + ")");
        	if(result.state == "200")
	            fnSuccess && fnSuccess(result);
    		else
    			PopupCreate({ cont : result.message,
                              hideNo: true });
        },
        error: function () {
            PopupCreate({ cont : "请求错误，请联系管理员！", hideNo: true });
        }
    });
}


//异步发送文件上传带loading状态
function AjaxFile(sRequestURL, oSendData, fnSuccess)
{ 
    $.ajax({
        type: "POST",
        url: sRequestURL,
        data: oSendData,
		cache: false,
		processData: false,
    	contentType: false,
        beforeSend: PopupCreate({ sClass : "loading" }),
        success: function (oData) {
        	var result = eval("(" + oData + ")");
        	if(result.state == "200")
	            fnSuccess && fnSuccess(result);
    		else
    			PopupCreate({ cont : result.message, hideNo: true });
        },
        error: function (oErr) {
        	PopupCreate({ cont : "请求错误，请联系管理员！", hideNo: true });
        }
    });
}


//-------------------------------------------------------控件部分------------------------------------------------------------


//创建popup层
function PopupCreate(obj)
{
    var setting = {
        title : "系统提示",
        cont : "请检查网络状态。",
        cueYes : "确定",
        cueNo : "取消",
        btYes : null,      //点击确认函数，null时为关闭popup
        btNo : null,       //点击取消函数，null时为关闭popup
        sClass : "duihao",  //提示的类，只有对号和问号,默认是对号
        hideNo: false     //是否隐藏取消按钮，false xBt事件等于btNo事件，true xBt事件等于btYes事件
        // hideYes: false     //隐藏所有按钮，还有右上角X按钮
    };

    for(x in setting)
    {
        if(obj[x])  setting[x] = obj[x];
    }

    var sHtml = "";
    if ($(".tc-cue")[0]) {
        if (setting.sClass == "loading") {
            if ($(".tc-cue .cue-main")[0]) {
                $(".tc-cue .cue-main").remove();
                DrawLoading();
            }
        } else {
            if ($(".tc-cue .cue-loading")[0])
                $(".tc-cue .cue-loading").remove();
            else
                $(".tc-cue .cue-main").remove();
            DrawCont();
        }
    } else {
        $("body").append("<div class=\"tc-cue\"><div class=\"cue-bg\"></div></div>");
        if (setting.sClass == "loading") {
            DrawLoading();
        } else {
            DrawCont();
        }
    }

    function DrawCont()
    {
        sHtml = "<div class=\"cue-main\"><i class=\"" + setting["sClass"] + "\"></i>"
        +"<h2 class=\"cue-title\">" + setting["title"] + "<span id=\"xBt\"></span></h2>"
        +"<div class=\"cue-cont\"><span style=\"text-align:left; display:block\">" + setting["cont"] + "</span></div>"
        +"<div class=\"cue-btn\"><p><a href=\"javascript:;\" class=\"cue-yes\">" + setting["cueYes"] + "</a><a href=\"javascript:;\" class=\"cue-no\">" + setting["cueNo"] + "</a></p></div>"
        +"</div>";
        $(".tc-cue .cue-bg").after(sHtml);
        $(".tc-cue .cue-bg").css("opacity","0.4");
        var nHeightAll = $(window).height();
        var nHeightCon = $(".tc-cue .cue-cont").outerHeight(true);
        if(nHeightCon > (nHeightAll - 100))
        {
            $(".tc-cue .cue-cont").css("height", nHeightAll - 100);
            $(".tc-cue .cue-cont").css("overflow", "scroll");
        }
        $(".tc-cue .cue-main").css("margin-top",-$(".tc-cue .cue-main").outerHeight(true)/2);
        $(".cue-yes").on("click",function(){
            if(setting.btYes)
                setting.btYes();
            else
                $(".tc-cue").remove();
        });
        $(".cue-no").on("click",function(){
            if(setting.btNo)
                setting.btNo();
            else
                $(".tc-cue").remove();
        });
        if(setting.hideNo)
        {
            $(".cue-no").remove();
            $("#xBt").on("click",function(){
                $(".cue-yes").click();
            });
        }
        else
        {
            $(".cue-yes").attr("style", "float:right");
            //$(".cue-btn p a").css("width","48%");
            $("#xBt").on("click",function(){
                $(".cue-no").click();
            });
        }
        // if(setting.hideYes)
        // {
        //     $(".cue-yes").remove();
        //     $("#xBt").remove();
        // }
    };

    function DrawLoading()
    {
       sHtml = "<div class=\"cue-loading\"><img src=\"/common/img/loading.gif\"/></div>" 
        $(".tc-cue .cue-bg").after(sHtml);
        $(".tc-cue .cue-bg").css("opacity","0");
        var nHeightAll = $(window).height();
        $(".tc-cue .cue-loading").css("margin-top", (nHeightAll-60)/2+"px");
    };
}


//关闭popup层
function  PopupDestroy()
{
    if($(".tc-cue")[0]) $(".tc-cue").remove();
}

//获取url参数 
$.getUrlParameter = function (sParamName, sURL) {
    var sURL = decodeURIComponent(sURL || location.search.slice(1));
    var rexUrl = new RegExp("(^|&)" + sParamName + "=([^&]*)(&|$)", "i");
    var aRes = sURL.match(rexUrl);
    return (aRes && aRes[2]) || "";
}



