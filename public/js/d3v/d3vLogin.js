/*
 @description ASIDE login page js
 @date 6.1.2013
 @author phil rymek
*/
(function() {	

	var D3V_URL = (document.location.href.indexOf('aside-dev') !== -1 ? 'https://aside-dev.herokuapp.com' : 'https://www.aside.io');

	/**
	 * @description log into salesforce
	 * @param		orgType - test or login
	 **/
	function login(orgType) {
		if(cannotLogin) {
			return;
		}
		
		if(isDevVersion()) {
			window.open(
				'https://' + orgType + '.salesforce.com/services/oauth2/authorize' +
				'?response_type=code' +
				'&client_id=3MVG9A2kN3Bn17hsGwcg_vs7vMv5CumLywdM2cVbcJBS9DVfdShKGnaJ2fq9eiYII7_tkvmRGeItas2jVRQmg' + 
				'&redirect_uri=https%3A%2F%2Faside-dev.herokuapp.com%2Fauth' +
				'&state=' + (orgType === 'test' ? 'a' : 'b'), '_self');		
		} else {
			window.open(
				'https://' + orgType + '.salesforce.com/services/oauth2/authorize' +
				'?response_type=code' +
				'&client_id=3MVG9A2kN3Bn17hsGwcg_vs7vMprfDMZGgJ_TtBy_RiNykKQ881YW_7JxigQe9d6ZOjjLDLSXvHLICGWCGntf' +
				'&redirect_uri=https%3A%2F%2Fwww.aside.io%2Fauth' +
				'&state=' + (orgType === 'test' ? 'c' : 'd'), '_self');		
		
		}
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
	
	function isDevVersion() {
		return document.location.href.indexOf('aside-dev.herokuapp.com') !== -1;
	}
	
	function setFooterText() {
		var $footer = $('span.copyright');
		
		if(isDevVersion()) {
			$footer.html('ASIDE 1.0.0  |  stable build @ <a href="https://www.aside.io/">aside.io</a>');
		} else {
			$footer.html('ASIDE 1.0.0  |  dev build @ <a href="https://aside-dev.herokuapp.com/">aside-dev.herokuapp.com</a>');
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
	
	$(document).ready(function() {
		cannotLogin = false;
		setFooterText();
		checkBrowserCompatibility();
		bindActions();
		recoverFromError();
	});
	
})();