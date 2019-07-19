/*
 @description Various utility methods that do not align with a particular mode
 			  as well as code for initializing d3v.
 @date 		  7.19.2012
 @author	  phil rymek
*/
var d3vUtil = {

	/**
	 * @description Resizes d3v to fit in the new window dimensions
	 * param        options - window resize options
	 **/
	resizeWindow : function(options) {
		var override = options && options.force === true;
		var done     = false;
		
		d3vUtil.positionAlert($('span#center'));
		d3vUtil.sizeHelp();
		d3vPopups.resizeGlobalPanel();	
		
		if(override || d3vData.isActive()) {
			d3vUtil.sizeGrid();
			d3vUtil.sizeViewport();
			
			done = !override;
		}
		
		if(!done && (override || d3vCode.isActive())) {
			d3vUtil.sizeEditor();
			d3vCode.resizeCodeTypeahead();
			d3vUtil.dragResizeEditors();
			editor.renderer.onResize(true);
			rightEditor.renderer.onResize(true);
			done = !override;
		}
		
		if(!done && (override || d3vTest.isActive())) {
			d3vTest.sizeMethodTable();
			d3vTest.resizeCoverageDialog();
			done = !override;
		}
		
		if(!done && (override || d3vPush.isActive())) {
			d3vPush.sizePushScreen();
		}

		d3vUtil.sizeContent();
	},
	
	/**
	 * @description Fires when the user finishes resizing the screen
	 **/
	handleResizeEnd : function() {
		d3vPopups.repositionDiffEditor($('#global-panel'), $('#diff-gutter'), $(window).width());	
		d3vUtil.dragResizeEditors();
		d3vUtil.resizeWindow();		
	},
	
	/**
	 * @description Wrapper for user driven calls to resizeWindow (e.g. user actually resizes window)
	 **/
	handleWindowResize : function() {
		d3vUtil.resizeWindow();
		clearTimeout(resizeEndTimer)
		resizeEndTime = setTimeout(d3vUtil.handleResizeEnd, RESIZE_END_DELAY);		
	},
	
	/**
	 * @description Determines if the current browser is safari
	 * @returns     true if safari, false otherwise
	 **/
	isSafari : function() {
		var navi = navigator.userAgent.toLowerCase();
		return /safari/.test(navi) && !/chrome/.test(navi);
	},
	
	/**
	 * @description Resizes the code editors when the gutter is dragged
	 * @param       $gutter - the gutter jquery obj
	 **/
	dragResizeEditors : function($gutter) {
		$gutter = $gutter || $('div#diff-gutter');
		
		var containerWidth = $('#diff-container').innerWidth();
		
		if($gutter.is(':visible')) {
			var gutterLocation = $gutter.offset().left;
			var rightWidth = containerWidth - (gutterLocation + $gutter.outerWidth());
			
			$('#left-editor').width(gutterLocation);
			$('#right-editor').css({ width : rightWidth, left : (gutterLocation + $gutter.outerWidth())});			
		} else {
			$('#left-editor').width(containerWidth);
		}
	},
	
	/**
	 * @description Set the diff editor width preference (remembered as a % because you might not open the window the same size)
	 **/
	changeDiffEditorWidths : function() {
		localStorage[COOKIE_PRE + DIFF_EDITOR_WIDTHS] = 
			$('#left-editor').width() / 
			$('#diff-container').innerWidth();
	},
	
	/**
	 * @description Determines if a filename is valid (alphanumeric only + period)
	 * @param       filename - name of file to validate
	 * @param       allowSpaces - true to allow spaces in the filename
	 * @returns     true if filename is valid, false if not
	 **/
	isValidFilename : function(filename, allowSpaces) {
		if(filename && filename.length) {
			var result = allowSpaces ? filename.match(/^[\w*\d*\s*\.*]+$/gi) : filename.match(/^[\w*\d*\.*]+$/gi);
		
			return result !== null;
		}
		
		return false;
	},
	
	/**
	 * @description Loads the size and position of the left editor, diff gutter, and diff editor.
	 **/
	loadDiffEditorWidths : function() {
		var position = parseFloat(localStorage[COOKIE_PRE + DIFF_EDITOR_WIDTHS] || DIFF_EDITOR_WIDTHS_DEF);
		var $gutter = $('div#diff-gutter');
		var containerWidth = $('#diff-container').innerWidth();
		
		position = parseInt(position * containerWidth);
		
		var rightWidth = containerWidth - (position + $gutter.outerWidth());
		
		$('div#left-editor').width(position);
		$gutter.css({ left : position });
		$('#right-editor').css({ width : rightWidth, left : (position + $gutter.outerWidth())});	
	},
	
	/**
	 * @description Initializes drag editor resize functionality
	 **/
	setupDragResize : function() {
		d3vUtil.loadDiffEditorWidths();
		
		$('div#diff-gutter').draggable({
			axis : 'x',
			
			zIndex : 100,
			
			containment : "parent",
			
			start : function() {
			
			},
			
			drag : function() {
				d3vUtil.dragResizeEditors($(this));
			},
			
			stop : function() {
				d3vUtil.dragResizeEditors($(this));
				d3vUtil.changeDiffEditorWidths();
				d3vUtil.resizeWindow();
			}
		});	
	},
	
	/**
	 * @description Opens salesforce to the classic user detail page
	 **/
	openUserDetail : function() {
		d3vUtil.openInSalesforce('/' + aside.user.userId + '?noredirect=1');
	},

	/**
	 * @description Sets the user based org name.
	 **/
	setUserOrgName : function() {
    	if(aside.user.username && aside.user.username.indexOf('@') !== -1) {
    		orgName = aside.user.username.split('@')[1];
    	} else if(result.Username) {
    		orgName = aside.user.username;
    	} else {
    		alert('ASIDE requires cookies to work properly, but it seems like you may have them disabled.\n' +
    		      'If you encounter issues while using ASIDE, enable cookies and try again.');
    		      
    		orgName = 'unknown';
    	}	
	},
	
	/**
	 * @description Revokes the users session and refresh tokens
	 **/
	revokeSessionTokens : function() {
		if(aside && aside.org && aside.org.endpoint) {
			var replaceKey = 'TO_REPLACE';
			var baseURL = 'https://' 
			            + aside.org.endpoint 
			            + '.salesforce.com/services/oauth2/revoke?token='
			            + replaceKey
			            + '&callback=revokeSessionHandler';
			            
			d3vUtil.injectScript(baseURL.replace(replaceKey, CookieUtil.readCookie(COOKIE_PRE + COOKIE_SID)));
			d3vUtil.injectScript(baseURL.replace(replaceKey, CookieUtil.readCookie(COOKIE_PRE + COOKIE_RTK)));
		}
		
	},
	
	/**
	 * @description Callback for revoke session jsonp call
	 * @param       response - salesforce revoke response
	 **/
	revokeSessionHandler : function(response) {
		console.log('revoke response', response);
	},
	
	/**
	 * @description Adds a script to the page head
	 * @param       url - url of script to add
	 **/
	injectScript : function(url) {
		if(url && url.length) {
			var scriptTag = '<script type="text/javascript" src="THE_URL"></script>';
			
			$('head').append(scriptTag.replace('THE_URL', url));
		}
	},
	 	
	/**
	 * @description Finds the widest element given a target
	 * @param       target - selector for set of elements to find the widest of
	 * @return      the widest element of the set
	 **/
	findWidestElement : function(target) {
		var maxWidth = 0;
		var $widest  = null;
		var $element;
		
		$(target).each(function() {
			$element = $(this);
			
			if($element.width() > maxWidth){
				maxWidth = $element.width();
				$widest = $element; 
			}
		});
		
		return $widest;
	},
	
	/**
	 * @description Cleanup after the loading process completes
	 **/
	handleLoadComplete : function() {
		$('span#loading-logo').remove();
    	$('div#generic-overlay').hide();
		document.title = 'ASIDE.IO';
		localStorage.errorRecoveryInProcess = false;
	},

	/**
	 * @description Turns aside into "non admin mode" -- the paired down version you get when viewing as someone without
	 *              Modify All Data and Author Apex permissions.
	 **/
	setNonAdminMode : function() {
		$('span#non-admin-helper').trigger('click');
		d3vUtil.resizeWindow({force:true});
		$('div#push-content, div#code-content, div#test-content, span#loading-logo').remove();
		$('div#mode-buttons').find('.admin-req').remove();
		alert('Since you do not have the Modify All Data and Author Apex permissions you are viewing a version of ASIDE ' +
		      'with less features.\n\nTo utilize all of ASIDEs functionality, log in with a profile that has these ' +
		      'permissions (e.g. System Administrator).');	
	},
	
	/**
	 * @description Sets the namespace cookie for the current org
	 **/
	setNamespaceCookie : function() {
		var cookieNS = CookieUtil.readCookie('d3vns' + aside.org.orgId);
		var cookieName = 'd3vns' + d3vUtil.getOrgId();
		
		if(!aside.org.namespace && cookieNS) {
			CookieUtil.createCookie(cookieName, NS_COOKIE_VALUE_PREFIX + cookieNS.replace(NS_COOKIE_VALUE_PREFIX, ''));
		} else {
			CookieUtil.createCookie(cookieName, NS_COOKIE_VALUE_PREFIX + (aside.org.namespace || ''));
		}
	},
	
	/**
	 * @description Generic debounce function
	 * @from        https://davidwalsh.name/javascript-debounce-function
	 * @param       func - function to debounce
	 * @param       wait - timeout amount
	 * @param       If `immediate` is true, trigger the function on the leading edge, instead of the trailing
	 **/
	debounce : function(func, wait, immediate) {
		var timeout;
		
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	},
	
	/**
	 * @description Assigns a random string identifier for the current aside instance.
	 **/
	setTabId : function() {
		if(aside) {
			aside.instance = d3vUtil.getRandomString();
		}
	},
	
	/**
	 * @description Opens help and jumps directly to the log levels section
	 **/
	showLogLevels : function() {
		if(!d3vCode.isActive()) {
			d3vUtil.switchSection(CODE_SECTION);
		}
					
		d3vUtil.openHelp();
		$('#help-dialog .d3v-pop-body').scrollTop(0).scrollTop($('#debug-apexcode').position().top - 125);
	},
	
	/**
	 * @description Escapes json for safe parsing
	 * @param       json - to escape
	 * @returns     escaped json
	 **/
	jsonEscape : function(json) {
		return json.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
	},
	
	/**
	 * @description Loads everything needed from the server to initialize aside, and does the initializing
	 **/
	loadASIDE : function() {
		var oid = d3vUtil.getOrgId();
		var filterLevel = oid ? 
			(localStorage[COOKIE_PRE + d3vUtil.getOrgId() + NAMESPACE_FILTER] || 'both') :
			'both';
		
		ServerAction.initASIDE(filterLevel, function(callbackData) {
			if(!callbackData) {
				alert('Fatal authentication error occurred. Please try logging in again.');
				d3vUtil.clearCookiesAndLogout();				
				return;
			}
		
			aside = JSON.parse(callbackData);
			aside.classes = {};
			aside.triggers = {};
			
			//work-around for namespace bug
			if(aside.org.namespace && (aside.org.namespace === 'false' || aside.org.namespace === 'true')) {
				aside.org.namespace = null;
			}
			
			//potentially remove this in the future if it ends up working fine
			installedPrefix = aside.org.namespace;
			
			d3vUtil.setTabId();
			d3vUtil.setUserOrgName();
			d3vCode.setFooterData();
			d3vUtil.displayWelcomeMessage();
			d3vUtil.resizeWindow();
			d3vCode.instantiateCodeTypeahead();
			d3vCode.buildFileMaps();
			d3vData.populateSOQLTypeahead();
			d3vPush.initializePushScreen();
			d3vTest.initializeTestTypeahead();
			d3vUtil.setNamespaceCookie();
			d3vTest.loadRunSomeQuery();
			d3vTest.loadRunBySelectionOptions();
			
	    	if(aside.user.admin) {
	    		d3vTest.populateFilterTypeahead();
	    		d3vTest.loadCoverageFilter();
	    		d3vCode.loadSymbolTables();
	    		d3vCode.resetLogAllowance(true);
	    	} else {
				d3vUtil.setNonAdminMode();
	    	}	
	    	
	    	CookieUtil.setCookieClone();
	    	d3vUtil.inspectUrlParameters();
	    	d3vUtil.handleLoadComplete();
	    	d3vSync.initializeVisibilityTracking();
	    	d3vPush.updateOnloadFilterPicklist(true);
	    	d3vCode.initializeLightning();
	    	
	    	gaLoggingReady = true;
		});		
	},
	
	/**
	 * @description Returns true when aside has finished loading
	 * @param       true when done loading, false when not
	 **/
	isDoneLoading : function() {
		return aside && aside.org && aside.org.orgId && aside.org.orgId.length;
	},
	
	/**
	 * @description Determines if a given mime type is considered to be a "zip" file
	 * @param       mime - string mime type
	 * @returns     true if mime type is a zip
	 **/
	isZip : function(mime) {
		return mime === 'application/zip' || 
		       mime === 'application/octet-stream' ||
		       mime === 'application/x-zip-compressed';
	},
	
	/**
	 * @description Since the mime alone is not reliable enough for determining if a file is a zip,
	 *              this method just attempts to turn the content into a zip to see if it is a zip.
	 * @param       mime - string mime type
	 * @param       content - attempts to be loaded as a zip file, if it fails, its not a zip
	 * @returns     true if mime type is a zip
	 **/
	isZipAdvanced : function(mime, content) {
		var isZipMime = d3vUtil.isZip(mime);
		    
		if(isZipMime) {
			try {
				var test = new JSZip(content, {base64: true});
				return true;
			} catch(ex) {
				return false;
			}
		}
		
		return false;
	},	
	
	/**
	 * @description Escapes '<' and '>' so tags appear in error messages;
	 * @param       toEscape - the string to escape
	 * @return      the escaped string
	 **/
	escapeTags : function(toEscape) {
		return toEscape.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	
	/*	This work is licensed under Creative Commons GNU LGPL License.
	
		License: http://creativecommons.org/licenses/LGPL/2.1/
	   Version: 0.9
		Author:  Stefan Goessner/2006
		Web:     http://goessner.net/ 
	*/
	json2xml : function(o, tab) {
	   var toXml = function(v, name, ind) {
	      var xml = "";
	      if (v instanceof Array) {
	         for (var i=0, n=v.length; i<n; i++)
	            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
	      }
	      else if (typeof(v) == "object") {
	         var hasChild = false;
	         xml += ind + "<" + name;
	         for (var m in v) {
	            if (m.charAt(0) == "@")
	               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
	            else
	               hasChild = true;
	         }
	         xml += hasChild ? ">" : "/>";
	         if (hasChild) {
	            for (var m in v) {
	               if (m == "#text")
	                  xml += v[m];
	               else if (m == "#cdata")
	                  xml += "<![CDATA[" + v[m] + "]]>";
	               else if (m.charAt(0) != "@")
	                  xml += toXml(v[m], m, ind+"\t");
	            }
	            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
	         }
	      }
	      else {
	         xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
	      }
	      return xml;
	   }, xml="";
	   for (var m in o)
	      xml += toXml(o[m], m, "");
	   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
	},
	
	/**
	 * @description Determines if a string ends with another string.
	 * @param       str - string to inspect
	 * @param       suffix - string to consider against end of str
	 * @return      true when str ends with suffix
	 **/
	endsWith : function(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	},	
	
	/**
	 * @description Determines if a string starts with another string.
	 * @param       str - string to inspect
	 * @param       prefix - string to consider against start of str
	 * @return      true when str start with suffix
	 **/
	startsWith : function(str, prefix) {
	    return str.indexOf(prefix) === 0;
	},		
	
	/**
	 * @description Adds an option element based on item to a specified select element, in alpha order.
	 * @param		item   - the text to add
	 * @param		$select - the parent to the new option
	 * @param		type   - page|component|trigger|class
	 **/
	addOption : function(item, $select, type) {
		type            = type.toLowerCase();
		var periodIndex = type.lastIndexOf('.');
		
		if(periodIndex !== -1) {
			type = type.substring(periodIndex + 1, type.length);
		}
		
		var optgroup;
		if(type === 'class' || type === 'cls') {
			optgroup = 'Apex Classes';
		} else if(type === 'page') {
			optgroup = 'Visualforce Pages';
		} else if(type === 'trigger') {
			optgroup = 'Apex Triggers';
		} else if(type === 'component'){ 
			optgroup = 'Visualforce Components';
		} else if(type === 'resource') {
			optgroup = 'Static Resources';
		} else if(type === 'object') {
			optgroup = 'Custom Objects';
		} else if(type === 'theme') {
			optgroup = 'UI Themes';
		} else if(type === 'xml') {
			optgroup = 'Package XMLs';		
		} else if(type.indexOf('aura-') !== -1) {
			optgroup = 'Lightning Bundles';	
		}
		
		var $options = $select.find('optgroup[label="' + optgroup + '"] option');
		var inserted = false;
		var found    = false;
		
		$options.each(function(idx, ele) {
			if(item === ele.innerHTML) {
				found = true;
				return false;
			}
		});		
		
		if(!found) {
			$options.each(function(idx, ele) {
				if(item <= ele.innerHTML) {
					$(ele).before('<option>' + item + '</option>');
					inserted = true;
					return false;
				}
			});
			
			if(!inserted) {
				var $found = $select.find('optgroup[label="' + optgroup + '"]');
				
				if($found.length) {
					$found.append('<option>' + item + '</option>');
				} else {
					$select.append('<optgroup label="' + optgroup + '"><option>' + item + '</option></optgroup>');
				}
			}		
		}
	},
	
	/**
	 * @description Generates a string representing your log level preferences
	 **/
	getLogOptionsString : function() {
		var levels = [];
		
		for(var i = 0, end = LOG_LEVELS.length; i < end; i++) {
			levels.push($('#' + LOG_LEVELS_PREFIX + LOG_LEVELS[i]).val());
		}
		
		return levels.join(',');
	},

	/**
	 * @description Download a file from a hidden iframe.
	 * @param       url - location to download file from.
	 **/
	downloadFromIFrame : function(url) {
		var $downloader = $('iframe#downloader');
		if($downloader.length) {
			$downloader.attr({
				src: url
			});
		} else {
	    	$('<iframe id="downloader" style="width:0;height:0;position:absolute;top:-100px;left:-100px;"/>').attr({
    			src: url
			}).appendTo($("body"));		
		}
	},

	/**
	 * @description Capitalizes the first character of a string.
	 * @return      the current string with the first character capitalized.
	 **/
	capitalizeString : function(str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	},
	
	/**
	 * @description Sizes the slickgrids viewport.
	 **/
	sizeViewport : function() {	
		if(grid) {
			grid.resizeCanvas();
		}
	},
	
	/**
	 * @description Sizes content below the header.
	 **/
	sizeContent : function() {
	    var $header      = $('div#d3v-header');
		var $panel       = $('div#instance-tabs');
		var $footer      = $('#code-footer');
	    var windowHeight = $(window).height();
		var headerHeight = $header.outerHeight();
		var panelTop     = headerHeight + 'px';
		
		$panel.width($('#sub-container').outerWidth() - $('#sub-controls').outerWidth());
		
		if($panel.css('top') === panelTop) {
			headerHeight += $panel.outerHeight();
		}

		var contentSize  = windowHeight - headerHeight;
		var footerHeight = $footer.is(':visible') ? $footer.outerHeight() : 0;
		
		$('div#d3v-body').css({"height" : contentSize + "px", "padding-top" : headerHeight + "px"});
		$('#d3v-ace-main').height(contentSize - footerHeight);
		editor.resize();
	},
	
	/**
	 * @description Determines if a string is a valid date
	 * @param       dateVal - string to test
	 * @param       true if its a date, false if not
	 **/
	isValidDate : function(dateVal) {
		var asDate = new Date(dateVal);
		
		if(asDate.toDateString() === 'Invalid Date') {
			return false;
		}
		
		return true;
	},
	
	/**
	 * @description Makes a date salesforce pretty
	 * @param		sfdcDate = salesforce formatted date (e.g. 2011-08-22T20:22:50.000Z)
	 * @param		testResultDisplay (optional) = true to display in the test result style
	 * @return		same date, but pretty
	 **/
	 salesforceDateMadeReadable : function(sfdcDate, testResultDisplay) {
	 	sfdcDate    = sfdcDate.substring(0, sfdcDate.length-5) + "+00:00";
		var utcDate = new Date(sfdcDate);
	 	var month   = utcDate.getMonth() + 1;
	 	var hours   = utcDate.getHours();
	 	
	 	var amPm = hours >= 12 ? 'PM' : 'AM';
		hours    = hours > 12 ? hours - 12 : hours;
		
		var monthName;
		if(month === 1) {
			monthName = testResultDisplay ? 'January' : 'Jan';
		} else if(month === 2) {
			monthName = testResultDisplay ? 'February' : 'Feb';
		} else if(month === 3) {
			monthName = testResultDisplay ? 'March' : 'Mar';
		} else if(month === 4) {
			monthName = testResultDisplay ? 'April' : 'Apr';
		} else if(month === 5) {
			monthName = 'May';
		} else if(month === 6) {
			monthName = 'June';
		} else if(month === 7) {
			monthName = 'July';
		} else if(month === 8) {
			monthName = testResultDisplay ? 'August' : 'Aug';
		} else if(month === 9) {
			monthName = testResultDisplay ? 'September' : 'Sept';
		} else if(month === 10) {
			monthName = testResultDisplay ? 'October' : 'Oct';
		} else if(month === 11) {
			monthName = testResultDisplay ? 'November' : 'Nov';
		} else {
			monthName = testResultDisplay ? 'December' : 'Dec';
		}
		
		var mins = utcDate.getMinutes() < 10 ? '0' + utcDate.getMinutes() : utcDate.getMinutes();
		return monthName + ' ' + 
		       utcDate.getDate() + ', ' + utcDate.getFullYear() + 
		       (testResultDisplay ? ' ' : ' at ') + 
		       hours + ':' + mins + ' ' + amPm;
	 },
	 
	/**
	 * @description Generates a unique 64 character string.  Used for push codes.
	 * @param       stringLength - length of string to generate
	 * @return		randomly generated string
	 **/
	getRandomString : function(stringLength) {
		var randomLength = stringLength || 64;
	    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var rand = '';
		for (var i = 0; i < randomLength; i++) {
			rand += chars[Math.floor(Math.random() * chars.length)];
		}
		
	    return rand;
	},
	
	/**
	 * @description Closes the help dialog.
	 **/		
	closeHelp : function() {
		var $help = $('div#help-dialog');
		if($help.is(':visible')) {
	    	$help.hide();
	    	$('div#generic-overlay').hide();
	    	d3vSync.requestSettingSync();
	    }
	},
	
	/**
	 * @description Opens the help dialog.
	 *              Called openHelp for historical reasons, now opens the options popup
	 **/		
	openHelp : function() {
		d3vPopups.closePopups();
	    $('div#help-dialog').show();
	    $('div#generic-overlay').show();
	    $('div#help-dialog .d3v-pop-body').scrollTop(0);
	    d3vUtil.toggleHelpSubsection();
	    d3vUtil.sizeHelp();
	},

	/**
	 * @description Opens the help documentation
	 **/		
	openHelpDocs : function() {
		window.open('/help', '_blank');
	},

	/**
	 * @description Opens the shortcuts documentation
	 **/		
	openShortcutDocs : function() {
		window.open('/shortcuts', '_blank');
	},
	
	/**
	 * @description Saves the status of all your aside tabs
	 * @param       silent - true to not output any alert messages
	 **/
	saveStatus : function(silent) {
		if(!silent) {
			d3vUtil.alert('saving ASIDE status...');
		}
		
		d3vSync.sendStatusRequest(function(tabStatus) {
			if(!silent) {
				d3vUtil.alert('status saved successfully!', {scheme : 'positive'});
			}
			
			localStorage[TAB_STATUS + d3vUtil.getOrgId()] = JSON.stringify(tabStatus);
		});
	},
	
	/**
	 * @description Loads the status of all your aside tabs
	 **/
	loadStatus : function() {
		var tabStatus = localStorage[TAB_STATUS + d3vUtil.getOrgId()];
		
		if(tabStatus) {
			tabStatus = JSON.parse(tabStatus);
			d3vUtil.alert('status loaded successfully!', {scheme : 'positive'});
			d3vUtil.loadTabStatus(tabStatus[0], true);
		
			for(var i = 1, end = tabStatus.length; i < end; i++) {
				d3vUtil.loadTabStatus(tabStatus[i], false);
			}
			
			localStorage[TAB_STATUS + d3vUtil.getOrgId()] = '';
		} else {
			d3vUtil.alert('failed to load status', {scheme : 'negative'});
		}
	},
	
	/**
	 * @description Loads the status of a single tab
	 * @param       status - the tab status to load
	 * @param       first  - the first tab loaded
	 **/
	loadTabStatus : function(status, first) {
		var openable = true;
		
		if(status.file && status.file.length && status.file.indexOf('.') === -1) {
			//shouldnt restore tab statuses of new files cause ASIDE just doesnt support that yet
			return;
		}
		
		if(first) {
			d3vUtil.switchSection(status.mode);
			
			if(status.query) {
				$('input#query-source').val(status.query);
				d3vData.performQuery();
			} else if(status.file) {
				d3vCode.openFile(status.full);
			}
		} else {
			//section,query,file
			var urlParams = '?section=' + status.mode;
			
			
			if(status.query) {
				urlParams += '&query=' + encodeURIComponent(status.query);
			} else if(status.file) {
				urlParams += '&file=' + status.full
			}
			
			window.open(D3V_URL + urlParams, '_blank');
		}
	},
	
	/**
	 * @description HTML encodes the given value
	 * @param       value - to encode
	 * @return      decoded value
	 **/
	htmlEncode : function(value) {
	  return $('<div/>').text(value).html();
	},	
	
	/**
	 * @description Sizes the help dialog
	 **/
	sizeHelp : function() {
		var $help = $('div#help-dialog');
		
		if($help.is(':visible')) {
			var heightScalar = 0.75;
			var helpSize = parseInt($(window).height() * heightScalar) - $('div.d3v-pop-head').outerHeight();
			$help.find('.d3v-pop-body').height(helpSize);
		}
	},
	
	/**
	 * @description Determines if the user is using an osx based device.
	 * @return      true if it is osx based, false if not.
	 **/
	isOSX : function() {
		return navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
	},
	
	/** 
	 * @description On OSX the mod character is ⌘, but on all other OS it is the control key.  This function sets the proper character.
	 **/
	setModCharacter : function() {
		var modChar = d3vUtil.isOSX() ? '⌘' : 'ctrl';
		
		$('span.command-mod').text(modChar);
	},
	
	/**
	 * @description Toggles a help subsection
	 **/
	toggleHelpSubsection : function() {
		var d3vType = $('div#mode-buttons span.active').text().trim();

		$('div.help-body-subsection').hide();
		$('div#hd-' + d3vType).show();
	},

	/**
	 * @description toggles the mode buttons visibility
	 **/
	toggleModeButtons : function() {
		var $mb   = $('div#mode-buttons');
		var $mode = $('span#mode');
		$mode.unbind();
		
		if($mode.text() === '<') {
			$mode.text('>');
			
		    if(timeoutIdModeButtons) {
		      clearTimeout(timeoutIdModeButtons);
		    }
			
			$mb.stop().fadeIn(800);
			setTimeout(function() {
				$mode.click(d3vUtil.toggleModeButtons);
			},800);
			   
			var futureFade = function() {
				$mb.stop().fadeOut(1000);
				setTimeout(function() {
					$mode.text('<');
				}, 1000);
				
			}
		
			timeoutIdModeButtons = setTimeout(futureFade, 15000);		
		} else {
		    if(timeoutIdModeButtons) {
		      clearTimeout(timeoutIdModeButtons);
		    }
			
			$mode.text('<');
			$mb.stop().fadeOut(1000);
			setTimeout(function() {
				$mode.click(d3vUtil.toggleModeButtons);
			}, 1000);						
		}
	},
	
	/**
	 * @description I wanted to put out data to the user in a way less obnoxious than an
	 *				alert message, thus the "alert"
	 * @param		message - string to display to user
	 * @param		showTime - time to show message before it begins to fade
	 * @param		fadeTime - time it takes for the message to completely fade
	 **/
	alert : function(message, options) {
	    if(uninterruptableAlert) {
	      return;
	    }
	
	    if(timeoutId) {
	      clearTimeout(timeoutId);
	    }
	    
	    if(!options) {
	    	options = {};
	    }
	
		var fadeTime = options.fadeTime || ALERT_FADE_TIME;
		var showTime = options.showTime || ALERT_DISPLAY_TIME;
		var scheme   = options.scheme   || 'neutral';
		var cssScheme = {opacity:'100'};
		
		var $ar = $('span#center');
		
		if(scheme === 'positive') {
			$ar.addClass('orangish').removeClass('bluish-back-hov').removeClass('redish');
		} else if(scheme === 'negative') {
			$ar.addClass('redish').removeClass('bluish-back-hov').removeClass('orangish');
		} else {
			$ar.addClass('bluish-back-hov').removeClass('orangish').removeClass('redish');
		}
		
		$ar.show()
		   .html(message)
		   .stop()
		   .css(cssScheme);
		   
		d3vUtil.positionAlert($ar);  
		var futureFade = function() {
			$ar.stop().animate({opacity:'0'}, fadeTime, function() {
				$(this).hide();
			});
		}
	
		timeoutId = setTimeout(futureFade, showTime)
	},
	
	/**
	 * @description Closes the currently displayed alert.
	 **/
	closeAlert : function() {
		$(this).hide();
	},
	
	/**
	 * @description Initialize the tab panel state on load
	 **/
	initializeTabPanel : function() {
		d3vUtil.showTabPanel(0);
		Ps.initialize(document.getElementById('instance-tabs'));
	},

	/**
	 * @description Shows the tab panel
	 **/	
	showTabPanel : function(animationLength) {
		localStorage[COOKIE_TAB_OPEN] = TAB_OPEN_VALUE;
		
	    var $header      = $('div#d3v-header');
		var $panel       = $('div#instance-tabs');
		var $footer      = $('#code-footer');
		var $content     = $('.content-section');
		var $ace         = $('div#d3v-ace-main');
		var $body        = $('div#d3v-body');
		var $diffEditor  = $('div#diff-ace-right');
		var $diffCon     = $('div#diff-container');
		var $gutter      = $('div#diff-gutter');
	    var windowHeight = $(window).height();
		var headerHeight = $header.outerHeight() + $panel.outerHeight();
		var panelTop     = headerHeight + 'px';
		var offset       = $panel.height();
		var aniLen       = animationLength;
		var aniOpts      = {duration : aniLen, queue : false};
		var panelTop     = $header.outerHeight();
		var contentSize  = windowHeight - headerHeight;
		var footerHeight = $footer.is(':visible') ? $footer.outerHeight() : 0;
		var newHeight    = (contentSize - footerHeight) + "px";
		
		$panel.animate({"top" : panelTop}, aniOpts);
		
		setTimeout(function() {	
			$body.animate({"height" : contentSize + "px", "padding-top" : headerHeight + "px"}, aniOpts);
			$ace.animate({"height" : newHeight}, aniOpts);
			$diffEditor.animate({"height" : newHeight}, aniOpts);
			$diffCon.animate({"height" : newHeight}, aniOpts);
			$gutter.animate({"height" : newHeight}, aniOpts);
			
			setTimeout(function() {
				editor.resize();
				rightEditor.resize();
				$('#tabs').html('&uarr;');
			}, TAB_ANIMATION_LENGTH);		
		}, aniLen / 2);
	},
	
	/**
	 * @description Toggles diffs on and off
	 **/
	toggleDiffs : function() {
		var diffing = aceDiffer && aceDiffer.options && aceDiffer.options.showDiffs;
		var diffingNow = $('#diff-gutter').is(':visible');
		
		if(diffing) {
			aceDiffer.setOptions({showDiffs : false});
		} else if(aceDiffer && diffingNow) {
			aceDiffer.setOptions({showDiffs : true});
		}
	},
	
	/**
	 * @description Toggles the dual diff editors open and closed
	 **/
	toggleDiffEditor : function() {
		var $gutter = $('#diff-gutter');
		var needsShow = !$gutter.is(':visible');
		
		if(needsShow) {
			d3vUtil.showDiffEditor();
		} else {
			d3vUtil.hideDiffEditor();
		}
		
		d3vUtil.sizeEditor();
		d3vCode.changeDiffEditorVisibility();
		d3vUtil.dragResizeEditors($gutter);
		d3vUtil.resizeWindow();
	},
	
	/**
	 * @description Causes the diff gutter to jump to the opposite side of the screen
	 **/
	switchGutterSide : function() {
		var $gutter = $(this);
		var leftPos = parseInt($gutter.css('left'));
		var width   = $('#diff-container').width();
		
		if(leftPos / width < 0.5) {
			$gutter.css({"left" : (width - ($gutter.outerWidth() + 10)) + "px"});
		} else {
			$gutter.css({"left" : "10px"});
		}
		
		d3vUtil.dragResizeEditors();
		d3vUtil.changeDiffEditorWidths();
		d3vUtil.resizeWindow();
	},

	/**
	 * @description Shows the side-by-side diff comparison
	 **/	
	showDiffEditor : function() {
		$('#diff-gutter').show();
		$('#diff-ace-right').parent().show();
		$('#foot-split').text('hide diff');
		
		if(diffEditorText && diffEditorText.length) {
			rightEditor.setValue(diffEditorText);
		}
		
		diffEditorText = null;
		aceDiffer.setOptions({ showDiffs : true });
		d3vUtil.dragResizeEditors();
		d3vPopups.repositionDiffEditor($('#global-panel'), $('#diff-gutter'), $(window).width());
		d3vUtil.resizeWindow();
	},

	/**
	 * @description Hides the side-by-side diff comparison
	 **/	
	hideDiffEditor : function() {
		$('#diff-gutter').hide();
		$('#diff-ace-right').parent().hide();
		$('#foot-split').text('show diff');
		
		diffEditorText = rightEditor.getValue();
		rightEditor.setValue('');
		aceDiffer.setOptions({ showDiffs : false });
		d3vUtil.dragResizeEditors();
		d3vUtil.resizeWindow();
	},

	/**
	 * @description Resets the diff
	 **/	
	initializeDiffEditor : function(mode, style, leftCode, rightCode) {
		if(aceDiffer) {
			aceDiffer.destroy();
			aceDiffer = null;
		}

	    aceDiffer = new AceDiff({
	        left: {
	            id: "d3v-ace-main",
	            content: leftCode
	        },
	        right: {
	            id: "diff-ace-right",
	            content: rightCode
	        },
	        classes: {
	            gutterID: "diff-gutter"
	        }
	    });
	    
	    d3vUtil.setupDragResize();
	},
	
	
	
	/**
	 * @description Centers the alert replacement
	 * @param       ar - alert replacement jquery object
	 **/
	positionAlert : function($ar) {
		$ar.css('left', ($(window).width() / 2) - ($ar.width() / 2) + 'px');
	},
	
	/**
	 * @description Gets the content (e.g. window - toolbar) height.
	 * @param @appWindow - the window object
	 * @param @d3vHeader - the header at top
	 * @return content height
	 **/
	getContentHeight : function($appWindow, $d3vHeader) {
		var $footer      = $('div#code-footer');
		var footerHeight = $footer.is(':visible') ? $footer.height() : 0;
		var tabsShowing  = $('#instance-tabs').css('top') === '35px' ? $('#instance-tabs').outerHeight() : 0;
		
		return $appWindow.height() - $d3vHeader.outerHeight() - footerHeight - tabsShowing - 1;
	},
	
	/**
	 * @description Gets the content (e.g. window - toolbar) width.
	 * @param @appWindow - the window object
	 * @return content width
	 **/
	getContentWidth : function($appWindow) {
		return $appWindow.width();
	},
	
	/**
	 * @description sizes the slickgrid.
	 * @param		$slickgrid - the slickgrid div
	 * @param		$d3vHeader - d3v's header
	 * @param		$appWindow - window as jquery object
	 **/	
	sizeSlickGrid : function($slickgrid, $d3vHeader, $appWindow) {
		var $pager    = $('div#pager');
		var newTop    = $d3vHeader.height() + ($('input#query-source').height() - 2);
		
		var newHeight = $appWindow.height() - newTop - ($pager.height() || 20);
		
		$('div#grid-container').css({"top":newTop+"px", "height":(newHeight-39)+"px"});
		$slickgrid.css({"height":(newHeight-39)+"px"});
		$pager.css({"top": (newTop + newHeight - 5)+"px"});
	},
	
	/**
	 * @description Sets d3v up for use.
	 *				Should only be called once, on dom ready.
	 **/
	initializeD3V : function() {
	    d3vUtil.alert('ASIDE is loading...');
	    $('div#code-content').show(); 
	    ace.require("ace/ext/language_tools");
	    
	    d3vUtil.initializeDiffEditor();
	    
	    editor = aceDiffer.getEditors().left;
	    rightEditor = aceDiffer.getEditors().right;
		
		d3vCode.populateUIThemePicklist();
		d3vCode.loadStylesheet();
		
	    d3vCode.hideZipMenu();
	    d3vCode.hideDebugCloseButton();
	    d3vUtil.resizeWindow({force:true});
	    d3vUtil.bindActions();
	    d3vUtil.bindControls();
		d3vUtil.sizeContent();
	    d3vUtil.initializeSlickgrid();
	    d3vUtil.loadASIDE();
	    d3vUtil.setModCharacter();
	    d3vUtil.initializeTabPanel();
	    d3vPopups.setupPopups();
	    d3vTest.initializeTestSection();
		d3vCode.loadAllSettings(true);
	    d3vCode.setScrollSpeed();
	    d3vCode.initFooter();
	    d3vCode.initializeAnnotationHelper();
	    d3vArchive.initializeArchive();
	    d3vUtil.isProductionEnvironment();
	    d3vUtil.bindEditorChange(true);
	    d3vSync.initialize();
	    d3vUtil.trackLastFocusedEditor();
	    d3vData.initialize();
	    d3vCode.initializeCodeDrop();
	    
	    editor.getSession().setValue(d3vUtil.getLandingString());
	},
	 
	/**
	 * @description Keeps track of the last focused editor
	 **/
	trackLastFocusedEditor : function() {
		lastFocusedEditor = editor;
		
		editor.on('focus', function() {
			lastFocusedEditor = editor;
		});
		
		rightEditor.on('focus', function() {
			lastFocusedEditor = rightEditor;
		});		
	},
	
	/**
	 * @description Generates and returns the landing page text
	 * @returns     the text to show in ACE when ASIDE loads
	 **/
	getLandingString : function() {
		var tabStateText = '';
		
		var tabState = localStorage[TAB_STATUS + d3vUtil.getOrgId()];
		
		if(tabState) {
			tabState = JSON.parse(tabState);
			
			tabStateText = "\n\n" +
				" =======================================================\n"   +
				" PRESS 'COMMAND + SHIFT + .' TO RESUME YOUR LAST SESSION\n\n";
			
			var end;
			var over = 0;
			
			if(tabState.length > MAX_TAB_DISPLAY) {
				over = tabState.length - MAX_TAB_DISPLAY;
				end  = MAX_TAB_DISPLAY;
			} else {
				end  = tabState.length;
			}
			
			for(var i = 0; i < end; i++) {
				tabStateText += "    - " + d3vUtil.capitalizeString(tabState[i].mode) + " tab";
				
				if(tabState[i].mode === CODE_SECTION && tabState[i].file && tabState[i].file.length) {
					tabStateText += " (" + tabState[i].file + ")";
				}
				
				tabStateText += '\n';
			}
			
			if(over) {
				tabStateText += "    - and " + over + " more tabs\n";
			}
			
			tabStateText += " =======================================================";
		}
				
		return "\n"                                                               +
	           " *************************\n"                                     +
	           " *   Welcome to ASIDE!   *\n"                                     +
	           " *************************"                                       +
	           "\n\n"                                                             +
	           " Want to write code?\n"                                           +
	           " > Type 'new' or 'open' in the text input above."                 +
	           "\n\n"                                                             +
	           " Need to run unit tests?\n"                                       +
	           " > Click 'test' in the upper right-hand corner."                  +
	           "\n\n"                                                             +
	           " Would you like to retrieve or deploy?\n"                         +
	           " > Click 'push' in the upper right-hand corner."                  +
	           "\n\n"                                                             +	          
	           " Looking to view or modify data?\n"                               +
	           " > Click 'data' in the upper right-hand corner."                  +
	           "\n\n"                                                             +	 
	           " Wondering where the documentation is at?\n"                      +  
	           " > Hover over your username in the upper right-hand corner,\n"    +
	           " then choose 'help'."                                             +
	           "\n\n"                                                             +
	           " In search of configuration options?\n"                           +
	           " > Hover over your username in the upper right-hand corner,\n"    +
	           "   then choose 'options'.  Please note you get different\n"       +
	           "   options depending on whether you are viewing the code,\n"      +
	           "   test, push, or data screen."                                   +
	           tabStateText;
	},
	
	/** 
	 * @description Resets the editor change and file opening flags
	 **/
	resetEditorChange : function() {
		fileOpening = false;
		fileModified = false;
		
		$('span#foot-save').addClass('btn-unsaveable').removeClass('btn-saveable');	
	},

	/**
	 * @description Bind editor change
	 * @param       (optional) onLoad - triggers a delayed call to resetEditorChange when this is true
	 **/
	 bindEditorChange : function(onLoad) {
	    editor.on('change', d3vUtil.handleEditorChange);	 
	    editor.on('changeSelection', d3vUtil.handleSelectionChange);
	    
	    
	    
	    if(onLoad) {
	    	setTimeout(function() {
	    		d3vUtil.resetEditorChange();
	    	}, 150);
	    } 	
	 },

	/**
	 * @description Handles cursor movement ace editor event
	 **/	 
	 handleSelectionChange : function() {
	 	var pos = editor.getCursorPosition();
	 	d3vUtil.displayLineNumber(pos);
	 	d3vUtil.trackLineNumber(pos.row);
	 },
	 
	 /**
	  * @description Tracks and handles changing of selected line number in the editor
	  * @param       currentLine - currently selected line in the editor
	  **/
	 trackLineNumber : function(currentLine) {
	 	if(currentLine && editorCurrentLine && currentLine !== editorCurrentLine) {
	 		if(currentFile && (currentFile.indexOf('.cls') !== -1 || currentFile.indexOf('.trigger') !== -1)) {
	 			d3vCode.parseRowTokens(editorCurrentLine);
	 		}
	 		
			editorCurrentLine = currentLine;
	 	}
	 },
	
	/**
	 * @description Determine if any text has changed in the editor.
	 **/
	 handleEditorChange : function() {
	 	if(!fileOpening) {
	 		fileModified = true;
	 		$('span#foot-save').addClass('btn-saveable').removeClass('btn-unsaveable');
	 	}
	 },
	
	/**
	 * @description Sets the slickgrid and all its components up for use.
	 **/
	initializeSlickgrid : function() {
	    //slickgrid options
	    var options = {
	        editable: true,
	        enableCellNavigation: true,
	        asyncEditorLoading: true,
	        autoEdit: false,
	        enableAddRow: true,
	        showHeaderRow: true,
	        forceFitColumns: true,
	        multiColumnSort: false
	    };
	    
	    //sort stuff
	    var sortcol = "A";
	    var sortdir = 1;

	    //add extra css for dragging maybe?  not sure, comes from slickgrid example
	    $(".grid-header .ui-icon")
	        .addClass("ui-state-default ui-corner-all")
	        .mouseover(function (e) {
	            $(e.target).addClass("ui-state-hover")
	        })
	        .mouseout(function (e) {
	            $(e.target).removeClass("ui-state-hover")
	        });
	
	    //instantiate slickgrid
	    dataView = new Slick.Data.DataView();
	    grid = new Slick.Grid("#myGrid", dataView, columns, options);       
	
	    //handle paging
	    dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
	        var isLastPage = pagingInfo.pageSize * (pagingInfo.pageNum + 1) - 1 >= pagingInfo.totalRows;
	        var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
	        var options = grid.getOptions();
	    
	        if (options.enableAddRow != enableAddRow) {
	            grid.setOptions({enableAddRow: enableAddRow});
	        }
	    });
	
	    //handle cell updates
	    grid.onCellChange.subscribe(function (e, args) {
	        dataView.updateItem(args.item.id, args.item);
	    });
	
	    //handle new row additions
	    grid.onAddNewRow.subscribe(function (e, args) {
	        d3vData.addNewData(args);
	    });
	
	    //handle grid navigation
	    grid.onKeyDown.subscribe(function (e) {
	        // select all rows on ctrl-a
	        if (e.which != 65 || !e.ctrlKey) {
	            return false;
	        }
	
	        var rows = [];
	        for (var i = 0; i < dataView.getLength(); i++) {
	            rows.push(i);
	        }
	
	        grid.setSelectedRows(rows);
	        e.preventDefault();
	    });

	    function comparer(a, b) {
	    	var x = a[sortcol];
	    	var y = b[sortcol];
	    	
	    	if(x === null || x === undefined || x === '') {
	    		return -1;
	    	} else if(y === null || y === undefined || y === '') {
	    		return 1;
	    	}
	    	
	    	return (x === y ? 0 : (x > y ? 1 : -1));
	    }
	
	    //handle grid sort
	    grid.onSort.subscribe(function (e, args) {
	        sortdir = args.sortAsc ? 1 : -1;
	        sortcol = args.sortCol.field;
	    
	        if ($.browser.msie && $.browser.version <= 8) {
	            dataView.fastSort(sortcol, args.sortAsc);
	        } else {
	            dataView.sort(comparer, args.sortAsc);
	        }
	    }); 
	    
	    //handle nifty row checkbox selection stuff
	    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
	    grid.registerPlugin(checkboxSelector);         
	
	    //instantiate pager and column picker
	    var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
	    	    
	    var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
	
	    //tell grid what to update when row count changes
	    dataView.onRowCountChanged.subscribe(function (e, args) {
	        grid.updateRowCount();
	        grid.render();
	    });
	    
	    //tell grid what to update when row data changes
	    dataView.onRowsChanged.subscribe(function (e, args) {
	        grid.invalidateRows(args.rows);
	        grid.render();
	    });
	
	    //Make the inputs tie into filtering & grid refreshing
	    $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
	        columnFilters[$(this).data("columnId")] = $.trim($(this).val());
	        dataView.refresh();
	    });
	
	    //When columns are reordered, make sure header row updates with it
	    grid.onColumnsReordered.subscribe(function (e, args) {
	        d3vData.updateHeaderRow();
	        columns = grid.getColumns();
	    });
	
	    //When resized are reordered, make sure header row updates with it
	    grid.onColumnsResized.subscribe(function (e, args) {
	        d3vData.updateHeaderRow();
	    });
	    
	    //When data in a column is changed, save the change to the server
	    grid.onCellChange.subscribe(function (e, args) {
	        d3vData.updateData(args);
	    });
	
	    //Generic dataview setup
	    dataView.beginUpdate();
	    dataView.setItems(data);
	    dataView.setFilter(d3vUtil.slickgridRowFilter);
	    dataView.endUpdate();
	    
	    //hide sort arrow
	    $('div.slick-headerrow').hide();
	
	    //Add the filter button to the pager
	    $('div.slick-pager').append('<span style="float:left; margin-top:5px;" ' +
	                                'class="ui-icon ui-icon-search" title="Toggle search panel" id="data-toggle-filter"></span>');
	                                
	    //Bind the onclick for the filter button to open and close the filter row
	    $('span#data-toggle-filter').click(d3vData.toggleFilterRow);	  
	    
	    //right click open in sfdc menu
	    grid.onContextMenu.subscribe(function (e) {
	    	e.preventDefault();
	        var cell = grid.getCellFromEvent(e);
	      	
	      	if(data && data[cell.row]) {
	      		$('#grm-ois').text('Visit Detail Page for: ' + data[cell.row].id)
	      					 .attr('rid', data[cell.row].id);
	      		$('#grm-sis').text('Global Search for: ' + data[cell.row][columns[cell.cell].name])
	      					 .attr('token', data[cell.row][columns[cell.cell].name]);
	      		
		        $("#grid-rc-menu")
		        	.data("row", cell.row)
		            .css("top", e.pageY)
		            .css("left", e.pageX)
		            .show();
		          
		        $("body").one("click", function () {
		            $("#grid-rc-menu").hide();
		        });	      
	        }
	    });	  
	    
	    $('#grm-ois').click(d3vData.openGridRowInSalesforce);
	    $('#grm-sis').click(d3vData.queryFieldInSalesforce);                                    
	},

	/**
	 * @description Removes label in inputs which gain focus
	 **/	
	handleLabelInInputFocus : function() {
    	var $that = $(this);
    	var label = $that.attr('d3v-label');
    	var text  = $that.val();
   	
    	if(text === label) {
    		$that.val('').removeClass('label-in-input-active');
    	}	
	},

	/**
	 * @description Adds label to inputs which lose focus
	 **/
	handleLabelInInputBlur : function() {
    	var $that = $(this);
    	var label = $that.attr('d3v-label');
    	var text  = $that.val();

    	if(!text || (text && !$.trim(text))) {
    		$that.val(label).addClass('label-in-input-active');
    	}	
	},

	/**
	 * @description Handles a change in slider value.
	 **/
	handleSliderChange : function() {
		var $that = $(this);
		d3vUtil.bindSliderToViewer($that);
		d3vCode.saveSliderValue($that);
	},	
	
	/**
	 * @description Prevents default event behavior
	 * @param       evt - event to prevent default behavior of
	 **/
	preventDefaultBehavior : function(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	},
	
	/**
	 * @description Pair a slider with a viewer so you can see the sliders exact value.
	 * @param		$that - element which triggered this function
	 **/
	bindSliderToViewer : function($that) {
		$('span.range-viewer[pair-with="' + $that.attr('pair-with') + '"]').text($that.val());
	},	
	
	/**
	 * @description Binds all mouse related events.
	 **/
	bindActions : function() {		
		//Bind slider with to a viewer
		$('input.range-slider').change(d3vUtil.handleSliderChange);
		
		//clear code history
		$('span#delete-local-code').click(d3vCode.clearCodeHistory);
		
		//clear test filter history
		$('span#delete-filter-history').click(d3vTest.clearTestFilters);
		
		//clear soql history
		$('span#delete-query-history').click(d3vData.clearSOQLHistory);
	
		//shows the change mode buttons
		$('span#mode').click(d3vUtil.toggleModeButtons);
	
	    //Bind header link click
	    $('div#mode-buttons span.mode-button').click(function() {
	        d3vUtil.handleHeaderLinkClick(this);
	    });
	    
	    //bind beautify button
	    $('#foot-beautify').click(d3vCode.beautify);
	    
	    //generate wsdl for opened apex class
	    $('#foot-wsdl').click(d3vCode.generateWSDL);
	    
	    //delete currently opened class
	    $('#foot-delete').click(d3vCode.performFileDelete);
	    
	    //bind minify button
	    $('#foot-minify').click(d3vCode.minify);
	    
	    //cancels the filter application
	    $('div#cct-filter-cancel').click(d3vTest.cancelApplyFilter);
	
	    //Bind theme change select
	    $('select#ace-theme').change(d3vCode.changeTheme);
	    
	    //Bind key bindings select
	    $('select#ace-keyboard').change(d3vCode.changeKeyBindings);	    
	    
	    //Bind zip file open button
	    $('#zh-open').click(d3vCode.openSelectedZipItem);
	    
	    //Bind reset logs action
	    $('div#start-debug-logs').click(function() {
	    	d3vCode.resetLogAllowance(false);
	    });
	    
	    //Bind refresh history button
	    $('#refresh-file-history').click(function() {
	    	d3vArchive.refreshLocalHistoryDialog(true);
	    });
	    
	    //Bind VF & Static Resource file rename
	    $('#non-apex-rename').click(d3vCode.changeCurrentFileName);
	    
	    //Remove label inside fields
	    $('.label-in-input').focus(d3vUtil.handleLabelInInputFocus);

	    //Display label inside fields
	    $('.label-in-input').blur(d3vUtil.handleLabelInInputBlur);

		//Bind set view blur to refresh the test result table
		$('#tr-filter').blur(d3vTest.refreshResultTable);

		//Bind delete zip item
		$('#zh-delete').click(d3vCode.deleteResourceFile);

		//Bind zip new file mime type selector
		$('#zn-mime-choice').change(d3vCode.handleZipNewFileTypeChange);
		
		//Bind zip new file, filename change field
		$('#zn-name').keyup(d3vCode.handleZipFilenameChange);

		//Create new file in zip
		$('#zn-create').click(d3vCode.addNewFileToZip);

		//Binds zip handler dialog open button
		$('#zip-handler-btn, #zn-back, #ausr-back').click(d3vCode.openZipHandler);

		//apply the selected stylesheet
		$('.aside-theme').change(d3vCode.changeStylesheet);

		//Bind global panel close
		$('#gp-close').click(d3vPopups.hideGlobalPanel);

		//Bind global panel resize
		$('#gp-resize').click(d3vPopups.resetGlobalPanelSize);
		
		//Bind global panel help
		$('#gp-help').click(d3vUtil.routeGlobalPanelHelp);
		
		//Bind find options
		$('#find-with-wrap, #find-by-whole, #find-by-regex, #find-case-sensitive').click(d3vCode.changeFindPreferences);

	    //Bind print margin column input
	    $('input#pm-size').keyup(d3vCode.changePrintMarginColumns);
	    
	    //Bind beautify line wrap position
	    $('input#beautify-pm-size').keyup(d3vCode.changeBeautifyLineWrap);

	    //Bind show print margin checkbox
	    $('input#show-pm').click(d3vCode.changeShowPrintMargin);
	    
	    //Bind auto conflict resolve preference update	
		$('input[name="resolve-conflicts"]').click(d3vCode.changeAutoResolve);
		
	    //Bind sync setting preference update
	    $('input#synchronize-settings').click(d3vCode.changeSettingSync);			    	    
	    
	    //Bind switch type preference update
	    $('select#synchronize-switch').change(d3vCode.changeSwitchMethod);
	    
	    //Bind log level controls
	    $('.debug-option').change(d3vCode.changeLogLevels);
	    
	    //Bind show invisibles checkbox
	    $('input#show-invisibles').click(d3vCode.changeShowInvisibles);

	    //Bind Auto-Autocomplete setting
	    $('input#auto-autocomplete').click(d3vCode.changeAutoAutocomplete);

	    //Bind Scroll Past End setting
	    $('input#scroll-past-end').click(d3vCode.changeScrollPastEnd);
	    
	    //Bind show indentation guide checkbox
	    $('input#show-indentation-guide').click(d3vCode.changeShowIndentationGuide);
	    
	    //Bind highlight active link
	    $('input#highlight-active-line').click(d3vCode.changeHighlightActiveLine);
	    
	    //Bind highlight active word
	    $('input#highlight-active-word').click(d3vCode.changeHighlightActiveWord);

	    //Bind toggle show footer
	    $('input#show-footer').click(d3vCode.changeShowFooter);

	    //Bind font size input
	    $('input#font-size').keyup(d3vCode.changeFontSize);
	    
	    //Bind tab size input
	    $('input#tab-size').keyup(d3vCode.changeTabSize);
	    
	    //Bind code filter input
	    $('select#onload-filter').change(d3vCode.changeCodeFilter);
	    
	    //Bind code help soft tab checkbox
	    $('input#soft-tabs').click(d3vCode.changeSoftTabs);
	
	    //Bind query button
	    $('span#data-query-link').click(d3vData.performQuery);
	
	    //Bind delete button
	    $('span	#data-delete-link').click(d3vData.deleteSelectedRows);
	    
	    //Bind export link
	    $('span#data-export-link').click(d3vData.exportToCSV);
	    
	    //Bind multi cursor option
	    $('#enable-multi-cursor').click(d3vCode.toggleMultiCursor);
	    
	    //bind scroll speed change
	    $('input#code-scroll-speed').change(d3vCode.setScrollSpeed);
	    
	    //apply code coverage filter
	    $('div#cct-filter-apply').click(d3vTest.closeCoverageFilter);
	    
	    //clear code coverage filter
	    $('div#cct-filter-clear').click(d3vTest.clearCoverageFilter);	    
	    
	    //open coverage filter
	    $('div#cct-filter').click(d3vTest.openCoverageFilter);
	    
	    //Kicks off coverage report generation
	    $('div#cct-refresh').click(d3vTest.generateCoverageReport);
	    
	    $('div#cct-csv').click(d3vTest.generateCoverageCSV);
	    
	    //Opens the coverage report popup
	    $('span#coverage-report-link').click(d3vTest.openCoverageReportPopup);
	    
	    //Causes the gutter to jump to the opposite side
	    $('div#diff-gutter').dblclick(d3vUtil.switchGutterSide);
	    
	    //Bind close help
	    $('div#close-help').click(d3vUtil.closeHelp);
	    
	    //Bind window resize to a helper
	    $(window).resize(d3vUtil.handleWindowResize);
	    
	    //Opens the share query popup
	    $('span#data-share-link').click(d3vData.shareQuery);

		//bind static resource mime type selector
		$('span#mime-okay').click(d3vCode.routeMimeSelection);
	    
	    //refreshes the list of debug logs
	    $('div#refresh-debug-logs').click(function() {
	    	d3vCode.refreshDebugLogList(false);
	    });

		//Shows Resource type selector main screen
		$('span#mime-back').click(d3vCode.showMimeMainScreen);
		
		//bind new tab button
		$('#add-new-tab, #sub-controls .dropbtn').unbind().click(function() {
    		window.open(D3V_URL, '_blank');
	    });
	    
		//Loads the "debug revert" copy of whatever was last in the editor.
		$('#debug-handler-btn').click(function() {
			d3vCode.revertEditorDebug();
		});	    

		//closes the popup when clicking the overlay
		$('#generic-overlay').click(d3vPopups.closePopups);

	    //bind exit action
	    $('#exit-tab').unbind().click(d3vUtil.exitD3V);
	    
	    //Bind help open to icon click
	    $('#help-tab').unbind().click(d3vUtil.openHelp);		
		
		//Adds a file from your computer to an existing static resource
		$('span#add-upload-to-zip-sr').click(d3vCode.addUploadedFileToZip);
		
		//Allows user to jump directly to log levels settings from debug log popup
		$('#set-log-levels').click(d3vUtil.showLogLevels);
		
		//saves a new static resource of type other
		$('span#mime-sr').click(d3vCode.saveOtherTypeResource);

		//close the currently displayed alert replacement message
		$('span#center').click(d3vUtil.closeAlert);	
		
		//requests all other aside instances update their settings
		$('.commands-tbl input, .commands-tbl select').blur(d3vSync.requestSettingSync);
		
		//set users history / log open references
		$('select#debug-open-select, select#lh-open-select, ' +
		  'select#ocs-open-select, select#related-open-select').change(d3vCode.changeOpenPreferences);

	    //warning before leaving page
		$(window).bind('beforeunload', function() {
			d3vSync.removeCurrentInstanceStatus();
			
    		unloadTimerId = setTimeout(function() {
        		ignoreAllErrors = false;
    		}, 1000);		
    		
			ignoreAllErrors = true;
			
			if(fileModified) {
				return 'Exiting will cause you to lose unsaved changes.';
			}
		
			return null;
		});
		
	    //clearup unload timer
		$(window).bind('unload', function() {
			d3vSync.removeCurrentInstanceStatus();
    		clearTimeout(unloadTimerId);
		});
		
		//log clientside errors
		//window.onerror = d3vUtil.logClientError;
	},
	
	isAsideInitialized : function() {
		return typeof aside != "undefined" && typeof aside.instance != "undefined"
	},

	/**
	 * @description Generic error logger
	 * @param       errorMsg   - error that occured
	 * @param       url        - what file it occured in
	 * @param       lineNumber - line it occured on
	 **/	
	logClientError : function(errorMsg, url, lineNumber) {
		if(url) {
			var urlSplit = url.split('/');
			url = urlSplit[urlSplit.length - 1];
		}
		
		var stackTrace = printStackTrace().join('\n');
		ServerAction.logClientError(errorMsg, url, lineNumber, stackTrace);
	},
	
	/**
	 * @description Number validator
	 **/
	isNumber : function(n) {
    	return !isNaN(parseFloat(n)) && isFinite(n);
	},

	/**
	 * @description Logs a user out of d3v.
	 **/		
	sendToLogin : function() {
		d3vUtil.clearCookiesAndLogout();
	},
	
	/**
	 * @description Clears aside's cookies and hits the salesforce logout endpoint.
	 *              Does not attempt to hit the partner api logout.
	 **/
	clearCookiesAndLogout : function() {
		window.onbeforeunload = null;
		var endpoint = aside && aside.org && aside.org.endpoint ? aside.org.endpoint : 'login';
		var url = d3vUtil.getFrontdoorURL('/secur/logout.jsp');
		var url2 = 'https://' + endpoint + '.salesforce.com/secur/logout.jsp';
		$('body').append('<iframe id="exit-sfdc-frame" width="0" height="0" style="display:none;"></iframe>');
		var $endFrame = $('#exit-sfdc-frame');
		$endFrame.attr('src', url2);
		d3vUtil.revokeSessionTokens();
		
		$endFrame.load(function() {
			setTimeout(function() {
				$('body').append('<iframe id="exit-sfdc-frame2" width="0" height="0" style="display:none;"></iframe>');
				var $endFrame2 = $('#exit-sfdc-frame2');
				$endFrame2.attr('src', url);			
			
				$endFrame2.load(function() {
					setTimeout(function() {
						ServerAction.logout(function() {
							CookieUtil.clearAllCookies();
							window.location.href = D3V_URL;							
						});
					}, 1000);	
				});			
			}, 1000);				
		});
	},
	
	/**
	 * @description Kicks a user out of d3v.
	 **/		
	kickoutUser : function(message) {
		$('div#generic-overlay').show();
		d3vArchive.saveEmergencyCopy();
		CookieUtil.clearAllCookies();		

		$(window).unbind('beforeunload');
		
		if(message) {
			alert(message);
		}
		
		window.location.href = D3V_URL;
	},	

	/**
	 * @description Prompts the user to see if they want to exit d3v.
	 **/	
	exitD3V : function() {
		if(confirm('Are you sure you want to logout of ASIDE?')) {
			d3vUtil.alert('closing ASIDE...');
			d3vUtil.saveStatus(true);
			d3vSync.removeCurrentInstanceStatus();
			
			setTimeout(function() {
				d3vSync.send({ type : REQUEST_CLOSE });			
			}, CLOSE_TIMEOUT);
			
			d3vUtil.endSession();
		}
	},
	
	/**
	 * @description Exits the user out of ASIDE, sending them to the login screen
	 **/
	endSession : function() {
		$(window).unbind('beforeunload');
		$('div#generic-overlay').show();
		d3vUtil.sendToLogin();	
	},
	
	/**
	 * @description Binds all keyboard related events.
	 **/
	bindControls : function() {
		//Remove Ace commands
		editor.commands.removeCommand('find');
		editor.commands.removeCommand('replace');
		editor.commands.removeCommand('findnext');
		editor.commands.removeCommand('gotoline');
		editor.commands.removeCommand('duplicateSelection');
		editor.commands.removeCommand('expandtoline');
		
		if(rightEditor) {
			rightEditor.commands.removeCommand('find');
			rightEditor.commands.removeCommand('replace');
			rightEditor.commands.removeCommand('findnext');
			rightEditor.commands.removeCommand('gotoline');
			rightEditor.commands.removeCommand('duplicateSelection');
			rightEditor.commands.removeCommand('expandtoline');
		}
			
	    //Add save command to editor
	    Mousetrap.bindGlobal('mod+s', function(evt) {
	    	if(d3vCode.isActive()) {
	    		setTimeout(function() {
	    			d3vCode.saveFile();
	    		}, 1);
	    	}
	    	
	    	if(d3vData.isActive()) {
	    		d3vData.performQuery();
	    	}
	    	
	    	return false;
	    });

	    //easy to accidentally leave without this
	    Mousetrap.bindGlobal('mod+[', function(evt) {
	    	return false;
	    });
	    
	    //Add find command to editor
	    Mousetrap.bindGlobal('mod+f', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.openFind(true);
	    	}
	    	
	    	return false;
	    });
	    
	    //Reset the stylesheet to default
	    Mousetrap.bindGlobal('mod+shift+\\', function(evt) {
	    	if(confirm("Are you sure you want to reset to the default stylesheet?  This will cause ASIDE to reload.")) {
	    		d3vCode.resetToDefaultCSS();
	    	}
	    	
	    	return false;
	    });	 	    
	    
	    //Add re-execute command to editor
	    Mousetrap.bindGlobal('mod+r', function(evt) {	    			     
	    	if(d3vCode.isActive()) {
	    		setTimeout(d3vCode.redoLastAction, 200);
	    	}
	    	
	    	return false;
	    });

	    //Bind open lightning bundle popup shortcut
	    Mousetrap.bindGlobal('mod+shift+y', function(evt) {
	    	if(d3vCode.isActive()) {
		    	d3vCode.showRelatedFiles();
		    }
		    
	    	return false;
	    });

	    //Bind open shortcuts
	    Mousetrap.bindGlobal('mod+shift+h', function(evt) {
		    d3vUtil.openShortcutDocs();
		    
	    	return false;
	    });
	    
	    //Bind open help
	    Mousetrap.bindGlobal('mod+shift+0', function(evt) {
	    	d3vUtil.openHelpDocs();
	    	
	    	return false;
	    });	    
	    
	    //Bind developer mode toggle
	    Mousetrap.bindGlobal('mod+shift+v', function(evt) {
	    	d3vCode.toggleDevelopmentMode();
	    	
	    	return false;
	    });
	    
	    //Bind minify
	    Mousetrap.bindGlobal('mod+shift+b', function(evt) {
	    	d3vCode.beautify();
	    	
	    	return false;
	    });
	    
	    //Bind minify
	    Mousetrap.bindGlobal('mod+shift+m', function(evt) {
	    	d3vCode.minify();
	    	
	    	return false;
	    });	    	    	               

		//Bind diff toggle
	    Mousetrap.bindGlobal('mod+shift+a', function(evt) {	    			     
	    	if(d3vCode.isActive()) {
	    		setTimeout(d3vUtil.toggleDiffs, 200);
	    	}
	    	
	    	return false;
	    });   
	    
		//Generate WSDL
	    Mousetrap.bindGlobal('mod+shift+f', function(evt) {	    			     
	    	if(d3vCode.isActive()) {
	    		setTimeout(d3vCode.generateWSDL, 200);
	    	}
	    	
	    	return false;
	    });   
	    
	    //Add jump to typeahead to editor
	    Mousetrap.bindGlobal('mod+b', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.putCursorInCodeHelper();
	    	} else if(d3vData.isActive()) {
	    		$('input#query-source').focus().click();
	    	}
	    	
	    	return false;
	    }); 
	
	    //Add delete command to editor
	    Mousetrap.bindGlobal('mod+k', function(evt) {
	    	if(d3vCode.isActive()) {
	    		setTimeout(d3vCode.performFileDelete, 200);
	    	}
	    	
	    	return false;
	    });	      
	
	    //Add org code search command to editor
	    Mousetrap.bindGlobal('mod+h', function(evt) {
	    	if(d3vCode.isActive()) {
	        	d3vPopups.showGlobalPanel('Find in All Code', '#ocs-popup');
	    	}
	    	
	    	return false;
	    }); 
	
	    //Add update version command to editor
	    Mousetrap.bindGlobal('mod+u', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.openUpdateDialog();
	    	}
	    	
	    	return false;
	    });
	    
		editor.commands.addCommand({
		    name: 'open-update-version',
		    bindKey: {win: 'Ctrl-u',  mac: 'Command-u'},
		    exec: function(editor) {
		    	if(d3vCode.isActive()) {
		    		d3vCode.openUpdateDialog();
		    	}
		    }
		});	    
	    
	    //Run the current test class.
	    Mousetrap.bindGlobal('mod+g', function(evt) {
	    
	    	if(d3vCode.isActive()) {
	    		d3vTest.executeCurrentTest();
	    	}
	    	
	    	return false;
	    });
	    
	    //Rename the current file
	    Mousetrap.bindGlobal('mod+e', function(evt) {
	    
	    	if(d3vCode.isActive()) {
	    		d3vCode.changeCurrentFileName();
	    	}
	    	
	    	return false;
	    });	    
	    
	    //Open the help dialog
	    Mousetrap.bindGlobal('up up down down left right left right b a enter', function(evt) {
	    	d3vPopups.openHelp();		
		});
	    
	    //Open the local history dialog
	    Mousetrap.bindGlobal('mod+l', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vArchive.openLocalHistoryDialog();
	    	}
	    	
	    	return false;
	    });

	    //Toggle diff editor open and closed
	    Mousetrap.bindGlobal('mod+shift+c', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vUtil.toggleDiffEditor();
	    	}
	    	
	    	return false;
	    }); 
	    
	    //Download editor contents
	    Mousetrap.bindGlobal('mod+shift+d', function(evt) {
	    	if(d3vCode.isActive()) {
	    		setTimeout(d3vCode.downloadEditorContents, 200);
	    	}
	    	
	    	return false;
	    }); 

	    //Open new instance of d3v
	    Mousetrap.bindGlobal('mod+shift+i', function(evt) {
    		window.open(D3V_URL, '_blank');
    		return false;
	    });	    
	    
	    //Open the current file in salesforce
	    Mousetrap.bindGlobal('mod+shift+o', function(evt) {
    		d3vUtil.openInSalesforce();
    		return false;
	    });
	    
	    //Open the debug log popup
	    Mousetrap.bindGlobal('mod+shift+l', function(evt) {
    		d3vCode.openDebugLogPopup();
    		return false;
	    });
	    
	    /**
	     * The next 9 controls are all for switching asides instance.
	     **/
	    Mousetrap.bindGlobal('ctrl+1', function(evt) {
	    	d3vUtil.switchInstance(0);
    		return false;
	    });

	    Mousetrap.bindGlobal('ctrl+2', function(evt) {
	    	d3vUtil.switchInstance(1);
    		return false;
	    });
	    
	    Mousetrap.bindGlobal('ctrl+3', function(evt) {
	    	d3vUtil.switchInstance(2);
    		return false;
	    });  	    

	    Mousetrap.bindGlobal('ctrl+4', function(evt) {
	    	d3vUtil.switchInstance(3);
    		return false;
	    });  
	    
	    Mousetrap.bindGlobal('ctrl+5', function(evt) {
	    	d3vUtil.switchInstance(4);
    		return false;
	    });
	    
	    Mousetrap.bindGlobal('ctrl+6', function(evt) {
	    	d3vUtil.switchInstance(5);
    		return false;
	    });
	    
	    Mousetrap.bindGlobal('ctrl+7', function(evt) {
	    	d3vUtil.switchInstance(6);
    		return false;
	    });  	    

	    Mousetrap.bindGlobal('ctrl+8', function(evt) {
	    	d3vUtil.switchInstance(7);
    		return false;
	    });  
	    
	    Mousetrap.bindGlobal('ctrl+9', function(evt) {
	    	d3vUtil.switchInstance(8);
    		return false;
	    });  	    	      	    	    	      
	    
	    //Switch to code section
	    Mousetrap.bindGlobal('mod+shift+6', function(evt) {
	    	if(!d3vCode.isActive()) {
	    		d3vUtil.switchSection(CODE_SECTION);
	    	}
	    	
	    	return false;
	    });
	    
	    //Switch to test section
	    Mousetrap.bindGlobal('mod+shift+7', function(evt) {
	    	if(!d3vTest.isActive()) {
	    		d3vUtil.switchSection(TEST_SECTION);
	    	}
	    	
	    	return false;
	    });
	    
	    //Switch to push section
	    Mousetrap.bindGlobal('mod+shift+8', function(evt) {
	    	if(!d3vPush.isActive()) {
	    		d3vUtil.switchSection(PUSH_SECTION);
	    	}
	    	
	    	return false;
	    });
	    
	    //Switch to data section
	    Mousetrap.bindGlobal('mod+shift+9', function(evt) {
	    	if(!d3vData.isActive()) {
	    		d3vUtil.switchSection(DATA_SECTION);
	    	}
	    	
	    	return false;
	    });	
	    
	    //Show code coverage for the current file
	    Mousetrap.bindGlobal('mod+;', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.displayTestCoverage();
	    	}
	    	
	    	return false;
	    });	
	    
	    //Toggle coverage highlights for the current file
	    Mousetrap.bindGlobal('mod+shift+;', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.toggleCoverageHighlights();
	    	}
	    	
	    	return false;
	    });	
	    
	    //Navigate to selected class
	    Mousetrap.bindGlobal('mod+j', function(evt) {
	    	if(d3vCode.isActive()) {
	    		d3vCode.navigateToSelected();
	    	}
	    	
	    	return false;
	    });		    
	    
	    //Save ASIDE tab status
	    Mousetrap.bindGlobal('mod+shift+,', function(evt) {
	    	d3vUtil.saveStatus(false);
	    	return false;
	    });
	    
	    //Load ASIDE tab status
	    Mousetrap.bindGlobal('mod+shift+.', function(evt) {
	    	d3vUtil.loadStatus();
	    	return false;
	    });    	    
	    
	    //Quit ASIDE
	    Mousetrap.bindGlobal('mod+shift+x', function(evt) {
	    	d3vUtil.exitD3V();
	    	return false;
	    });
	    
	    //Open Help
	    Mousetrap.bindGlobal('mod+shift+p', function(evt) {
	    	d3vUtil.openHelp();
	    	return false;
	    });	
	    
	    //Open User Detail
	    Mousetrap.bindGlobal('mod+shift+u', function(evt) {
	    	d3vUtil.openUserDetail();
	    	return false;
	    });		        		        	       
	    
	    //Bind enter to trigger find next  
	    $('textarea#find-textarea').keydown(function(event) {
	        if(event.keyCode === 13) {
	        	if(!key.ctrl) {
		            event.preventDefault();
		            d3vCode.performFind(false);	        	
	        	}
	        }
	    });	
	    
	    //Bind enter to lighting save new input
	    $('input#lightning-bundle-name').keydown(function(event) {
	        if(event.keyCode === 13) {
	        	if(!key.ctrl && !$('.ui-autocomplete').is(':visible')) {
		            event.preventDefault();
		            d3vCode.createLightning();	        	
	        	}
	        }
	    });		        
	    
	    $('.ocs-input').keydown(function(event) {
	        if(event.keyCode === 13) {
	        	if(!key.ctrl) {
		            event.preventDefault();
		            d3vCode.findInFiles();	        	
	        	}
	        }
	    });
	
		//On escape close help and any open animated modals
		$(document).keyup(function(event) {     
		    if(event.keyCode === 27) {
		        var closedModal = d3vPopups.closePopups();
		        
		        if(!closedModal) {
		        	d3vPopups.hideGlobalPanel();
		        }
		    }
		});
	},

	/**
	 * @description Displays and sizes ace for initial display of d3v.
	 **/	
	sizeGrid : function() {
	    var $appWindow  = $(window);
	    var $d3vHeader  = $("div#d3v-header");
	    var $slickgrid  = $('div#myGrid');	

	    d3vUtil.sizeSlickGrid($slickgrid, $d3vHeader, $appWindow);
	},
	
	/**
	 * @description Routes the global panels help link to the appropriate piece of documentation
	 **/
	routeGlobalPanelHelp : function() {
		window.open('/help#' + $('.gp-panel:visible').attr('id'), '_blank');
	},
	
	/**
	 * @description Displays and sizes slickgrid for initial display of d3v.
	 **/
	sizeEditor : function() {
		var $appWindow  = $(window);
		var $d3vHeader  = $("div#d3v-header");
		var $aceEditor  = $("div#d3v-ace-main");
		var $diff       = $('div#diff-ace-right');
		var $gutter     = $('div#diff-gutter');
		var $container  = $('div#diff-container');
		var diffShowing = $gutter.is(':visible');
		var fullHeight  = d3vUtil.getContentHeight($appWindow, $d3vHeader);
		
		$aceEditor.height(fullHeight);
		$diff.height(fullHeight);
		$gutter.height(fullHeight);
		$container.height(fullHeight);
	},
	
	/**
	 * @description Switches to a different instance of aside, by index
	 * @param       index - the 0-based index of the instance to switch to
	 **/
	switchInstance : function(index) {
		var $instance = $('.instance-file');

		if($instance && $instance.length && index < $instance.length) {
			d3vSync.send({ 
				type : REQUEST_SWITCH, 
			    to   : $($('.instance-file')[index]).attr('instance')
			});			
		}	
	},

	/**
	 * @description Opens a file in a new instance of d3v
	 * @param		filename   - filename to open in new instance
	 * @param		openTo     - (optional) object with either a line number or token to find in newly opened doc
	 **/
	openFileInNewWindow : function(filename, openTo) {
		var url = D3V_URL + '?file=' + encodeURIComponent(filename);
		
		if(openTo) {
			if(openTo.token) {
				url += '&find=' + encodeURIComponent(openTo.token);
			} else if(openTo.lineNumber) {
				url += '&ln=' + encodeURIComponent(openTo.lineNumber);
			}
		}
		
		window.open(url, '_blank');
	},
	
	/**
	 * @description Execute a command in a new window
	 * @param		command - the command to execute
	 **/
	executeCommandInNewWindow : function(command) {
		var url = D3V_URL + '?command=' + encodeURIComponent(command);
		
		window.open(url, '_blank');
	},	

	/**
	 * @description Opens the file being viewed in salesforce.
	 * @param       whereTo - (optional) page to open in salesforce
	 **/
	openInSalesforce : function(whereTo) {
		if(whereTo && typeof whereTo === "string") {
			d3vUtil.visitThroughFrontdoor(whereTo);
		} else if(d3vCode.isActive()) {
			d3vCode.openInSalesforce();
		} else if(d3vTest.isActive()) {
			d3vTest.openInSalesforce();
		} else if(d3vPush.isActive()) {
			d3vPush.openInSalesforce();
		} else if(d3vData.isActive()) {
			d3vData.openInSalesforce();
		} else {
			d3vUtil.visitThroughFrontdoor('/home/home.jsp');
		}
	},
	
	/**
	 * @description pads a number with a leading zero
	 * @param       num - the number to pad
	 * @return      the padded number
	 **/
	padNumber : function(num) {
	    return ("0" + num).slice(-2);
	},
	
	/**
	 * @description format a datetime in the salesforce query format (ISO format)
	 * @param       toFormat - the date to format
	 * @return      the formatted date
	 **/	
	formatQueryDate : function(toFormat) {
	    return [toFormat.getUTCFullYear(), 
	            d3vUtil.padNumber(toFormat.getUTCMonth() + 1), 
	            d3vUtil.padNumber(toFormat.getUTCDate())].join("-") + "T" + 
	           [d3vUtil.padNumber(toFormat.getUTCHours()), 
	            d3vUtil.padNumber(toFormat.getUTCMinutes()), 
	            d3vUtil.padNumber(toFormat.getUTCSeconds())].join(":") + "Z";
	},
	
	/**
	 * @description Builds the url to visit a page through frontdoor.jsp
	 **/
	getFrontdoorURL : function(retUrl) {
		var pep       = decodeURIComponent(CookieUtil.readCookie(COOKIE_PRE + COOKIE_PEP));
		var sid       = decodeURIComponent(CookieUtil.readCookie(COOKIE_PRE + COOKIE_SID));	
				
		return pep.split('/services/Soap/u/')[0] + 
		       '/secur/frontdoor.jsp?sid=' + sid + 
		       '&retURL=' + encodeURIComponent(retUrl);	
	},

	/**
	 * @description Open a new tab via the salesforce frontdoor.
	 * @param		retUrl - url to visit after frontdoor redirects user
	 * @param       viewer (optional) - set an existing window to use the frontdoor opposed to the global window		
	 **/	
	visitThroughFrontdoor : function(retUrl, viewer) {
		var frontdoor = d3vUtil.getFrontdoorURL(retUrl);
		
		if(viewer) {
			viewer.location.href = frontdoor;
		} else {
			window.open(frontdoor, '_blank');
		}
	}, 
	
	/**
	 * @description Gets org id of current org.
	 * @return		id of current org
	 **/
	getOrgId : function() {
		var cookieVal = CookieUtil.readCookie('d3vmep');
		if(cookieVal) {
			return cookieVal.substring(cookieVal.length - 15, cookieVal.length);
		} else {
			return '';
		}
	},

	/**
	 * @description Gets the value for a url parameter
	 * @param		name - name of url parameter
	 * @from        http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
	 **/
	getURLParameter : function(name) {
	    return decodeURIComponent(
	    	(new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	},
	
	/**
	 * @description Inspects and handles url parameters
	 * @return		true when a url valid parameter is found
	 **/
	inspectUrlParameters : function() {
		var url   = location.href;
		var found = false;
		
		if(url.indexOf('section') !== -1) {
			var section = d3vUtil.getURLParameter('section');
			
			if(section) {
				d3vUtil.switchSection(section);
				found = true;
			}		
		}

		if(url.indexOf('file') !== -1 || url.indexOf('command') !== -1) {
			var isCommand = url.indexOf('command') !== -1;
			var file = isCommand ? d3vUtil.getURLParameter('command') : d3vUtil.getURLParameter('file');
						
			if(file) {
				var lineNumber = d3vUtil.getURLParameter('ln');
				var findToken  = d3vUtil.getURLParameter('find');
				
				if(isCommand) {
					d3vCode.codeSelectionAction(file, false);
				} else if(lineNumber) {
					d3vCode.openFile(file, { lineNumber : lineNumber });
				} else if(findToken) {
					d3vCode.openFile(file, { token : findToken });
				} else {
					d3vCode.openFile(file);
				}
				
				found = true;
			}
		}
		
		if(url.indexOf('query=') !== -1) {
			var query = d3vUtil.getURLParameter('query');
			CookieUtil.eraseCookie('d3vpbq');
			
			if(query) {
				d3vUtil.switchSection(DATA_SECTION);
				$('input#query-source').trigger('focus').val(query);
				d3vData.performQuery();
				found = true;
			}
		}
		
		return found;
	},
	
	/**
	 * @description Switches to a different section
	 * @param       section - name of section to switch to (code|test|data|push)
	 **/
	switchSection : function(section) {
		$('div#mode-buttons').find('span.mode-button:contains("' + section + '")').trigger('click');	
		d3vUtil.resizeWindow();
		
		if($('div#help-dialog').is(':visible')) {
			d3vUtil.openHelp();
		}
	},
	
	/**
	 * @description Sets the cursor location footer text
	 **/
	displayLineNumber : function(pos) {
		var loc = 'line ' + (pos.row+1) + ', column ' + pos.column;
		$('span#fc-3').text(loc);
	},
		
	/**
	 * @description displays a welcome message to the user and sets the document title
	 **/
	displayWelcomeMessage : function() {
		d3vUtil.alert("Hi " + aside.user.firstname + ", welcome to ASIDE", { scheme : 'positive' });
	},
	
	/**
	 * @description Onclick handler for the main options on the toolbar
	 * @param		that - the link clicked that caused this event to fire
	 **/
	handleHeaderLinkClick : function(that) {
		//set selected link
		var $clicked = $(that);
	    $('div#mode-buttons span.active').removeClass('active').addClass('inactive');
	    $clicked.addClass('active');
	    
	    //hide everything so proper stuff can be shown
	    $('div.content-section').hide();
	    $('span.helper-section').hide();
	
		//show proper stuff
	    var whatWasClicked = $clicked.html().trim();
	    $('div#' + whatWasClicked + '-content').show();
	    $('span#' + whatWasClicked + '-helper').show();
	    
		//close autocomplete when switching tabs
		if(editor && editor.completer) {
			editor.completer.detach();
		}	    
	    
		d3vUtil.resizeWindow();
		d3vUtil.setTabName();
		
		//special extras needed
	    if(whatWasClicked == 'code') {
	    	d3vTest.shutdownTestRefreshTimer();
	    	$('#code-footer').show();
	    	
	    	if(!$('select#code-helper-input').val()) {
	    		d3vUtil.alert('use the input to the left to edit or create code');
	    	} 
	    } else if(whatWasClicked == 'data') {
	    	d3vTest.shutdownTestRefreshTimer();
	    	$('#code-footer').hide();
	    	
	    	var queryVal = $('input#query-source').val(); 
	    	if(data.length === 0 && (!queryVal || queryVal === 'enter a soql query')) {
	    		d3vUtil.alert('enter a query below');
	    	}
	    } else if(whatWasClicked == 'test') {
			d3vTest.refreshResultTable();
	    	$('#code-footer').hide();
	    } else if(whatWasClicked == 'push') {
	    	d3vTest.shutdownTestRefreshTimer();
	    	d3vUtil.alert('select files to retrieve, or drop a zip to deploy');
	    	d3vPush.setVariableDiplays();
	    	$('#code-footer').hide();
	    }
	},
	
	/**
	 * @description Function which determines how header row filters, filter
	 * @param		item - a row of data
	 **/
	slickgridRowFilter : function(item) {
		var cid;
		var asText;
		var col;
		
		for (var columnId in columnFilters) {
			cid = columnFilters[columnId].toLowerCase();
			if (columnId !== undefined && cid !== "") {
				col = grid.getColumns()[grid.getColumnIndex(columnId)];
				
				if(col) { 				
					asText = ('' + item[col.field]).toLowerCase();
					
					if (col.field && asText && asText.indexOf(cid) !== 0) {
						return false;
					}
				}
			}
		}
	
		return true;
	},

	/**
	 * @description counts the number of properties of an object
	 * @param       obj - object to count number of properties on
	 * @return      the count
	 **/
	countProperties : function(obj) {
		var count = 0;
		
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)) {
				count++;
			}
		}
		
		return count;
	},

	/**
	 * @description Encodes a utf-8 string so its safe for transport
	 * @param		toEncode - string to encode
	 * @return		utf-8 string encoded
	 **/	
	encodeUtf8 : function(toEncode) {
  		return unescape(encodeURIComponent(toEncode));
	},
		
	/**
	 * @description Decodes a utf-8 string so the characters look correct
	 * @param		toDecode - ugly string
	 * @return		proper looking utf-8 string
	 **/	
	decodeUtf8 : function(toDecode) {
		ServerAction.setGlobalDebugInfo('real trace = ' + toDecode);
		var decodeResult = toDecode ? decodeURIComponent(escape(toDecode)) : '';
		ServerAction.resetGlobalDebugInfo();
  		return decodeResult;
	},

	/**
	 * @description Runs the batch jobs that archive the code
	 **/		
	updateSOSLIndex : function() {
		d3vUtil.alert('queueing indexing job...');
		
		ServerAction.deployD3VBatch(function(callbackData) {
			d3vUtil.alert('indexing job queued successfully!', { scheme : 'positive'});
		});
	},

	/**
	 * @description Uninstalls org code search
	 **/		
	uninstall : function() {
		d3vUtil.alert('uninstalling org code search...');

		var destructiveChanges = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>AsideCodeArchiveBatch</members><members>AsideTest</members><members>AsideTriggerUtil</members><members>AsideUtil</members><name>ApexClass</name></types><types><members>AsideCodeUpdateTrigger</members><name>ApexTrigger</name></types><types><members>Aside_Code_File__c</members><members>Aside_Code_Update__c</members><name>CustomObject</name></types><version>30.0</version></Package>';
		var packageXML = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><version>30.0</version></Package>';
				
		var uninstallZip = new JSZip();
		uninstallZip.file("destructiveChanges.xml", destructiveChanges);
		uninstallZip.file("package.xml", packageXML);
		
		d3vUtil.closeHelp();
		d3vUtil.switchSection('push');
		d3vPush.writeToPushConsole('Requesting destructive changes deploy...', true);
		d3vPush.updateDeployStatus(uninstallZip, true);		
		
		d3vPush.executeDeploy(uninstallZip.generate(), {
			allowMissingFiles : true,
			validateOnly : false,
			ignoreWarnings : true,
			purgeOnDelete : true,
			runAllTests : false	
		});
		
		aside.org.needsUpdate = true;
		aside.org.installed = false;
		aside.org.version = '';
	},
	
	/**
	 * @description Stops the tab from flashing further
	 **/
	stopFlashing : function() {
		if(tabFlashId) {
			clearInterval(tabFlashId);
		}
		
		d3vUtil.setOriginalFavicon();
	},
	
	/**
	 * @description Alternates the current tab title in an attempt to grab the users attention
	 **/
	flashForAttention : function() {
		d3vUtil.stopFlashing();
		
		$(document).attr(DOCUMENT_TITLE, TAB_FLASH_NAME);
		d3vUtil.setInvertedFavicon();
		
		tabFlashId = setInterval(function() {
		    var tabTitle   = document.title;
		    var asideTitle = d3vUtil.getTabName();
		
		    if(tabTitle === asideTitle) {
		    	$(document).attr(DOCUMENT_TITLE, TAB_FLASH_NAME);
		    	d3vUtil.setInvertedFavicon();
		    } else {
		    	$(document).attr(DOCUMENT_TITLE, asideTitle);
		    	d3vUtil.setOriginalFavicon();
		    }	
		}, FLASH_DELAY); 
	},
	
	/**
	 * @description Sets the favicon to the standard, non-inverted style
	 **/
	setOriginalFavicon : function() {
		$("link[rel*='icon'").remove();
		
	    var link = document.createElement('link');
	    link.type = 'image/x-icon';
	    link.rel = 'shortcut icon';
	    link.href = 'images/favicon.ico';
	    
	    document.getElementsByTagName('head')[0].appendChild(link);	
	},

	/**
	 * @description Sets the favicon to the non-inverted style
	 **/	
	setInvertedFavicon : function() {
		$("link[rel*='icon'").remove();
		
	    var link = document.createElement('link');
	    link.type = 'image/x-icon';
	    link.rel = 'shortcut icon';
	    link.href = 'images/faviconinvert.ico';
	    
	    document.getElementsByTagName('head')[0].appendChild(link);		
	},

	/**
	 * @description Return what the current tab should be labeled.
	 * @return      current tab (document) title
	 **/
	getTabName : function() {
	 	if(d3vData.isActive()) {
	 		return DATA_SECTION + ' [' + orgName + ']';
	 	} else if(d3vTest.isActive()) {
	 		return TEST_SECTION + ' [' + orgName + ']';
	 	} else if(d3vPush.isActive()) {
	 		return PUSH_SECTION + ' [' + orgName + ']';	 		
	 	}
	 	
 		if(lastAction) {
		    var fnSplit = lastAction.split(" ");
		    var command = fnSplit[0];
		    
		    if(command == "Open") {
		    	return fnSplit[1];
		    } else if(command == "New") {
		    	return lastAction;
		    } else if(command == "Go") {
		    	return 'waka waka waka';
		    } else if(command == "Execute") {
		    	return 'execute anonymous';
		    } else {
		    	return 'hai?';
		    }	 			
 		} else {
 			return 'code';
 		}	 
	},

	/**
	 * @description Tab blur handler
	 **/	 
	setTabName : function() {
		d3vUtil.stopFlashing();
		$(document).attr(DOCUMENT_TITLE, d3vUtil.getTabName());
	},
	
	/**
	 * @description Determines if the currently logged into org is a production environment.
	 * @return      true for prod, false for sandbox
	 **/
	isProductionEnvironment : function() {
		if(isProductionEnv !== undefined && isProductionEnv !== null) {
			return isProductionEnv;
		}
		
		var apiEndpoint = CookieUtil.readCookie('d3vaep');
		apiEndpoint     = decodeURIComponent(apiEndpoint);
		isProductionEnv = apiEndpoint.match(/cs\d{1,2}/gi) === null;
		
		return isProductionEnv;
	},	
	
	/**
	 * @description Attempts to reauthenticate the user
	 * @param       reasonEndpoint - used to track errors, this is the url that generated the 
	 *                               error this method is trying to recover from, or '/refresh' 
	 *                               if its called due to inactivity.	 
	 **/
	reauthenticate : function(reasonEndpoint) {
		$('div#generic-overlay').show();
		$('div#fatal-error-popup').show();
		$('div#fatal-error-popup-header span, span#fe-success, span#fe-failed').hide();
		$('div#fatal-error-popup-header img, span#fe-progress').show();
		
		ServerAction.refreshToken(true, reasonEndpoint);
	},
	
	/**
	 * @description Upon successful reauthentication, reset editor state to where the user left off
	 * @param       onReauth       - true when this method is called because an error occured 
	 *                               in the app, false when its called due to inactivity
	 * @param       reasonEndpoint - used to track errors, this is the url that generated the 
	 *                               error this method is trying to recover from, or '/refresh' 
	 *                               if its called due to inactivity.
	 **/
	handleSuccessfulReauthentication : function(onReauth, reasonEndpoint) {
		$('span#fe-progress').hide();
		$('div#fatal-error-popup-header img').hide();
		$('span#quick-recover, span#long-recover').hide();
		
		if(orgName) {
			$('span#fe-success').show();
			$('div#fatal-error-popup-header span.successful').show();		
			$('span#quick-recover').show();
			setTimeout(function() {
				$('div#generic-overlay').hide();
				$('div#fatal-error-popup').hide();
				d3vUtil.alert('recovery successful!', { scheme : 'positive' });
				saving = false;
				CookieUtil.setCookieClone();		
			}, ERROR_MESSAGE_PAUSE);		
		} else {
			if(localStorage.errorRecoveryInProcess == 'true' || localStorage.errorRecoveryInProcess == true) {
				ServerAction.handleRefreshFailure(onReauth, reasonEndpoint);
			} else {
				localStorage.errorRecoveryInProcess = true;
				$('span#fe-success').show();
				$('div#fatal-error-popup-header span.successful').show();				
				$('span#long-recover').show();
				$(window).unbind('beforeunload');
				
				setTimeout(function() {
					d3vUtil.alert('recovery successful!', { scheme : 'positive' });
					var recoveryUrl = '';
					
					if(d3vCode.isActive() && currentFile) {
						var currentLine = editor.selection.getCursor() && editor.selection.getCursor().row ?
										  editor.selection.getCursor().row + 1 : 1;
										  
						recoveryUrl = '?file=' + encodeURIComponent(currentFile) + '&ln=' + encodeURIComponent(currentLine);
					} else if(d3vData.isActive()) {
						recoveryUrl = '?section=data';
					} else if(d3vTest.isActive()) {
						recoveryUrl = '?section=test';
					} else if(d3vPush.isActive()) {
						recoveryUrl = '?section=push';
					}
					
					window.location.href = D3V_URL + recoveryUrl;			
				}, ERROR_MESSAGE_PAUSE);
			}		
		}	
	},
	
	/**
	 * @description If ASIDE fails to reauthenticate, sends user to login screen and informs them ASIDE could not recover from the error
	 **/
	handleFailedReauthentication : function() {
		$('span#fe-progress').hide();
		$('span#fe-failed').show();
		$('div#fatal-error-popup-header img').hide();
		$('div#fatal-error-popup-header span.failed').show();
		d3vArchive.saveEmergencyCopy();
		
		setTimeout(function() {
			d3vUtil.clearCookiesAndLogout();
		}, ERROR_MESSAGE_PAUSE);
	}
}