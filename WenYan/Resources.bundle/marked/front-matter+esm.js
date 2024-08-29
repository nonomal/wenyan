/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/front-matter@4.0.2/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import e from './js-yaml+esm.js';var t="undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{};function n(){throw new Error("setTimeout has not been defined")}function r(){throw new Error("clearTimeout has not been defined")}var o=n,i=r;function a(e){if(o===setTimeout)return setTimeout(e,0);if((o===n||!o)&&setTimeout)return o=setTimeout,setTimeout(e,0);try{return o(e,0)}catch(t){try{return o.call(null,e,0)}catch(t){return o.call(this,e,0)}}}"function"==typeof t.setTimeout&&(o=setTimeout),"function"==typeof t.clearTimeout&&(i=clearTimeout);var u,f=[],l=!1,s=-1;function c(){l&&u&&(l=!1,u.length?f=u.concat(f):s=-1,f.length&&m())}function m(){if(!l){var e=a(c);l=!0;for(var t=f.length;t;){for(u=f,f=[];++s<t;)u&&u[s].run();s=-1,t=f.length}u=null,l=!1,function(e){if(i===clearTimeout)return clearTimeout(e);if((i===r||!i)&&clearTimeout)return i=clearTimeout,clearTimeout(e);try{return i(e)}catch(t){try{return i.call(null,e)}catch(t){return i.call(this,e)}}}(e)}}function d(e,t){this.fun=e,this.array=t}d.prototype.run=function(){this.fun.apply(null,this.array)};function w(){}var h=w,p=w,v=w,y=w,g=w,b=w,T=w;var x=t.performance||{},E=x.now||x.mozNow||x.msNow||x.oNow||x.webkitNow||function(){return(new Date).getTime()};var B=new Date;var L={nextTick:function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];f.push(new d(e,t)),1!==f.length||l||a(m)},title:"browser",browser:!0,env:{},argv:[],version:"",versions:{},on:h,addListener:p,once:v,off:y,removeListener:g,removeAllListeners:b,emit:T,binding:function(e){throw new Error("process.binding is not supported")},cwd:function(){return"/"},chdir:function(e){throw new Error("process.chdir is not supported")},umask:function(){return 0},hrtime:function(e){var t=.001*E.call(x),n=Math.floor(t),r=Math.floor(t%1*1e9);return e&&(n-=e[0],(r-=e[1])<0&&(n--,r+=1e9)),[n,r]},platform:"browser",release:{},config:{},uptime:function(){return(new Date-B)/1e3}},N={exports:{}},U=e,k=new RegExp("^(\\ufeff?(= yaml =|---)$([\\s\\S]*?)^(?:\\2|\\.\\.\\.)\\s*$"+("win32"===(void 0!==L?L.platform:"")?"\\r?":"")+"(?:\\n)?)","m");N.exports=function(e,t){e=e||"";var n={allowUnsafe:!1};(t=t instanceof Object?{...n,...t}:n).allowUnsafe=Boolean(t.allowUnsafe);var r=e.split(/(\r?\n)/);return r[0]&&/= yaml =|---/.test(r[0])?function(e,t){var n=k.exec(e);if(!n)return{attributes:{},body:e,bodyBegin:1};var r=t?U.load:U.safeLoad,o=n[n.length-1].replace(/^\s+|\s+$/g,""),i=r(o)||{},a=e.replace(n[0],""),u=function(e,t){var n=1,r=t.indexOf("\n"),o=e.index+e[0].length;for(;-1!==r;){if(r>=o)return n;n++,r=t.indexOf("\n",r+1)}return n}(n,e);return{attributes:i,body:a,bodyBegin:u,frontmatter:o}}(e,t.allowUnsafe):{attributes:{},body:e,bodyBegin:1}};var D=N.exports.test=function(e){return e=e||"",k.test(e)};var O=N.exports;export{O as default,D as test};
//# sourceMappingURL=/sm/1ed359efcd653de05b4f9c4b9b82a1fc5fc109a900ce5802ea8dbe3345a59f53.map