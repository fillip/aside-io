/*
 @description ASIDE login page js
 @date 6.1.2013
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/
(function() {	

	var D3V_URL;
	var D3V_CID; 
	var D3V_GID;
	
	/**
	 * @description log into salesforce
	 * @param		orgType - test or login
	 **/
	function login(orgType) {
		if(cannotLogin) {
			return;
		}
		
		window.open(
			'https://' + orgType + '.salesforce.com/services/oauth2/authorize' +
			'?response_type=code' +
			'&client_id=' + D3V_CID + 
			'&redirect_uri=' + encodeURIComponent(D3V_URL + '/auth') + 
			'&state=' + orgType, '_self');
	}

	/**
	 * @description Logs into a sandbox org with the given credentials
	 **/
	function loginToD3VSandbox() {
		login('test');
	}

	/**
	 * @description Logs into a production org with the given credentials
	 **/
	function loginToD3VProduction() {
		login('login');
	}
	
	function checkBrowserCompatibility() {
		var supportsLocalStorage = false;
		var supportsIndexedDB = false;
		
		try {
			localStorage;
			supportsLocalStorage = true;
		} catch(ex) {
			supportsLocalStorage = false;
		}
		
		supportsIndexedDB = (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB) !== undefined;
		if(!supportsIndexedDB && !supportsLocalStorage) {
			$('a.sandbox, a.production').unbind().click(function() {
				cannotLogin = true;
				alert('Your browser does not support HTML5 Local Storage or Indexed DB.  Try ASIDE with the newest version of Google Chrome or Mozilla Firefox for the best experience.');
			});
		} else if(!supportsLocalStorage) {
			$('a.sandbox, a.production').unbind().click(function() {
				cannotLogin = true;
				alert('Your browser does not support HTML5 Local Storage.  Try ASIDE with the newest version of Google Chrome or Mozilla Firefox for the best experience.');
			});
		} else if(!supportsIndexedDB) {
			$('a.sandbox, a.production').unbind().click(function() {
				cannotLogin = true;
				alert('Your browser does not support HTML5 Indexed DB.  Try ASIDE with the newest version of Google Chrome or Mozilla Firefox for the best experience.');
			});
		}
	}
	
	function bindActions() {
		$('a.sandbox').click(loginToD3VSandbox);
		$('a.production').click(loginToD3VProduction);
	}
	
	function consumeErrorCookies() {
		var errorType = CookieUtil.readCookie('d3vlf1');
		var errorDesc = CookieUtil.readCookie('d3vlf2');
		
		if(errorType && errorDesc) {
			errorType = errorType.replace(/\_/g, ' ');
			errorDesc = errorDesc.replace(/\+/g, ' ');

			var errorSuffix = '';
			if(errorType === 'invalid grant' && errorDesc === 'ip restricted or invalid login hours') {
				errorSuffix = '\n\nYou are encountering this error because the Salesforce org you ' +
				              'are trying to login to has IP restrictions and ASIDE.IO has a dynamic IP address ' +
				              'that does not meet those restrictions.';
			}
			
			alert('Failed to login :(\n\nReason: ' + errorType + ' - ' + errorDesc + errorSuffix + 
				  '\n\nIf you feel this is an error please email admin at aside dot io.');
		}
		
		CookieUtil.eraseCookie('d3vlf1');
		CookieUtil.eraseCookie('d3vlf2');
	}
	
	function recoverFromError() {
		consumeErrorCookies();
		autoLogin();
	}
	
	function autoLogin() {
		var url = window.location.href;
		
		if(url.indexOf('autologp=1') !== -1) {
			loginToD3VProduction();	
		} else if(url.indexOf('autologd=1') !== -1) {
			loginToD3VSandbox();
		}
	}
	
	function setConstants() {
		$.post('/vars', function(result) {
			result = JSON.parse(result);
			D3V_URL = result.url;
			D3V_CID = result.cid;
			D3V_GID = result.gid;
			
			setupGoogleAnalytics();
		});
	}
	
	function setupGoogleAnalytics() {
		if(D3V_GID && D3V_GID.length) {
		    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		
		    ga('create', D3V_GID, 'auto');
		    ga('send', 'pageview');
		}
	}
	
	$(document).ready(function() {
		cannotLogin = false;
		setConstants();
		checkBrowserCompatibility();
		bindActions();
		recoverFromError();
	});
	
})();