/*
 @description Simple methods to work with cookies.
 @date 		  6.6.2012
 @author	  http://www.quirksmode.org/js/cookies.html
 @modified by phil rymek
 
 Copyright (c) 2018, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/
var CookieUtil = {

	//cookie expiration constant
	COOKIE_EXP : 7200000,

	/**
	 * @description Removes all d3v-related cookies
	 **/
	clearAllCookies : function() {
	 	CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_SID);
		CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_MEP);
		CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_AEP);
		CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_PEP);
		CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_UID);
		CookieUtil.eraseCookie(COOKIE_PRE + COOKIE_RTK);	 
	},

	/**
	 * @description read a cookie
	 * @param		name of cookie
	 * @return		cookie value
	 * @courtesy of http://www.quirksmode.org/js/cookies.html
	 **/
	readCookie : function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		
		return null;
	},
	
	/**
	 * @description Helper method for creating a cookie.
	 * @from		http://www.quirksmode.org/js/cookies.html
	 * @param		name  - cookie name
	 * @param		value - cookie value
	 * @param		days  - expiry date, optional
	 **/
	createCookie : function(name, value, days) {
		var date = new Date();
		var expiryMs = days ? days*24*60*60*1000 : this.COOKIE_EXP;
		date.setTime(date.getTime() + expiryMs);
		var expires = "; expires="+date.toGMTString();
		document.cookie = name+"="+value+expires+"; path=/";
	},

	/**
	 * @description Erases a cookie
	 * @from		http://www.quirksmode.org/js/cookies.html
	 * @param		name  - cookie name
	 **/					
	eraseCookie : function(name) {
		CookieUtil.createCookie(name, "", -1);
	},

	/**
	 * @description Determines if all cookies necessary are present.
	 * @return		true when all cookies are present, false when they are not
	 **/		
	hasAllCookies : function() {
		return CookieUtil.readCookie(COOKIE_PRE + COOKIE_SID) &&
		       CookieUtil.readCookie(COOKIE_PRE + COOKIE_MEP) &&
		       CookieUtil.readCookie(COOKIE_PRE + COOKIE_AEP) &&
		       CookieUtil.readCookie(COOKIE_PRE + COOKIE_PEP) &&
		       CookieUtil.readCookie(COOKIE_PRE + COOKIE_UID);
	},

	/**
	 * @description Clones all cookies into a js object
	 **/		
	setCookieClone : function() {
		cookieClone = {};
		if(CookieUtil.hasAllCookies()) {
			//Thanks Pointy!
			//http://stackoverflow.com/questions/2239520/how-can-i-iterate-over-cookies-using-jquery-or-just-javascript
			cookieClone = {};
			$.each(document.cookie.split(/; */), function()  {
				var splitCookie = this.split('=');
			 	cookieClone[splitCookie[0]] = splitCookie[1];
			});
		}
	},

	/**
	 * @description Creates all cookies from the js object version
	 **/		
	setCookiesFromClone : function() {
		if(!CookieUtil.hasAllCookies()) {
			for(var prop in cookieClone) {
				if(cookieClone.hasOwnProperty(prop)) {
					CookieUtil.createCookie(prop, cookieClone[prop]);
				}		
			}		
		}
	}
	
}