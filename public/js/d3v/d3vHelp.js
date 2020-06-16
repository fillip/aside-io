/*
 @description ASIDE.IO Help, About, Updates, Shortcuts code helpers
 @date 11.26.2016
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var ANIMATION_LENGTH = 350;
var SCROLL_TO_BUFFER = 15;
var SCROLL_TO_LENGTH = 1000;
var OUTLINE_OPEN_LENGTH = 700;
var CORRECTION_OFFSET = 140;
var COLLAPSED_HEADER_HEIGHT = 60;
var TITLE_BUFFER = 0;

var headerOriginalPosition;

$(document).ready(init);

function init() {
	showNavLinks();
	addTitleItemIds();
	initializeScrollWithPage();
	updateModKey();
	bindEvents();
	buildOutline();
}

function bindEvents() {
	bindToSection();
	bindOutlineToggles();
	bindMouseEvents();
	bindOther();
	bindOutlineSearch();
	bindSearchReset();
}

function bindSearchReset() {
	$('.search-reset').click(resetOutline);
}

function bindOutlineSearch() {
	$('.outline-search').keyup(filterOutline);
}

function insertAtPosition(target, add, position) {
	return [target.slice(0, position), add, target.slice(position)].join('');
}

function filterOutline() {
	var $this = $(this);
	var val = $this.val();
	var valLower;
	var $ele;
	var match;
	var matchLower;
	var start;
	var end;
	var bolded;
	valLower = val.toLowerCase();
	
	$('.outline-item').each(function(idx, ele) {
		$ele = $(ele);
		match = $ele.attr('original-text');
		$ele.text(match);
		
		if(match && match.length) {
			matchLower = match.toLowerCase();
			start = matchLower.indexOf(valLower);
			
			if(start === -1) {
				$ele.hide();
			} else {
				$ele.show();
				end = start + val.length + 3; //'<b>'.length is 3
				bolded = insertAtPosition(match, '<b>', start);
				bolded = insertAtPosition(bolded, '</b>', end);
				$ele.html(bolded);
			}
		}
	});
	
	$('.outline-item:visible').each(function(idx, ele) {
		$ele = $(ele);
		
		if($ele.hasClass('ol4')) {
			$ele.prevAll('.ol3:first').show();
			$ele.prevAll('.ol2:first').show();
			$ele.prevAll('.ol1:first').show();
		} else if($ele.hasClass('ol3')) {
			$ele.prevAll('.ol2:first').show();
			$ele.prevAll('.ol1:first').show();
		} else if($ele.hasClass('ol2')) {
			$ele.prevAll('.ol1:first').show();
		}	
	});
}

function resetOutline() {
	$('.outline-search').val('');
	var $ele;
	
	$('.outline-item').each(function(idx, ele) {
		$ele = $(ele);
		$ele.html($ele.attr('original-text'));
	}).show();
}

function bindOther() {
	$('.goes-prev').click(function() {
		scrollToAdjacentSection(false);
	});
	
	$('.goes-next').click(function() {
		scrollToAdjacentSection(true);
	});	
}

function bindMouseEvents() {
	$('body').on('mouseenter', '.scrolled', showNavLinks);
	$('body').on('mouseleave', '.scrolled', showTitleBlock);	
}

function showNavLinks() {
	$('span.title-block').css('display', 'none');
	$('a.nav-link').css('display', 'inline-block');
}

function showTitleBlock() {
	$('a.nav-link').css('display', 'none');
	$('span.title-block').css('display', 'inline-block');
}

function bindOutlineToggles() {
	$('#generic-overlay').click(toggleOutline);
	
	//On escape close help and any open animated modals
	$(document).keyup(function(event) {     
	    if(event.keyCode === 27) {
	        toggleOutline();
	    }
	});    	
}

function updateModKey() {
	if(!isOSX()) {
		$('.mod-key').text('ctrl');
	}
}

function isOSX() {
	return navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
}

function initializeScrollWithPage() {
	headerOriginalPosition = $('.nav-link').offset().top;
	$(window).scroll(scrollHeaderWithPage);
}

function scrollHeaderWithPage() {
	var $window   = $(this);
	var $toScroll = $('.header');
	var windowTop = $window.scrollTop();
	var offset    = windowTop - headerOriginalPosition;

	if(offset > 0) {
		$toScroll.addClass('scrolled');
		updateTitleBlockWithClosestTitle();
	} else {
		offset = 0;
		$toScroll.removeClass('scrolled');
		showNavLinks();
	}
	
	$toScroll
	  .stop(false, false)
	  .animate({ "top" : offset }, ANIMATION_LENGTH);
}  

function updateTitleBlockWithClosestTitle() {
	$('.title-block').text(getClosestTitleName());
	
	//workaround for hover detection bug	
	$('.scrolled').trigger('mouseleave');
}

function getClosestTitleName() {
	var $closest = getClosestTitleElement();

	if($closest && $closest.length) {
		return $closest.text();
	}

	return '';
}

function scrollToAdjacentSection(next) {
	var $closest = getClosestTitleElement();
	var $toScroll;
	
	
	if(!$('.header').hasClass('scrolled') && next) {
		$toScroll = $closest;
	} else if(next) {
		$toScroll = $closest.nextAll('.title-item:first');
	} else {
		$toScroll = $closest.prevAll('.title-item:first');
	}
	
	if(!$toScroll || ($toScroll && $toScroll.length === 0)) {
		if(next) {
			$toScroll = $closest;
		} else {
			scrollToTop(SCROLL_TO_LENGTH);
			return;
		}
	}
	
	scrollWindowToElement($toScroll, SCROLL_TO_LENGTH);
}

function scrollToTop(animationDuration) {
	$('html, body').animate({ scrollTop : 0 }, animationDuration); 
}

function getClosestTitleElement() {
	var $window = $(window);
	var top = $window.scrollTop() + COLLAPSED_HEADER_HEIGHT;
	var distance;
	var closestDistance = null;
	var $closest;
	var $ele;
	
	$('.title-item').each(function(index, ele) {
		$ele = $(ele);

		distance = top - ($ele.offset().top - TITLE_BUFFER);
		
		if(closestDistance === null || (distance > -1 && distance <= closestDistance)) {
			closestDistance = distance;
			$closest = $ele;
		}
	});

	return $closest;
}

function bindToSection() {
	$('.scroller').click(function() {
		scrollWindowTo($(this), SCROLL_TO_LENGTH);
	});
	$('.outline').click(toggleOutline);
}

function scrollWindowTo($that, animationDuration, offset) {
	var $to = $($that.attr('href'));
	scrollWindowToElement($to, animationDuration, offset);
}

function scrollWindowToElement($to, animationDuration, offset) {
	offset = offset || 0;
	offset = $to.offset().top - SCROLL_TO_BUFFER - offset;
	
	if(animationDuration) {
		$('html, body').animate({ scrollTop : offset }, animationDuration);  			
	} else {
		$(window).unbind('scroll');
		$(window).scrollTop(offset);
		$('.header').css('top', offset);
		$(window).scroll(scrollHeaderWithPage);
	}
}

function toggleOutline() {
	if(isOverlayOpen()) {
		closeOutline();
	} else {
		openOutline();
	}
}

function openOutline() {
	$(window).scrollTop($(window).scrollTop()+1);
	
	setTimeout(function() {
		var $toScroll = $('.header');
		var $window = $(window);
		var $outline = $('.outline-container');
		var height = $window.height() - $toScroll.outerHeight();
		$('.outline').text('close');
		showOverlay();
		showNavLinks();
		resetOutline();
		
		$toScroll
		  .stop(false, false)
		  .removeClass('scrolled')
		  .css({ "top" : $window.scrollTop() + 'px' });	
		  
		$outline
			.stop(false, false)
			.animate({"height":height + "px"}, OUTLINE_OPEN_LENGTH);	
	}, 10);
}

function closeOutline(callback) {
	var $toScroll = $('.header');
	var $window = $(window);
	var $outline = $('.outline-container');
	$('.outline').text('search');
	hideOverlay();
		
	scrollHeaderWithPage();  		
	  
	$outline.stop(false, false);
	
	$outline.animate({"height":"0px"}, OUTLINE_OPEN_LENGTH, function() {
		$toScroll.addClass('scrolled').trigger('mouseleave');
		
		if(callback) {
			callback();
		}
	});
}

function isOverlayOpen() {
	return $('#generic-overlay').is(':visible');
}

function showOverlay() {
	$('#generic-overlay').fadeIn(ANIMATION_LENGTH);
	$('body').css('overflow', 'hidden');
}

function hideOverlay() {
	$('#generic-overlay').fadeOut(ANIMATION_LENGTH);
	$('body').css('overflow', 'auto');
}

function buildOutline() {
	var $titles = $('.title-item');
	var markup = [];
	
	$titles.each(function(idx, ele) {
		markup.push(getOutlineItem($(ele)));
	});
	
	$('.outline-table').html(markup.join(''));
	$('.outline-item').unbind().click(function() {
		var $that = $(this);
		scrollWindowTo($that, 0, $(window).height() - CORRECTION_OFFSET);
		
		updateTitleBlockWithClosestTitle();
		
		closeOutline(function() {
			updateTitleBlockWithClosestTitle();
		}); 
	});
}

function getOutlineItem($titleItem) {
	var outlineClass = 'ol1';
	
	if($titleItem.hasClass('tl1')) {
		outlineClass = 'ol1';
	} else if($titleItem.hasClass('tl2')) {
		outlineClass = 'ol2';
	} else if($titleItem.hasClass('tl3')) {
		outlineClass = 'ol3';
	} else if($titleItem.hasClass('tl4')) {
		outlineClass = 'ol4';
	} else if($titleItem.hasClass('tl5')) {
		outlineClass = 'ol5';
	}
	
	return '<span original-text="' + 
	       $titleItem.text() + 
	       '" class="outline-item ' + 
	       outlineClass + 
	       '" href="#' + 
	       $titleItem.attr('id') + 
	       '">' + 
	       $titleItem.text() + 
	       '</span>';
}

function addTitleItemIds() {
	var count = 1;
	
	$('.title-item').each(function(idx, ele) {
		var $ele = $(ele);
		var eleId = $ele.attr('id');
		
		if(!eleId) {
			$ele.attr('id', 'title-item-' + count);
		}
		
		count++;
	});
}