KISSY.add("brix/gallery/multimedia/index",function(a,b,c,d){function f(){var a=this;f.superclass.constructor.apply(a,arguments),a.init()}var e=c.all;return f.ATTRS={w0:{value:100},h0:{value:100},w1:{value:300},h1:{value:250},right:{value:0},top:{value:28}},a.extend(f,b,{init:function(){var b=this,c="multimedia_"+a.guid();b.set("id",c);var f=e('<div id="'+c+'"></div>');f.css({width:b.get("w0"),height:b.get("h0"),position:"absolute",right:b.get("right"),top:b.get("top"),"z-index":999999}),e("body").prepend(f),f=null;var g="fn_multimedia_"+a.guid();window[g]=function(a,c){b.sendToJS(a,c)},d.add("#"+c,{src:b.get("swf_url"),id:c+"_swf",version:10,params:{flashvars:{JavaScriptName:g,url:b.get("url")},wmode:"transparent",allowScriptAccess:"always"},attrs:{width:"100%",height:"100%"}})},sendToJS:function(a,b){var c=this;a=="switch"?c._switch(b):a=="open"&&window.open(b)},_switch:function(b){var c=this,d=b=="start"?1:0,e;d==1?(e={width:c.get("w1"),height:c.get("h1")},d=0):(e={width:c.get("w0"),height:c.get("h0")},d=1),a.one("#"+c.get("id")).css(e)}}),f},{requires:["base","node","flash"]});