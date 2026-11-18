/**
 * jQuery VirtualKeyboard plugin
 *
 * @author youharutou, 2016.03.23
 * 
 * Copyright (c) 2016 youharutou
 * 
 * Version:  1.0.0
 * 
 */

(function($) {
	
	var caps, lowercase, currentMode;
	caps = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	lowercase = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

	//添加移动端的点击效果
	function clickEffect(target) {
		target.each(function() {
			this.addEventListener("touchstart", function() {
				var _this = $(this);
				_this.addClass("active");
				setTimeout(function() {
					_this.removeClass("active");
				}, 150);
			}, false);
		});
	}

    $.keyboard = function(target, options) {
		var base, 
		    defaults, 
			bodyNode, 
			element, 
			oTimer,           //用于判断长按的时间
			delTimer,         //长按删除的循环器
			cursorTimer;      //显示光标的循环器
		var cursorExist = 1;  //光标是否存在
		var endTime = 0;      //用于判断双击的时间
		base = this;
		this.target = target;  //输入框
		this.$target = $(target).addClass("ui-keyboard-target").prop("readonly", true);
		typeof $(target).attr("placeholder") !== "undefined" && $(target).data("placeholder", $(target).attr("placeholder"));  //保存目标的placeholder值，以免影响光标
		defaults = {
			theme: "default",                //默认主题s
			layouts: "mix",                  //混搭布局
			ready: function(){return true},  //键盘是否就绪
			change: null,                    //目标的值发生改变时的回调函数
			focus: null,                     //目标获得焦点时的回调函数
			blur: null                       //目标失去焦点时的回调函数
		};
		bodyNode = document.getElementsByTagName("body")[0];
	
		options && $.extend(defaults, options);
		this.settings = defaults;
		
		//异常报告
		if(typeof defaults.theme !== "string"){
			throw new Error("the type of theme must be 'String'");
		}
		
		//生成键盘类名字符串
		function classGenerator(){
			var classes = "ui-keyboard";
			var theme_class = "ui-theme-" + defaults.theme;
			var layout_class = "ui-layout-" + defaults.layouts;
			classes = classes + " " + theme_class + " " + layout_class;
			return classes;
		}
		
		//生成键盘
		function setContent(){
			var kb_content = '';
			switch (defaults.layouts){
				case "mix":
					var line1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
					var line2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
					var line3 = ["Z", "X", "C", "V", "B", "N", "M"];
					kb_content += '<div class="ui-keyboard-line">';
					for(var i = 1; i < 10; i++){
						kb_content += '<div class="ui-keyboard-key ui-keyboard-number" data-key="' + i + '"><span>' + i + '</span></div>';
					}
					kb_content += '<div class="ui-keyboard-key ui-keyboard-number" data-key="0"><span>0</span></div>';
					kb_content += '</div><div class="ui-keyboard-line">';
					var character_temp = {};
					//生成26个字母键放入临时的字符集中
					for(var i = 0; i < caps.length; i++){
						character_temp[caps[i]] = '<div class="ui-keyboard-key ui-keyboard-character" data-key="' + i + '"><span>' + caps[i] + '</span></div>';
					}
					//按设定的布局加入字符键
					for(var i = 0; i < line1.length; i++){
						kb_content += character_temp[line1[i]];
					}
					kb_content += '</div><div class="ui-keyboard-line">';
					for(var i = 0; i < line2.length; i++){
						kb_content += character_temp[line2[i]];
					}
					kb_content += '</div><div class="ui-keyboard-line">';
					kb_content += '<div class="ui-keyboard-key ui-keyboard-capslock"><span>&nbsp;</span></div>';
					for(var i = 0; i < line3.length; i++){
						kb_content += character_temp[line3[i]];
					}
					kb_content += '<div class="ui-keyboard-key ui-keyboard-delete"><span>&nbsp;</span></div>';
					kb_content += '</div>';
					break;
				default:;
			}
			element.innerHTML = kb_content;
		}
		
		//渲染键盘，配置样式
		function rendering(){
			bodyNode.appendChild(element);
		}
		
		//显示光标
		function showCursor(){
			typeof base.$target.data("placeholder") !== "undefined" && base.$target.attr("placeholder", "");
			cursorTimer = setInterval(function(){
				var value = base.$target.val();
				if(cursorExist){
					value = value.slice(0, value.length - 1);
					cursorExist = 0;
				}
				else {
					value += "|";
					cursorExist = 1;
				}
				base.$target.val(value);
			}, 500);
		}
		
		//隐藏光标
		function hideCursor(){
			clearInterval(cursorTimer);
			cursorExist = 1;
			var value = base.$target.val();
			var arr = value.split("");
			if(arr[arr.length - 1] == "|"){
				value = value.slice(0, value.length - 1);
				base.$target.val(value);
			}
			typeof base.$target.data("placeholder") !== "undefined" && base.$target.attr("placeholder", base.$target.data("placeholder"));
		}
		
		//给键盘按键绑定事件
		function eventMonitor(){
			base.$target.on("touchstart", function(e){
				e.stopPropagation();
				if(!base.settings.ready()){
					return;
				}
				if(base.$target.hasClass("active")){
					return;
				}
				typeof base.settings.focus === "function" && base.settings.focus(e, base.target);
				base.$target.addClass("active");
				var elemStyle = base.elem.style;
				var value = base.$target.val();
				value += "|";
				base.$target.val(value);
				showCursor();
				elemStyle.visibility = "visible";
				elemStyle.opacity = 1;
				elemStyle.webkitTransform = elemStyle.MozTransform = elemStyle.OTransform = elemStyle.transform = "translate(0,0)";
			});
			$(document).on("touchstart", function(e){
				if(!($.contains(base.elem, e.target) || $.contains(base.target, e.target))){
					hideCursor();
					base.$target.hasClass("active") && typeof base.settings.blur === "function" && base.settings.blur(e, base.target);
					base.$target.removeClass("active");
					var elemStyle = base.elem.style;
					elemStyle.visibility = "hidden";
					elemStyle.opacity = 0;
					elemStyle.webkitTransform = elemStyle.MozTransform = elemStyle.OTransform = elemStyle.transform = "translate(0,40px)";
				}
			});
			$(".ui-keyboard-number", element).on("touchstart", function(e){
				e.stopPropagation();
				clearInterval(cursorTimer);
				cursorExist = 1;
				var $capslock = $(".ui-keyboard-capslock", element);
				var value = base.$target.val();
				var arr = value.split("");
				if(arr[arr.length - 1] == "|"){
					value = value.slice(0, value.length - 1);
				}
				var valid_value = value + $(this).data("key");
				value = valid_value + "|";
				base.$target.val(value);
				showCursor();
				typeof base.settings.change === "function" && base.settings.change(e, valid_value, base.target);
				if($capslock.hasClass("caps-one")){
					$capslock.removeClass("caps-one");
					currentMode = lowercase;
				}
			});
			$(".ui-keyboard-character", element).on("touchstart", function(e){
				e.stopPropagation();
				clearInterval(cursorTimer);
				cursorExist = 1;
				var $capslock = $(".ui-keyboard-capslock", element);
				var value = base.$target.val();
				var arr = value.split("");
				if(arr[arr.length - 1] == "|"){
					value = value.slice(0, value.length - 1);
				}
				var valid_value = value + currentMode[$(this).data("key")];
				value = valid_value + "|";
				base.$target.val(value);
				showCursor();
				typeof base.settings.change === "function" && base.settings.change(e, valid_value);
				if($capslock.hasClass("caps-one")){
					$capslock.removeClass("caps-one");
					currentMode = lowercase;
				}
			});
			$(".ui-keyboard-delete", element).on("touchstart", function(e){
				e.stopPropagation();
				clearInterval(cursorTimer);
				cursorExist = 1;
				var value = base.$target.val();
				var arr = value.split("");
				var reduced = arr[arr.length - 1] == "|" ? 2 : 1;
				value = value.slice(0, value.length - reduced) + "|";
				base.$target.val(value);
				oTimer = setTimeout(function(){
					clearTimeout(oTimer);
					clearInterval(cursorTimer);
					cursorExist = 1;
					delTimer = setInterval(function(){
						var value = base.$target.val();
						value = value.slice(0, value.length - 2) + "|";
						base.$target.val(value);
					}, 80);
				}, 450);
			});
			$(".ui-keyboard-delete", element).on("touchend", function(e){
				e.stopPropagation();
				clearTimeout(oTimer);
				clearInterval(delTimer);
				var value = base.$target.val();
				var valid_value = value.slice(0, value.length - 1);
				typeof base.settings.change === "function" && base.settings.change(e, valid_value);
				showCursor();
			});
			$(".ui-keyboard-capslock", element).on("touchstart", function(e){
				e.stopPropagation();
				if($(this).hasClass("caps-one") || $(this).hasClass("caps-long")){
					$(this).removeClass("caps-one");
					$(this).removeClass("caps-long");
					currentMode = lowercase;
				}
				else {
					$(this).addClass("caps-one");
					currentMode = caps;
				}
				var startTime = new Date().getTime();
				if(startTime - endTime < 200){
					$(this).removeClass("caps-one");
					$(this).addClass("caps-long");
					currentMode = caps;
				}
			});
			$(".ui-keyboard-capslock", element).on("touchend", function(e){
				e.stopPropagation();
				endTime = new Date().getTime();
			});
			clickEffect($(".ui-keyboard-key", element).not(".ui-keyboard-capslock").find("span"));
		}
		
		//键盘DOM对象
		this.elem = element = document.createElement("div");
		//配置键盘类名
		element.className = classGenerator();
		setContent();
		rendering();
		eventMonitor();
		currentMode = lowercase;
		
		return this;
    }
	
	$.fn.keyboard = function(options){
		return this.each(function(){
			(new $.keyboard(this, options));
		});
	};
	$.fun = $.keyboard.prototype;
	
	/**
	 * 显示键盘
	 */
	$.fun.show = function(){
		
	}
	
	/**
	 * 隐藏键盘
	 */
	$.fun.hide = function(){
		
	}
	
})(jQuery);