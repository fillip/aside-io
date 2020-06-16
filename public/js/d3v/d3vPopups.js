/*
 @description d3v popup functionality
 @date 8.17.2012
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vPopups = {

	/**
	 * @description Opens the help dialog
	 **/	
	openHelp : function() {
    	if(gme) {
	    	$('div#d3v-header').removeClass('gm-ee');
	    	d3vUtil.alert('D3V Mode Disabled :(');
			myAudio.pause();
			myAudio.currentTime = 0;	
    	} else {
	    	$('div#d3v-header').addClass('gm-ee');
	    	d3vUtil.alert('D3V Mode Enabled!');
	    	/*
			myAudio = new Audio('css/images/gm.mp3'); 
			if (typeof myAudio.loop == 'boolean') {
			    myAudio.loop = true;
			} else {
			    myAudio.addEventListener('ended', function() {
			        this.currentTime = 0;
			        myAudio.load();
			        this.play();
			    }, false);
			}
			myAudio.load();
			myAudio.play(); 	
			*/
    	}	
    	
    	gme = !gme;
	},
	
	/**
	 * @description Closes all error related popups
	 * @param       panelOrigin - (optional) screen panel originated from code/test/push/data 
	 **/
	closeErrorPopups : function(panelOrigin) {
		d3vPopups.hideGlobalPanel(panelOrigin);
	},
	
	/**
	 * @description Saves the preferred size of the global panel so it can be used later, as a percentage
	 **/
	saveGlobalPanelSize : function() {
		localStorage[COOKIE_PRE + GP_PREF_SIZE] = $('#global-panel').width();
	},
	
	/**
	 * @description Loads the preferred size of the global panel so the user doesnt need to constantly manipulate it
	 **/	
	getGlobalPanelSize : function() {
		var prefSize = localStorage[COOKIE_PRE + GP_PREF_SIZE];
		
		if(prefSize && prefSize.length) {
			return parseInt(prefSize);
		}
		
		return GP_DEFAULT_PREF_SIZE;
	},
	
	/**
	 * @description Resets the global panel size to the default size
	 **/
	resetGlobalPanelSize : function() {
		delete localStorage[COOKIE_PRE + GP_PREF_SIZE];
		d3vPopups.setGlobalPanelSize($('#global-panel'), d3vPopups.getGlobalPanelSize());
	},
	
	/**
	 * @description Sets the global panel size to the specified value
	 * @param       $gp - jquery object for global panel
	 * @param       gpSize - new size of global panel as a percentage
	 **/
	setGlobalPanelSize : function($gp, gpSize) {
		var bodySize = $(window).width() - gpSize;
		
		$('#d3v-body').css({"width" : bodySize + "px"});
		$gp.show().css({"width" : gpSize + "px"});
		d3vUtil.resizeWindow();	
	},	
	
	/**
	 * @description Toggles the global panel open, or closes it is its already open
	 * @param       panelTitle - title of panel content
	 * @param       panelSelector - selector of panel content to display
	 * @param       panelOrigin - screen panel opened from 'code', 'push', 'test', 'data', or dont send anything for a panel which should be considered global
	 * @return      true when panel is open, false when it was forced shut
	 **/
	showGlobalPanel : function(panelTitle, panelId, panelOrigin) {
		var $gp = $('#global-panel');
		var $gpSub = $(panelId);
		var $currentPanel = $('.gp-panel:visible');
		var $gpClose = $('#gp-close').text('close');
		var findIgnoreCase = panelId === '#find-popup';
	    
		if(!findIgnoreCase && $currentPanel && $currentPanel.length && !$currentPanel.hasClass('error-pop') && $gpSub.hasClass('error-pop')) {
			$gpClose.text('back');		
			$currentPanel
				.addClass('reopen-panel')
				.attr('panel-title', $('#gp-title-text').text())
				.attr('panel-origin', $currentPanel.attr('gp-origin') || '');
		}
		
		$('.gp-panel').hide();
		$gpSub.show();
		$('#gp-title-text').text(panelTitle);
		
		if(panelOrigin && panelOrigin.length) {
			$gpSub.attr('gp-origin', panelOrigin);
		} else {
			$gpSub.removeAttr('gp-origin');
		}
		
		d3vPopups.setGlobalPanelSize($gp, d3vPopups.getGlobalPanelSize());
		d3vPopups.repositionDiffEditor($gp, $('#diff-gutter'), $(window).width());
		d3vUtil.dragResizeEditors();
		d3vUtil.resizeWindow();
		d3vPopups.saveGlobalPanelOpen(true, panelTitle, panelId, panelOrigin);
		return true;
	},
	
	/**
	 * @description Closes the global panel
	 * @param       panelOrigin - (optional) screen panel originated from code/test/push/data
	 **/
	hideGlobalPanel : function(panelOrigin) {
		var $gp = $('#global-panel');
		var $underPanel = $('.gp-panel.reopen-panel');
		
		if(panelOrigin && panelOrigin.length) {
			var currentOrigin = $gp.find('.gp-panel:visible').attr('gp-origin');

			if(currentOrigin !== panelOrigin) {
				return;
			}
		}
		
		if($gp.is(':visible')) {
			$gp.hide();
			$('.gp-panel').removeAttr();
			$('#d3v-body').width($(window).width());
			d3vUtil.resizeWindow();
			d3vPopups.saveGlobalPanelOpen(false);
		}
		
		//hide global panel calls open and removes this class
		if($underPanel && $underPanel.length) {
			var panelTitle = $underPanel.attr('panel-title');
			var panelId = '#' + $underPanel.attr('id');
			var previousPanelOrigin = $underPanel.attr('panel-origin') || null;
			$underPanel.removeClass('reopen-panel').attr('panel-title', '');
			d3vPopups.showGlobalPanel(panelTitle, panelId, previousPanelOrigin);
			return;
		}		
	},	
	
	/**
	 * @description Loads the open (e.g. open or not) status of the global panel, and restores the panel to said status
	 **/
	loadGlobalPanelOpen : function() {
		var gpOpen = localStorage[COOKIE_PRE + GP_PREF_OPEN];
		
		if(gpOpen && gpOpen.length) {
			gpOpen = JSON.parse(gpOpen);
			
			if(gpOpen.id === '#debug-logs') {
				d3vCode.refreshDebugLogList(true);
			} else if(gpOpen.id === '#code-errors-list' || gpOpen.id === '#general-errors' || gpOpen.id === '#local-history') {
				return;
			}
			
			d3vPopups.showGlobalPanel(gpOpen.title, gpOpen.id, gpOpen.origin);
		}
	},

	/**
	 * @description Saves the open (e.g. open or not) status of the global panel
	 * @param       panelOpen     - true if the panel is open, false if it is closed
	 * @param       panelTitle    - title of panel content
	 * @param       panelSelector - selector of panel content to display
	 * @param       panelOrigin   - screen panel opened from 'code', 'push', 'test', 'data', or dont send anything for a panel which should be considered global
	 **/	
	saveGlobalPanelOpen : function(panelOpen, title, id, origin) {
		if(panelOpen) {
			var gpOpen = {
				title : title, id : id, origin : (origin || '')
			};
			
			localStorage[COOKIE_PRE + GP_PREF_OPEN] = JSON.stringify(gpOpen);		
		} else {
			localStorage[COOKIE_PRE + GP_PREF_OPEN] = '';
		}
	},	
	
	/**
	 * @description Initializes global panel resize functionality
	 **/
	setupGlobalPanelResize : function() {
		$('#global-panel').resizable({
			handles : "w",
			maxWidth : parseInt($(window).width() * GP_MAX_SIZE),
			minWidth: 185,
			start : function() {
				
			},
			stop : function() {
				d3vPopups.repositionDiffEditor($('#global-panel'), $('#diff-gutter'), $(window).width()); 
				d3vPopups.dragResizeGlobalPanel();
				d3vUtil.resizeWindow();
				d3vPopups.saveGlobalPanelSize();
			},
			resize : function() {
				d3vPopups.dragResizeGlobalPanel();
				d3vUtil.resizeWindow();
			}
		});
	},	
	
	/**
	 * @description Resizes the global panel so it maintains proportionality
	 **/
	resizeGlobalPanel : function() {
		var $gp = $('#global-panel');
		
		$gp.css({"height" : "", "position" : "", "top" : "", "left" : ""});
		
		if($gp.hasClass('ui-resizable')) {
			$gp.resizable('option', 'maxWidth', parseInt($(window).width() * GP_MAX_SIZE));
		}
		
		d3vPopups.dragResizeGlobalPanel();
	},
	
	/**
	 * @description Resizes the main div when the global panel is dragged
	 * @param       $handle - the global panel handle jquery obj
	 **/
	dragResizeGlobalPanel : function($handle) {
		$handle = $handle || $('div#global-panel');
		
		var containerWidth = $(window).width();
		
		if($handle.is(':visible')) {
			var bodySize = containerWidth - $handle.outerWidth();
			$('#d3v-body').width(bodySize);	
			
			if($handle.width() <= GP_SMALL_TABLE && !$handle.hasClass('gp-small')) {
				$handle.addClass('gp-small').removeClass('gp-large');
			} else if ($handle.width() > GP_SMALL_TABLE && !$handle.hasClass('gp-large')) {
				$handle.removeClass('gp-small').addClass('gp-large');
			}
		} else {
			$('#d3v-body').width($(window).width());
		}	
	},	
	
	/**
	 * @description Moves the diff editor gutter to be left of the global panel
	 **/
	repositionDiffEditor : function($gp, $gutter, windowWidth) {
		if($gutter.is(':visible')) {
			var gpWidth     = $gp.is(':visible') ? $gp.width() : 0;
			var gpLeft      = windowWidth - gpWidth;
			var gutterWidth = $gutter.width();
			var gutterLeft  = parseInt($gutter.css('left'));
			
			if(gutterLeft > gpLeft - gutterWidth) {
				$gutter.css({
					left : (gpLeft - gutterWidth) + "px"
				});
			}		
		}
	},
	
	/**
	 * @description Displays a message to the user within a popup.
	 * @param       title     - the title of the dialog
	 * @param       message   - to display to user.
	 * @param       rawResult - API error that caused this method to be called
	 * @param       origin    - global panel origin
	 **/
	displayMessage : function(title, message, rawResult, origin) {
		d3vCode.buildErrorDialogMarkup($('#general-errors'), -1, message, rawResult, message, true);
		d3vPopups.showGlobalPanel(title, '#general-errors', origin);
	},	

	/**
	 * @description Sets up close button for all d3v popups
	 * @param       event - contains info related to the click
	 **/
	handlePopupExit : function(event) {
	    var $parent = $(event.target).parent().parent();
	    $parent.hide();
	    $('div#generic-overlay').hide();
	},
	
	/**
	 * @description Toggles a find option on and off.
	 * @param       event - click event
	 **/
	findSetOnOff : function(event) {
	    $(event.target).toggleClass('d3v-ph-active');
	},
	
	/**
	 * @description Determines if find by regex is on
	 * @return      true when its on, false when not
	 **/
	isFindByRegexOn : function() {
	    return $('#find-by-regex').is(':checked');
	},
	
	/**
	 * @description Determines if wrap find is on
	 * @return      true when its on, false when not
	 **/
	isFindWithWrapOn : function() {
	    return $('#find-with-wrap').is(':checked');
	},
	
	/**
	 * @description Determines if find by whole word is on
	 * @return      true when its on, false when not
	 **/
	isFindByWholeOn : function() {
	    return $('#find-by-whole').is(':checked');
	},
	
	/**
	 * @description Determines if find is case sensitive
	 * @return      true when its on, false when not
	 **/
	isFindCaseSensitive : function() {
	    return $('#find-case-sensitive').is(':checked');
	},
	
	/**
	 * @description Sets the version displayed by the popup
	 * @param       version - version to set
	 **/
	setDefaultVersion : function(version) {
	    $('select#version-selector').val(version);
	},
	
	/**
	 * @description Initializes the version popup.
	 **/
	setupVersionPopup : function() {
	    $('span#update-to-new-version').click(d3vCode.updateVersion);
	    
	    for(var i = MAX_VERSION; i >= MIN_VERSION; i--) {
	        var option = '<option>' + i + '.0' + '</option>';
	        $('select#version-selector').append(option);
	    }
	},
	
	/**
	 * @description Initializes the retrieve version popup.
	 **/
	setupRetrieveVersionPopup : function() {
		var $select = $('#package-xml-version');
		var option;
		
	    for(var i = MAX_VERSION; i >= MIN_VERSION; i--) {
	        option = '<option>' + i + '.0' + '</option>';
	        $select.append(option);
	    }
	},	
	
	/**
	 * @description Instantiates the find popup.
	 **/
	setupFindPopup : function() {
	    $('div.d3v-ph-find').click(d3vPopups.findSetOnOff);
	    
	    var findNext = function() {
	    	d3vCode.performFind(false);
	    }
	    
	    var findPrev = function() {
	    	d3vCode.performFind(true);
	    }
	    
	    var replaceSingle = function() {
	    	d3vCode.performReplace(false);
	    }
	    
	    var replaceAll = function() {
	    	d3vCode.performReplace(true);
	    }
	    
	    $('div#find-next').click(findNext);
	    $('div#find-previous').click(findPrev);
	    $('div#replace-selected').click(replaceSingle);
	    $('div#replace-all').click(replaceAll);
	},
	
	/**
	 * @description Closes all open popups
	 * @param       returns true when it actually closes a popup
	 **/
	closePopups : function() {
		var closeEligible = 
			!$('#deploy-popup-header img').is(':visible') && d3vUtil.isDoneLoading();
		
		if(closeEligible) {
			if($('.save-reseter:visible').length > 0) {
				saving = false;
			}		
		
			var $modal = $('.animated-modal:visible');
			$modal.hide();
			$('#generic-overlay').hide();	
			
			return $modal.length > 0;	
		}
		
		return false;
	},

	/**
	 * @description Opens the specified animated modal popup
	 * @param       popupName - selector of popup to display
	 **/	
	showAnimatedModal : function(popupName) {
    	d3vPopups.closePopups();
    	$('#generic-overlay').show();
    	$(popupName).show();		
	},
	
	/**
	 * @description Instantiates the org code search popup.
	 **/
	setupOCSPopup : function() {
	    $('#go-ocs').click(d3vCode.findInFiles);
	    $('#clear-ocs').click(d3vCode.clearOCS);
	    $('#update-ocs-index').click(d3vUtil.updateSOSLIndex);
	},
	
	/**
	 * @description Initializes all popups.
	 **/
	setupPopups : function() {	    
	    $('.d3v-popup-close').click(d3vPopups.handlePopupExit);
	    d3vPopups.setupFindPopup();
	    d3vPopups.setupVersionPopup();
	    d3vPopups.setupOCSPopup();
	    d3vPopups.setupGlobalPanelResize();
	    d3vPopups.loadGlobalPanelOpen();
	}
}