/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(typeof Crypto=="undefined"||!Crypto.util)&&function(){var e=window.Crypto={},g=e.util={rotl:function(a,b){return a<<b|a>>>32-b},rotr:function(a,b){return a<<32-b|a>>>b},endian:function(a){if(a.constructor==Number)return g.rotl(a,8)&16711935|g.rotl(a,24)&4278255360;for(var b=0;b<a.length;b++)a[b]=g.endian(a[b]);return a},randomBytes:function(a){for(var b=[];a>0;a--)b.push(Math.floor(Math.random()*256));return b},bytesToWords:function(a){for(var b=[],c=0,d=0;c<a.length;c++,d+=8)b[d>>>5]|=(a[c]&255)<<
24-d%32;return b},wordsToBytes:function(a){for(var b=[],c=0;c<a.length*32;c+=8)b.push(a[c>>>5]>>>24-c%32&255);return b},bytesToHex:function(a){for(var b=[],c=0;c<a.length;c++)b.push((a[c]>>>4).toString(16)),b.push((a[c]&15).toString(16));return b.join("")},hexToBytes:function(a){for(var b=[],c=0;c<a.length;c+=2)b.push(parseInt(a.substr(c,2),16));return b},bytesToBase64:function(a){if(typeof btoa=="function")return btoa(f.bytesToString(a));for(var b=[],c=0;c<a.length;c+=3)for(var d=a[c]<<16|a[c+1]<<
8|a[c+2],e=0;e<4;e++)c*8+e*6<=a.length*8?b.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d>>>6*(3-e)&63)):b.push("=");return b.join("")},base64ToBytes:function(a){if(typeof atob=="function")return f.stringToBytes(atob(a));for(var a=a.replace(/[^A-Z0-9+\/]/ig,""),b=[],c=0,d=0;c<a.length;d=++c%4)d!=0&&b.push(("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(c-1))&Math.pow(2,-2*d+8)-1)<<d*2|"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(c))>>>
6-d*2);return b}},e=e.charenc={};e.UTF8={stringToBytes:function(a){return f.stringToBytes(unescape(encodeURIComponent(a)))},bytesToString:function(a){return decodeURIComponent(escape(f.bytesToString(a)))}};var f=e.Binary={stringToBytes:function(a){for(var b=[],c=0;c<a.length;c++)b.push(a.charCodeAt(c)&255);return b},bytesToString:function(a){for(var b=[],c=0;c<a.length;c++)b.push(String.fromCharCode(a[c]));return b.join("")}}}();
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(){var c=Crypto,j=c.util,d=c.charenc,k=d.UTF8,o=d.Binary;c.PBKDF2=function(e,f,d,a){function l(a,b){return c.HMAC(p,b,a,{asBytes:!0})}e.constructor==String&&(e=k.stringToBytes(e));f.constructor==String&&(f=k.stringToBytes(f));for(var p=a&&a.hasher||c.SHA1,q=a&&a.iterations||1,b=[],m=1;b.length<d;){for(var g=l(e,f.concat(j.wordsToBytes([m]))),i=g,n=1;n<q;n++)for(var i=l(e,i),h=0;h<g.length;h++)g[h]^=i[h];b=b.concat(g);m++}b.length=d;return a&&a.asBytes?b:a&&a.asString?o.bytesToString(b):j.bytesToHex(b)}})();
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(g){function k(c,b){var a=c._blocksize*4;return a-b.length%a}var j=g.pad={},f=function(c){for(var b=c.pop(),a=1;a<b;a++)c.pop()};j.NoPadding={pad:function(){},unpad:function(){}};j.ZeroPadding={pad:function(c,b){var a=c._blocksize*4,d=b.length%a;if(d!=0)for(d=a-d;d>0;d--)b.push(0)},unpad:function(){}};j.iso7816={pad:function(c,b){var a=k(c,b);for(b.push(128);a>1;a--)b.push(0)},unpad:function(c){for(;c.pop()!=128;);}};j.ansix923={pad:function(c,b){for(var a=k(c,b),d=1;d<a;d++)b.push(0);b.push(a)},
unpad:f};j.iso10126={pad:function(c,b){for(var a=k(c,b),d=1;d<a;d++)b.push(Math.floor(Math.random()*256));b.push(a)},unpad:f};j.pkcs7={pad:function(c,b){for(var a=k(c,b),d=0;d<a;d++)b.push(a)},unpad:f};var g=g.mode={},h=g.Mode=function(c){if(c)this._padding=c};h.prototype={encrypt:function(c,b,a){this._padding.pad(c,b);this._doEncrypt(c,b,a)},decrypt:function(c,b,a){this._doDecrypt(c,b,a);this._padding.unpad(b)},_padding:j.iso7816};f=(g.ECB=function(){h.apply(this,arguments)}).prototype=new h;f._doEncrypt=
function(c,b){for(var a=c._blocksize*4,d=0;d<b.length;d+=a)c._encryptblock(b,d)};f._doDecrypt=function(c,b){for(var a=c._blocksize*4,d=0;d<b.length;d+=a)c._decryptblock(b,d)};f.fixOptions=function(c){c.iv=[]};f=(g.CBC=function(){h.apply(this,arguments)}).prototype=new h;f._doEncrypt=function(c,b,a){for(var d=c._blocksize*4,e=0;e<b.length;e+=d){if(e==0)for(var i=0;i<d;i++)b[i]^=a[i];else for(i=0;i<d;i++)b[e+i]^=b[e+i-d];c._encryptblock(b,e)}};f._doDecrypt=function(c,b,a){for(var d=c._blocksize*4,e=
0;e<b.length;e+=d){var i=b.slice(e,e+d);c._decryptblock(b,e);for(var f=0;f<d;f++)b[e+f]^=a[f];a=i}};f=(g.CFB=function(){h.apply(this,arguments)}).prototype=new h;f._padding=j.NoPadding;f._doEncrypt=function(c,b,a){for(var d=c._blocksize*4,a=a.slice(0),e=0;e<b.length;e++){var f=e%d;f==0&&c._encryptblock(a,0);b[e]^=a[f];a[f]=b[e]}};f._doDecrypt=function(c,b,a){for(var d=c._blocksize*4,a=a.slice(0),e=0;e<b.length;e++){var f=e%d;f==0&&c._encryptblock(a,0);var g=b[e];b[e]^=a[f];a[f]=g}};f=(g.OFB=function(){h.apply(this,
arguments)}).prototype=new h;f._padding=j.NoPadding;f._doEncrypt=function(c,b,a){for(var d=c._blocksize*4,a=a.slice(0),e=0;e<b.length;e++)e%d==0&&c._encryptblock(a,0),b[e]^=a[e%d]};f._doDecrypt=f._doEncrypt;g=(g.CTR=function(){h.apply(this,arguments)}).prototype=new h;g._padding=j.NoPadding;g._doEncrypt=function(c,b,a){for(var d=c._blocksize*4,a=a.slice(0),e=0;e<b.length;){var f=a.slice(0);c._encryptblock(f,0);for(var g=0;e<b.length&&g<d;g++,e++)b[e]^=f[g];++a[d-1]==256&&(a[d-1]=0,++a[d-2]==256&&
(a[d-2]=0,++a[d-3]==256&&(a[d-3]=0,++a[d-4])))}};g._doDecrypt=g._doEncrypt})(Crypto);
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(){function m(a,d){for(var c=0,b=0;b<8;b++){d&1&&(c^=a);var e=a&128,a=a<<1&255;e&&(a^=27);d>>>=1}return c}for(var k=Crypto,v=k.util,x=k.charenc.UTF8,h=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,
208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,
206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],w=[],e=0;e<256;e++)w[h[e]]=e;for(var o=[],p=[],q=[],r=[],s=[],t=[],e=0;e<256;e++)o[e]=m(e,2),p[e]=m(e,3),q[e]=m(e,9),r[e]=m(e,11),s[e]=m(e,13),t[e]=m(e,14);var y=[0,1,2,4,8,16,32,64,128,27,54],a=[[],[],[],[]],f,l,g,i=k.AES={encrypt:function(a,d,c){var c=c||{},b=c.mode||new k.mode.OFB;b.fixOptions&&b.fixOptions(c);var a=a.constructor==String?x.stringToBytes(a):a,e=c.iv||v.randomBytes(i._blocksize*4),d=d.constructor==String?k.PBKDF2(d,
e,32,{asBytes:!0}):d;i._init(d);b.encrypt(i,a,e);a=c.iv?a:e.concat(a);return c&&c.asBytes?a:v.bytesToBase64(a)},decrypt:function(a,d,c){var c=c||{},b=c.mode||new k.mode.OFB;b.fixOptions&&b.fixOptions(c);var a=a.constructor==String?v.base64ToBytes(a):a,e=c.iv||a.splice(0,i._blocksize*4),d=d.constructor==String?k.PBKDF2(d,e,32,{asBytes:!0}):d;i._init(d);b.decrypt(i,a,e);return c&&c.asBytes?a:x.bytesToString(a)},_blocksize:4,_encryptblock:function(n,d){for(var c=0;c<i._blocksize;c++)for(var b=0;b<4;b++)a[c][b]=
n[d+b*4+c];for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[b][c];for(var e=1;e<l;e++){for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]=h[a[c][b]];a[1].push(a[1].shift());a[2].push(a[2].shift());a[2].push(a[2].shift());a[3].unshift(a[3].pop());for(b=0;b<4;b++){var c=a[0][b],f=a[1][b],u=a[2][b],j=a[3][b];a[0][b]=o[c]^p[f]^u^j;a[1][b]=c^o[f]^p[u]^j;a[2][b]=c^f^o[u]^p[j];a[3][b]=p[c]^f^u^o[j]}for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[e*4+b][c]}for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]=h[a[c][b]];a[1].push(a[1].shift());
a[2].push(a[2].shift());a[2].push(a[2].shift());a[3].unshift(a[3].pop());for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[l*4+b][c];for(c=0;c<i._blocksize;c++)for(b=0;b<4;b++)n[d+b*4+c]=a[c][b]},_decryptblock:function(n,d){for(var c=0;c<i._blocksize;c++)for(var b=0;b<4;b++)a[c][b]=n[d+b*4+c];for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[l*4+b][c];for(var e=1;e<l;e++){a[1].unshift(a[1].pop());a[2].push(a[2].shift());a[2].push(a[2].shift());a[3].push(a[3].shift());for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]=w[a[c][b]];
for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[(l-e)*4+b][c];for(b=0;b<4;b++){var c=a[0][b],f=a[1][b],h=a[2][b],j=a[3][b];a[0][b]=t[c]^r[f]^s[h]^q[j];a[1][b]=q[c]^t[f]^r[h]^s[j];a[2][b]=s[c]^q[f]^t[h]^r[j];a[3][b]=r[c]^s[f]^q[h]^t[j]}}a[1].unshift(a[1].pop());a[2].push(a[2].shift());a[2].push(a[2].shift());a[3].push(a[3].shift());for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]=w[a[c][b]];for(c=0;c<4;c++)for(b=0;b<4;b++)a[c][b]^=g[b][c];for(c=0;c<i._blocksize;c++)for(b=0;b<4;b++)n[d+b*4+c]=a[c][b]},_init:function(a){f=
a.length/4;l=f+6;i._keyexpansion(a)},_keyexpansion:function(a){g=[];for(var d=0;d<f;d++)g[d]=[a[d*4],a[d*4+1],a[d*4+2],a[d*4+3]];for(d=f;d<i._blocksize*(l+1);d++)a=[g[d-1][0],g[d-1][1],g[d-1][2],g[d-1][3]],d%f==0?(a.push(a.shift()),a[0]=h[a[0]],a[1]=h[a[1]],a[2]=h[a[2]],a[3]=h[a[3]],a[0]^=y[d/f]):f>6&&d%f==4&&(a[0]=h[a[0]],a[1]=h[a[1]],a[2]=h[a[2]],a[3]=h[a[3]]),g[d]=[g[d-f][0]^a[0],g[d-f][1]^a[1],g[d-f][2]^a[2],g[d-f][3]^a[3]]}}})();
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(){var l=Crypto,m=l.util,n=l.charenc,p=n.UTF8,o=n.Binary,k=l.MD5=function(a,e){var g=m.wordsToBytes(k._md5(a));return e&&e.asBytes?g:e&&e.asString?o.bytesToString(g):m.bytesToHex(g)};k._md5=function(a){a.constructor==String&&(a=p.stringToBytes(a));for(var e=m.bytesToWords(a),g=a.length*8,a=1732584193,c=-271733879,d=-1732584194,b=271733878,f=0;f<e.length;f++)e[f]=(e[f]<<8|e[f]>>>24)&16711935|(e[f]<<24|e[f]>>>8)&4278255360;e[g>>>5]|=128<<g%32;e[(g+64>>>9<<4)+14]=g;for(var g=k._ff,h=k._gg,i=
k._hh,j=k._ii,f=0;f<e.length;f+=16)var l=a,n=c,o=d,q=b,a=g(a,c,d,b,e[f+0],7,-680876936),b=g(b,a,c,d,e[f+1],12,-389564586),d=g(d,b,a,c,e[f+2],17,606105819),c=g(c,d,b,a,e[f+3],22,-1044525330),a=g(a,c,d,b,e[f+4],7,-176418897),b=g(b,a,c,d,e[f+5],12,1200080426),d=g(d,b,a,c,e[f+6],17,-1473231341),c=g(c,d,b,a,e[f+7],22,-45705983),a=g(a,c,d,b,e[f+8],7,1770035416),b=g(b,a,c,d,e[f+9],12,-1958414417),d=g(d,b,a,c,e[f+10],17,-42063),c=g(c,d,b,a,e[f+11],22,-1990404162),a=g(a,c,d,b,e[f+12],7,1804603682),b=g(b,a,
c,d,e[f+13],12,-40341101),d=g(d,b,a,c,e[f+14],17,-1502002290),c=g(c,d,b,a,e[f+15],22,1236535329),a=h(a,c,d,b,e[f+1],5,-165796510),b=h(b,a,c,d,e[f+6],9,-1069501632),d=h(d,b,a,c,e[f+11],14,643717713),c=h(c,d,b,a,e[f+0],20,-373897302),a=h(a,c,d,b,e[f+5],5,-701558691),b=h(b,a,c,d,e[f+10],9,38016083),d=h(d,b,a,c,e[f+15],14,-660478335),c=h(c,d,b,a,e[f+4],20,-405537848),a=h(a,c,d,b,e[f+9],5,568446438),b=h(b,a,c,d,e[f+14],9,-1019803690),d=h(d,b,a,c,e[f+3],14,-187363961),c=h(c,d,b,a,e[f+8],20,1163531501),
a=h(a,c,d,b,e[f+13],5,-1444681467),b=h(b,a,c,d,e[f+2],9,-51403784),d=h(d,b,a,c,e[f+7],14,1735328473),c=h(c,d,b,a,e[f+12],20,-1926607734),a=i(a,c,d,b,e[f+5],4,-378558),b=i(b,a,c,d,e[f+8],11,-2022574463),d=i(d,b,a,c,e[f+11],16,1839030562),c=i(c,d,b,a,e[f+14],23,-35309556),a=i(a,c,d,b,e[f+1],4,-1530992060),b=i(b,a,c,d,e[f+4],11,1272893353),d=i(d,b,a,c,e[f+7],16,-155497632),c=i(c,d,b,a,e[f+10],23,-1094730640),a=i(a,c,d,b,e[f+13],4,681279174),b=i(b,a,c,d,e[f+0],11,-358537222),d=i(d,b,a,c,e[f+3],16,-722521979),
c=i(c,d,b,a,e[f+6],23,76029189),a=i(a,c,d,b,e[f+9],4,-640364487),b=i(b,a,c,d,e[f+12],11,-421815835),d=i(d,b,a,c,e[f+15],16,530742520),c=i(c,d,b,a,e[f+2],23,-995338651),a=j(a,c,d,b,e[f+0],6,-198630844),b=j(b,a,c,d,e[f+7],10,1126891415),d=j(d,b,a,c,e[f+14],15,-1416354905),c=j(c,d,b,a,e[f+5],21,-57434055),a=j(a,c,d,b,e[f+12],6,1700485571),b=j(b,a,c,d,e[f+3],10,-1894986606),d=j(d,b,a,c,e[f+10],15,-1051523),c=j(c,d,b,a,e[f+1],21,-2054922799),a=j(a,c,d,b,e[f+8],6,1873313359),b=j(b,a,c,d,e[f+15],10,-30611744),
d=j(d,b,a,c,e[f+6],15,-1560198380),c=j(c,d,b,a,e[f+13],21,1309151649),a=j(a,c,d,b,e[f+4],6,-145523070),b=j(b,a,c,d,e[f+11],10,-1120210379),d=j(d,b,a,c,e[f+2],15,718787259),c=j(c,d,b,a,e[f+9],21,-343485551),a=a+l>>>0,c=c+n>>>0,d=d+o>>>0,b=b+q>>>0;return m.endian([a,c,d,b])};k._ff=function(a,e,g,c,d,b,f){a=a+(e&g|~e&c)+(d>>>0)+f;return(a<<b|a>>>32-b)+e};k._gg=function(a,e,g,c,d,b,f){a=a+(e&c|g&~c)+(d>>>0)+f;return(a<<b|a>>>32-b)+e};k._hh=function(a,e,g,c,d,b,f){a=a+(e^g^c)+(d>>>0)+f;return(a<<b|a>>>
32-b)+e};k._ii=function(a,e,g,c,d,b,f){a=a+(g^(e|~c))+(d>>>0)+f;return(a<<b|a>>>32-b)+e};k._blocksize=16;k._digestsize=16})();
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(){var j=Crypto,n=j.util,l=j.charenc,p=l.UTF8,o=l.Binary,i=j.SHA1=function(a,g){var c=n.wordsToBytes(i._sha1(a));return g&&g.asBytes?c:g&&g.asString?o.bytesToString(c):n.bytesToHex(c)};i._sha1=function(a){a.constructor==String&&(a=p.stringToBytes(a));var g=n.bytesToWords(a),c=a.length*8,a=[],h=1732584193,d=-271733879,e=-1732584194,f=271733878,k=-1009589776;g[c>>5]|=128<<24-c%32;g[(c+64>>>9<<4)+15]=c;for(c=0;c<g.length;c+=16){for(var i=h,j=d,l=e,o=f,q=k,b=0;b<80;b++){if(b<16)a[b]=g[c+b];else{var m=
a[b-3]^a[b-8]^a[b-14]^a[b-16];a[b]=m<<1|m>>>31}m=(h<<5|h>>>27)+k+(a[b]>>>0)+(b<20?(d&e|~d&f)+1518500249:b<40?(d^e^f)+1859775393:b<60?(d&e|d&f|e&f)-1894007588:(d^e^f)-899497514);k=f;f=e;e=d<<30|d>>>2;d=h;h=m}h+=i;d+=j;e+=l;f+=o;k+=q}return[h,d,e,f,k]};i._blocksize=16;i._digestsize=20})();
/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
(function(){var c=Crypto,i=c.util,g=c.charenc,h=g.UTF8,j=g.Binary;c.HMAC=function(b,d,a,e){d.constructor==String&&(d=h.stringToBytes(d));a.constructor==String&&(a=h.stringToBytes(a));a.length>b._blocksize*4&&(a=b(a,{asBytes:!0}));for(var c=a.slice(0),a=a.slice(0),f=0;f<b._blocksize*4;f++)c[f]^=92,a[f]^=54;b=b(c.concat(b(a.concat(d),{asBytes:!0})),{asBytes:!0});return e&&e.asBytes?b:e&&e.asString?j.bytesToString(b):i.bytesToHex(b)}})();
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2011                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
};

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
};