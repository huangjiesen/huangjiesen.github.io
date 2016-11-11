!function($){var execute=function(value,rule){var paramArr,index=rule.indexOf("[");index>0&&(paramArr=rule.substring(index+1,rule.length-1).split(","),rule=rule.substr(0,index));var method=$.fn.validate.rules[rule];if(method)return method(value,paramArr);throw new Error("没有发现校验规则："+rule)},validate=function(obj){var rule=obj.data("rule");rule.onBefore&&rule.onBefore(obj,rule.msg);var value=obj.val();if(rule.trim&&obj.val(value=$.trim(value)),""==value)return!rule.required||(rule.onEmpty&&rule.onEmpty(obj,rule.msg),rule.isEmpty=!0,!1);if(rule.isEmpty=!1,rule.validType){var isOk,type=rule.validType,validType=void 0;switch(typeof type){case"function":isOk=type(value);break;case"string":isOk=execute(value,type);break;default:if(!(type instanceof Array))throw new Error("校验类型validType的参数值不正确，请指定字符串类型的规则名称或直接指定校验函数，需传多个规则名称可用数组方式");$.each(type,function(i,n){if(!(isOk=execute(value,n)))return validType=n,!1})}if(!isOk)return rule.onInvalid&&rule.onInvalid(obj,rule.msg,validType),!1}return!0},bindRule=function(obj,rule){obj.data("rule",rule),unBind(obj),obj.bind("focus",function(){$.fn.validate.style.focus(obj,rule.msg)}),$.fn.validate.style.focusout&&obj.bind("focusout",function(){$.fn.validate.style.focusout(obj,rule.msg)})},unBind=function(target){target.data("rule",void 0),target.unbind("focus",$.fn.validate.style.focus),target.unbind("focusout",$.fn.validate.style.focusout)};$.fn.validate=function(options){if("string"==typeof options){if(2==arguments.length){var opt=this.data("rule")||$.fn.validate.defaults;bindRule(this,$.extend({},opt,arguments[1]))}var method=$.fn.validate.method[options];if(method)return method(this);throw new Error("方法："+options+"未定义。可调用方法有(validate|destroy)")}return options=options||{},bindRule(this,$.extend({},$.fn.validate.defaults,options)),this},$.fn.validate.defaults={trim:!0,required:!1,validType:null,msg:null,onBefore:null,onEmpty:null,onInvalid:null},$.fn.validate.method={validate:function(obj){var rule=obj.data("rule");return validate(obj)?($.fn.validate.style.ok(obj,rule.msg),!0):($.fn.validate.style.error(obj,rule.msg,rule.isEmpty),!1)},destroy:unBind},$.fn.validate.style={ok:function(){},error:function(){},focus:function(){},focusout:function(obj){$.fn.validate.method.validate(obj)}},$.fn.validate.rules={phone:function(value){return/^1(3|4|5|7|8)\d{9}$/.test(value)},email:function(value){return/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value)},url:function(value){return/^https?:\/\/([\dA-Za-z\.-]+)\.([A-Za-z\.]{2,6})([\/\w \.-]*)*\/?(\?.+)?$/.test(value)},length:function(value,param){return value>=param[0]&&value<=param[1]}},$.fn.formToJson=function(){if(!this.is("form"))throw new Error("当前元素非form表单元素");var obj={};return $.each(this.serializeArray(),function(){obj[this.name]?obj[this.name]=obj[this.name]+","+this.value:obj[this.name]=this.value}),obj}}(jQuery);
