/*
 @description d3v code functionality
 @date 7.19.2012
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vCode = {

	/**
	 * @description Returns true when the code section is active
	 * @return      true when active, false when not
	 **/
	isActive : function() {
		var $active = $('div#right span.mode-button.active');
		return $active && $active.length && $active.text() === 'code';
	},

	/**
	 * @description If a visualforce page is active, opens it in a new tab, otherwise opens the source code being viewed
	 **/	
	openInSalesforce : function() {
		var isPage  = currentFile ? currentFile.indexOf('.page') !== -1 : false;
		var content;
		var matches;
		var pageUrl;
		
		if(isPage) {
			content = editor.getSession().getValue();
			content = content.substring(0, content.indexOf('>'));
			matches = content.match(/\sstandardcontroller="([A-Za-z0-9\_]*)"/i);
			pageUrl = '/apex/' + currentFile.split('.')[0];
		}	
		
		if(isPage && matches && matches.length) { 
			var viewer = window.open(null, '_blank');
			
			ServerAction.query("SELECT Id FROM " + matches[1] + " ORDER BY LastModifiedDate DESC LIMIT 1", function(results) {
				results = eval('(' + results + ')');
				
				if(results && results.length) {
					d3vUtil.visitThroughFrontdoor(pageUrl + '?id=' + results[0].Id, viewer);
				} else if(currentFileId && currentFileId.length >= 15) {
					d3vUtil.visitThroughFrontdoor('/' + currentFileId, viewer);
				} else {
					d3vUtil.visitThroughFrontdoor('/home/home.jsp', viewer);
				}
			});
		} else if(isPage) {
			d3vUtil.visitThroughFrontdoor(pageUrl);
		} else if(currentFileId && currentFileId.length >= 15) {
			d3vUtil.visitThroughFrontdoor('/' + currentFileId);
		} else {
			d3vUtil.visitThroughFrontdoor('/home/home.jsp');	
		}
	},

	/**
	 * @description Clears all data in the code local history
	 **/
	clearCodeHistory : function() {
		if(confirm('Are you sure you want to delete the local history?')) {
			d3vUtil.alert('deleting...');
			d3vArchive.deleteAll(TABLE_CODE_HISTORY);
		}
	},	
	
	/**
	 * @description Display the "run" icon, to differentiate between running and saving when using exec anon
	 **/
	showRunIcon : function() {
		$('img#fs-save').hide();
		$('img#fs-run').show();
		$('span#foot-save').attr('title', 'run the anonymous block (shortcut: command + s)');
	},

	/**
	 * @description Display the "save" icon, to differentiate between running and saving when using exec anon
	 **/	
	showSaveIcon : function() {
		$('img#fs-run').hide();
		$('img#fs-save').show();
		$('span#foot-save').attr('title', 'save the current file (shortcut: command + s)');		
	},
	
	/**
	 * @description Sets the highlight based on the extension type
	 * @param       type - the file extension
	 **/
	setHighlight : function(type) {
		if(type === 'js') {
			d3vCode.setJavascriptHighlights();
		} else if(type === 'css') {
			d3vCode.setCSSHighlights();
		} else if(type === 'txt') {
			d3vCode.setTextHighlights();
		} else if(type === 'html') {
			d3vCode.setHTMLHighlights();
		} else if(type === 'xml') {
			d3vCode.setXMLHighlights();
		}
	},
	
	/**
	 * @description If text is selected, checks to see if it is an existing apex class and if it is, tries to navigate to it.
	 **/
	navigateToSelected : function() {
		var focusedEditor = d3vCode.getFocusedEditor(editor);
	
		focusedEditor.exitMultiSelectMode();
		var selectedText = $.trim(focusedEditor.getSelectedText());
		var loweredText  = selectedText.toLowerCase();
		
		if(selectedText && selectedText.length > 1 && selectedText.length < 200) {
			if(d3vCode.validateFilename(selectedText) === null) {
				d3vCode.navigateToSelectedClass(selectedText);
			} else if(d3vUtil.endsWith(loweredText, '__c')) {
				d3vCode.navigateToSelectedObject(selectedText);
			} else if(d3vUtil.startsWith(loweredText, 'apex:')) {
				d3vCode.navigateToSelectedVisualforceTag(loweredText, '');
			} else if(d3vUtil.startsWith(loweredText, '<apex:')) {
				d3vCode.navigateToSelectedVisualforceTag(loweredText, '<');
			} else if(d3vUtil.startsWith(loweredText, '</apex:')) {
				d3vCode.navigateToSelectedVisualforceTag(loweredText, '</');
			} else if(d3vUtil.startsWith(loweredText, 'c:')) {
				d3vCode.navigateToSelectedVisualforceComponent(selectedText, 'c:');
			} else if(d3vUtil.startsWith(loweredText, '<c:')) {
				d3vCode.navigateToSelectedVisualforceComponent(selectedText, '<c:');
			} else if(d3vUtil.startsWith(loweredText, '</c:')) {
				d3vCode.navigateToSelectedVisualforceComponent(selectedText, '</c:');
			}
		}
	},

	/**
	 * @description Navigates to the selected visualforce tag
	 * @param       selectedText - name of selected tag to open
	 * @param       tagPrefix - used to include the beginning '<'
	 **/
	navigateToSelectedVisualforceTag : function(selectedText, tagPrefix) {
		selectedText = selectedText.split(tagPrefix + 'apex:')[1].replace('>', '');
		window.open(VF_DEV_GUIDE_SEARCH_URL + selectedText, '_blank');
	},
	
	/**
	 * @description If the current file is a class or trigger, attempts to validate that 
	 *              the current filename has not been changed or does not already exist
	 * @return      true when validation was successful, false when it fails
	 **/
	validateApexFilename : function() {
		var parsedFilename = d3vCode.parseCurrentFilename();
		
		if(parsedFilename && parsedFilename.length) {
			if(currentFile && currentFile.length) {
				//parsed the name from an existing file, validate it has not changed
				var openFile = d3vCode.getNonNamespacedFilename();
				
				if(parsedFilename !== openFile) {
					return false;
				}
			} else {
				//parsing the name from a new file, validate it does not already exist
				var tempName;
				for(var i = 0, end = aside.files.length; i < end; i++) {
					tempName = aside.files[i];
					
					if(tempName.indexOf('.cls') === -1) {
						continue;
					} else {
						tempName = tempName.replace('.cls', '').replace('Open ', '');
						
						if(aside.org.namespace && aside.org.namespace.length) {
							tempName = tempName.replace(aside.org.namespace + '.', '');
						}
						
						if(tempName === parsedFilename) {
							return false;
						}
					}
				}
			}
		}
		
		return true;
	},
	
	/**
	 * @description Beautifies HTML, CSS, JS, VF, Apex, and Java code
	 **/
	beautify : function() {
		var currentType  = editor.session.getMode().$id.split('/')[2];
		var inputCode    = editor.session.getValue();
		var outputCode   = null;
		var warnUser     = false;
		var wrapPosition = $('#beautify-pm-size').val() || 80;
		wrapPosition     = parseInt(wrapPosition);
		
		var defaultOpts = {
			indent_inner_html : true,
			wrap_line_length  : wrapPosition,
			indent_handlebars : true,
			end_with_newline  : true,
			extra_liners      : ['/html', '/apex:page', 'body', 'head', '/aura:application', 
			                     '/aura:component', '/design:component', '/aura:documentation', '/aura:interface', '/aura:tokens'],
			space_around_selector_separator : true,
			indent_size : $('#tab-size').val() || 4
		};
		
		if(currentType === 'html') {
			outputCode = html_beautify(inputCode, defaultOpts);
		} else if(currentType === 'css') {
			outputCode = css_beautify(inputCode, defaultOpts);
		} else if(currentType === 'javascript') {
			outputCode = js_beautify(inputCode, defaultOpts);
		} else if(currentType === 'java') {
			outputCode = js_beautify(inputCode, {
				wrap_line_length : 0,
				indent_size : $('#tab-size').val() || 4
			});
		} else {
			currentType = null;
		}
		
		if(currentType && currentType.length && outputCode && outputCode.length) {
			d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
			editor.session.setValue(outputCode);
			d3vUtil.alert('successfully beautified!', { scheme : "positive"});
		} else {
			d3vUtil.alert('beautify failed: only works with apex, vf, js, and css', { scheme : "negative"});
		}
	},
	
	/**
	 * @description Minifies HTML, CSS, JS, VF, Apex, and Java code
	 * @param       openTag  - <script> | <style> | empty string
	 * @param       closeTag - </script> | </style> | empty string
	 * @return      
	 **/
	minify : function() {
		var openTag;
		var closeTag;
		var theMin = require('html-minifier');
		var orig = editor.session.getValue();
		var currentType = editor.session.getMode().$id.split('/')[2];
		
		if(currentType === 'html') {
			openTag = '';
			closeTag = '';
		} else if(currentType === 'css') {
			openTag = '<style>';
			closeTag = '</style>';
		} else if(currentType === 'javascript') {
			openTag = '<script>';
			closeTag = '</script>';
		} else if(currentType === 'java') {
			currentType = null;
		} else {
			currentType = null;
		}

		if(currentType && currentType.length) {
			var minCopy = theMin.minify(openTag + orig + closeTag, {
				collapseWhitespace: true, 
				minifyJS: true,
				minifyCSS: true,
				removeComments: true
			});
			
			if(openTag && openTag.length) {
				minCopy = minCopy.substr(openTag.length, minCopy.length - (openTag.length + closeTag.length));
			}
			
			editor.session.setValue(minCopy);	
			d3vUtil.alert('successfully minified!', { scheme : "positive"});	
		} else {
			d3vUtil.alert('minify failed: only works with vf, js, and css', { scheme : "negative"});
		}
	},
	
	/**
	 * @description Attempts to parse the current file to determine the filename (only works on apex classes and triggers)
	 **/
	parseCurrentFilename : function() {
		if(currentFile && currentFile.length) {
			if(currentFile.indexOf('.cls') !== -1) {
				return d3vCode.parseApexClassFilename();
			} else if(currentFile.indexOf('.trigger') !== -1) {
				return d3vCode.parseTriggerFilename();
			}
		} else if(lastAction === 'New Apex Class') {
			return d3vCode.parseApexClassFilename();
		} else if(lastAction === 'New Trigger') {
			return d3vCode.parseTriggerFilename();
		}
		
		return null;
	},

	/**
	 * @description Given the currently opened file is an apex class, will return the filename
	 **/
	parseApexClassFilename : function() {
		var re = /\s*(public|private|global)\s+(?:virtual\s+|abstract\s+)?(?:with\s+sharing\s+|without\s+sharing\s+)?class\s+(\w+)\s*((extends\s+\w+)|(implements\s+\w+[\.\<\>\s,\w+]*))?\s*\{/gi;
		var code = editor.getSession().getValue();
		var matches;
		 
		while ((matches = re.exec(code)) !== null) {
		    if (matches.index === re.lastIndex) {
		        re.lastIndex++;
		    }
		    
		    if(matches && matches.length && matches.length >= 3) {
		    	return matches[2];
		    }
		}
		
		return null;
	},

	/**
	 * @description Given the currently opened file is a trigger, will return the filename
	 **/
	parseTriggerFilename : function() {
		var re = /\s*trigger\s+(\w+)\s+on/gi;
		
		var code = editor.getSession().getValue();
		var matches;
		 
		while ((matches = re.exec(code)) !== null) {
		    if (matches.index === re.lastIndex) {
		        re.lastIndex++;
		    }
		    
		    if(matches && matches.length && matches.length >= 2) {
		    	return matches[1];
		    }
		}
		
		return null;
	},

	/**
	 * @description Navigates to the selected sobject
	 * @param       selectedText - name of selected sobject to open
	 **/
	navigateToSelectedObject : function(selectedText) {
		var objectId = d3vPush.getIdFromObjectName(selectedText);
		
		if(objectId) {
			d3vUtil.openInSalesforce('/' + objectId);
		}
	},

	/**
	 * @description Navigates to the selected vf component
	 * @param       selectedText - name of selected component to open
	 * @param       prefix       - prefix to remove off selected text
	 **/	
	navigateToSelectedVisualforceComponent : function(selectedText, prefix) {
		selectedText = selectedText.replace(prefix, '');
		var $selected = $('select#code-helper-input option:contains("' + selectedText + '.component")');
		
		if($selected && $selected.length) {
			var fullFile = (installedPrefix ? installedPrefix + '.' : '') + selectedText + '.component';
			$selected.each(function(ele, idx) {
				var $ele = $(ele);
				
				if($selected.text().indexOf(' ' + fullFile) !== -1) {					
					d3vUtil.openFileInNewWindow(fullFile);						
					return false;
				}
			});
		}	
	},
	
	/**
	 * @description Navigates to the selected apex class
	 * @param       selectedText - name of selected class to open
	 **/
	navigateToSelectedClass : function(selectedText) {
		var $selected = $('select#code-helper-input option:contains("' + selectedText + '.cls")');
		
		if($selected && $selected.length) {			
			var fullFile = (installedPrefix ? installedPrefix + '.' : '') + selectedText + '.cls';
			$selected.each(function(ele, idx) {
				var $ele = $(ele);
				
				if($selected.text().indexOf(' ' + fullFile) !== -1) {								
					d3vUtil.openFileInNewWindow(fullFile);						
					return false;
				}
			});
		}	
	},
	
	/**
	 * @description Opens the zip handler popup
	 **/
	openZipHandler : function() {
		d3vPopups.showAnimatedModal('#zip-handler');
		var zipFullPath = $('#zip-handler-btn span').text();
		var path = '/';
		
		if(zipFullPath && zipFullPath.length && zipFullPath !== ZIP_BASE_DISPLAY_NAME) {
			if(!zipFullPath.startsWith('/')) {
				zipFullPath = '/' + zipFullPath;
			}
			
			path = zipFullPath.substring(0, zipFullPath.lastIndexOf('/') + 1);
		}
		 
		d3vCode.setZipHandler(path);
	},
	
	/**
	 * @description Sets the zip handler to the correct state given a path
	 * @param       path - describes state of zip handler
	 **/
	setZipHandler : function(path) {
		path = path || $('#zh-location').text();
		$('#zh-location').text(path);
		
		if(currentZip && currentZip.files) {
			var hasFiles = d3vUtil.countProperties(currentZip.files) > 0;
			var markup   = d3vCode.getZipList(path, hasFiles);
			
			$('#zh-files').html(markup);
			d3vCode.bindZipActions();
		} else {
			$('#zh-files').html('No zip found');
		}
	},
	
	/**
	 * @description Binds actions for zip handler dialog
	 **/
	bindZipActions : function() {
		$('.zh-item')
			.unbind()
			.click(d3vCode.selectZipItem)
			.dblclick(function(evt) {
				d3vCode.selectZipItem(evt);
				d3vCode.openSelectedZipItem();
			});
	},
	
	/**
	 * @description Highlights selection of an item in the zip menu
	 * @param       that - item clicked
	 **/
	selectZipItem : function(that) {
		$('.zh-item-selected').removeClass('zh-item-selected');
		$(that.currentTarget).addClass('zh-item-selected');
	},

	/**
	 * @description Handles selection of going back one level up
	 **/	
	backOneZipLevel : function() {
		var path = $('#zh-location').text();
		
		if(path && path.length && path.substring(path.length - 1, path.length) === '/') {
			path = path.substring(0, path.length - 1);
		}
		
		path = path.substring(0, path.lastIndexOf('/') + 1);
		d3vCode.setZipHandler(path || '/');
	},

	/**
	 * @description Handles selection of an item in the zip menu
	 **/	
	openSelectedZipItem : function() {
		var $selected   = $('.zh-item-selected');
		var currentPath = $('#zh-location').text();
		
		if($selected && $selected.length) {
			if($selected.hasClass('zh-file')) {
				d3vCode.openZippedFile(currentPath, $selected.text());
			} else if($selected.hasClass('zh-folder')) {
				d3vCode.navigateToZipFolder(currentPath, $selected.text());
			} else if($selected.hasClass('zh-back')) {
				d3vCode.backOneZipLevel();
			} else if($selected.hasClass('zh-new')) {
				d3vCode.openNewZipFileDialog();
			} else if($selected.hasClass('zh-new-folder')) {
				d3vCode.addNewFolderToZip();
			} else if($selected.hasClass('zh-upload')) {
				d3vCode.addExistingFileToZip();
			} else {
				d3vUtil.alert('failed to open item', { scheme : 'negative' });
			}
		} else {
			d3vUtil.alert('You must select a file or folder first');
		}
	},
	
	/**
	 * @description Navigate to the selected folder in the zip resource
	 * @param        path - path to folder within zip
	 * @param        fn - name of folder to open	 
	 **/
	navigateToZipFolder : function(path, fn) {
		path = path === '/' ? '' : path;
		
		if(!path.endsWith('/')) {
			path += '/';
		}
		
		if(!fn.endsWith('/')) {
			fn += '/';
		}		
		
		d3vCode.setZipHandler(path + fn);	
	},
	
	/**
	 * @description Opens the dialog which handles adding an uploaded file to a zipped resource
	 **/
	addExistingFileToZip : function() {
		$('#add-upload-to-zip-rn').val(d3vCode.makePathJSZipFriendly($('#zh-location').text()));
		d3vPopups.showAnimatedModal('#add-upload-to-zip');	
	},
	
	/**
	 * @description Adds a new folder to the current zip
	 **/
	addNewFolderToZip : function() {
		var fn = prompt('Enter the new folder name: ');
		
		if(fn && fn.length && $.trim(fn).length && currentZip) {
			var fullPath = d3vCode.makePathJSZipFriendly($('#zh-location').text());
			currentZip.folder(fullPath + fn);
			d3vCode.setZipHandler('/' + fullPath);
			d3vUtil.alert('new folder added successfully', { scheme : 'positive' });
		} else {
			d3vUtil.alert('failed to add new folder', { scheme : 'negative' });
		}
	},
	
	/**
	 * @description Opens the popup which handles up setting up new files within the zipped resource.
	 **/
	openNewZipFileDialog : function() {
		var officialPath = '/' + d3vCode.makePathJSZipFriendly($('#zh-location').text());
		$('#zn-path').val(officialPath);
		d3vPopups.showAnimatedModal('#zip-new');		
		d3vCode.handleZipNewFileTypeChange();
	},

	/**
	 * @description UI helper method for updating fields as the user changes the file type
	 **/	
	handleZipNewFileTypeChange : function() {
		var fileType = $('#zn-mime-choice').val();
		
		if(fileType === 'css' || fileType === 'html' || fileType === 'js' || fileType === 'txt' || fileType === 'xml') {
			$('#zn-name').val('filename.' + fileType);
			d3vCode.updateZipNewFileFullname();
		} else {
			d3vUtil.alert('error: unknown file type', { scheme : 'negative' });
		}
	},

	/**
	 * @description UI helper method for updating fields as the user changes the file name
	 **/	
	handleZipFilenameChange : function() {
		$('#zn-name').text();
		d3vCode.updateZipNewFileFullname();
	},

	/**
	 * @description UI helper method for updating the fullname field on the new zip file dialog
	 **/		
	updateZipNewFileFullname : function() {
		$('#zn-full').val($('#zn-path').val() + $('#zn-name').val());
	},
	
	/**
	 * @description Alters the path to be the same format as used by JSZIP.
	 * @param       path - in aside format
	 * @returns     path in jszip format
	 **/
	makePathJSZipFriendly : function(path) {
		path = path || '';
		path = path.substring(1);
		
		if(path.lastIndexOf('/') + 1 !== path.length) {
			path += '/';
		}	
		
		return path;
	},
	
	/**
	 * @description Adds a new file to the zip
	 **/
	addNewFileToZip : function() {
		var fn = $('#zn-full').val().substring(1);
		
		if(fn && fn.lastIndexOf('.') !== -1) {
			if(currentZip.files[fn]) {
				d3vUtil.alert('a file with this name already exists');
				return;
			}
		
			var pid = fn.lastIndexOf('.');
			var ext = fn.substring(pid + 1, fn.length);
			ext     = ext.toLowerCase();
			
			if(ext === 'js' || ext === 'css' || ext === 'txt' || ext === 'html' || ext === 'xml') {
				d3vCode.setHighlight(ext);
		        editor.getSession().setValue('');
		        editor.getSession().setAnnotations([]);
		        currentZippedFile = fn;
		        currentZip.file(currentZippedFile, '');
		        d3vCode.setZipFilename(fn);
		        d3vPopups.closePopups();
			} else {
				d3vUtil.alert('the only valid extensions are: js, css, txt, html, xml')
			}
		} else if(fn !== null) {
			d3vUtil.alert('filename not valid');
		}
	},		
	
	/**
	 * @descriptions Opens the file within a zip
	 * @param        path - path to file within zip
	 * @param        fn - name of file to open
	 **/
	openZippedFile : function(path, fn) {
		path = d3vCode.makePathJSZipFriendly(path);
		
		path += fn;
		
		var zippedFile = currentZip.files[path];
		
		if(zippedFile) {
			var ext = zippedFile.name.substring(zippedFile.name.lastIndexOf('.') + 1, zippedFile.name.length);

			if(ext === 'js' || ext === 'css' || ext === 'txt' || ext === 'html' || ext === 'xml' || ext === 'md' || ext === 'json' || ext === 'svg') {
				d3vCode.setHighlight(ext);
	        	editor.getSession().setValue(zippedFile.asText());
	        	editor.getSession().setAnnotations([]);
	        	d3vUtil.alert('successfully opened file', { scheme : 'positive'});
	        	currentZippedFile = zippedFile.name;        
	        	d3vCode.setZipFilename(path);
				d3vUtil.resetEditorChange();	        
				d3vPopups.closePopups();		
	        } else {
	        	d3vUtil.alert('ASIDE does not support this file type (' + ext + ')');
	        }
		} else {
			d3vUtil.alert('cannot open file', { scheme : 'negative'});
		}	
	},
	
	/**
	 * @description Get the list of items to populate the zip list
	 * @param       path - path to current level in zip as if it were expanded
	 * @param       hasFiles - true if the zip has files or folders in it
	 * @return      markup for list of files that should appear in the zip
	 **/
	getZipList : function(path, hasFiles) {
		var markup = '<ul>';
		
		if(path !== '/') {
			markup += '<li class="zh-back zh-item unselectable">Back</li>';
		}
			
		markup += '<li class="zh-upload zh-item unselectable">Add Uploaded File</li>';
		markup += '<li class="zh-new zh-item unselectable">Create New File</li>';
		markup += '<li class="zh-new-folder zh-item unselectable">Create New Folder</li>';
		
		if(hasFiles) {
			var zipItems = d3vCode.getZipFilesFromPath(path);
			var zipFolders = [];
			var zipFiles = [];
			
			for(var item in zipItems) {
				if(item && item.length && zipItems.hasOwnProperty(item)) {
					if(zipItems[item].options && !zipItems[item].options.dir) {
						zipFiles.push('<li class="zh-file zh-item unselectable">' + item + '</li>');
					} else {
						zipFolders.push('<li class="zh-folder zh-item unselectable">' + item + '</li>');
					}
				}
			}
			
			for(var i = 0, end = zipFolders.length; i < end; i++) {
				markup += zipFolders[i];
			}
			
			for(var i = 0, end = zipFiles.length; i < end; i++) {
				markup += zipFiles[i];
			}			
		}
		
		return markup + '</ul>';
	},
	
	/**
	 * @description Returns a list of files and folders from the current zip, for a given path
	 * @param       path   - location to pull files from
	 * @returns     list of files in the zip at the path
	 **/
	getZipFilesFromPath : function(path) {
		var subset = d3vData.unflatten(currentZip.files);
		var ps     = path.split('/');
		
		for(var i = 0; i < ps.length; i++) {
			if(ps[i] && ps[i].length) {
				subset = subset[ps[i]];
			}
		}
		
		return subset;
	},
	
	/**
	 * @description initializes zip handler menu
	 * @param       resource - static resource to build menu from
	 **/ 
	buildZipMenu : function(resource) {
		var zip = new JSZip(resource.Body, {base64: true});
		if(zip && zip.files) {
			currentZip = zip;
			d3vCode.setZipFilename(ZIP_BASE_DISPLAY_NAME);
			d3vCode.showZipMenu();
		}
	},
		
	/**
	 * @description Performs a find next operation for the current token
	 **/
	footerFindNext : function() {
		d3vCode.performFind(false);
	},
	
	/**
	 * @description Performs a find previous operation for the current token
	 **/
	footerFindPrevious : function() {
		d3vCode.performFind(true);
	},
	
	/**
	 * @description Set the drop button width to be the current drop button width...so it doesnt get smaller on hover when shorter text
	 *              fills the div
	 **/
	setHeaderMenuWidth : function() {
		$('.dropbtn').width($('.dropbtn').width());
	},
	
	/**
	 * @description Set the data that displays in the center of the footer
	 **/
	setFooterData : function() {
		var un = aside.user.username || '';
		$('.dropbtn').html('<span>' + un + '</span>');
		$('span#fc-3').text('line 1, column 1');
		d3vCode.setHeaderMenuWidth();
	},
	
	/**
	 * @description Toggles development mode on and off
	 **/
	toggleDevelopmentMode : function() {
		if(aside && aside.user && aside.user.userId) {
			var devMode = aside.user.devMode ? 'disabling' : 'enabling';
			var devModePast = aside.user.devMode ? 'disabled' : 'enabled';
			
			d3vUtil.alert(devMode + ' development mode...');
			
			var updateScript = 'List<User> us = [SELECT Id, UserPreferencesApexPagesDeveloperMode FROM User WHERE Id = :UserInfo.getUserId()];us.get(0).UserPreferencesApexPagesDeveloperMode = !us.get(0).UserPreferencesApexPagesDeveloperMode;update us;';
				
			ServerAction.executeAnonymous(updateScript, function(result) {
				result = JSON.parse(result);
				
				if(result.success) {
					d3vUtil.alert('development mode ' + devModePast + ' successfully', { scheme : 'positive'});
					aside.user.devMode = !aside.user.devMode;
				} else {
					d3vUtil.alert('failed to ' + devModePast + ' development mode', { scheme : 'negative' });
				}
			});
		}	
	},
	
	/**
	 * @description Show the related files popup
	 **/
	showRelatedFiles : function() {
		d3vCode.setRelatedFiles();
		d3vPopups.showAnimatedModal('#related-popup');
	},
	
	/**
	 * @description Set the list of related files on the related files popup
	 **/
	setRelatedFiles : function() {
		if(currentFile && currentFile.length) {
			var ext = d3vCode.getCurrentExtension();
			if(ext.indexOf('aura-') !== -1) {
				var type = d3vCode.getAuraType(ext).type;
				var shortName = lastAction.replace('.aura-' + type, '.aura-');
				var $option;
				var related = {};
				var hasApplication = false;
				var hasComponent = false;
				var relatedName;
				
				$('select#code-helper-input').find('option:contains("' + shortName + '")').each(function(index, ele) {
					$option = $(ele);
					relatedName = $option.text();
					
					if(relatedName !== lastAction) {
						related[relatedName] = true;
					}
					
					if(relatedName.indexOf('.aura-component') !== -1) {
						hasComponent = true;
					}
					
					if(relatedName.indexOf('.aura-application') !== -1) {
						hasApplication = true;
					}					
				});
				
				if(hasComponent || hasApplication) {
					var others = ['controller', 'helper', 'style', 'documentation', 'renderer', 'svg'];
					
					if(hasComponent) {
						others.push('design');
					}
					
					for(var i = 0, end = others.length; i < end; i++) {
						var found = false;
						
						for(var prop in related) {
							if(related.hasOwnProperty(prop) && prop.indexOf('.aura-' + others[i]) !== -1) {
								found = true;
								break;
							}
						}
						
						if(!found && others[i] !== type) {
							if(others[i] === 'svg') {
								related['New Lightning SVG'] = true;
							} else {
								related['New Lightning ' + d3vUtil.capitalizeString(others[i])] = true;
							}
						}
					}
				}
			}
			
			$('#related-files-home').html(d3vCode.getRelatedFilesMarkup(related));
	
			$('#related-files-home .d3v-table-row').unbind().click(function() {
				var $that = $(this);
				var openMethod = $('#related-open-select').val();
	
				if(openMethod === 'new') {
					d3vUtil.executeCommandInNewWindow($that.text());
				} else {
					d3vCode.codeSelectionAction($that.text());
					d3vPopups.closePopups();
				}
			});			
		} 
	},
	
	/**
	 * @description Build out the markup itself for the related files list
	 * @param       related - the list of related files to generate markup for
	 **/	
	getRelatedFilesMarkup : function(related) {
		var markup = '';
		var sortable = [];
		
		if(related) {		
			for(var prop in related) {
				if(related.hasOwnProperty(prop)) {
					sortable.push(prop);
				}
			}
		
			sortable.sort();
			
			for(var i = 0, end = sortable.length; i < end; i++) {
				if(sortable[i].indexOf('Open ') === 0) {
					markup += '<div class="d3v-table-row">' + sortable[i] + '</div>';
				}
			}
			
			for(var i = 0, end = sortable.length; i < end; i++) {
				if(sortable[i].indexOf('Open ') !== 0) {
					markup += '<div class="d3v-table-row">' + sortable[i] + '</div>';
				}
			}			
		}
		
		if(sortable.length === 0) {
			var type = d3vUtil.capitalizeString(d3vCode.getAuraType(d3vCode.getCurrentExtension()).type);
			markup += '<span>The lightning resource type "' + type + '" does not bundle with other lightning resource types.</span>';
		}
		
		return markup;
	},
	
	/**
	 * @description Initializes the footer
	 **/
	initFooter : function() {			
		$('span#foot-save').click(d3vCode.saveFile);
		$('#foot-logs').click(d3vCode.openDebugLogPopup);
		$('#foot-devmode').click(d3vCode.toggleDevelopmentMode);
		$('span#foot-split').click(d3vUtil.toggleDiffEditor);
		
		$('#foot-ois').click(d3vUtil.openInSalesforce);
		$('#user-detail').click(d3vUtil.openUserDetail);
		$('span#foot-repeat').click(function() {
			setTimeout(d3vCode.redoLastAction, 200);
		});
		
		$('#foot-related').click(d3vCode.showRelatedFiles);
		$('span#foot-rt').click(d3vTest.executeCurrentTest);
		$('span#foot-th').click(d3vCode.toggleCoverageHighlights);
		$('span#foot-download').click(d3vCode.downloadEditorContents);
		$('.foot-version').click(d3vCode.openUpdateDialog);
		$('div#coverage-bar').click(d3vCode.displayTestCoverage);
		$('span#foot-fn').click(d3vCode.footerFindNext);
		$('span#foot-fp').click(d3vCode.footerFindPrevious);
		$('#foot-history').click(d3vArchive.openLocalHistoryDialog);
		
		$('#foot-find').click(function() {
			d3vCode.openFind(true);
		});
		
		$('#foot-find-all').click(function() {
			d3vPopups.showGlobalPanel('Find in All Code', '#ocs-popup');
		});
		
		//keep popup find in sync with footer find
		$('input#footer-find').keyup(function() {
			$('textarea#find-textarea').val($(this).val());
		});
		
		//keep footer find in sync with popup find
		$('textarea#find-textarea').keyup(function() {
			$('input#footer-find').val($(this).val());
		});		
		
		$('div#coverage-bar').hover(function() {
			var $desc = $(this).find('span#db-desc');
			previousHoverText = $desc.text();
			$desc.text('Recalculate...');
		}, function() {
		    $(this).find('span#db-desc').text(previousHoverText || 'Not Applicable');
		});		
	},
	
	/**
	 * @description Sets the text and the width of the footer test coverage bar graph.
	 * @param       coverage - the coverage percentage
	 **/
	setFootCoverage : function(coverage) {
		var coverageText = 'Not Applicable';
		var $bar         = $('div#cb-percentage');
		
		if(coverage === '0') {
			var fileContent = editor.getSession().getValue().toLowerCase();
			if(fileContent.indexOf('@istest') !== -1) {
				coverage = null;
			}
		}
		
		if(coverage) {
			coverage          = parseInt(coverage);
			coverageText      = coverage + '%';
			previousHoverText = coverageText;
			
			$bar.removeClass('pos-bar neg-bar');
			if(coverage < 75) {
				$bar.addClass('neg-bar');
			} else {
				$bar.addClass('pos-bar');
			}
		} else {
			coverage = 0;
		}
		
		$('span#db-desc').text(coverageText);
		
		if(coverage == 100) {
			$bar.css('width', 'auto');
		} else {
			$bar.css('width', coverage + '%');
		}	
	},
	
	/**
	 * @description Outputs a message to the coverage footer that its calculating
	 **/
	setCoverageCalculating : function() {
		$('span#db-desc').text('Calculating...');
		$('div#cb-percentage').css('width', '0%');	
	},
	
	/**
	 * @description Handles user clicking the "Add File to Zip" button
	 **/
	addUploadedFileToZip : function() {
		if(d3vCode.validateUploadTypeResource()) {
			d3vCode.readAndAddFileToZip(d3vCode.getSelectedUploadFile());
			d3vPopups.closePopups();
		} else {
			d3vUtil.alert('You must first choose a file.');
		}
	},
	
	/**
	 * @description Displays the popup used to add an existing file to a static resource
	 **/
	showExistingFilePopup : function() {
		d3vPopups.showAnimatedModal('#add-upload-to-zip');
	},
	
	/**
	 * @description Deletes the static resource from the server.
	 **/
	deleteResourceFile : function() {
		var toDelete = $('#zh-location').text();
		var $selected = $('.zh-item-selected');
		var selectedDelete = $selected.text();
		
		if(!$selected.hasClass('zh-file') && !$selected.hasClass('zh-folder')) {
			d3vUtil.alert('you can only delete files and folders');
			return;
		}
		
		if(selectedDelete && selectedDelete.length) {
			toDelete = d3vCode.makePathJSZipFriendly(toDelete) + selectedDelete;
			
			if(toDelete && currentZip) {
				var delName = currentZip.files[toDelete] ? toDelete : toDelete + '/';
				currentZip.remove(toDelete);
				d3vUtil.alert('file removed.  saving zip…', { scheme : 'positive'});
				
				if(currentZippedFile === toDelete) {
					d3vCode.setZipMessage(currentFile ? currentFile.split('.')[0] : 'New File');				
				}
				
				var numFilesRemaining = d3vUtil.countProperties(currentZip.files);
				if(numFilesRemaining > 0 && currentFileId) {
					d3vCode.updateStaticResource(true);
				} else {
					d3vUtil.alert('file removed', { scheme : 'positive'});
					d3vCode.setZipHandler();
				}
			} else {
				d3vUtil.alert('cannot delete file(s)', { scheme : 'negative'});
			}		
		} else {
			d3vUtil.alert('you must select a file to delete');
		}
	},
	
	/**
	 * @description Switches multi cursor on and off
	 **/
	toggleMultiCursor : function() {
		var $input  = $('#enable-multi-cursor');
		var enabled = $input.is(':checked');

		editor.setOption("enableMultiselect", enabled);
		rightEditor.setOption("enableMultiselect", enabled);
		
		localStorage[COOKIE_PRE + MULTI_CURSOR_ALLOWED] = enabled;
	},	
	
	/**
	 * @description Handles setting different mime types of static resources
	 **/
	routeMimeSelection : function() {
		var selected = $('select#mime-choice').val();
		
		if(selected && selected.length) {
			switch(selected) {
				case "css":
					d3vCode.setCSSSwitch();
					break;
				case "js":
					d3vCode.setJSSwitch();
					break;
				case "zip":
					d3vCode.setZipSwitch();
					break;
				case "upload":
					d3vCode.showMimeOtherScreen();
					break;
				case "html":
					d3vCode.setHTMLSwitch();
					break;
				case "xml":
					d3vCode.setXMLSwitch();
					break;
			}
		}
	},

	/**
	 * @description Show the zip drop down menu button when user is viewing a zip file
	 **/	
	showZipMenu : function() {
		$('#zip-handler-btn').show();
	},

	/**
	 * @description Hide the zip drop down menu button
	 **/	
	hideZipMenu : function() {
		$('#zip-handler-btn').hide();
	},
	
	/**
	 * @description Hides the debug close button
	 **/		
	hideDebugCloseButton : function() {
		$('#debug-handler-btn').hide();
	},
	
	/**
	 * @description Shows the debug close button
	 **/	
	showDebugCloseButton : function() {
		$('#debug-handler-btn').show();
	},	
	
	/**
	 * @description Opens the debug log popup
	 **/
	openDebugLogPopup : function() {
		var gpOpen = d3vPopups.showGlobalPanel('Debug Logs', '#debug-logs');
		
		if(gpOpen) {
			d3vCode.refreshDebugLogList(false);
		}
	},
	
	/**
	 * @description Updates trace flag for current user
	 * @param       silent - squelch alerts
	 **/
	resetLogAllowance : function(silent) {
		if(!silent) {
			d3vUtil.alert('updating debug log TraceFlag...');
		}
		
		ServerAction.resetLogAllowance(function() {
			if(!silent) {
				d3vUtil.alert('update successful!', { scheme : 'positive'});
			}
		});
	},	
	
	/**
	 * @description Returns code coverage for the current file
	 * @param       showHighlights - true to turn highlights on
	 * @param       silent - true to not output any alerts
	 **/
	getCoverage : function(showHighlights, silent) {
		var currExt = d3vCode.getCurrentExtension();
		if(currExt !== 'cls' && currExt !== 'trigger') {
			if(!silent) {
				d3vUtil.alert('this only works on apex');
			}
			
			d3vCode.setFootCoverage();
			return;
		}
	
		if(currentFileId) {
			if(!silent) {
				d3vUtil.alert('calculating code coverage...');
			}
		} else {
			if(!silent) {
				d3vUtil.alert('cannot get coverage, no file selected');
			}
			
			return;			  
		}
		
		var query = "SELECT NumLinesCovered, NumLinesUncovered, Coverage " +
		            "FROM ApexCodeCoverageAggregate WHERE ApexClassOrTriggerId = '" + currentFileId + "'";
		            
		d3vCode.setCoverageCalculating();
		ServerAction.queryTooling(query, function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			
			if(callbackData && callbackData.length) {
				callbackData   = callbackData[0];
				var totalLines = callbackData.NumLinesUncovered + callbackData.NumLinesCovered;
				var coverage   = Math.floor((callbackData.NumLinesCovered / totalLines) * 100);
				var prefix     = '';
				
				d3vCode.setFootCoverage(coverage || '0');
				
				if(showHighlights && $.isArray(callbackData.Coverage.uncoveredLines)) {
					if(callbackData.Coverage.uncoveredLines.length === 0 && coverage !== 100) {
						callbackData.Coverage.uncoveredLines = d3vCode.getFakeUncoveredLines();
					}
				
				    prefix = 'uncovered lines highlighted: ';
					d3vCode.showCoverageHighlights(callbackData.Coverage.uncoveredLines);
				} else {
					d3vCode.hideCoverageHighlights();
				}

				if(!silent) {
					d3vUtil.alert(prefix + 'this file is ' + coverage + '% covered (' + callbackData.NumLinesCovered + ' / ' + totalLines + ')');
				}
			} else {
				d3vCode.setFootCoverage('0');
				
				if(!silent) {
					d3vUtil.alert('no test coverage found for this file', { scheme : 'negative'});
				}
			}
		});
	},
	
	/**
	 * @description Switches the static resource type selector popup to its main screen
	 **/
	showMimeMainScreen : function() {
		d3vCode.defaultResourceName();
		$('input#mime-file').val(null);
		$('div#mime-type-other').hide();
		$('div#mime-type-main').fadeIn(300);
	},
	
	/**
	 * @description Defaults the resource name and editability
	 **/
	defaultResourceName : function() {
		if(currentFile) {
			$('input#mime-rn').val(currentFile.split('.')[0]);
			$("input#mime-rn").attr('disabled', true);
		} else {
			$('input#mime-rn').val('');
			$("input#mime-rn").attr('disabled', false);
		}	
	},

	/**
	 * @description Switches the static resource type selector popup to its "other" (e.g. not js/css) screen
	 **/	
	showMimeOtherScreen : function() {
		$('div#mime-type-main').hide();
		$('div#mime-type-other').fadeIn(300);
	},

	/**
	 * @description Reads the passed in file and adds it to static resource
	 * @param       file - file metadata of file to read and upload
	 **/
	readAndAddFileToZip : function(file) {
		var reader = new FileReader();
		
		reader.onloadend = function(result) {
			if(result && result.target && result.target.result) {
				if(result.total > MAX_RESOURCE_SIZE) {
					d3vUtil.alert('file too large, max size 5mb', { scheme : 'negative' });
				} else {
					var path = $('#add-upload-to-zip-rn').val() || '';
					
					if(d3vUtil.startsWith(path, '/')) {
						path = path.substring(1);
					}
					
					if(path.length && !d3vUtil.endsWith(path, '/')) {
						path += '/';
					}
					
					path += file.name;
					
					if(currentZip.files[path]) {
						d3vUtil.alert('a file with this name already exists');
						return;
					}
					
					currentZip.file(path, btoa(d3vPush.arrayBufferToBinaryString(result.target.result)), {base64: true});
					d3vCode.determineSaveType();
					d3vPopups.closePopups();
				}
			} else {
				d3vUtil.alert('error reading file');
			}
		};
		
		reader.readAsArrayBuffer(file);
	},
	
	/**
	 * @description Reads the passed in file and saves it as a new static resource
	 * @param       file - file metadata of file to read and upload
	 **/
	readAndUploadResource : function(file) {
		var reader = new FileReader();
		
		reader.onloadend = function(result) {
			if(result && result.target && result.target.result) {
				if(result.total > MAX_RESOURCE_SIZE) {
					d3vUtil.alert('file too large, max size 5mb', { scheme : 'negative' });
				} else {
					d3vCode.uploadResource(file, btoa(d3vPush.arrayBufferToBinaryString(result.target.result)));
					$('div#mime-close').hide();				
				}
			} else {
				d3vUtil.alert('error reading file');
				$('div#mime-close').hide();
			}
		};
		
		reader.readAsArrayBuffer(file);
	},

	/**
	 * @description Uploads the file passed in as a static resource
	 * @param       file        - file metadata
	 * @param       fileContent - base 64 file content
	 **/	
	uploadResource : function(file, fileContent) {
		var name = $('input#mime-rn').val();
		var type = file.type;
		$('div#mime-errors').hide();
		d3vUtil.alert('uploading resource…');
		
		if(currentFileId) {
			d3vCode.performUpdateResource(currentFileId, type, fileContent, function() {
				$('div#mime-errors').hide();
			});
		} else {
			var isUpload = ['text/css', 'text/javascript', 'text/plain', 'application/text'].indexOf(type) !== -1;
			d3vCode.performCreateResource(name, type, fileContent, isUpload, function() {
				$('div#generic-overlay').hide();
			});		
		}
	},
	
	/**
	 * @description Sets the editor style mode
	 * @param       modeName - the name of the mode to set the editor to
	 **/
	setMode : function(modeName) {
		editor.getSession().setMode(modeName);
		rightEditor.getSession().setMode(modeName);	
	},

	/**
	 * @description Performs the callout to update a static resource
	 * @param       recId    - id of resource to update
	 * @param       type     - resource mime type
	 * @param       content  - resource content
	 * @param       callback - (optional) callback triggered when creation is successful
	 **/		
	performUpdateResource : function(recId, type, content, callback) {
		editor.getSession().setAnnotations([]);
		d3vCode.setMode(null);
			        		
		if(d3vUtil.isZipAdvanced(type, content)) {
			currentZip   = new JSZip(content, {base64: true});
			content      = currentZip.generate();
		} else {
			d3vCode.resetZip();
		}
		
        ServerAction.updateStaticResource(content, recId, type, true, function(callbackData) {
        	var result   = eval('(' + callbackData + ')');
        	var readOnly = result.length === 3;
        	var record   = result[1];
        	record       = record[0] || record;
        	result       = result[0];
        	editor.setReadOnly(readOnly);
        	
        	if(result.updateResponse.result.success) {
        		d3vUtil.alert('successfully updated resource', { scheme : 'positive'});
        		$('#generic-overlay').hide();
        		d3vCode.setSaveKey(record);
        		d3vUtil.resetEditorChange();
				d3vCode.finishSave();
				
			    if(currentZip) {
			    	currentZippedFile = null;
					d3vCode.showZipMenu();	
					d3vCode.setZipMessage(currentFile.split('.')[0]);    	
			    } else if(readOnly) {
        			editor.getSession().setValue('Note: This file cannot be viewed with ASIDE, to download it press command+shift+d.\n' +
        			                             'To update this file press command+u.\n\n' +
        			                             'Resource Name: ' + currentFile.split('.')[0] + '\n' +
        			                             'Content Type:  ' + type);			    
			    } else {
			    	lastFile = d3vUtil.decodeUtf8(atob(record.Body));
			    	editor.getSession().setValue(lastFile); 	
			    }
        		        		
        		if(callback) {
        			callback();
        		}        		
        	} else {
	    		d3vUtil.alert('save failed', { scheme : 'negative'});
				d3vPopups.displayMessage('Static Resource Save Error', result.updateResponse.result.errors.message, result);     
        	}
        	
        	saving = false;
        });	
	},

	/**
	 * @description Performs the callout to create a static resource
	 * @param       name     - resource name
	 * @param       type     - resource mime type
	 * @param       content  - resource content
	 * @param       callback - (optional) callback triggered when creation is successful
	 **/	
	performCreateResource : function(name, type, content, isUpload, callback) {
    	var skipEncoding = false;
    	
    	if(!currentZip && d3vUtil.isZipAdvanced(type, content) && content) {
    		currentZip = new JSZip(content, {base64: true});
			d3vCode.showZipMenu();    		
    	}
    	
		if(currentZip) {
			if(currentZippedFile && currentZip.files[currentZippedFile]) {
				currentZip.file(currentZippedFile, editor.getSession().getValue());
			}
			
			content = currentZip.generate();
		}
		
		if(content) {
			content = btoa(content);
			skipEncoding = true;
		} else {
			content = btoa(editor.getSession().getValue());
		}
				
        ServerAction.createStaticResource(name, type, content, skipEncoding, function(callbackData) {
        	var result   = eval('(' + callbackData + ')');
        	var readOnly = result.length === 3;
        	var record   = result[1];
        	record       = record[0] || record;
        	result       = result[0];
        	editor.setReadOnly(readOnly);
        	
        	if(result.createResponse.result.success) {
        		d3vUtil.alert('successfully created resource', { scheme : 'positive'});
        		d3vCode.setSaveKey(record);
        		d3vCode.handleNewFile({Name : name, 
        		                         Id : result.createResponse.result.id, 
        		            NamespacePrefix : record.NamespacePrefix, 
        		                ContentType : type}, '.resource', content);
        		                
        		d3vUtil.resetEditorChange();
        		d3vCode.finishSave();
        		
			    if(readOnly) {
			    	editor.getSession().setAnnotations([]);
			    	d3vCode.setMode(null);
        			editor.getSession().setValue('Note: This file cannot be viewed with ASIDE, to download it press command+shift+d.\n' +
        			                             'To update this file press command+u.\n\n' +
        			                             'Resource Name: ' + currentFile.split('.')[0] + '\n' +
        			                             'Content Type:  ' + type);			    
			    } else if(!currentZip && isUpload) {
			    	lastFile = d3vUtil.decodeUtf8(atob(record.Body));
			    	editor.getSession().setValue(lastFile);
			        editor.getSession().setAnnotations([]);
			        d3vCode.setMode(null); 	
			    }
        		
        		if(callback) {
        			callback();
        		}
        	} else {
	    		d3vUtil.alert('save failed', { scheme : 'negative'});
				d3vPopups.displayMessage('Static Resource Save Error', result.createResponse.result.errors.message, result);     
        	}
        	
        	saving = false;
        });				
	},
	
	/** 
	 * @description Returns the currently selected file (selected within "other" static resource type popup) 
	 **/
	getSelectedFile : function() {
		return $('input#mime-file')[0].files[0];
	},
	
	/** 
	 * @description Returns the currently selected file (selected within "add existing file to zip" popup) 
	 **/
	getSelectedUploadFile : function() {
		return $('input#add-upload-to-zip-file')[0].files[0];
	},	

	/**
	 * @description Saves a new static resource of type "other"
	 **/	
	saveOtherTypeResource : function() {
		if(d3vCode.validateOtherTypeResource()) {
			d3vCode.readAndUploadResource(d3vCode.getSelectedFile());
		} else {
			d3vUtil.alert('Before saving you must fill in the Resource Name and Content fields.');
		}
	},
	
	/**
	 * @description Validates that the required fields are filled in prior to saving a new static resource with type "other"
	 * @return      true is required fields are populated, false if not
	 **/
	validateOtherTypeResource : function() {
		var file = $('input#mime-file').val();
		var name = $('input#mime-rn').val();
		
		return file && file.length && name && name.length;
	},
	
	/**
	 * @description Validates that the required fields are filled in prior to uploading a file into a static resource
	 * @return      true is required fields are populated, false if not
	 **/
	validateUploadTypeResource : function() {
		var name = $('input#add-upload-to-zip-file').val();
		
		return name && name.length;
	},	

	/**
	 * @description Displays the test coverage for the current file
	 **/
	updateFooterCoverage : function() {
		d3vCode.getCoverage(false, true);
	},
	
	/**
	 * @description Displays the test coverage for the current file
	 **/
	displayTestCoverage : function() {
		d3vCode.getCoverage(false, false);
	},

	/**
	 * @description Toggles code highlights on and off
	 **/	
	toggleCoverageHighlights : function() {
		if(coverageHighlights) {
			d3vUtil.alert('coverage highlights removed');
			d3vCode.hideCoverageHighlights();
		} else {
			d3vCode.getCoverage(true, false);
		}
	},
	
	/**
	 * @description When a file has 0% coverage the API returns an empty uncovered lines array, but really it should contain all lines
	 *              This function generates the result expected from the API
	 **/
	getFakeUncoveredLines : function() {
		var uncoveredLines = [];
		
		for(var i = 1, end = editor.session.getLength(); i <= end; i++) {
			uncoveredLines.push(i);
		}	
		
		return uncoveredLines;	
	},
	
	/**
	 * @description Turns code coverage highlights on
	 * @param       uncoveredLines - the lines to highlight as uncovered
	 **/
	showCoverageHighlights : function(uncoveredLines) {
		coverageHighlights = true;
		$('span#foot-th').text('hide coverage');
		for(var i = 0, end = uncoveredLines.length; i < end; i++) {
			editor.getSession().addGutterDecoration(uncoveredLines[i] - 1, "gutter-coverage");	
		}
	},
	
	/**
	 * @description Turns code coverage highlights off
	 **/
	hideCoverageHighlights : function() {
		coverageHighlights = false;
		$('span#foot-th').text('show coverage');
		for(var i = 0, end = editor.getSession().getLength(); i < end; i++) {
			editor.getSession().removeGutterDecoration(i, "gutter-coverage");	
		}
	},	

	/**
	 * @description Refreshes the debug log list
	 * @param       silent - squelches alerts when true
	 **/	
	refreshDebugLogList : function(silent) {
		if(!silent) {
			d3vUtil.alert('refreshing debug log…');
		}
		
		ServerAction.getDebugLogList($('input#my-debug-logs').is(':checked'), function(callbackData) {
			if(!silent) {
				d3vUtil.alert('debug logs updated successfully', { scheme : 'positive'});
			}
			
			callbackData = eval('(' + callbackData + ')');
			var markup = '';
			var rowClass;
			for(var i = 0, end = callbackData.length; i < end; i++) {
				rowClass = 'debug-log-row' + (i % 2 === 1 ? '' : ' debug-log-row-odd');
				markup += '<div log-id="' + callbackData[i].Id + '" class="' + rowClass + '">' 
					   +    '<div class="debug-top-row">'
				       +  		'<span class="debug-fn">'
		               +			callbackData[i].Operation
		               +		'</span>'
		               +		'<span class="debug-timestamp keep-right">'
		               +			d3vUtil.salesforceDateMadeReadable(callbackData[i].StartTime, false)
		               +		'</span>'		               
		               +  	'</div>'
		               +  	'<div class="debug-bottom-row">'
		               +		d3vCode.formatDebugLogStatus(callbackData[i].Status)		               
		               +		'<span class="keep-right debug-size">'
		               +         	parseInt(callbackData[i].LogLength).toLocaleString()
		               +		' bytes</span>'		               
		         	   +  	'</div>'
		         	   +  '</div>';
		 	}
		 	
		 	$('div#debug-log-table').empty().append(markup);
		 	$('div.debug-log-row').unbind().click(d3vCode.handleDebugLogRowClick);
		});
	},
	
	/**
	 * @description Opens a debug log row when clicked
	 **/
	handleDebugLogRowClick : function() {
		var $that = $(this);
		var openWhere = $('#debug-open-select').val();
		
		if(openWhere === 'aside' || openWhere === 'left') {
			d3vUtil.alert('opening debug log...');
			
			ServerAction.getDebugLog($that.attr('log-id'), function(cbd) {
				d3vUtil.alert('debug log opened successfully', { scheme : 'positive' });
				
				if(!d3vCode.isActive()) {
					d3vUtil.switchSection(CODE_SECTION);
				}
				
				if(openWhere === 'aside') {
					d3vUtil.showDiffEditor();
					aceDiffer.setOptions({ showDiffs : false });				
					rightEditor.getSession().setValue(cbd);
				} else {
					d3vCode.setEditorDebugRevert();
					editor.getSession().setValue(cbd);
				}
				
				d3vUtil.dragResizeEditors();
				d3vUtil.resizeWindow();
			});
		} else {
			d3vUtil.downloadFromIFrame('/getDebugLog?id=' + $that.attr('log-id'));
		}		
	},
	
	/**
	 * @description Tracks a "revert copy" of the code currently in the editor for when you choose to open a debug
	 *              log in the primary editor
	 **/
	setEditorDebugRevert : function() {
		if(!editorDebugRevert) {
			editorDebugRevert = editor.getSession().getValue();
			saving = true;
			d3vCode.hideZipMenu();
			d3vCode.showDebugCloseButton();			
		}	
	},
	
	/**
	 * @description Loads the "revert copy" and resets the editor to its previous state.
	 **/	
	revertEditorDebug : function(skipLoad) {
		saving = false;
		
		if(!skipLoad && editorDebugRevert && editorDebugRevert.length) {
			editor.getSession().setValue(editorDebugRevert);
		}
		
		editorDebugRevert = null;
		
		d3vCode.hideDebugCloseButton();
		if(currentZip) {
			d3vCode.showZipMenu();
		}
	},

	/**
	 * @description Download whatever is currently displaying in the editor.
	 * @param       status - the status to format
	 **/	
	formatDebugLogStatus : function(status) {
		if(status === 'Success') {
			return '<span class="dl-successful">Successful</span>';
		} else {
			return '<span class="debug-status bluish">' + status + '</span>';
		}
	},
	
	/**
	 * @description Returns reference to the currently focused ace editor
	 * @param       defaultEditor - editor to use if neither are focused
	 * @returns     reference to focused editor
	 **/
	getFocusedEditor : function(defaultEditor) {
		return lastFocusedEditor;
	},

	/**
	 * @description Download whatever is currently displaying in the editor.
	 **/
	downloadEditorContents : function() {
		var filename = prompt('Enter a file name', currentFile || 'download.txt')
		var fileBlob;
		var ext;
		
		if(currentFile && currentFile.length) {
			var fnSplit = currentFile.split('.');
			ext = fnSplit[fnSplit.length - 1];
		}

		if(ext === 'resource' && filename && currentZip && currentZip.files && Object.keys(currentZip.files).length) {
			var query = "SELECT Body, ContentType FROM StaticResource WHERE " +
			            (currentFileId ? "Id = '" + currentFileId + "'" : "Name = '" + currentFile + "'");
			
			d3vUtil.alert('downloading file...');
			ServerAction.query(query, function(callbackData) {
				callbackData = eval('(' + callbackData + ')');
				callbackData = callbackData[0] || callbackData;
				fileBlob     = d3vPush.b64toBlob(callbackData.Body, callbackData.ContentType);
				
				saveAs(fileBlob, filename);
				d3vUtil.alert('download successful!', { scheme : 'positive'});
			});
		} else if(filename) {
			var focusedEditor = d3vCode.getFocusedEditor(editor);
			fileBlob = new Blob([focusedEditor.getSession().getValue()], {type: "text/plain;charset=" + document.characterSet});
			saveAs(fileBlob, filename);
			d3vUtil.alert('download successful!', { scheme : 'positive'});
		}
	},
	 
	/**
	 * @description Validates a save key.
	 * @param       result - object with key data to validate
	 * @param       true when key is up to date, else false
	 **/
	validateVisualforceKey : function(result) {
	    return lastSaveKey === result.Id + '-' + result.LastModifiedById + '-' + result.LastModifiedDate;
	},
	
	/**
	 * @description Puts the users cursor in the code typahead, and clears its input
	 **/
	putCursorInCodeHelper : function() {
	    $('select#code-helper-input').trigger("chosen:open");
	    $('div.chzn-search input').click().focus();
	},

	/**
	 * @description Sets the code editor to its default state.
	 **/
	goToCodeDefaultState : function() {
	    lastAction           = null;
	    currentFile          = null;
	    currentFileId        = null;
	    lastFile             = null;
	    currentFileNamespace = null;
	    currentBundleId      = null;
	    currentZip           = null;
	    currentZippedFile    = null;
	    
	    d3vCode.setApiVersion('-');
	    $(document).attr('title', 'ASIDE.IO');
	    d3vCode.showSaveIcon();
	    editor.getSession().setValue('');
	    d3vCode.putCursorInCodeHelper();
	    d3vCode.setFootCoverage();
	},

	/**
	 * @decription Opens the "update" (e.g. change content type for resources, change version for others) dialog
	 **/	
	openUpdateDialog : function() {
		if(foreignManaged) {
			d3vUtil.alert("packaged files are not updatable");
		} else if(currentFile) {
			var cfs = currentFile.split('.');
			var ext = cfs[1];
			
			if(ext == 'resource') {
				d3vCode.openContentDialog();
			} else if(ext === 'object') {
				d3vUtil.alert('this command does not work on objects');
			} else {
				d3vCode.openVersionDialog();
			}
		} else {
			d3vUtil.alert("there must be a file open to update");
		}
	},

	/**
	 * @decription Opens the content type change dialog
	 **/	
	openContentDialog : function() {
		d3vCode.defaultResourceName();
		d3vPopups.showAnimatedModal('#mime-errors');
		$('div#mime-close').show();
	},

	/**
	 * @decription Opens the version dialog
	 **/
	openVersionDialog : function() {
	    d3vPopups.showAnimatedModal('#version-popup');
	},

	/**
	 * @description Finds the string in the find input box
	 * @param       backwards - true if backwards, false if forwards
	 * @param       wrap      - true to wrap the doc when searching
	 * @param       whatToFind - (optional) used if you want to find something that is not in the find input.
	 **/
	performFind : function(backwards, wrap, whatToFind) {
	    var findObj = {
	      backwards: backwards,
	      wrap: wrap || d3vPopups.isFindWithWrapOn(),
	      caseSensitive: d3vPopups.isFindCaseSensitive(),
	      wholeWord: d3vPopups.isFindByWholeOn(),
	      regExp: d3vPopups.isFindByRegexOn()
	    };
	    
	    var toFind = whatToFind || $('textarea#find-textarea').val();
	    lastFocusedEditor.find(toFind, findObj);
	},

	/**
	 * @description Jumps to a method in the current file -- a performFind() wrapper.
	 * @param       methodName - name of method to locate.
	 **/
	jumpToMethod : function(methodName) {
	    d3vCode.performFind(false, true, methodName);
	},
	
	/**
	 * @description Finalizes the deletion by informing the user of its success, and updates the ide accordingly.
	 * @param       deleteResult - result of deleteFiles()
	 **/
	finalizeFileDeletion : function(deleteResult) {
	    deleteResult = eval('(' + deleteResult + ')');
	    if(deleteResult.success) {
	        d3vUtil.alert('successful deletion', { scheme : 'positive'});
	        d3vCode.removeLastActionFromTypeahead();
	        d3vSync.sendRemoveFileRequest(lastAction);
	        d3vCode.goToCodeDefaultState();
	    } else {
	        d3vUtil.alert('deletion failed', { scheme : 'negative'});
	        
	        if(deleteResult.errors && deleteResult.errors.message) {
	        	d3vPopups.displayMessage('Delete Error', deleteResult.errors.message, deleteResult);
	        }
	    }
	},
	
	/**
	 * @description Replaces a found token
	 * @param       all - replace all if true, selected item if false
	 **/
	performReplace : function(all) {
	    var replaceWith = $('textarea#replace-textarea').val();
	    if(all) {
	        //Replace all doesnt work as I would expect it to, 
	        //unless I first call performFind with wrap set to true.
	        d3vCode.performFind(false, true);
	        editor.replaceAll(replaceWith);
	    } else {
	        editor.insert(replaceWith);
	    }
	},
	
	/**
	 * @description Opens the find dialog
	 **/
	openFind : function(requestSync) {
	    d3vPopups.showGlobalPanel('Find', '#find-popup');
	    
	    var focusedEditor = d3vCode.getFocusedEditor(editor);
	    
	    var selectedText = focusedEditor.session.getTextRange(focusedEditor.getSelectionRange());
	    var $finder      = $('textarea#find-textarea');
	    
	    if(selectedText && $.trim(selectedText) != '') {
	        $finder.focus().val(selectedText).select();
	    } else {
	    	$finder.focus().click().select();
	    }
	},
	
	/**
	 * @description Closes the find popup
	 * @param       requestSync - true when others instances should update the find popup
	 **/
	closeFind : function(requestSync) {
		d3vPopups.hideGlobalPanel();
	},

	/**
	 * @description Displays visualforce/lightning errors to the user.
	 * @param       result - errors
	 * @param       rawResult - the complete api result
	 * @param       panelTitle - error panel title label
	 **/
	displayGenericErrors : function(result, rawResult, panelTitle) {
	    var $errorPopup = $('div#code-errors-list');
	    $errorPopup.empty();
	    var resultEscaped = d3vUtil.escapeTags(result);
	    var $errorLink = $('<span class="compiler-error">' + resultEscaped + '</span>');

        var $btnContainer = $('<div class="gen-btn-container" />');	    
	    var atLine = result.indexOf('at line ');
	    var atCol  = result.indexOf(' column ');
	    var lineNumber = -1;
	    
	    if(atLine !== -1 && atCol !== -1) {
	        var lineSplit  = result.substring(atLine + 'at line '.length);
	    	lineNumber     = parseInt(lineSplit.split(' ')[0]) - 1;
	    	var colNumber  = parseInt(lineSplit.split(' ')[2].replace(':', ''));

	        var annos = [{ 
	          row: lineNumber, 
	          column: colNumber, 
	          text: result,
	          type: "error" // also warning and information 
	        }];
	        
	        editor.getSession().setAnnotations(annos);   
	    }
	    
	    d3vCode.buildErrorDialogMarkup($errorPopup, lineNumber, resultEscaped, rawResult, resultEscaped);
	    d3vPopups.showGlobalPanel(panelTitle, '#code-errors-list', CODE_SECTION);             
	},
	
	/**
	 * @description Displays visualforce errors to the user.
	 * @param       result - errors
	 * @param       rawResult - the complete api result
	 **/
	displayVisualforceErrors : function(result, rawResult) {
		d3vCode.displayGenericErrors(result, rawResult, 'Visualforce Save Error');         
	},

	/**
	 * @description Changes ace's code highlighting to be apex-like
	 **/
	apexMode : function() {
        d3vCode.setMode("ace/mode/java");
        editor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });
        rightEditor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });                 
	},
	
	/**
	 * @description Changes ace's code highlighting to be visualforce-like
	 **/
	htmlMode : function() {
        d3vCode.setMode("ace/mode/html");
        editor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete  });
     	rightEditor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });

        if(!vfAutoCompleteLoaded) {
        	vfAutoCompleteLoaded = true;
        	
        	if(aside.objMap) {
        		editor.session.getMode().$completer.addSObjects(aside.objMap);
        	}
        	
        	if(aside.files) {
        		editor.session.getMode().$completer.addComponentsAndClasses(aside.files, aside.org.namespace);
        	}
        }
	},	
	
	/**
	 * @description Updates ASIDEs knowledge of apex classes, with data based on the currently opened file
	 **/
	updateApexDefinition : function() {
		d3vCode.getSymbolTable(function(symbolTable) {
			d3vCode.parseSymbolTable(symbolTable);
			d3vCode.loadSymbolTables();
			d3vCode.setVariableMap();
		});
	},
	
	/**
	 * @description Obtains the symbol table for the current file, if it is an apex class.
	 * @param       callback - callback to do something with resulting symbol table
	 **/	
	getSymbolTable : function(callback) {
		if(currentFile.indexOf('.cls') !== -1 && currentFileId) {
			ServerAction.queryTooling("SELECT SymbolTable FROM ApexClass WHERE Id = '" + currentFileId + "'", function(callbackData) {
				callbackData = eval('(' + callbackData + ')');
				
				if(callbackData && callbackData.length) {
					callbackData = callbackData[0];
					
					if(callback && callbackData.SymbolTable) {
						callback(callbackData.SymbolTable);
					}
				}
			});		
		}
	},
	
	/**
	 * @description Saves a symbol table to local storage
	 * @param       className - name of class symbol table is for
	 * @param       symbolTable - the symbol table (in ASIDEs format)
	 **/
	saveSymbolTable : function(className, symbolTable) {
		var symbolTables = d3vCode.loadSymbolTableData();
		
		if(symbolTable) {
			symbolTables[className] = symbolTable;
			
			try {
				localStorage[SYM_TABLES + aside.org.orgId] = JSON.stringify(symbolTables);
			} catch(ex) {
				d3vCode.wipeSymbolTables();
			}
		}
	},
	
	/**
	 * @description Adds the saved custom tables to asides apex encyclopedia
	 **/
	loadSymbolTables : function() {
		var symbolTables = d3vCode.loadSymbolTableData();
		
		for(var prop in symbolTables) {
			if(symbolTables.hasOwnProperty(prop)) {
				apexLang[prop] = symbolTables[prop];
			}
		}
	},
	
	/**
	 * @description Load the symbol tables for the current org from local storage
	 **/
	loadSymbolTableData : function() {
		var symbolTables = localStorage[SYM_TABLES + aside.org.orgId];
		
		if(symbolTables) {
			return JSON.parse(symbolTables);
		}
		
		return {};
	},
	
	/**
	 * @description Removes all symbol tables from local storage
	 **/
	wipeSymbolTables : function() {
		for(var prop in localStorage) {
			if(prop.indexOf(SYM_TABLES) === 0 && localStorage.hasOwnProperty(prop)) {
				delete localStorage[prop];
			}
		}
	},	
	
	/**
	 * @description Parses a symbol table, turning it into the format ASIDE uses
	 * @param       symbolTable - the symbol table to translate
	 **/
	parseSymbolTable : function(symbolTable) {
		d3vCode.saveSymbolTableContents(symbolTable);
		
		if(symbolTable.innerClasses && symbolTable.innerClasses.length) {
			for(var i = 0, end = symbolTable.innerClasses.length; i < end; i++) {
				d3vCode.saveSymbolTableContents(symbolTable.innerClasses[i]);
			}		
		}
	},

	/**
	 * @description Parses & saves the contents of a single symbol table
	 * @param       symbolTable - the symbol table to translate
	 **/	
	saveSymbolTableContents : function(symbolTable) {
		var className = symbolTable.name.toLowerCase();
		
		var asideTable = {
			constructors : d3vCode.parseClassConstructors(symbolTable),
			properties : d3vCode.parseClassProperties(symbolTable, false),
			staticProperties : d3vCode.parseClassProperties(symbolTable, true),
			instanceMethods : d3vCode.parseClassMethods(symbolTable, false),
			staticMethods : d3vCode.parseClassMethods(symbolTable, true)
		};
		
		apexLang[className] = asideTable;
		d3vCode.saveSymbolTable(className, asideTable);	
	},
	
	/**
	 * @description Parses the "type" of a variable.  Handles List, Set, Map cases to make them uniform
	 * @param       objectType - the type of the variable from the symbol table
	 **/
	parseVariableType : function(objectType) {
		if(objectType) {
			var lowerType = objectType.toLowerCase();
			
			if(lowerType === 'list') {
				return 'List';
			} else if(lowerType === 'set') {
				return 'Set';
			} else if(lowerType === 'map') {
				return 'Map';
			}
			
			return objectType;
		}
		
		return '';
	},
	
	/**
	 * @description Determines if an item in the symbol table has the specified modifier
	 * @param       item - the symbol item to check for the modifier
	 * @param       modifier - the modifier to look for
	 * @returns     true when the item has the modifier
	 **/
	checkForSymbolItemModifier : function(item, modifier) {
		if(item) {
			if(item.visibility && current.visibility.toLowerCase() === modifier) {
				return true;
			}
			
			if(item.modifiers && item.modifiers.length) {
				for(var i = 0, end = item.modifiers.length; i < end; i++) {
					if(item.modifiers[i] === modifier) {
						return true;
					}
				}
			}
		}
		
		return false;
	},
	
	/**
	 * @description Parses the constructors from the salesforce symbol table, translating them to the format ASIDE uses
	 * @param       symbolTable - the symbol table to translate constructors from
	 **/
	parseClassConstructors : function(symbolTable) {
		var constructors = [];
		var constructor;
		var current;
		var currParams;
		var paramSignature;
		var currentType;
		
		for(var i = 0, end = symbolTable.constructors.length; i < end; i++) {
			current = symbolTable.constructors[i];
			
			if(d3vCode.checkForSymbolItemModifier(current, PUBLIC_MODIFIER)) {
				currParams = [];
				
				if(!current.parameters || !current.parameters.length) {
					currParams.push('()');
				} else {
					paramSignature = '(';
					
					for(var j = 0, endJ = current.parameters.length; j < endJ; j++) {
						paramSignature += d3vCode.parseVariableType(current.parameters[j].type) + ' ' + current.parameters[j].name + ', ';
					}
					
					currParams.push(paramSignature.substring(0, paramSignature.length - 2) + ')');
				}
							
				constructors.push({
					type : 'void',
					name : current.name,
					parameters: currParams
				});
			}
		}
		
		return constructors;
	},

	/**
	 * @description Parses the properties from the salesforce symbol table, translating them to the format ASIDE uses
	 * @param       symbolTable - the symbol table to translate properties from
	 * @param       forStatic   - true if trying to parse static properties false if not
	 **/	
	parseClassProperties : function(symbolTable, forStatic) {
		var properties = [];
		var current;
		var propIsStatic;
		
		for(var i = 0, end = symbolTable.properties.length; i < end; i++) {
			current = symbolTable.properties[i];
			
			if(d3vCode.checkForSymbolItemModifier(current, PUBLIC_MODIFIER)) {
				propIsStatic = current.modifiers && current.modifiers.length && current.modifiers[0] && current.modifiers[0].toLowerCase() === STATIC_MODIFIER;
				
				if((propIsStatic && forStatic) || (!propIsStatic && !forStatic)) {				
					properties.push({
						type : current.type,
						name : d3vCode.parseVariableType(current.name)
					});
				}
			}
		}		
		
		return properties;
	},

	/**
	 * @description Parses the methods from the salesforce symbol table, translating them to the format ASIDE uses
	 * @param       symbolTable - the symbol table to translate methods from
	 * @param       forStatic - true if we are trying to translate static methods, false for instance methods
	 **/	
	parseClassMethods : function(symbolTable, forStatic) {
		var methods = [];
		var current;
		var currParams;
		var paramSignature;
		
		for(var i = 0, end = symbolTable.methods.length; i < end; i++) {
			current = symbolTable.methods[i];
			
			if(d3vCode.checkForSymbolItemModifier(current, PUBLIC_MODIFIER)) {
				var isStatic = false;
				
				for(var j = 0, endJ = current.modifiers.length; j < endJ; j++) {
					if(current.modifiers[j] && current.modifiers[j].toLowerCase() === STATIC_MODIFIER) {
						isStatic = true;
						break;
					}
				}
				
				if((forStatic && isStatic) || (!forStatic && !isStatic)) {
					currParams = [];
					
					if(!current.parameters || !current.parameters.length) {
						currParams.push('()');
					} else {
						paramSignature = '(';
						
						for(var j = 0, endJ = current.parameters.length; j < endJ; j++) {
							paramSignature += d3vCode.parseVariableType(current.parameters[j].type) + ' ' + current.parameters[j].name + ', ';
						}
						
						currParams.push(paramSignature.substring(0, paramSignature.length - 2) + ')');
					}				
				
					methods.push({
						type : d3vCode.parseVariableType(current.returnType),
						name : current.name,
						parameters: currParams
					});				
				}
			}
		}			
		
		return methods;
	},	
	
	/**
	 * @description Queries for the current version of an object to obtain the save key
	 **/
	updateObjectSaveKey : function() {
		if(currentFileId) {
			ServerAction.queryTooling("SELECT Id, LastModifiedDate FROM CustomObject WHERE Id = '" + currentFileId + "'", function(callbackData) {
				callbackData = eval('(' + callbackData + ')');
				
				if(callbackData && callbackData.length) {
					d3vCode.setSaveKey(callbackData);
				}
			});
		} else {
			lastSaveKey = null;
		}
	},
	
	/**
	 * @description Updates the save key
	 * @param       result - data to update key from
	 **/
	setSaveKey : function(result) {
	    var keyRecord = result[0] || result;
	    lastSaveKey = keyRecord.Id               + '-' +
	                  keyRecord.LastModifiedById + '-' +
	                  keyRecord.LastModifiedDate;
	},	
	
	/**
	 * @description Calculates the width needed to display all the icons in the autocorrect
	 **/
	calculateACWidth : function() {
		var tokens = editor.completer.popup.data;
		var longest = 0;
		var current = 0;
		
		if(tokens && tokens.length) {
			for(var i = 0, end = tokens.length; i < end; i++) {
				current = 0;
				
				if(tokens[i].caption) {
					current += tokens[i].caption.length;
				}
				
				if(tokens[i].meta) {
					current += tokens[i].meta.length;
				}
				
				if(current > longest) {
					longest = current;
				}
			}
			
			return Math.ceil((longest + 3) * (editor.completer.popup.renderer.layerConfig.characterWidth || 10));
		}
		
		return 400;
	},
	
	/**
	 * @description Sizes the autocomplete box to fit all its entries (in terms of width)
	 **/
	setACWidth : function(theEditor) {
		if(editor && editor.completer) {
			editor.completer.popup.renderer.container.style.width = d3vCode.calculateACWidth() + 'px';	
		}
	},	

	/**
	 * @description Search all code in the org for the text entered into the
	 *              "Org Code Search" input text.
	 **/
	findInFiles : function() {
	    var searchVal = $('input.ocs-input').val();
	    
	    if(searchVal && searchVal.length) {
	        d3vUtil.alert('searching...', { showTime : ALERT_DISPLAY_TIME_LONG });
	        d3vCode.orgCodeSearch(searchVal);
	    } else {
	        d3vUtil.alert('enter a value to search for');
	    }
	},

	/**
	 * @description Builds and displays the results from the org code search.
	 * @param       result      - ocs results
	 * @param       searchVal   - what was searched for
	 * @param       $resultsDiv - div to display results in
	 **/
	buildOCSResultList : function(result, searchVal, $resultsDiv) {
	    $resultsDiv.empty();
	    var paddedNamespace = aside.org.namespace && aside.org.namespace.length ? aside.org.namespace + '__' : '';
		var markup = [];

	    for(var i = 0, endI = result.length; i < endI; i++) {
	        var filename    = result[i].Name;
	        var filetype    = 'class';
	        var currentType = result[i].type || result[i].Type;
	        var splitOn     = 'Body';
	        var ext;
	        var snippets;
	        
	        if(currentType === 'ApexClass') {
	        	ext = 'cls';
	        	splitOn = 'Body';
	        } else if(currentType === 'ApexPage') {
	        	ext = 'page';
	        	splitOn = 'Markup';
	        } else if(currentType === 'ApexTrigger') {
	        	ext = 'trigger';
	        	splitOn = 'Body';
	        } else if(currentType === 'ApexComponent') {
	        	ext = 'component';
	        	splitOn = 'Markup';
	        }
	        
			snippets = d3vCode.getTokenSnippets(searchVal, result[i][splitOn]);
			
	        var fullname    = (result[i].NamespacePrefix ? result[i].NamespacePrefix + '.' : '') + filename + '.' + ext;
	        var className   = i % 2 === 1 ? 'ocs-result' : 'ocs-result-alt';
	        
	        markup.push('<div class="' + className + '" fn="' + fullname + '">'
	        	   +        '<div class="keep-left full-width">'
	        	   +            '<div class="keep-left ocsr-name">' + fullname + '</div>'
	        	   +            '<div class="keep-right ocsr-more">'
	        	   +                '<div class="ocsr-count">' + snippets.length + '</div>'
	        	   +                '<div class="ocsr-plus">+</div>'
	        	   +            '</div>'
	        	   +        '</div>'
	        	   +        '<div class="keep-left full-width snippet-table hidden">'
	        	   +			d3vCode.getOCSSnippetMarkup(snippets)
	        	   +        '</div>'
	               +    '</div>');
	    }            
	    
	    $resultsDiv.html(markup.join(''));

        $('.ocsr-name').unbind().click(function() {
        	var $this  = $(this);
        	var toFind = $this.attr('specific-search');
        	var cfn    = $this.parent().parent().attr('fn'); 
        	
        	d3vCode.openAndFind(cfn, searchVal);
        }); 
        
        $('.ocs-snippet').unbind().click(function() {
        	var $this  = $(this);
        	var toFind = $this.attr('specific-search');
        	var cfn    = $this.parent().parent().attr('fn'); 
        	
        	d3vCode.openAndFind(cfn, toFind);
        });         
        
        $('.ocsr-more').unbind().click(function() {
        	var $that = $(this);
        	var $sign = $that.find('.ocsr-plus');
        	var expanded = $sign.text() === '-';
        	var $snippetTable = $that.parent().siblings('.snippet-table');
        	
        	if(expanded) {
        		$sign.text('+');
        		$snippetTable.hide();
        	} else {
        		$sign.text('-');
        		$snippetTable.show();
        	}
        });
	},
	
	/**
	 * @description Opens a file and finds a token inside of it
	 * @param       cfn - file name to search inside of
	 * @param       toFind - the token to find
	 **/
	openAndFind : function(cfn, toFind) {
    	if($('#ocs-open-select').val() === 'current') {
    		if(d3vCode.getCompleteFilename() === cfn) {
    			d3vCode.performFind(false, true, toFind);
    		} else {
    			d3vCode.openFile(cfn, {token : toFind});
    		}
    	} else {
    		window.open('/?file=' + encodeURIComponent(cfn) + '&find=' + encodeURIComponent(toFind), '_blank');
    	}	
	},
	
	/**
	 * @description Given a list of snippets, returns HTML menu markup representing those snippets
	 * @param       snippets - the list of snippets to return as html menu
	 * @returns     html snippet menu markup
	 **/
	getOCSSnippetMarkup : function(snippets) {
		if(snippets.length === 0) {
			return '<div class="ocs-result-not-local">Search token not found in newest file.</div>';
		}
	
		var markup = [];
		var encoded;
		var asAttr;
		var display;
		
		for(var i = 0, end = snippets.length; i < end; i++) {
			encoded = d3vUtil.htmlEncode(snippets[i].value);
			asAttr = encoded.replace(OCS_OPEN_HIGHLIGHT, '').replace(OCS_CLOSE_HIGHLIGHT, '');
			display = (snippets[i].leftPad ? '...' : '') 
			        + encoded.replace(OCS_OPEN_HIGHLIGHT, '<i>').replace(OCS_CLOSE_HIGHLIGHT, '</i>')
			        + (snippets[i].rightPad ? '...' : '');
			
			markup.push('<div class="ocs-snippet keep-left full-width" specific-search="' + asAttr + '">' + display + '</div>');
		}
		
		return markup.join('');
	},
	
	/**
	 * @desription Returns an snippet for every time a token is used within a larger string
	 * @param      token - the token to search for
	 * @param      code - the larger string to look for the token within
	 * @returns    list of snippets
	 **/
	getTokenSnippets : function(token, code) {
		var lowerCode = code.toLowerCase();
		var lowerToken = token.toLowerCase();
		
		var instances = [];
		var position = lowerCode.indexOf(lowerToken, 0);
		var snippetStart;
		var snippetEnd;
		var snippet;
		var snippetTokenLoc;
		var snippetNewLine;
		var snippetFirstHalf;
		var snippetSecondHalf;
		var reconstructedSnippet;
		var lowerSnippet;
		var snippetMiddle;
		var leftEllipsis;
		var rightEllipsis;
		
		while(position !== -1) {
			snippetStart = position - OCS_SNIPPET_BUFFER;
			snippetEnd = position + token.length + OCS_SNIPPET_BUFFER * 3;
			snippet = code.substring(snippetStart, snippetEnd);
			lowerSnippet = snippet.toLowerCase();
			snippetTokenLoc = lowerSnippet.indexOf(lowerToken);
			snippetFirstHalf = snippet.substring(0, snippetTokenLoc);
			snippetSecondHalf = snippet.substring(snippetTokenLoc + token.length);
			snippetMiddle = snippet.substring(snippetTokenLoc, snippetTokenLoc + token.length);
			snippetNewLine = snippetFirstHalf.lastIndexOf('\n');
			leftEllipsis = false;
			rightEllipsis = false;
			
			//snippets with a new line before the token start one char after new line
			if(snippetNewLine !== -1) {
				snippetFirstHalf = snippetFirstHalf.substring(snippetNewLine + 1);
			} else if($.trim(snippetFirstHalf).length) {
				leftEllipsis = true;
			}
			
			//snippets with a new line after the token are cut off at the new line
			snippetNewLine = snippetSecondHalf.indexOf('\n');
			if(snippetNewLine !== -1) {
				snippetSecondHalf = snippetSecondHalf.substring(0, snippetNewLine);
			} else if(!d3vUtil.endsWith(snippetSecondHalf, ';')) {
				rightEllipsis = true;
			}
			
			position = lowerCode.indexOf(lowerToken, position + 1);
			reconstructedSnippet = snippetFirstHalf + OCS_OPEN_HIGHLIGHT + snippetMiddle + OCS_CLOSE_HIGHLIGHT + snippetSecondHalf;
			instances.push({ 
				value : $.trim(reconstructedSnippet),
				leftPad : leftEllipsis,
				rightPad : rightEllipsis});
		}
		
		return instances;
	},

	/**
	 * @description Processes server org code search results.
	 * @param       result    - result from server
	 * @param       searchVal - what was searched for.
	 **/
	processOCSResults : function(result, searchVal) {
	    var $resultsDiv = $('div#ocs-results');
	    if(result.length === 0) {
	        $resultsDiv.html('<div class="ocs-no-results">no results found</div>');
	    } else {
	        d3vCode.buildOCSResultList(result, searchVal, $resultsDiv);
	    }            
	},
	
	/**
	 * @description Clears the org code search
	 **/
	clearOCS : function() {
		$('.ocs-input').val('');
		$('#ocs-results').html('<div class="ocs-no-results">no results found</div>');
		d3vUtil.alert('results cleared!', { scheme : 'positive'});
	},

	/**
	 * @description Calls to server to search all code for searchVal
	 * @param       searchVal - what to search for
	 **/
	orgCodeSearch : function(searchVal) {
	    ServerAction.findInFiles(searchVal, function(callbackData) {
	    	callbackData = JSON.parse(callbackData);
	    	
	    	if(callbackData.length === OCS_MAX_ROWS) {
	    		d3vUtil.alert('search successful, results returned limited to ' + OCS_MAX_ROWS, { scheme : 'positive'});
	    	} else if(callbackData.length) {
	    		d3vUtil.alert('search successful, found ' + callbackData.length + ' results', { scheme : 'positive'});
	    	} else {
	    		d3vUtil.alert('no matching results found', { scheme : 'positive'});
	    	}
	        
	        d3vCode.processOCSResults(callbackData, searchVal);
	    });                 
	},

	/**
	 * @description Takes a result from d3vController.query and will delete the files from server via api
	 * @param       result - return value of d3vController.query
	 * @return      deletion success/failure object
	 **/
	deleteFiles : function(result) {
	    ServerAction.deleteRecords([result.Id], function(callbackData) {
	    	d3vCode.finalizeFileDeletion(callbackData);
	    });           
	},
	
	/**
	 * @description Deletes lightning file from the server.
	 *              Has custom logic for lightning because when its the last AuraDefinition under
	 *              the AuraDefinitionBundle, you need to delete the AuraDefinitionBundle instead of the AuraDefinition
	 **/
	deleteLightningFile : function() {
    	var filename = d3vCode.getNonNamespacedFilename();
    	var namespaceClause = d3vCode.getNamespacePrefixWhere().replace('NamespacePrefix', 'AuraDefinitionBundle.NamespacePrefix');
    	var query = "SELECT AuraDefinitionBundleId FROM AuraDefinition " +
    	            "WHERE AuraDefinitionBundle.DeveloperName = '" + filename + "' AND" + namespaceClause;
    	
    	var auraType = d3vCode.getAuraType(d3vCode.getCurrentExtension()).type;
    	
    	if(auraType === 'application' || auraType === 'component' || auraType === 'interface' || auraType === 'tokens' || auraType === 'event') {
    		if(confirm('Deleting a lightning ' + auraType + ' will delete this resource along with all of the other lightning resources in this bundle.  Are you sure you want to continue?')) {
    			d3vUtil.alert('deleting...');
    			d3vCode.deleteFiles({Id : currentBundleId});
    		} else {
    			d3vUtil.alert('delete cancelled');
    		}	
    	} else {
    		d3vUtil.alert('deleting...');
    		d3vCode.deleteFiles({Id : currentFileId});
    	}

	},

	/**
	 * @description Deletes the current file from the server
	 **/
	executeFileDelete : function() {
		var cfs = currentFile.split('.');
		var ext = cfs[1];
		var fn  = cfs[0];
		
	    if(currentFileId && currentFileId.length && ext.indexOf('aura-') !== -1) {
	    	d3vCode.deleteLightningFile();	    
	    } else if(currentFileId && currentFileId.length) {
	    	d3vUtil.alert('deleting...');
	    	d3vCode.deleteFiles({Id : currentFileId});
	    } else if(ext === 'xml') {
	    	delete localStorage[PACKAGE_XML_FILE + aside.org.orgId + fn];
	        d3vUtil.alert('successful deletion', { scheme : 'positive'});
	        d3vCode.removeLastActionFromTypeahead();
	        d3vSync.sendRemoveFileRequest(lastAction);
	        d3vCode.goToCodeDefaultState();	    
	    } else if(ext === 'theme') {
	    	var selected = $('.aside-theme').val();
	    	
	    	if(selected === fn) {
	    		d3vUtil.alert('cannot delete the selected theme', { scheme : 'negative'});
	    		return;
	    	}
	    
	    	delete localStorage[UI_THEME_FILE + fn];
	        d3vUtil.alert('successful deletion', { scheme : 'positive'});
	        d3vCode.removeLastActionFromTypeahead();
	        d3vSync.sendRemoveFileRequest(lastAction);
	        d3vCode.goToCodeDefaultState();	   
	        d3vCode.populateUIThemePicklist();
	    } else {
	    	d3vUtil.alert('cannot currently delete file', { scheme : 'negative'});    	
	    }
	},

	/**
	 * @description Deletes the file currently shown in the editor, if the user accepts.
	 **/
	performFileDelete : function() {
		var ext = d3vCode.getCurrentExtension();
		
	    if(!foreignManaged && currentFile && currentFile.indexOf('.') !== -1 && ext !== 'object') {
	        var cfs = currentFile.split('.');
	        var ext = cfs[1];
	       
	        if(ext === 'resource') {
	        	d3vCode.hideZipMenu();
			}
			
	        if(confirm('Are you sure you want to delete ' + currentFile + '?')) {
	            d3vCode.executeFileDelete();
	        }
	    } else if(foreignManaged) {
	    	d3vUtil.alert('this file cannot be deleted because it is packaged');
	    } else if(ext === 'object') {
	    	d3vUtil.alert('objects must be deleted from within salesforce');
	    } else {
	        d3vUtil.alert('this is an awkward time to try to delete');
	    }
	},

	/**
	 * @description Given the id of a lightning file, will update 
	 *              the version of the file to the new specified version 
	 * @param       fileId  - id of lightning file to update
	 * @param       version - new version number
	 **/
	processLightningVersionUpdate : function(fileId, version) {
		version = version + '';
		
		if(version.indexOf('.') === -1) {
			version = version + '.0';
		}

	    var updatedLightning = {
	    	Id : currentBundleId,
	    	ApiVersion : version
	    };  
	
		ServerAction.updateRecords(updatedLightning, 'AuraDefinitionBundle', function(updateResult) {
			var result = eval('(' + updateResult + ')');
	        if(result.updateResponse.result.success === "true" || result.updateResponse.result.success === true) {
	            d3vUtil.alert("version successfully updated", { scheme : 'positive'});
	            d3vCode.setApiVersion(version);
	        } else {
	            d3vUtil.alert("update failed", { scheme : 'negative'});
	            d3vCode.displayGenericErrors(result.updateResponse.result.errors.message, result, 'Lightning Save Error'); 
	        }					
		});
	},

	/**
	 * @description Given the id of a vf file, will update 
	 *              the version of the file to the new specified version 
	 * @param       fileId  - id of vf file to update
	 * @param       vfType  - Page|Component
	 * @param       version - new version number
	 **/
	processVersionUpdate : function(fileId, vfType, version) {
		version = version + '';
		
		if(version.indexOf('.') === -1) {
			version = version + '.0';
		}
	
	    var updatedVF = {
	    	Id : fileId,
	    	ApiVersion : version
	    };  
	
		ServerAction.updateRecords(updatedVF, "Apex" + d3vUtil.capitalizeString(vfType), function(callbackData) {
			var result = eval('(' + callbackData + ')');
	        if(result.updateResponse.result.success === "true" || result.updateResponse.result.success === true) {
	            d3vUtil.alert("version successfully updated", { scheme : 'positive'});
	            d3vCode.setApiVersion(version);
	        } else {
	            d3vUtil.alert("update failed", { scheme : 'negative'});
	            d3vCode.displayVisualforceErrors(result.updateResponse.result.errors.message, result);
	        }					
		});
	},

	/**
	 * @description Updates the version of the currently opened lightning file
	 * @param       version - new version number
	 **/
	updateLightningVersion : function(version) {
        if(currentFileId) {
            d3vCode.processLightningVersionUpdate(currentFileId, version);
        } else {
            d3vUtil.alert('no file to update');
        }
	},

	/**
	 * @description Given the name of a vf file, will update 
	 *              the version of the file to the new specified version 
	 * @param       vfType  - Page|Component
	 * @param       version - new version number
	 **/
	updateVisualforceVersion : function(vfType, version) {
        if(currentFileId) {
            d3vCode.processVersionUpdate(currentFileId, vfType, version);
        } else {
            d3vUtil.alert('no file to update');
        }
	},

	/**
	 * @description Updates the version of an apexfile, if one is currently open in the editor
	 * @param       apexType - class|trigger
	 * @param       version - new version number
	 **/
	updateApexVersion : function(apexType, version) {
	    d3vCode.saveApex(editor.getSession().getValue(), false, apexType, version);
	},
	
	/**
	 * @description Reverts ASIDE to using its default CSS
	 **/
	resetToDefaultCSS : function() {
		delete localStorage[COOKIE_PRE + COOKIE_SAVE_STYLESHEET];
		window.location.reload();
	},	

	/**
	 * @description Updates the working css to the stylesheet contents specified
	 * @param       stylesheet - the css to use
	 **/	
	setStylesheet : function(stylesheet) {
		$('#aside-css, #aside-custom-css').remove();
		$('head').append('<style id="aside-custom-css">' + stylesheet + '</style>');	
	},
	
	/**
	 * @description Applies the selected stylesheet
	 **/
	applyStylesheet : function() {
		var stylesheet = $('.aside-theme').val();
		
		if(stylesheet && stylesheet.length) {
			if(d3vUtil.startsWith(stylesheet, '/css/')) {
				$.get(stylesheet, function(cbd) {
					if(cbd && cbd.length) {
						d3vCode.setStylesheet(cbd);
					}
				});
			} else {
				var toApply = JSON.parse(localStorage[UI_THEME_FILE + stylesheet]);
				d3vCode.setStylesheet(toApply.code);
			}
		}
	},
	
	/**
	 * @description Opens the default CSS file from the server
	 **/
	openDefaultCSS : function() {
		$.get('/css/d3v.css', function(cbd) {
			editor.session.setValue(cbd);
			d3vCode.setMode('ace/mode/css');
		});			
	},

	/**
	 * @description Updates version of the currently opened file to the inputted version.
	 **/
	updateVersion : function() {
	    var version = $('select#version-selector').val();
	    
	    if(version) {
	    	d3vUtil.alert('updating version number...');
	        version = parseInt(version);
	        
	        if(!lastAction) {
	            d3vUtil.alert('nothing to update...');
	        } else if(lastAction.substring(0, 4) === 'New ') {
	            d3vUtil.alert('sorry, I cant change the version of a new file');
	        } else if(lastAction.substring(0, 5) === 'Open ') {
				var ext = d3vCode.getCurrentExtension();
				
				if(ext === 'cls') {
					ext = 'class';
				}
				
	            if(ext === 'class' || ext === 'trigger') {
	                d3vCode.updateApexVersion(ext, version);
	            } else if(ext.indexOf('aura-') !== -1) {
	            	d3vCode.updateLightningVersion(version);
	            } else {
	                d3vCode.updateVisualforceVersion(ext, version);
	            }
	        }                
	    } else {
	        d3vUtil.alert('you must enter a version number', { scheme : 'negative'});
	    }      
	},

	/**
	 * @description Displays execute anonymous errors to the user.
	 * @param       result - errors
	 **/
	displayExecuteAnonymousErrors : function(result) {
		if(!$.isArray(result)) {
			result = [result];
		}
		
	    var $errorPopup = $('div#code-errors-list');
	    $errorPopup.empty();
	    var annos = [];
	    var errorMsg;
	    var line;
	    
	    if(result[0].compiled === "true") {
	    	errorMsg = 
	    		d3vTest.addStackTraceLinks(result[0].exceptionMessage) + 
	    		'<br /><br />' +
	    		d3vTest.addStackTraceLinks(result[0].exceptionStackTrace);
	    		
	    	d3vCode.buildErrorDialogMarkup($errorPopup, -1, errorMsg, result, result[0].exceptionMessage, true);
	    	$('span.stack-trace-link').unbind().click(d3vTest.stackTraceFileClickHandler);
	    } else {
	        for(var i = 0, endI = result.length; i < endI; i++) {
	        	line = parseInt(result[i].line);
	            errorMsg = 'line ' + (line - 1) + ', col ' + result[i].column + '. ' + result[i].compileProblem;
	            
	            annos.push({ 
	              row: line - 2, 
	              column: parseInt(result[i].column), 
	              text: errorMsg,
	              type: "error" // also warning and information 
	            });              
	            
	        	d3vCode.buildErrorDialogMarkup($errorPopup, line - 1, errorMsg, result, result[i].compileProblem);
	        }
	    }
	
		if(annos && annos.length) { 
	    	editor.getSession().setAnnotations(annos);
	    }
	    
	    d3vPopups.showGlobalPanel('Execute Anonymous Error', '#code-errors-list', CODE_SECTION);           
	},

	/**
	 * @description Opens execute anonymous.
	 **/
	openExecuteAnonymous : function() {
		d3vUtil.alert('entered execute anonymous mode');
		d3vCode.enableAnonymousFooter();
		d3vCode.showRunIcon();
		d3vCode.apexMode();
		d3vCode.revertEditorDebug(true);
	    editor.getSession().setValue('');
	    d3vPopups.closeErrorPopups(CODE_SECTION);
	    d3vCode.loadAnonymousBlock();
		ServerAction.resetLogAllowance(function() {});	  
		d3vCode.changeSaveButtonToExecuteAnonymousButton();
	},
	
	/**
	 * @description Executes an anonymous block of apex.
	 * @param       editorContents - code to execute
	 **/
	executeAnon : function(editorContents) {
		d3vCode.saveAnonymousBlock(editorContents);
		
	    ServerAction.executeAnonymous(editorContents, function(callbackData) {
	    	//its hard to track down the types of errors that break execute anonymous
	    	//put any failing execute anonymous snippets in a file called executeAnonymousFailure.html
	    	callbackData = (callbackData || '').replace(' \'"\'"', ': (\')"');
			var result = eval('(' + d3vUtil.jsonEscape(callbackData) + ')');
			saving = false;
			
			editor.getSession().setAnnotations([]); //remove any marked compiler errors
			
			if($('#global-panel').is(':visible')) {
				d3vCode.refreshDebugLogList(true);
			}
			
	        if(result.success === "true") {
	        	d3vArchive.write(TABLE_CODE_HISTORY, 'ExecuteAnonymous', editorContents);
	            d3vUtil.alert('successful execution', { scheme : 'positive'});
	            d3vPopups.closeErrorPopups(CODE_SECTION);
	        } else {
	            d3vUtil.alert('execution failed', { scheme : 'negative'});
	            d3vCode.displayExecuteAnonymousErrors([result]);
	        }
	    });
	},
	
	/**
	 * @description Saves the code that was ran anonymously
	 * @param       toSave - the code to save
	 **/
	saveAnonymousBlock : function(toSave) {
		localStorage[ANONYMOUS_BLOCK + d3vUtil.getOrgId()] = toSave;
	},
	
	/**
	 * @description Attempts to load the last anonymous block executed in this org
	 **/
	loadAnonymousBlock : function() {
		var block = localStorage[ANONYMOUS_BLOCK + d3vUtil.getOrgId()];
		
		if(block && block.length) {
			editor.getSession().setValue(block);
		}
	},

	/**
	 * @description Patches the page tag, such that if you use the auto creation 
	 *              shortcut it expands it to the full controller name
	 * @param       pageName - name of vf file, no extension
	 **/	
	patchPageTag : function(pageName) {
		var content  = editor.getSession().getValue();
		var startIdx = content.indexOf('<apex:');
		var endIdx   = content.indexOf('>', startIdx);
		content      = content.substring(startIdx, endIdx);
		var matches  = content.match(/\scontroller="#([A-Za-z0-9\_]*)"/i);
		var success  = false;
		var clsName;
		
		if(matches && matches.length) {
			clsName = pageName + matches[1];
			content = editor.getSession().getValue().replace(matches[0], ' controller="' + clsName + '"');
			success = true;
		} else {
			matches = content.match(/\sstandardcontroller="([A-Za-z0-9\_]*)"/i);
			
			if(matches && matches.length) {
				var insertRegex = /(\sextensions="[A-Za-z0-9\_,\s]*)(#([A-Za-z0-9\_]*))([A-Za-z0-9\_,\s]*")/i;
				matches = content.match(insertRegex);
				
				if(matches && matches.length) {
					clsName = pageName + matches[3];
					content = editor.getSession().getValue().replace(insertRegex, "$1" + clsName + "$4");
					success = true;
				}
			}	
		}
	
		if(success) {
			var cursor = editor.selection.getCursor();
			editor.getSession().setValue(content);
			editor.moveCursorToPosition(cursor);
			
			var newFilePrefix = '';
			if(currentFileNamespace) {
				newFilePrefix = currentFileNamespace + '.';
			}
			
			
	        var $typeahead = $('select#code-helper-input');
	        d3vUtil.addOption('Open ' + newFilePrefix + clsName + '.cls', $typeahead, 'class');
			d3vUtil.addOption('Open ' + newFilePrefix + clsName + 'Test.cls', $typeahead, 'class');
		}	
	},

	/**
	 * @description Adds an entry to the Lightning Bundle autocomplete
	 **/
	addLightningResourceToBundleAutocomplete : function() {
    	var autoCompleteEntry = d3vCode.getNonNamespacedFilename();
    		
		var acValues = $('#lightning-bundle-name').autocomplete('option', 'source');
		   		
		if(!acValues.includes(autoCompleteEntry)) {
			acValues.push(autoCompleteEntry);
		}
	},

	/**
	 * @description Cleans up the state of the IDE post lightning save
	 * @param       editorContents - AuraDefinition Source
	 * @param       defType        - AuraDefinition DefType
	 * @param       isNew          - true if this was a new file, false if its an update
	 * @param       saveResult     - result of the upsert operation
	 **/
	finishLightningSave : function(editorContents, defType, isNew, saveResult) {
		saveResult = eval('(' + saveResult + ')');
		
		var record = saveResult[1];
		record     = record[0] || record;
		
		saveResult = saveResult[0];
		saveResult = saveResult.length ? saveResult[0] : saveResult;		
		saveResult = isNew ? saveResult.createResponse : saveResult.updateResponse;
		editor.getSession().setAnnotations([]); //remove any marked compiler errors
		
	    if(saveResult.result.success) {
	        d3vUtil.alert("saved successfully", { scheme : 'positive'});
	        lastFile = editorContents;
	        d3vPopups.closeErrorPopups(CODE_SECTION);
	        
	        if(isNew) {
	        	currentBundleId = record.AuraDefinitionBundleId || null;
	        	d3vCode.handleNewFile(record, '.aura-' + defType.toLowerCase());
	        	d3vCode.addLightningResourceToBundleAutocomplete();
	        	d3vCode.setLightningFooter(defType.toUpperCase(), false);
	        }
	        
	        d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), editorContents);
	        d3vCode.setSaveKey(record);
	        d3vUtil.resetEditorChange();
	        d3vCode.finishSave();
	    } else {
	    	if($.isArray(saveResult.result.errors) && saveResult.result.errors.length > 1) {
	    		saveResult.result.errors = saveResult.result.errors[0];
	    	}
	    
	        d3vUtil.alert("saved failed", { scheme : 'negative'});
	        d3vCode.displayGenericErrors(saveResult.result.errors.message, saveResult, 'Lightning Save Error');
	    }
	    
	    saving = false;
	},

	/**
	 * @description Creates the visualforce record and upserts it.
	 * @param       pageName       - name of vf file, no extension
	 * @param       vfType         - type "Page" or "Component"
	 * @param       pageSaveResult - result of upsertVisualforce
	 * @param       newFile        - true when this is a new file, false when not
	 * @param       editorContents - file that was saved to server
	 **/
	finishVisualforceSave : function(pageName, vfType, pageSaveResult, newFile, editorContents) {
		pageSaveResult = eval('(' + pageSaveResult + ')');
		
		var record     = pageSaveResult[1];
		record         = record[0] || record;
		pageSaveResult = pageSaveResult[0];
		pageSaveResult = pageSaveResult.length ? pageSaveResult[0] : pageSaveResult;		
		pageSaveResult = newFile ? pageSaveResult.createResponse : pageSaveResult.updateResponse;
		editor.getSession().setAnnotations([]); //remove any marked compiler errors
		
	    if(pageSaveResult.result.success) {
	        d3vUtil.alert("saved successfully", { scheme : 'positive'});
	        lastFile = editorContents;
	        d3vPopups.closeErrorPopups(CODE_SECTION);
	        
	        if(newFile) {
	        	d3vCode.handleNewFile(record, '.' + vfType);
	        	d3vCode.patchPageTag(pageName);
	        }
	        
	        d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), editorContents);
	        d3vCode.setSaveKey(record);
	        d3vCode.registerCodeUpdate(d3vUtil.capitalizeString(vfType));
	        d3vUtil.resetEditorChange();
	        d3vCode.finishSave();
	    } else {
	        d3vUtil.alert("saved failed", { scheme : 'negative'});
	        d3vCode.displayVisualforceErrors(pageSaveResult.result.errors.message, pageSaveResult);
	    }
	    
	    saving = false;
	},

	/**
	 * @description Method which contains any generic operations which always must be called on open any file type
	 **/	
	finishOpen : function() {
		d3vArchive.refreshLocalHistoryDialog();
	},
	
	/**
	 * @description Method which contains any generic operations which always must be called on save finish of any file type
	 **/
	finishSave : function() {
		d3vArchive.refreshLocalHistoryDialog();
	},

	/**
	 * @description Creates the visualforce record and upserts it.
	 * @param       editorContents - visualforce markup
	 * @param       pageName       - name of vf file, no extension
	 * @param       vfType         - type "Page" or "Component"
	 * @param       id             - id of visualforce page/component, if null will insert
	 * @return      object with success / failure info
	 **/
	upsertVisualforce : function(editorContents, pageName, vfType, id) {
	    if(id) {
	        ServerAction.updateVisualforce(editorContents, id, "Apex" + vfType, function(callbackData) {
	        	d3vCode.finishVisualforceSave(pageName, vfType, callbackData, false, editorContents); 
	        });
	    } else {
	        ServerAction.createVisualforce(editorContents, pageName, "Apex" + vfType, function(callbackData) {
	        	d3vCode.finishVisualforceSave(pageName, vfType, callbackData, true, editorContents); 
	        });
	    }            
	},
	
	/**
	 * @description Gets part of a where clause selecting the appropriate namespace prefix for the current file.
	 * @return      portion of where clause
	 **/
	getNamespacePrefixWhere : function() {
		if(currentFileNamespace) {
			return " NamespacePrefix = '" + currentFileNamespace + "'";
		}
		
		return " NamespacePrefix = null";
	},

	/**
	 * @description Saves visualforce to server.
	 * @param       editorContents - contents to save as page/component
	 * @param       pageName       - name of vf page/component
	 * @param       vfType         - must be 'Page' or 'Component'
	 **/
	saveVisualforce : function(editorContents, pageName, vfType) {
	    ServerAction.query("select Id, LastModifiedById, LastModifiedDate, NamespacePrefix from Apex" + vfType +
	                        " where name = '" + pageName + "' AND " + d3vCode.getNamespacePrefixWhere(), function(callbackData) {
	                        
	        var result    = eval('(' + callbackData + ')');
	        result        = result.length ? result[0] : result;
	        var newFile   = $.isArray(result) && result.length === 0;
			currentFileNamespace = result.NamespacePrefix || null;
			
			var multiExt = false;
			
			if(newFile) {
				var extRegex = /(\sextensions="(([A-Za-z0-9\_#,]*))")/i;
				var extMatch = editorContents.match(extRegex);
				
				if(extMatch && extMatch.length >= 3) {
					var exts = extMatch[2];
					multiExt = exts && exts.indexOf('#') !== -1 && exts.indexOf(',') !== -1;				
				}
			}
			
			if(newFile && multiExt) {
	            d3vUtil.alert('auto generation is limited to one extension', { scheme : 'negative'});
	            saving = false;			
			} else if(newFile || d3vCode.validateVisualforceKey(result)) {
	            var queryResultId = newFile ? null : result.Id;
	            d3vCode.upsertVisualforce(editorContents, pageName, vfType, queryResultId);               
	        } else if(!d3vCode.validateVisualforceKey(result)) {
				
				//This odd snippet of code is due to salesforce changing how the LastModifiedDate field works for ApexPages
				//It now updates if you update a related ApexComponent, which throws off ASIDEs conflict resolution, hence the
				//workaround below
				if(vfType === 'Page') {
					var queryResultId = newFile ? null : result.Id;
					d3vCode.checkForFalsePageUpdates(result, editorContents, pageName, vfType, queryResultId);
				} else {
					d3vCode.handleGenericSaveFailure();
				}
	        } else {
	            d3vUtil.alert('sorry, I cant let you save that', { scheme : 'negative'});
	            saving = false;
	        }      
	    });
	},
	
	validateLightningSave : function(auraDefinitionId, callback) {
		if(auraDefinitionId && auraDefinitionId.length) {
			ServerAction.query("SELECT Id, LastModifiedById, LastModifiedDate " +
				"FROM AuraDefinition WHERE Id = '" + auraDefinitionId + "'", function(callbackData) {
				
	        	var result = eval('(' + callbackData + ')');
	        	var isNew = false;
	        	var keyValidated = false;
	        	
	        	if(result && $.isArray(result) && result.length === 1) {
	        		result = result[0];
	        		
	        		isNew = false;
	        		keyValidated = lastSaveKey && 
	        		               lastSaveKey.length && 
	        		               lastSaveKey === result.Id + '-' + result.LastModifiedById + '-' + result.LastModifiedDate;
	        	} else {
	        		isNew = true;
	        	}
	        	
	        	callback(isNew, keyValidated);
			});
		} else {
			callback(true, false);
		}
	},
	
	/**
	 * @description Initializes anything related to lightning
	 **/
	initializeLightning : function() {
		if(aside && aside.files && aside.files.length) {
			var bundleNames = {};
			var autocompletes = [];
			var extIndex;
			
			for(var i = 0, end = aside.files.length; i < end; i++) {
				extIndex = aside.files[i].indexOf('.aura-');
				if(extIndex !== -1) {
					bundleNames[aside.files[i].substring(5, extIndex)] = true;
				}
			}
			
			for(var prop in bundleNames) {
				if(bundleNames.hasOwnProperty(prop)) {
					if(aside.org.namespace && aside.org.namespace.length) {
						autocompletes.push(prop.replace(aside.org.namespace + '.', ''));
					} else {
						autocompletes.push(prop);
					}
				}
			}
			
			$('#lightning-bundle-name').autocomplete({ 
				source : autocompletes
			});
		}
		
		$('#cancel-lightning-bundle, #lb-header .d3v-popup-close').unbind().click(function() {
			d3vPopups.closePopups();
			saving = false;
		});
		
		$('#save-lightning-bundle').unbind().click(d3vCode.createLightning);
	},
	
	
	/**
	 * @description Creates a new lightning resource and bundle if needed
	 **/
	createLightning : function() {
		var bundleName = $('#lightning-bundle-name').val();
		var silent = $('#save-lightning-bundle').attr('is-silent') === 'true';
		
		if(bundleName && bundleName.length) {
			if(d3vCode.validateFilename(bundleName) !== null) {
				if(!silent) {
					d3vUtil.alert('must enter a valid filename', { scheme : 'negative'});
				}
				
				return;
			}
			
			var defType = lastAction.replace('New Lightning ', '').toUpperCase();
			
			var sourceFormat = d3vCode.getAuraFormat(defType);
			var editorContents = editor.getSession().getValue();
			
	    	if(!silent) {
	        	d3vUtil.alert('saving ' + lastAction.toLowerCase().replace('new ', '') + '...', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }			
			
			d3vPopups.closePopups();
			
			ServerAction.createLightning(editorContents, 
			                             defType, 
			                             bundleName, 
			                             sourceFormat,
			                             function(callbackData) {
			                             
				d3vCode.finishLightningSave(editorContents, defType, true, callbackData);
			});		
		} else if(!silent) {
			d3vUtil.alert('save failed, name is required', { scheme : 'negative'});
		}
	},
	
	/**
	 * @description Saves lightning to server.
	 * @param       editorContents - contents to save as lightning resource
	 * @param       silent - do not show alerts during save
	 * @param       id - id of aura definition
	 **/
	saveLightning : function(editorContents, id, silent) {
		d3vCode.validateLightningSave(id, function(isNew, keyValidated) {
			if(isNew) {
				d3vPopups.showAnimatedModal('#lightning-bundler');	
				$('#save-lightning-bundle').attr('is-silent', '' + silent);			
			} else if(!isNew && keyValidated) {
				var auraType = d3vCode.getAuraType(d3vCode.getCurrentExtension()).type.toLowerCase();
				
		    	if(!silent) {
		        	d3vUtil.alert('saving lightning ' + auraType + '…', {showTime:ALERT_DISPLAY_TIME_LONG});
		        }
	        			
				ServerAction.updateLightning(editorContents, id, function(callbackData) {
					d3vCode.finishLightningSave(editorContents, auraType, isNew, callbackData);
				});
			} else if(!isNew && !keyValidated) {
				d3vCode.handleGenericSaveFailure();
			}
		});
	},	
	
	checkForFalsePageUpdates : function(pageRecord, editorContents, pageName, vfType, queryResultId) {
		var modifiedDate = new Date(pageRecord.LastModifiedDate);
		modifiedDate.setSeconds(modifiedDate.getSeconds() - 3); 

		ServerAction.query('SELECT Id FROM ApexComponent WHERE LastModifiedById = \'' + 
			aside.user.userId + '\' AND LastModifiedDate >= ' + modifiedDate.toISOString() + 
			' AND LastModifiedDate <= ' + pageRecord.LastModifiedDate, function(callbackData) {
		
	        var result = eval('(' + callbackData + ')');
	        if(result && result.length > 0) {
	        	d3vCode.upsertVisualforce(editorContents, pageName, vfType, queryResultId);     
	        } else {
	        	d3vCode.handleGenericSaveFailure();
	        }
		});
	},
	
	handleGenericSaveFailure : function() {
        d3vUtil.alert('save failed, your version is out of date', { scheme : 'negative'});
        
        var resolveType = $('input[name="resolve-conflicts"]:checked').val();
        //if(resolveType === 'auto-man' || resolveType === 'auto-off') {
        //	d3vSync.resolveConflict();
        if(resolveType === 'manual' || resolveType === 'auto-man') {
        	d3vSync.stageMerge();
        } else {
        	saving = false;
        }	
	},

	/**
	 * @description Whatever you told the typeahead to do last...this just does that again
	 **/
	redoLastAction : function() {
	    if(lastAction && confirm("Are you sure you want to '" + lastAction + "'?")) {
	        d3vUtil.alert("redoing: '" + lastAction + "'", {showTime:ALERT_DISPLAY_TIME_LONG});
	        d3vCode.codeSelectionAction(lastAction, true);
	        $('select#code-helper-input').val(lastAction).trigger('chosen:updated');
	    }            
	},

	/**
	 * @description Opens content in a new tab.
	 * @param       filename - determines what to open in new tab
	 **/
	openNewTab : function(filename) {
	    if(filename == "Go to Apex Developers Guide") {
	        window.open("http://www.salesforce.com/us/developer/docs/apexcode/index.htm", "_blank");
	    } else if(filename == "Go to Developer Forums") {
	        window.open("http://boards.developerforce.com/", "_blank");
	    } else if(filename == "Go to Salesforce Stack Exchange") {
	        window.open("http://salesforce.stackexchange.com/", "_blank");	        
	    } else if(filename == "Go to Visualforce Developers Guide") {
	        window.open("http://www.salesforce.com/us/developer/docs/pages/index.htm", "_blank");
	    } else {
	        d3vUtil.alert("command not found");
	    }
	},

	/**
	 * @description Handles creation of new files, so the ide has proper knowledge of them.
	 * @param       result    - new file query result
	 * @param       extension - file extension
	 * @param       zip - optional.  zip content when creating new zip file
	 **/	
	handleNewFile : function(result, extension, zip) {
		if(result.AuraDefinitionBundle) {
			currentFile = result.AuraDefinitionBundle.DeveloperName + extension.toLowerCase();
			currentFileNamespace = result.AuraDefinitionBundle.NamespacePrefix || null;
		} else {
			currentFile = (result.Name || result.DeveloperName) + extension.toLowerCase();
			currentFileNamespace = result.NamespacePrefix || null;
		}
			    
	    currentFileId = result.Id;
	    
	    if(zip && !currentZip && d3vUtil.isZipAdvanced(result.ContentType, zip)) {
	    	currentZip = new JSZip(zip, {base64: true});
	    	currentZippedFile = null;
			d3vCode.showZipMenu();	    	
	    }
	    
	    lastAction     = 'Open ' + d3vCode.getCompleteFilename();	    
        var $typeahead = $('select#code-helper-input');
        var namespaced = d3vCode.getNamespacedFilename();

	    if(aside && aside.files) {
	    	aside.files.push(lastAction);
	    }
        
        if(extension === '.resource') {
        	d3vCode.setApiVersion('resource type');
        	$('.foot-version').show();
        } else if(extension.indexOf('.aura-') !== -1) {
        	$('.foot-version').show();
        	d3vCode.setApiVersion(result.AuraDefinitionBundle.ApiVersion);        	
        } else if(extension !== '.xml' && extension !== '.theme') {
        	$('.foot-version').show();
        	d3vCode.setApiVersion(result.ApiVersion);
        }
        
        d3vUtil.setTabName();
        d3vCode.updateFooterCoverage();
        d3vCode.updateCodeList(lastAction, namespaced, $typeahead, extension);
        $typeahead.val(lastAction).trigger('chosen:updated');
   		d3vSync.sendAddFileRequest(lastAction, namespaced, extension);
   		
        var lowerExt = extension.toLowerCase();
        if(lowerExt === '__c.object') {
        	d3vCode.updateObjectSaveKey();
        }
	},
	
	/**
	 * @description Updates all chosen typeaheads with new file names
	 * @param       action     - the last action taken (e.g. 'Open ' + full file name)
	 * @param       namespaced - namespaced version of filename
	 * @param       $typeahead - the primary chosen typeahead
	 * @param       extension  - the new file's extension
	 **/
	updateCodeList : function(action, namespaced, $typeahead, extension) {
        d3vUtil.addOption(action, $typeahead, extension);
        $typeahead.trigger('chosen:updated');
        d3vCode.manageRecentFiles($typeahead, action);
        
        var lowerExt = extension.toLowerCase();
        if(lowerExt === '.cls') {
        	d3vTest.addToTestTypeahead(namespaced);
        }        
	},

	/**
	 * @description Registers a code update to the database
	 * @param       type - Class/Component/Trigger/Page
	 **/
	registerCodeUpdate : function(type) {
	    if(aside.org.installed) { //always false
		    ServerAction.registerCodeUpdate(d3vCode.getNamespacedFilename(), 
		                                    type, 
		                                    lastPushCode, 
		                                    function(callbackData) {});
	    }
	},

	/**
	 * @description Builds and returns the current file's filename include namespace and extension
	 * @return      filename including namespace and extension
	 **/
	getCompleteFilename : function() {
		var saveName = '';
		
		if(currentFile) {
			saveName = currentFile;
			
			if(currentFileNamespace) {
				saveName = currentFileNamespace + '.' + saveName;
			}
		}
		
		return saveName;
	},

	/**
	 * @description Builds and returns the current file's filename exclusing namespace and extension
	 * @return      filename without namespace or extension
	 **/
	getNonNamespacedFilename : function() {
		var saveName = d3vCode.getNamespacedFilename();
		
		var splitIndex = saveName.indexOf('.');
		if(saveName && splitIndex !== -1) {
			saveName = saveName.substring(splitIndex + 1, saveName.length);
		}
		
		return saveName;
	},
	
	/**
	 * @description Builds and returns the current file's filename include namespace excluding extension
	 * @return      filename including namespace
	 **/
	getNamespacedFilename : function() {
		var saveName = d3vCode.getCompleteFilename();
		
		if(saveName) {
			saveName = saveName.substring(0, saveName.lastIndexOf('.'));
		}
		
		return saveName;
	},

	/**
	 * @description Gets the extension of the current file
	 * @return      current file extension
	 **/
	getCurrentExtension : function() {
		var ext = '';
		if(currentFile) {
			ext = currentFile.substring(currentFile.lastIndexOf('.') + 1, currentFile.length);
		}
		
		return ext;
	},

	/**
	 * @description Creates a new static resource
	 **/
	createStaticResource : function() {
		var srName = prompt('What would you like to name the new static resource?');
		var validationResult = d3vCode.validateFilename(srName);
		
		if(srName && srName.length && validationResult === null) {
			var mimeType = currentZip ? 'application/zip' : 'text/' + editor.session.getMode().$id.split('/')[2];
			d3vUtil.alert('saving new static resource…', { showTime : ALERT_DISPLAY_TIME_LONG });
			d3vCode.performCreateResource(srName, mimeType, null, false);
		} else if(validationResult && validationResult.length) {
			d3vUtil.alert('illegal character in filename: ' + validationResult[0], { scheme : 'negative'});
			saving = false;
		} else {
			d3vUtil.alert('invalid filename', { scheme : 'negative'});
			saving = false;
		}	   
	},
	
	/**
	 * @description Validates a filename to make sure it meets salesforce's criteria
	 * @param       fn - the filename to validate
	 * @return      null when successful, the an array of illegal characters when failed
	 **/
	validateFilename : function(fn) {
		if(fn) {
			return fn.match(/__|\.|\s|\"|\'|\#|\(|\)|\/|\\|\:|\@|\!|\$|\%|\*/i);
		} else {
			return null;
		}
	},
	
	/**
	 * @description Resets a zip file to an unopen state
	 **/
	resetZip : function() {
	    currentZip           = null;
	    contentTypeSwitch    = null;
	    currentZippedFile    = null;
		d3vCode.hideZipMenu();		
	},
	
	/**
	 * @description Handles a user requested content switch
	 **/
	handleContentSwitch : function(contentType) {
		if(contentTypeSwitch) {
			contentType = contentTypeSwitch;
			contentTypeSwitch = null;
			
			if(!d3vUtil.isZip(contentType)) {
				d3vCode.resetZip();				
			}			
		}
		
		return contentType;
	},

	/**
	 * @description Saves the currently-being edited file to server.
	 * @param       refreshZipHandler - true to refresh the zip handler popup on successful save
	 **/
	updateStaticResource : function(refreshZipHandler) {
	    ServerAction.query("SELECT Id, LastModifiedById, LastModifiedDate, ContentType " +
	                       "FROM StaticResource WHERE Id = '" + currentFileId + "'", function(callbackData) {
	                        
	        var result      = eval('(' + callbackData + ')');
	        result          = result.length ? result[0] : result;
	        var newFile     = $.isArray(result) && result.length === 0;
			var contentType = d3vCode.handleContentSwitch(result.ContentType);
						
	        if(result && d3vCode.validateVisualforceKey(result)) {
	        	var content = editor.getSession().getValue();
	        	var skipEncoding = false;
	        	
				if(currentZip) {
					if(currentZippedFile && currentZip.files[currentZippedFile]) {
						currentZip.file(currentZippedFile, content);
					}
					
					content = currentZip.generate();
					skipEncoding = true;
				}
				
	            ServerAction.updateStaticResource(content, result.Id, contentType, skipEncoding, function(callbackData) {
	            	var result = eval('(' + callbackData + ')');
	            	var record = result[1];
	            	result     = result[0];
	            	
	            	if(result.updateResponse.result.success) {
	            		d3vUtil.alert('successfully updated resource', { scheme : 'positive'});
	            		$('#generic-overlay').hide();
	            		d3vCode.setSaveKey(record);
	            		d3vUtil.resetEditorChange();
	            		d3vCode.finishSave();
	            		
	            		if(refreshZipHandler) {
	            			d3vCode.setZipHandler();
	            		}
	            	} else {
			    		d3vUtil.alert('save failed', { scheme : 'negative'});
						d3vPopups.displayMessage('Static Resource Save Error', result.updateResponse.result.errors.message, result);     
	            	}
	            	
	            	saving = false;
	            });
	        } else {
	            d3vUtil.alert('cant save, your version is dirty', { scheme : 'negative'});
	            saving = false;
	        }      
	    });		
	},

	/**
	 * @description Saves the currently-being edited file to server.
	 **/
	saveFile : function() {
		if(!fileModified) {
			d3vUtil.alert('cannot save, no changes have been made to this file');
			saving = false;
		} else if(editor.getReadOnly()) {
			d3vUtil.alert('cannot save, editor is in read only mode');
			saving = false;			
		} else if(!saving) {
	        saving = true;
	        d3vCode.determineSaveType();
	    }
	    
	    return false;
	},
	
	/**
	 * @description Determines if a given filename is acceptable for the xml file
	 * @param       filename - name of file to verify
	 * @returns     true when filename is acceptable, false when it fails
	 **/
	validateXMLFilename : function(filename) {
		return filename && filename.length && filename.match(/[^\w]/g) === null
	},

	/**
	 * @description Determines if a given string is a package xml
	 * @param       xml - content to verify
	 * @returns     true when content is a package xml, false otherwise
	 **/	
	isPackageXML : function(xml) {
		return xml.indexOf('<?xml version="1.0" encoding="UTF-8"?>') === 0 && 
		       xml.indexOf('<Package') !== -1 &&
		       xml.indexOf('</Package>') !== -1;
	},

	/**
	 * @description Saves a package xml file to your local machine
	 * @param       filename - name of xml file being updated (optional -- only required for updates)
	 **/	
	savePackageXML : function(filename) {
		var filename = filename || prompt('Enter a name for this new package.xml file:');
		
		if(d3vCode.validateXMLFilename(filename)) {
			lastFile = editor.getSession().getValue();
			localStorage[PACKAGE_XML_FILE + aside.org.orgId + filename] = JSON.stringify({
				code : lastFile,
				time : new Date().toUTCString()
			});
			
			editor.getSession().setAnnotations([]);
			
			d3vCode.handleNewFile({
				Name : filename,
				NamespacePrefix : '',
				Id : null,
				ContentType : 'text/xml'
			}, '.xml');
			
			d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
			d3vUtil.alert('xml saved successfully', { scheme : 'positive'});
			d3vUtil.resetEditorChange();
			d3vCode.finishSave();
		} else {
			d3vUtil.alert('invalid filename', { scheme : 'negative'});
		}
		
		saving = false;
	},
	
	/**
	 * @description Saves a ui theme to your local machine
	 * @param       filename - name of ui file being updated (optional -- only required for updates)
	 **/	
	saveUITheme : function(filename) {
		var filename = filename || prompt('Enter a name for this UI theme:');
		
		if(d3vCode.validateXMLFilename(filename)) {
			lastFile = editor.getSession().getValue();
			
			localStorage[UI_THEME_FILE + filename] = JSON.stringify({
				code : lastFile,
				time : new Date().toUTCString()
			});
			
			editor.getSession().setAnnotations([]);
			
			d3vCode.handleNewFile({
				Name : filename,
				NamespacePrefix : '',
				Id : null,
				ContentType : 'text/css'
			}, '.theme');
			
			d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
			d3vUtil.alert('theme saved successfully', { scheme : 'positive'});
			d3vUtil.resetEditorChange();
			d3vCode.finishSave();	
			d3vCode.populateUIThemePicklist();
			
			if(filename === $('.aside-theme').val()) {
				d3vCode.applyStylesheet();
			}
		} else {
			d3vUtil.alert('invalid filename', { scheme : 'negative'});
		}
		
		saving = false;
	},	
	
	/**
	 * @description Adds the list of available ui themes to the selector.
	 **/		
	populateUIThemePicklist : function() {
		var options = '';
		var $bpx = $('select.aside-theme');
		var base = UI_THEME_FILE;
		var fn;
		var selected = $bpx.val();
		
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(base) === 0) {
				fn = prop.substring(base.length);
				options += '<option class="custom-item" value="' + fn + '">' + fn + '</option>';
			}
		}
		
		$bpx.find('.custom-item').remove();
		$bpx.append(options);
		
		if(selected && selected.length) {
			$bpx.val(selected);
		} else {
			$bpx.val(DEFAULT_STYLESHEET);
		}
	},	
	
	/**
	 * @description Returns the type of a file given its filename (including extension)
	 * @param       filename - name of file to get type of
	 * @return      type e.g. VisualforceComponent
	 **/
	extensionToType : function(filename) {
		filename = filename.toLowerCase();
		
		if(filename.indexOf('.cls') !== -1) {
			return 'ApexClass';
		} else if(filename.indexOf('.page') !== -1) {
			return 'ApexPage';
		} else if(filename.indexOf('.trigger') !== -1) {
			return 'ApexTrigger';
		} else if(filename.indexOf('.component') !== -1) {
			return 'ApexComponent';
		} else if(filename.indexOf('.resource') !== -1) {
			return 'StaticResource';
		} else if(filename.indexOf('.object') !== -1) {
			return 'sObject';
		} else if(filename.indexOf('.aura-') !== -1) {
			return 'AuraDefinitionBundle';
		}
		
		return '';
	},
	
	/**
	 * @description Changes the name of the current visualforce page, component, or static resource	 
	 **/
	changeCurrentFileName : function() {
		if(currentFileId && currentFileId.length) {
			var type = d3vCode.extensionToType(currentFile);
			var isLightning = type === 'AuraDefinitionBundle';
			
			if(type === "sObject") {
				d3vUtil.alert("objects can only be renamed from within salesforce", { scheme : 'negative'});
				return;
			} else if(type !== 'ApexPage' && type !== 'ApexComponent' && type !== 'StaticResource' && !isLightning) { 
				d3vUtil.alert("cannot change the name of apex classes or triggers", { scheme : 'negative'});
				return;			
			}
			
			var newFilename = prompt('What is the new name for ' + currentFile.split('.')[0] + '?');
			if(!newFilename) {
				d3vUtil.alert("rename cancelled", { scheme : 'negative'});
				return;
			}
			
			var updatedFile;
			
			if(isLightning && currentBundleId) {
			    updatedFile = {
			    	Id : currentBundleId, 
			    	MasterLabel : newFilename
			    };				
			} else {
			    updatedFile = {
			    	Id : currentFileId,
			    	Name : newFilename
			    };			
			}
		
			ServerAction.updateRecords(updatedFile, type, function(callbackData) {
				var result = eval('(' + callbackData + ')');
				
		        if(result.updateResponse.result.success === "true" || result.updateResponse.result.success === true) {
		        	if(isLightning) {
		        		d3vUtil.alert("label successfully updated (DeveloperName unchanged)", { scheme : 'positive'});
		        	} else {
			            d3vUtil.alert("filename successfully updated", { scheme : 'positive'});
			            d3vCode.handleFilenameChange(newFilename);		        	
		        	}
		        } else {
		            d3vUtil.alert("update failed", { scheme : 'negative'});
		            
		            if(isLightning) {
		            	d3vCode.displayGenericErrors(result.updateResponse.result.errors.message, result, 'Lightning Save Error'); 
		            } else {
		            	d3vCode.displayVisualforceErrors(result.updateResponse.result.errors.message, result);
		            }
		        }					
			});		
		} else {
			d3vUtil.alert("open a file before trying to change its name");
		}
	},
	
	/**
	 * @description Handles the changing of a filename, cleaning up typeaheads and globals
	 * @param       newFilename - new file name
	 **/
	handleFilenameChange : function(newFilename) {
        var ext = currentFile.split('.')[1];
        currentFile = newFilename + '.' + ext;
        var lightningFilesToUpdate = d3vCode.removeLastActionFromTypeahead();
        var currentTypeaheadIndex = aside.files.indexOf(lastAction);
        if(currentTypeaheadIndex !== -1) {
        	aside.files.splice(currentTypeaheadIndex, 1);
        }
        
        lastAction = 'Open ' + d3vCode.getCompleteFilename();	 
        aside.files.push(lastAction);
        var $typeahead = $('select#code-helper-input');
        var namespaced = d3vCode.getNamespacedFilename();
		d3vCode.updateCodeList(lastAction, namespaced, $typeahead, ext);
		$typeahead.val(lastAction).trigger('chosen:updated');
		d3vSync.sendAddFileRequest(lastAction, namespaced, ext);
	},

	/**
	 * @description Saves a class to server.
	 * @param       editorContents - apex to save
	 * @param       isNew - true if this is a new false, false if not
	 * @param       apexType - class or trigger
	 * @param       (optional) version - new version number
	 **/
	saveApex : function(editorContents, isNew, apexType, version) {
		if(foreignManaged) {
			d3vUtil.alert('cannot update managed apex', { scheme : 'negative'});
			saving = false;
			editor.getSession().setAnnotations([]);
			return;
		}
		
		var fnValidated = d3vCode.validateApexFilename();
		var fnChanged = false;
		
		if(!fnValidated && !isNew && confirm('Are you sure you want to change the filename?')) {
			fnChanged = true;
		} else if(!fnValidated) {
			var errorType = isNew ? 'this file name is already in use' : 'cannot change file name';
			d3vUtil.alert(errorType, { scheme : 'negative'});
			saving = false;
			editor.getSession().setAnnotations([]);
			return;			
		}
		
		var parsedFilename = d3vCode.parseCurrentFilename();
		var saveName = d3vCode.getNamespacedFilename();
		if(!saveName) {
			saveName = 'A!NEW!FILE';
		}
		
	    ServerAction.saveApex(version ? '' : editorContents, 
	                          d3vUtil.capitalizeString(apexType), 
	                          isNew ? 'A!NEW!FILE' : saveName, 
	                          lastSaveKey,
	                          version || -1,
	                          currentFileId || '',
	                          parsedFilename || '',
	                          fnChanged,
	                          function(saveApexResult) {
	                          
	        saving = false;
	        var result = eval('(' + saveApexResult.replace(/\n/gi, '').replace(' \'"\'"', ': (\')"') + ')');
	        editor.getSession().setAnnotations([]); //remove any marked compiler errors
	        
	        if(result.success == "true") {
	            if(version) {
	                d3vUtil.alert('version updated successfully', { scheme : 'positive'});  
	                d3vCode.setApiVersion(version + '.0');  
	            } else {
	                d3vUtil.alert('no errors, save successful', { scheme : 'positive'});
	            }
	            
	            lastFile = editorContents;
	            d3vPopups.closeErrorPopups(CODE_SECTION);
				
				var extType = apexType === 'class' ? '.cls' : '.trigger';
                if(isNew) {
                    d3vCode.handleNewFile(result, extType);
                } else if(fnChanged) {
              		d3vCode.handleApexNameChange(result, extType);
                }
	            
	            d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
	            d3vCode.setSaveKey(result);
	            d3vCode.registerCodeUpdate(d3vUtil.capitalizeString(apexType));
	            d3vUtil.resetEditorChange();
	            d3vCode.setVariableMap();
	            d3vCode.finishSave();
	        } else {
	            d3vUtil.alert('save failed', { scheme : 'negative'});
	            
	            if(d3vCode.hasMergeConflict(result)) {
	            	var resolveType = $('input[name="resolve-conflicts"]:checked').val();
	            	if(resolveType === 'auto-man' || resolveType === 'auto-off') {
	            		d3vSync.resolveConflict();
	            	} else if(resolveType === 'manual') {
	            		d3vSync.stageMerge();
	            	} else {
	            		saving = false;
	            		d3vCode.displayAdvancedErrors(result, false, result);
	            	}
	            } else {
	            	d3vCode.displayAdvancedErrors(result, false, result);
	            }
	        }
	    });
	},
	
	/**
	 * @description Updates the typeahead when the name of the apex class is changed
	 * @param       result - new file query result
	 * @param       ext    - file extension
	 **/
	handleApexNameChange : function(result, ext) {
		d3vCode.removeLastActionFromTypeahead();
		
	    currentFile    = (result.Name || result.DeveloperName) + ext.toLowerCase();
	    currentFileId  = result.Id;
	    lastAction     = 'Open ' + d3vCode.getCompleteFilename();
        var $typeahead = $('select#code-helper-input');
        var namespaced = d3vCode.getNamespacedFilename();

        var currentTypeaheadIndex = aside.files.indexOf(lastAction);
        if(currentTypeaheadIndex !== -1) {
        	aside.files.splice(currentTypeaheadIndex, 1);
        }
        
        aside.files.push(lastAction);
        d3vCode.updateCodeList(lastAction, namespaced, $typeahead, ext);
        $typeahead.val(lastAction).trigger('chosen:updated'); 
        d3vSync.sendAddFileRequest(lastAction, namespaced, ext); 
	},
	
	/** 
	 * @description Determines is a save encountered a merge conflict
	 * @param       result - save result
	 * @return      true when there was a merge conflict, false when there was not
	 **/
	hasMergeConflict : function(result) {
		if(!$.isArray(result)) {
			result = [result];
		}

	    for(var i = 0, endI = result.length; i < endI; i++) {
	    	if(result[i].name === 'CONFLICT_DURING_SAVE') {
	    		return true;
	    	}
	    }
	    
	    return false;
	},
	
	/**
	 * @description Jumps the cursor to the position in the code an error refers to
	 **/
	jumpToErrorMessageLine : function() {
    	var line = parseInt($(this).attr('line') || 0);
    	
    	if(line === -1) {
    		d3vUtil.alert('cannot jump to error, line unknown');
    	} else {
    		editor.gotoLine(line);
    	}	
	},
	
	/**
	 * @description Builds out the save error dialog shown in the global panel
	 * @param       $errorPopup - target to add the generated markup to
	 * @param       line        - line number error occured on
	 * @param       errorMsg    - full error message displayed to user
	 * @param       rawResult   - complete error returned from API
	 * @param       problem     - base error message, unmodified
	 * @param       renderErrorAsHTML - renders the error message as html instead of text
	 **/
	buildErrorDialogMarkup : function($errorPopup, line, errorMsg, rawResult, problem, renderErrorAsHTML) {
        var $errorLink = $('<span class="compiler-error no-jump" line="' + line + '">' + (renderErrorAsHTML ? errorMsg : d3vUtil.escapeTags(errorMsg)) + '</span>');
        var $sfseIt    = $('<span class="button gp-btn full-width" error="' + encodeURIComponent(problem) + '">Search on SFSE</span>');
        var $googleIt  = $('<span class="button gp-btn full-width" error="salesforce ' + encodeURIComponent(problem) + '">Google the Error</span>');
        var $jumpToIt  = $('<span class="button gp-btn full-width" line="' + line + '">Jump to Error</span>');
        var $toggleResultTypes = $('<span class="button gp-btn full-width">Show API Response</span>');
        var $btnContainer = $('<div class="gen-btn-container" />');       
        
        if(line !== -1) {
        	$btnContainer.append($jumpToIt);
        	$errorLink.removeClass('no-jump'); 
        	$errorLink.click(d3vCode.jumpToErrorMessageLine);
        	$jumpToIt.click(d3vCode.jumpToErrorMessageLine);
        }
        
        $btnContainer.append($toggleResultTypes).append($googleIt).append($sfseIt);  
        
        $googleIt.click(function() {
        	window.open("https://www.google.com/#q=" + $(this).attr('error'), "_blank");
        });
        
        $sfseIt.click(function() {
        	window.open("http://salesforce.stackexchange.com/search?q=" + $(this).attr('error'), "_blank");
        });
        
        $toggleResultTypes.click(function() {
        	var $ce = $('.compiler-error');
        	
        	if($ce.is(':visible')) {
	        	$ce.hide();
	        	$('.raw-result').show();	 
	        	$(this).text('Show Error Message');       	
        	} else {
        		$('.raw-result').hide();
	        	$ce.show();	
	        	$(this).text('Show API Response');
        	}
        });
        
        $errorPopup.empty();
        $errorPopup.append($errorLink);
        
        if(rawResult) {
	        var $rawResult = $('<span class="raw-result hidden" line="' + line + '"><pre id="rr-json">' + JSON.stringify(rawResult, null, 2) + '</pre></span>');
	        $rawResult.hide();     
	        $errorPopup.append($rawResult);   
        }
        
        $errorPopup.append($btnContainer);
	},	

	/**
	 * @description Displays errors to the user in an advanced error popup
	 * @param       result - errors
	 * @param       forObjects - true if this error message is result of an object save
	 * @param       rawResult  - complete result object
	 **/
	displayAdvancedErrors : function(result, forObjects, rawResult) {
		if(!$.isArray(result)) {
			result = [result];
		}
		
	    var $errorPopup = $('div#code-errors-list');
	    $errorPopup.empty();
	    var annos = [];
	    var errorMsg;
	    for(var i = 0, endI = result.length; i < endI; i++) {
	    	if(result[i].line) {
	    		if(forObjects) {
		        	errorMsg = 'line ' + result[i].lineNumber +  '. ' + result[i].problem;
		        	result[i].column = 1;
		        	result[i].line = parseInt(result[i].lineNumber);	    		
	    		} else {
	    			errorMsg = 'line ' + result[i].line + ', col ' + result[i].column + '. ' + result[i].problem;
	    		}
	        } else {
	        	errorMsg = result[i].problem;
	        	result[i].line = 1;
	        	result[i].column = 1;
	        }
	        
	        annos.push({ 
	          row: parseInt(result[i].line)-1, 
	          column: parseInt(result[i].column), 
	          text: errorMsg,
	          type: "error" // also warning and information 
	        });  	        
	        
	        d3vCode.buildErrorDialogMarkup($errorPopup, result[i].line, errorMsg, rawResult, result[i].problem);
	    }
	
	    editor.getSession().setAnnotations(annos);
	    
	    var saveMessage = forObjects ? 'sObject Save Error' : 'Apex Save Error';  
	    d3vPopups.showGlobalPanel(saveMessage, '#code-errors-list', CODE_SECTION);      
	},

	/**
	 * @descrition Determines how to handle file saving.
	 * @param      silent - true if this function should not throw alerts
	 **/
	determineSaveType : function(silent) {
	    var editorContents = editor.getSession().getValue();
	    
	    if(lastAction == "New Apex Class" || lastAction == "New Test Class") {
	    	if(!silent) {
	        	d3vUtil.alert('saving new class…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }
	        
	        d3vCode.saveApex(editorContents, true, 'class');
	    } else if(lastAction == "New Trigger") {
	    	if(!silent) {
	        	d3vUtil.alert('saving new trigger…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }
	        
	        d3vCode.saveApex(editorContents, true, 'trigger');                
	    } else if(lastAction == "New Visualforce Page") {
	    	//this has to be on a timeout to prevent default browser behavior from occuring on save
	    	setTimeout(function() {
		        var vfName = prompt('Enter a name for this new visualforce page:');
		        if(vfName) {
		        	if(!silent) {
		        		d3vUtil.alert('saving new page…', {showTime:ALERT_DISPLAY_TIME_LONG});
		        	}
		        	
		        	d3vCode.saveVisualforce(editorContents, vfName, 'Page');
		        } else {
		        	if(!silent) {
		        		d3vUtil.alert('save canceled');
		        	}
		        	
		        	saving = false;
		        } 	
	    	}, 200);
	    } else if(lastAction == "New Visualforce Component") {
	    	//this has to be on a timeout to prevent default browser behavior from occuring on save
	    	setTimeout(function() {
		        var vfName = prompt('Enter a name for this new visualforce component:');
		        if(vfName) {
		        	if(!silent) {
		        		d3vUtil.alert('saving new component…', {showTime:ALERT_DISPLAY_TIME_LONG});
		        	}
		        	
		        	d3vCode.saveVisualforce(editorContents, vfName, 'Component');
		        } else {
		        	if(!silent) {
		        		d3vUtil.alert('save canceled');
		        	}
		        	
		        	saving = false;
		        } 
	    	}, 200);	        
	    } else if(lastAction == "Execute Anonymous") {
	    	if(!silent) {
	        	d3vUtil.alert('executing…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }
	        
	        d3vCode.executeAnon(editorContents);
	    } else if(lastAction == "New Static Resource") {
	    	setTimeout(function() {
	    		d3vCode.createStaticResource();
	    	}, 200);
	    } else if(lastAction == "New Custom Object") {
	    	setTimeout(function() {
	    		d3vCode.saveCustomObject();
	    	}, 200);
	    } else if(lastAction == "New Package XML") {
	    	if(!silent) {
	        	d3vUtil.alert('saving package xml…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }
	        	    
	    	setTimeout(function() {
	    		d3vCode.savePackageXML();
	    	}, 200);
	    } else if(lastAction == "New UI Theme") {
	    	if(!silent) {
	        	d3vUtil.alert('saving ui theme…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        }
	        	    
	    	setTimeout(function() {
	    		d3vCode.saveUITheme();
	    	}, 200);	    	
	    } else if(lastAction.indexOf('New Lightning ') !== -1) {	        	    
	    	setTimeout(function() {
	    		d3vCode.saveLightning(editorContents, null, silent ? true : false);
	    	}, 200);		    
	    } else if(currentFile) {
	        var filename = d3vCode.getNonNamespacedFilename();
	        var ext      = d3vCode.getCurrentExtension();
	            
	        if(ext == 'cls') {
	        	if(!silent) {
	            	d3vUtil.alert('saving class…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveApex(editorContents, false, 'class');
	        } else if(ext == 'trigger') {
	        	if(!silent) {
	            	d3vUtil.alert('saving trigger…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveApex(editorContents, false, 'trigger');                    
	        } else if(ext == 'page') {
	        	if(!silent) {
	            	d3vUtil.alert('saving page…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveVisualforce(editorContents, filename, 'Page');
	        } else if(ext == 'component') {
	        	if(!silent) {
	            	d3vUtil.alert('saving component…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveVisualforce(editorContents, filename, 'Component');
	        } else if(ext == 'resource') {
	        	if(!silent) {
	        		d3vUtil.alert('updating static resource…', {showTime:ALERT_DISPLAY_TIME_LONG});
	        	}
	        	
	        	d3vCode.updateStaticResource(false);
	        } else if(ext == 'object') {
	        	d3vCode.saveCustomObject();
	        } else if(ext == 'xml') {
	        	if(!silent) {
	            	d3vUtil.alert('saving xml…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.savePackageXML(filename);     	
	        } else if(ext == 'theme') {
	        	if(!silent) {
	            	d3vUtil.alert('saving theme…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveUITheme(filename); 	        
	        } else if(ext.indexOf('aura-') !== -1) {
	        	if(!silent) {
	        		var auraInfo = d3vCode.getAuraType(ext);
	            	d3vUtil.alert('saving lightning ' + auraInfo.type + '…', {showTime:ALERT_DISPLAY_TIME_LONG});
	            }
	            
	            d3vCode.saveLightning(editorContents, currentFileId, true);        	
	        }
	    }
	},
	
	/**
	 * @description Loads all code editor style settings
	 **/
	loadAllSettings : function(skipStylesheetLoad) {
		if(!skipStylesheetLoad) {
			d3vCode.loadStylesheet();
		}
	    
	    d3vCode.loadTheme();
	    d3vCode.loadKeyBindings();
	    d3vCode.loadTabSettings();
	    d3vCode.loadActiveLineHighlight();
	    d3vCode.loadAutoAutocomplete();
	    d3vCode.loadScrollPastEnd();
	    d3vCode.loadEnableMultiCursor();
	    d3vCode.loadActiveWordHighlight();
	    d3vCode.loadShowFooter();
	    d3vCode.loadFontSize();
	    d3vCode.loadShowInvisibles();
	    d3vCode.loadShowIndentationGuide();
	    d3vCode.loadShowPrintMargin();
	    d3vCode.loadPrintMarginColumns();
	    d3vCode.loadBeautifyLineWrap();
	    d3vCode.loadSliderValues();
	    d3vCode.loadSettingSync();
	    d3vCode.loadSwitchMethod();
	    d3vCode.loadAutoResolve();
	    d3vCode.loadDiffEditorVisibility();
	    d3vCode.loadOpenPreferences();
	    d3vCode.loadLogLevels();
	    d3vCode.loadFindPreferences();
	},	

	/**
	 * @description Loads the users auto conflict resolve preference (default: true)
	 **/
	loadAutoResolve : function() {
		var preference = localStorage[COOKIE_PRE + AUTO_RESOLVE_CONFLICT];
		
		if(preference && preference.length) {
			$('input[name="resolve-conflicts"][value="' + preference + '"]').attr('checked', 'checked');
		} else {
			$('input[name="resolve-conflicts"][value="off"]').attr('checked', 'checked');
		} 
	},
	
	/**
	 * @description Updates the users tab list sync preferences
	 **/
	changeAutoResolve : function() {
		localStorage[COOKIE_PRE + AUTO_RESOLVE_CONFLICT] = $('input[name="resolve-conflicts"]:checked').val();
	},	

	/**
	 * @description Loads the users setting sync preferences (default: true)
	 **/
	loadSettingSync : function() {
		var preference = localStorage[COOKIE_PRE + SETTING_SYNC_PREFERENCE];
		
		if(preference && preference.length) {
			$('input#synchronize-settings').prop('checked', preference === 'true');
		} else {
			$('input#synchronize-settings').prop('checked', true);
		} 	
	},	
	
	/**
	 * @description Updates the users setting sync preferences
	 **/
	changeSettingSync : function() {
		localStorage[COOKIE_PRE + SETTING_SYNC_PREFERENCE] = $('input#synchronize-settings').is(':checked') ? 'true' : 'false';
	},		
				
	/**
	 * @description Loads the users switch method (alert / title change) preference (default: alert)
	 **/
	loadSwitchMethod : function() {
		var preference = localStorage[COOKIE_PRE + SWITCH_METHOD_PREFERENCE];
		
		if(preference && preference.length) {
			$('select#synchronize-switch').val(preference);
		} else {
			$('select#synchronize-switch').val('alert');
		} 		
	},	
	
	/**
	 * @description Updates the users switch method (alert / title change) preference
	 **/
	changeSwitchMethod : function() {
		localStorage[COOKIE_PRE + SWITCH_METHOD_PREFERENCE] = $('select#synchronize-switch').val();
	},			
	
	/**
     * @description Loads the users soft tab & tab size settings
     **/
	loadTabSettings : function() {
		var useSoftTabs = localStorage[COOKIE_PRE + COOKIE_SAVE_SOFT_TAB];
		var tabSize     = localStorage[COOKIE_PRE + COOKIE_SAVE_TAB_SIZE];
		
		if(useSoftTabs) {
			useSoftTabs = useSoftTabs === "true";
			$('input#soft-tabs').attr('checked', useSoftTabs);
			editor.getSession().setUseSoftTabs(useSoftTabs);
			rightEditor.getSession().setUseSoftTabs(useSoftTabs);		
		}
		
		if(tabSize) {
			$('input#tab-size').val(tabSize);
			editor.getSession().setTabSize(parseInt(tabSize));
			rightEditor.getSession().setTabSize(parseInt(tabSize));
		}
	},

	/**
	 * @description Changes the tab size setting and saves the preference in a cookie
	 **/
	changeTabSize : function() {
		var tabSize = $('input#tab-size').val();
		
		if(!tabSize || !d3vUtil.isNumber(tabSize) || parseInt(tabSize) < 1) {
			tabSize = 1;
		}
		
		localStorage[COOKIE_PRE + COOKIE_SAVE_TAB_SIZE] = tabSize;
		editor.getSession().setTabSize(tabSize);
		rightEditor.getSession().setTabSize(tabSize);
	},
	
	/**
	 * @description Changes the code load filter setting.
	 **/
	changeCodeFilter : function() {
		var filter = $('select#onload-filter').val();
		
		if(filter === 'both' || filter === 'upkg' || filter === 'pkgd' || filter === 'none') {
			localStorage[COOKIE_PRE + aside.org.orgId + NAMESPACE_FILTER] = filter;
		} else {
			filter = parseInt(filter);
			d3vArchive.readAll(TABLE_PUSH_FILTERS, function(val) {
				if(filter === val.id) {
					var serverFilter = d3vPush.prepareFilterForLoad(val);
					serverFilter.id = filter;
					localStorage[COOKIE_PRE + aside.org.orgId + NAMESPACE_FILTER] = JSON.stringify(serverFilter);
				}
			}, function() {});			
		}
	},	
	
	/**
	 * @description Loads the code load filter setting.
	 **/
	loadCodeFilter : function() {
		var filter = localStorage[COOKIE_PRE + aside.org.orgId + NAMESPACE_FILTER] || 'both';
		
		if(filter === 'both' || filter === 'upkg' || filter === 'pkgd' || filter === 'none') {
			$('select#onload-filter').val(filter);
		} else if(filter && filter.length) {
			filter = JSON.parse(filter);
			$('select#onload-filter').val(filter.id);		
		}
	},
	
	/**
	 * @description Generates and downloads a WSDL for the current Apex class
	 **/
	generateWSDL : function() {
		var fn = currentFile;
		
		if(!fn || !fn.length || (fn && fn.length && fn.indexOf('.cls') === -1)) {
			d3vUtil.alert('cannot generate wsdl', { scheme : 'negative' });
			return;
		}
		
		d3vUtil.alert('generating wsdl...');
		
		var fnSplit = fn.split('.');
		var url = '/services/wsdl/class/';
		
		if(currentFileNamespace && currentFileNamespace.length) {
			url += currentFileNamespace + '/';
		}
		
		url += fnSplit[0];
		
		url = d3vUtil.getFrontdoorURL(url);
		window.open(url, '_blank');
		d3vUtil.alert('wsdl generated successfully', { scheme : 'positive' });
	},

	/**
	 * @description Sets the value of the scroll speed, based on the value selected in help
	 **/	
	setScrollSpeed : function() {
		var scrollSpeed = parseInt($('input#code-scroll-speed').val()) / 100;
		editor.setScrollSpeed(scrollSpeed);
		rightEditor.setScrollSpeed(scrollSpeed);
	},
	
	/**
	 * @description Saves the value of a slider
	 * @param		$that - element which triggered this function
	 **/
	saveSliderValue : function($that) {
		localStorage[COOKIE_PRE + $that.attr('save-as')] = $that.val();
	},
	
	/**
	 * @description Loads all stores slider values
	 **/
	loadSliderValues : function() {
		$('input.range-slider').each(function(idx, ele) {
			var $ele = $(ele);
			var pairWith  = $ele.attr('pair-with');
			var sliderVal = parseInt(localStorage[COOKIE_PRE + $ele.attr('save-as')]) || $(ele).val() || DEF_CODE_HISTORY_LENGTH;
			$('span.range-viewer[pair-with="' + $ele.attr('pair-with') + '"]').text(sliderVal);
			$ele.val(sliderVal);
		});
	},	
	
	/**
	 * @description Changes the soft tab setting and saves the preference in a cookie
	 **/
	changeSoftTabs : function() {
		var useSoftTabs = $('input#soft-tabs').attr('checked');
		if(useSoftTabs) {
			editor.getSession().setUseSoftTabs(true);
			rightEditor.getSession().setUseSoftTabs(true);
			localStorage[COOKIE_PRE + COOKIE_SAVE_SOFT_TAB] = "true";
		} else {
			editor.getSession().setUseSoftTabs(false);
			rightEditor.getSession().setUseSoftTabs(false);
			localStorage[COOKIE_PRE + COOKIE_SAVE_SOFT_TAB] = "false";
		}
	},

	/**
	 * @description Loads and sets the log level preferences
	 **/
	loadLogLevels : function() {
		var logLevels = localStorage[COOKIE_PRE + COOKIE_LOGGING_LEVELS];
		
		if(logLevels && logLevels.length) {
			var levels = logLevels.split(',');
			
			for(var i = 0, end = LOG_LEVELS.length; i < end; i++) {
				$('#' + LOG_LEVELS_PREFIX + LOG_LEVELS[i]).val(levels[i]);
			}
		} else {
			$('.debug-option').val(LOG_LEVEL_DEFAULT);
		}
	},
	
	/**
	 * @description Loads the users find preferences (regex, wrap, whole word, case sensitive)
	 **/
	loadFindPreferences : function() {
		var findPreferences = localStorage[COOKIE_PRE + FIND_PREFERENCES];
		
		if(findPreferences && findPreferences.length) {
			findPreferences = JSON.parse(findPreferences);
		} else {
			findPreferences = {
				wrap : true,
				case : false,
				regex : false,
				whole : false
			};
		}
	
		$('#find-with-wrap').prop('checked', findPreferences.wrap);
		$('#find-case-sensitive').prop('checked', findPreferences.case);
		$('#find-by-regex').prop('checked', findPreferences.regex);
		$('#find-by-whole').prop('checked', findPreferences.whole);	
	},

	/**
	 * @description Handles changing of any of the users find preferences (regex, wrap, whole word, case sensitive)
	 **/	
	changeFindPreferences : function() {
		localStorage[COOKIE_PRE + FIND_PREFERENCES] = JSON.stringify({
			wrap : $('#find-with-wrap').is(':checked'),
			case : $('#find-case-sensitive').is(':checked'),
			regex : $('#find-by-regex').is(':checked'),
			whole : $('#find-by-whole').is(':checked')
		});
	},

	/**
	 * @description Saves users log levels preferences when they change them
	 **/
	changeLogLevels : function() {
	   localStorage[COOKIE_PRE + COOKIE_LOGGING_LEVELS] = d3vUtil.getLogOptionsString();
	},
	
	/**
	 * @description Loads and sets the last selected theme
	 **/
	loadTheme : function() {
		var lastTheme  = localStorage[COOKIE_PRE + COOKIE_SAVE_THEME];
		
		if(!lastTheme) {
			lastTheme = 'ace/theme/eclipse';
		}
		
		rightEditor.setTheme(lastTheme);
		editor.setTheme(lastTheme);
		$('select#ace-theme').val(lastTheme);
	},
	
	/**
	 * @description Loads and sets the last selected key bindings
	 **/
	loadKeyBindings : function() {
		var lastBindings = localStorage[COOKIE_PRE + COOKIE_SAVE_BINDINGS];
		
		if(!lastBindings) {
			lastBindings = null;
		}
		
		rightEditor.setKeyboardHandler(lastBindings);
		editor.setKeyboardHandler(lastBindings);
		$('select#ace-keyboard').val(lastBindings);
	},	
	
	/**
	 * @description Loads and sets the last selected stylesheet
	 **/
	loadStylesheet : function() {
		var lastTheme = localStorage[COOKIE_PRE + COOKIE_SAVE_STYLESHEET];
		
		if(!lastTheme) {
			lastTheme = '/css/d3v.css';
		}
		
		$('select.aside-theme').val(lastTheme);
		d3vCode.applyStylesheet();
	},	

	/**
	 * @description Change theme of ace editor
	 **/
	changeStylesheet : function() {
	    var chosenTheme = $(this).val();
	    $('select.aside-theme').val(chosenTheme);
	    localStorage[COOKIE_PRE + COOKIE_SAVE_STYLESHEET] = chosenTheme;

	    d3vCode.applyStylesheet(); 
	},

	/**
	 * @description Change theme of ace editor
	 **/
	changeTheme : function() {
	    var chosenTheme = $('select#ace-theme').val();
	    localStorage[COOKIE_PRE + COOKIE_SAVE_THEME] = chosenTheme;
	    editor.setTheme(chosenTheme);
	    rightEditor.setTheme(chosenTheme);    
	},
	
	/**
	 * @description Change key bindings used by ace editor
	 **/
	changeKeyBindings : function() {
	    var chosenBindings = $('select#ace-keyboard').val();
	    localStorage[COOKIE_PRE + COOKIE_SAVE_BINDINGS] = chosenBindings;
	    
	    if(chosenBindings && chosenBindings.length) {
	    	editor.setKeyboardHandler(chosenBindings);
	    	rightEditor.setKeyboardHandler(chosenBindings); 	    
	    } else {
	    	editor.setKeyboardHandler(null);
	    	rightEditor.setKeyboardHandler(null); 
	    }
	},
		
	
	/**
	 * @description Loads and sets the debug log and local file history open preference
	 **/
	loadOpenPreferences : function() {
		var debugPreference = localStorage[COOKIE_PRE + COOKIE_DEBUG_OPEN_PREF];
		var lhPreference = localStorage[COOKIE_PRE + COOKIE_LOCAL_OPEN_PREF];
		var faPreference = localStorage[COOKIE_PRE + FIND_ALL_PREFERENCE];
		var relatedPreference = localStorage[COOKIE_PRE + RELATED_PREFERENCE];
		
		if(!debugPreference) {
			debugPreference = OPEN_PREF_DEFAULT;
		}
		
		if(!lhPreference) {
			lhPreference = OPEN_PREF_DEFAULT;
		}
		
		if(!faPreference) {
			faPreference = FIND_ALL_PREF_DEFAULT;
		}
		
		if(!relatedPreference) {
			relatedPreference = RELATED_PREF_DEFAULT;
		}
		
		$('select#debug-open-select').val(debugPreference);
		$('select#lh-open-select').val(lhPreference);
		$('select#ocs-open-select').val(faPreference);
		$('select#related-open-select').val(relatedPreference);
	},

	/**
	 * @description Change debug log and local file history open preference
	 **/
	changeOpenPreferences : function() {
	    var debugPreference = $('select#debug-open-select').val();
	    localStorage[COOKIE_PRE + COOKIE_DEBUG_OPEN_PREF] = debugPreference;
	    
	    var lhPreference = $('select#lh-open-select').val();
	    localStorage[COOKIE_PRE + COOKIE_LOCAL_OPEN_PREF] = lhPreference;
	    
	    var faPreference = $('select#ocs-open-select').val();
	    localStorage[COOKIE_PRE + FIND_ALL_PREFERENCE] = faPreference;	 
	    
	    var relatedPreference = $('select#related-open-select').val();
	    localStorage[COOKIE_PRE + RELATED_PREFERENCE] = relatedPreference;	 
	},	
	
	/**
	 * @description Enables / disables the active line highlight
	 **/
	changeHighlightActiveLine : function() {
		if($('input#highlight-active-line').attr('checked')) {
			editor.setHighlightActiveLine(true);
			rightEditor.setHighlightActiveLine(true);
			localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_LINE] = 'true';
		} else {
			editor.setHighlightActiveLine(false);
			rightEditor.setHighlightActiveLine(true);
			localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_LINE] = 'false';
		}
	},

	/**
	 * @description Enables / disables the active word highlight
	 **/	
	changeHighlightActiveWord : function() {
		if($('input#highlight-active-word').attr('checked')) {
			editor.setHighlightSelectedWord(true);
			rightEditor.setHighlightSelectedWord(true);
			localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_WORD] = 'true';
		} else {
			editor.setHighlightSelectedWord(false);
			rightEditor.setHighlightSelectedWord(false);
			localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_WORD] = 'false';
		}
	},
	
	/**
	 * @description Enables / disabled the code footer
	 **/
	changeShowFooter : function() {
		var showFooter = $('input#show-footer').is(':checked');
		localStorage[COOKIE_PRE + SHOW_FOOTER] = '' + showFooter;
		d3vCode.toggleShowFooter(showFooter);
	},
	
	/**
	 * @description Show or hide the code footer
	 * @param       show - true to show, false to hide
	 **/
	toggleShowFooter : function(show) {
		if(show) {
			$('div#code-footer').show();
		} else {
			$('div#code-footer').hide();
		}
		
		d3vUtil.resizeWindow();
	},

	/**
	 * @description Changes the number of columns that the print margin is displayed at
	 **/		
	changePrintMarginColumns : function() {
		var printMarginColumns = $('input#pm-size').val();
		
		if(!printMarginColumns || !d3vUtil.isNumber(printMarginColumns) || parseInt(printMarginColumns) < 1) {
			printMarginColumns = 1;
		}
		
		localStorage[COOKIE_PRE + COOKIE_SAVE_PM_SIZE] = printMarginColumns;
		editor.setPrintMarginColumn(printMarginColumns);
		rightEditor.setPrintMarginColumn(parseInt(printMarginColumns));		
	},

	/**
	 * @description Loads the number of columns that the print margin is displayed at
	 **/		
	loadPrintMarginColumns : function() {
		var printMarginColumns = localStorage[COOKIE_PRE + COOKIE_SAVE_PM_SIZE];
	
		if(printMarginColumns) {
			$('input#pm-size').val(printMarginColumns);
			editor.setPrintMarginColumn(parseInt(printMarginColumns));
			rightEditor.setPrintMarginColumn(parseInt(printMarginColumns));		
		}	
	},
	
	/**
	 * @description Changes the number of columns that beautify uses to line wrap at
	 **/		
	changeBeautifyLineWrap : function() {
		var wrapCols = $('input#beautify-pm-size').val();
		
		if(!wrapCols || !d3vUtil.isNumber(wrapCols) || parseInt(wrapCols) < 1) {
			wrapCols = 1;
		}
		
		localStorage[COOKIE_PRE + COOKIE_SAVE_BEAUTY_SIZE] = wrapCols;	
	},

	/**
	 * @description Loads the number of columns that beautify uses to line wrap at
	 **/		
	loadBeautifyLineWrap : function() {
		var wrapCols = localStorage[COOKIE_PRE + COOKIE_SAVE_BEAUTY_SIZE];
	
		if(wrapCols) {
			$('input#beautify-pm-size').val(wrapCols);	
		}	
	},	

	/**
	 * @description Saves state of diff editor visibility
	 **/		
	changeDiffEditorVisibility : function() {
		localStorage[COOKIE_PRE + DIFF_EDITOR_VISIBILITY] = $('#diff-gutter').is(':visible') ? 'true' : 'false';
	},
	
	/**
	 * @description Loads state of diff editor visibility
	 **/
	loadDiffEditorVisibility : function() {
		var visibility = localStorage[COOKIE_PRE + DIFF_EDITOR_VISIBILITY];
		
		if(visibility && visibility.length) {
			if(visibility === 'true') {
				d3vUtil.showDiffEditor();
			} else {
				d3vUtil.hideDiffEditor();
			}
		} else {
			d3vUtil.hideDiffEditor();
		}
		
		d3vUtil.dragResizeEditors($('#diff-gutter'));
		d3vUtil.resizeWindow();
	},

	/**
	 * @description Changes the editor font size
	 **/		
	changeFontSize : function() {
		var fontSize = $('input#font-size').val();
		
		if(!fontSize || !d3vUtil.isNumber(fontSize) || parseInt(fontSize) < 1) {
			fontSize = 1;
		}
		
		localStorage[COOKIE_PRE + COOKIE_SAVE_FONT_SIZE] = fontSize;
		editor.setFontSize(parseInt(fontSize));
		rightEditor.setFontSize(parseInt(fontSize));	
		aceDiffer.lineHeight = aceDiffer.editors.right.ace.renderer.lineHeight;
		aceDiffer.diff();		
	},

	/**
	 * @description Load the editor font size
	 **/		
	loadFontSize : function() {
		var fontSize = localStorage[COOKIE_PRE + COOKIE_SAVE_FONT_SIZE];
	
		if(fontSize) {
			$('input#font-size').val(fontSize);
			editor.setFontSize(parseInt(fontSize));
			rightEditor.setFontSize(parseInt(fontSize));	
			aceDiffer.lineHeight = aceDiffer.editors.right.ace.renderer.lineHeight;
			aceDiffer.diff();
		}	
	},
	
	/**
	 * @description Loads the 'show print margin' setting from a cookie
	 **/
	loadShowPrintMargin : function() {
		var showPrintMargin = localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_PM];
		showPrintMargin     = showPrintMargin === 'true' || showPrintMargin === null;
		$('input#show-pm').attr('checked', showPrintMargin);
		editor.setShowPrintMargin(showPrintMargin);
		rightEditor.setShowPrintMargin(showPrintMargin);
	},
	
	/**
	 * @description Handles changing of the 'show print margin' setting
	 **/
	changeShowPrintMargin : function() {
		if($('input#show-pm').attr('checked')) {
			editor.setShowPrintMargin(true);
			rightEditor.setShowPrintMargin(true);	
						
			localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_PM] = 'true';
		} else {
			editor.setShowPrintMargin(false);
			rightEditor.setShowPrintMargin(false);		
						
			localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_PM] = 'false';
		}
	},

	/**
	 * @description Loads 'show indentation guide' setting
	 **/
	loadShowIndentationGuide : function() {
		var showIndentGuide = localStorage[COOKIE_PRE + COOKIE_SAVE_INDENT];
		showIndentGuide     = showIndentGuide === 'true' || showIndentGuide === null;
		$('input#show-indentation-guide').attr('checked', showIndentGuide);
		editor.setDisplayIndentGuides(showIndentGuide);
		rightEditor.setDisplayIndentGuides(showIndentGuide);
	},

	/**
	 * @description Handles changing of the 'show indentation guide' setting
	 **/
	changeShowIndentationGuide : function() {
		if($('input#show-indentation-guide').attr('checked')) {
			editor.setDisplayIndentGuides(true);
			rightEditor.setDisplayIndentGuides(true);
					
			localStorage[COOKIE_PRE + COOKIE_SAVE_INDENT] = 'true';
		} else {
			editor.setDisplayIndentGuides(false);
			rightEditor.setDisplayIndentGuides(false);
					
			localStorage[COOKIE_PRE + COOKIE_SAVE_INDENT] = 'false';
		}
	},

	/**
	 * @description Loads 'show invisibles' setting
	 **/
	loadShowInvisibles : function() {
		var showInvisibles = localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_INVIS];
		showInvisibles     = showInvisibles === 'true' || showInvisibles === null;
		$('input#show-invisibles').attr('checked', showInvisibles);
		editor.setShowInvisibles(showInvisibles);
		rightEditor.setShowInvisibles(showInvisibles);
	},
	
	/**
	 * @description Handles changing of the 'show invisibles' setting
	 **/
	changeShowInvisibles : function() {
		if($('input#show-invisibles').attr('checked')) {
			editor.setShowInvisibles(true);
			rightEditor.setShowInvisibles(true);
					
			localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_INVIS] = 'true';
		} else {
			editor.setShowInvisibles(false);
			rightEditor.setShowInvisibles(false);
					
			localStorage[COOKIE_PRE + COOKIE_SAVE_SHOW_INVIS] = 'false';
		}
	},		
	
	/**
	 * @description Loads the active line highlight setting
	 **/
	loadActiveLineHighlight : function() {
		var highlight = localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_LINE];
		highlight     = highlight === 'true' || highlight === null;
		$('input#highlight-active-line').attr('checked', highlight);
		editor.setHighlightActiveLine(highlight);
		rightEditor.setHighlightActiveLine(highlight);		
	},

	/**
	 * @description Loads the users multi cursor preference
	 **/
	loadEnableMultiCursor : function() {
		var mcp = localStorage[COOKIE_PRE + MULTI_CURSOR_ALLOWED];
		mcp = mcp === 'true' || false;
		$('input#enable-multi-cursor').attr('checked', mcp);
		
		d3vCode.toggleMultiCursor();
	},

	/**
	 * @description Loads the "scroll past end" setting 
	 **/
	loadScrollPastEnd : function() {
		var spe = localStorage[COOKIE_PRE + SCROLL_PAST_END];
		spe = spe === 'true' || false;
		$('input#scroll-past-end').attr('checked', spe);
		editor.setOption('scrollPastEnd', (spe ? SPE_VALUE : 0));
		rightEditor.setOption('scrollPastEnd', (spe ? SPE_VALUE : 0));
	},
	
	/**
	 * @description Handles changing of the "scroll past end" setting
	 **/
	changeScrollPastEnd : function() {
		var spe = $('input#scroll-past-end').attr('checked') ? true : false;
		localStorage[COOKIE_PRE + SCROLL_PAST_END] = spe;
		editor.setOption('scrollPastEnd', (spe ? SPE_VALUE : 0));	
		rightEditor.setOption('scrollPastEnd', (spe ? SPE_VALUE : 0));			
	},	

	/**
	 * @description Loads the auto-autocomplete setting 
	 **/
	loadAutoAutocomplete : function() {
		var autoAutocompleteSetting = localStorage[COOKIE_PRE + AUTO_AUTOCOMPLETE];
		autoAutocomplete = autoAutocompleteSetting === 'true' || autoAutocompleteSetting === null || autoAutocompleteSetting === undefined;
		$('input#auto-autocomplete').attr('checked', autoAutocomplete);
		editor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });
		rightEditor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });
	},
	
	/**
	 * @description Handles changing of the 'Auto-Autocomplete' setting
	 **/
	changeAutoAutocomplete : function() {
		if($('input#auto-autocomplete').attr('checked')) {
			autoAutocomplete = true;
		} else {
			autoAutocomplete = false;
		}
		
		localStorage[COOKIE_PRE + AUTO_AUTOCOMPLETE] = autoAutocomplete;
		editor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });	
		rightEditor.setOptions({ enableBasicAutocompletion: true, enableLiveAutocompletion : autoAutocomplete });			
	},	

	/**
	 * @description Loads the active word highlight setting
	 **/	
	loadActiveWordHighlight : function() {
		var highlight = localStorage[COOKIE_PRE + COOKIE_SAVE_ACTIVE_WORD];
		highlight     = highlight === 'true' || highlight === null;
		$('input#highlight-active-word').attr('checked', highlight);
		editor.setHighlightSelectedWord(highlight);
		rightEditor.setHighlightSelectedWord(highlight);
	},
	
	/**
	 * @description Loads the users show footer preference
	 **/
	loadShowFooter : function() {
		var showFooter = localStorage[COOKIE_PRE + SHOW_FOOTER];
		showFooter     = showFooter === 'true' || showFooter === 'checked' || showFooter === null || showFooter === undefined;
		$('input#show-footer').attr('checked', showFooter);
		d3vCode.toggleShowFooter(showFooter);
	},
	
	/**
	 * @description Sets the foreign managed flag, indicating that this is managed code that cannot be edited with aside.
	 **/
	setForeignManaged : function() {
		foreignManaged = currentFileNamespace && editor.getSession().getValue() === '(hidden)';
	},
	
	/**
	 * @description Sets the foreign managed flag to a neutral state.
	 **/
	resetForeignManaged : function() {
		foreignManaged = false;
	},
	
	/**
	 * @description Shows the footer used for execute anonymous.  Most basic.
	 **/
	enableAnonymousFooter : function(includeRun, includeVersion) {
		$('.cf-sub-min').hide();
		$('.cf-sub-test').hide();
	},		
	
	/**
	 * @description Shows the test footer and hides the beautify/minify footer
	 * @param       includeRun - true to include the run tests button
	 * @param       includeVersion - true to include the version/type button	
	 **/
	enableTestFooter : function(includeRun, includeVersion) {
		$('.cf-sub-min').hide();
		$('.cf-sub-test').show();
		
		if(includeRun) {
			$('#foot-rt').show();
		} else {
			$('#foot-rt').hide();
		}	
		
		if(includeVersion) {
			$('.foot-version').show();
		} else {
			$('.foot-version').hide();
		}				
	},
	
	/**
	 * @description Shows the beautify/minify footer and hides the test footer
	 * @param       includeVersion - true to include the version/type button	
	 * @param       includeMinify  - true to include minify button, false to exclude it 
	 **/	
	enableMinifyFooter : function(includeVersion, includeMinify, includeRename, includeLightning) {
		$('.cf-sub-test').hide();
		$('.cf-sub-min').show();
		
		if(includeMinify) {
			$('#foot-minify').show();
		} else {
			$('#foot-minify').hide();
		}
		
		if(includeVersion) {
			$('.foot-version').show();
		} else {
			$('.foot-version').hide();
		}	
		
		if(includeRename) {
			$('#non-apex-rename').show();
		} else {
			$('#non-apex-rename').hide();
		}	
		
		if(includeLightning) {
			$('#foot-related').show();
		} else {
			$('#foot-related').hide();
		}
	},
	
	/**
	 * @description Gets the aura type given an aura extension
	 * @param       ext  - the complete aura extension (e.g. "aura (svg)")
	 * @return      object with new ext and aura type
	 **/
	getAuraType : function(ext) {
		var extSplit = ext.split('-');
		
		return {
			extension : extSplit[0],
			type : extSplit[1]
		};
	},
	
	/**
	 * @description Get the starting AuraDefinition code for a given definition type
	 * @param       defType - the aura definition type
	 **/	
	getLightningBaseCode : function(defType) {
		if(defType && defType.length) {
			defType = defType.toUpperCase();
		
			if(defType === 'APPLICATION') {
				return '<aura:application>\n\n</aura:application>';
			} else if(defType === 'COMPONENT') {
				return '<aura:component>\n\n</aura:component>';
			} else if(defType === 'EVENT') {
				return '<aura:event type="APPLICATION" description="Event template" />';
			} else if(defType === 'DOCUMENTATION') {
				return '<aura:documentation>\n\t<aura:description></aura:description>\n</aura:documentation>';
			} else if(defType === 'DESIGN') {
				return '<design:component>\n\n</design:component>';
			} else if(defType === 'INTERFACE') {
				return '<aura:interface>\n\n</aura:interface>';
			} else if(defType === 'TOKENS') {
				return '<aura:tokens>\n\n</aura:tokens>';
			} else if(defType === 'CONTROLLER') {
				return '({\n\tmyAction : function(component, event, helper) {\n\n\t\n\t}\n})';
			} else if(defType === 'HELPER') {
				return '({\n\thelperMethod : function() {\n\n\t}\n})';
			} else if(defType === 'RENDERER') {
				return '({\n\n})';
			} else if(defType === 'STYLE') {
				return '.THIS {\n\n}';
			} else if(defType === 'SVG') {
				return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
				       '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' +
				       'xmlns:xlink="http://www.w3.org/1999/xlink">\n\n</svg>';
			}			
		}
		
		return '';
	},

	/**
	 * @description Determines the file format for a given lightning type
	 * @param       defType - the aura definition type
	 **/
	getAuraFormat : function(defType) {
		if(defType && defType.length) {
			defType = defType.toUpperCase();
			
			if(defType === 'APPLICATION' || 
			   defType === 'COMPONENT' || 
			   defType === 'EVENT' || 
			   defType === 'DOCUMENTATION' || 
			   defType === 'DESIGN' ||
			   defType === 'INTERFACE' ||
			   defType === 'TOKENS' ||
			   defType === 'SVG') {
			   
				return 'XML';
			} else if(defType === 'CONTROLLER' || defType === 'HELPER' || defType === 'RENDERER') {
				return 'JS';
			} else if(defType === 'STYLE') {
				return 'CSS';
			}
		}
		
		return 'XML';
	},
	
	/**
	 * @description Applies the appropriate footer for the aura DefType passed in
	 * @param       defType - the aura definition type
	 * @param       isNew - true if working with a new record
	 **/	
	setLightningFooter : function(defType, isNew) {	        
        if(d3vCode.getAuraFormat(defType) === 'XML') {
        	d3vCode.enableMinifyFooter(!isNew, true, !isNew, !isNew);	   
        } else {
        	d3vCode.enableMinifyFooter(!isNew, false, !isNew, !isNew);	   
        }	
	},
	
	/**
	 * @description Applies the appropriate highlight for the aura DefType passed in
	 * @param       defType - the aura definition type
	 **/
	setAuraHighlight : function(defType) {
		if(defType && defType.length) {
			defType = defType.toUpperCase();
			
			if(defType === 'APPLICATION' || 
			   defType === 'COMPONENT' || 
			   defType === 'EVENT' || 
			   defType === 'DOCUMENTATION' || 
			   defType === 'DESIGN' ||
			   defType === 'INTERFACE' ||
			   defType === 'TOKENS') {
			   
				d3vCode.setMode('ace/mode/html');
			} else if(defType === 'CONTROLLER' || defType === 'HELPER' || defType === 'RENDERER') {
				d3vCode.setMode('ace/mode/javascript');
			} else if(defType === 'STYLE') {
				d3vCode.setMode('ace/mode/css');
			} else if(defType === 'SVG') {
				d3vCode.setMode('ace/mode/xml');
			} else {
				d3vCode.setMode('ace/mode/html');
			}
		}
	},

	/**
	 * @description Opens a page/component/class/trigger.
	 * @param       filename  - the name of the file to open
	 * @param       searchInfo - (optional) allows for opening to a specific line or or first instance of a token
	 **/
	openFile : function(filename, searchInfo) {
	    if($('span#error-coverage-act').length == 0) {
	        d3vPopups.closeErrorPopups(CODE_SECTION);
	    }
	    
	    $('span#error-remove-highlights').html('Show Coverage Highlights');
	    
	    lastAction   = 'Open ' + filename;
	    var fnSplit  = filename.split(".");
	    var ext;
	    var auraInfo;
	    
	    if(fnSplit.length === 3) {
	    	ext = fnSplit[2];
	    	currentFile = fnSplit[1] + '.' + ext;
	    	currentFileNamespace = fnSplit[0];  
	    } else {
	    	ext = fnSplit[1];
	    	currentFile = fnSplit[0] + '.' + ext;
	    	currentFileNamespace = null;  	    
	    }
	    
	    if(ext.indexOf('aura') !== -1) {
	    	auraInfo = d3vCode.getAuraType(ext);
	    	ext = auraInfo.extension;
	    }
	    
	    if(ext === 'object') {
	    	d3vUtil.alert('loading object, this may take a moment…', {showTime:ALERT_DISPLAY_TIME_LONG});
	    } else {
	    	d3vUtil.alert('opening…', {showTime:ALERT_DISPLAY_TIME_LONG});
	    }
	    
	    setTimeout(function() {
	    	d3vUtil.setTabName();
	    }, 1);
	    
	    editor.getSession().setValue('loading, please wait...');
	    
	    var select   = "";
	    var fromType = 'apex';
	    
		$('select#code-helper-input').val(lastAction).trigger('chosen:updated');
		
	    if(ext == "cls") {
	        select = "Body";
	        ext    = "class";
	        d3vCode.apexMode();
	        d3vCode.enableTestFooter(true, true);
	    } else if(ext == "page" || ext == "component") {
	        select = "Markup";
	        d3vCode.htmlMode();
	        d3vCode.enableMinifyFooter(true, true, true);
	    } else if(ext == "trigger") {
	        select = "Body";
	        d3vCode.apexMode();
	        d3vCode.enableTestFooter(false, true);
	    } else if(ext == "resource") {
	    	select   = "Body";
	    	fromType = 'static';
	    	d3vCode.enableMinifyFooter(true, true, true);
	    } else if(ext == "object") {
	    	select   = '';
	    	fromType = '';
	    	d3vCode.enableMinifyFooter(false, false, false);
	    } else if(ext == "aura") {
	    	select   = 'Source';
			fromType = auraInfo.type;
	        d3vCode.setAuraHighlight(fromType);
	        d3vCode.setLightningFooter(fromType, false);
	    } else {
	    	d3vCode.enableMinifyFooter(false, true, false);
	    }
		
	    var codeToUse    = null;
	    var completeName = d3vCode.getCompleteFilename();
		
		d3vCode.revertEditorDebug(true);
		d3vCode.performLoadFile(select, fromType, ext, null, searchInfo);	
		
		if(aside && aside.org && aside.org.orgId && localStorage[BACKUP_EXT + aside.org.orgId + completeName] === 'true') {
			d3vArchive.readFiles(completeName + BACKUP_EXT, function(event) {
				if(event.org && aside && aside.org && aside.org.orgId && event.org === aside.org.orgId) {
					var currentTime = new Date().getTime();
					
					if(currentTime - event.timestamp < BACKUP_LIFESPAN) {
		    			alert('It looks like ASIDE crashed while you were editing this file.  ' +
		    			'You can load the crash backup version by clicking the "history" button in the footer and ' +
		    			'choosing the "Crash Backup" entry from the history dialog.');						
					}
				}
				
				d3vArchive.removeEmergencyCopyReminder(completeName);
			});
		} else {
			d3vArchive.removeEmergencyCopyReminder(completeName);
		}
	},
	
	/**
	 * @description Handles opening of text files in aside via drag and drop
	 **/ 
	initializeCodeDrop : function() {
	    var dropZone = document.getElementById('code-content');
	    dropZone.addEventListener('dragover', d3vUtil.preventDefaultBehavior, false);	
	    dropZone.addEventListener('dragleave', d3vUtil.preventDefaultBehavior, false);	
	    dropZone.addEventListener('drop', d3vCode.handleFileDrop, false);		
	},	
	
	handleFileDrop : function(evt) {
		d3vUtil.preventDefaultBehavior(evt);
		
	    var files = evt.dataTransfer.files;
	    if(files && files.length === 1) {
	    	files = files[0];
	    		    	
	    	var reader = new FileReader();
	    	
		    reader.onload = (function(theFile) {
		    	return function(evt) {
		    		try {
		        		var fileResult = evt.target.result;
		        	} catch(ex) {
		        		d3vUtil.alert('sorry, I cant seem to read that file...', { scheme : 'negative' });
		        		return;
		        	}
		        	
		        	if(theFile.size && theFile.size > 5121234) {
		        		d3vUtil.alert('sorry, maximum file size is 5 mb', { scheme : 'negative' });
		        	} else if (theFile.name.indexOf('.cls') !== -1       || 
		        	           theFile.name.indexOf('.page') !== -1      || 
		        	           theFile.name.indexOf('.trigger') !== -1   || 
		        	           theFile.name.indexOf('.component') !== -1 || 
		        	           theFile.name.indexOf('.xml') !== -1) {
		        	    
		        	    var ext = theFile.name.split('.')[1];
		        		d3vUtil.alert('dumping .' + ext + ' file into editor');
		        		var fileResult = d3vPush.arrayBufferToBinaryString(fileResult);		        	           
		        		editor.getSession().setValue(fileResult);
		        	} else {
		        		d3vUtil.alert('the code section only processes .cls, .page, .trigger, .xml, and .component files', { scheme : 'negative' });
		        	}
		        };
			})(files);
		
		    reader.readAsArrayBuffer(files);  	
	    } else if(files && files.length > 1) {
	    	d3vUtil.alert('max one file at a time', { scheme : 'negative' });
	    }		
	},
	
	/**
	 * @description Turns of all highlights
	 **/
	plainTextMode : function() {
		d3vCode.setMode(null);
	},

	/**
	 * @description Loads a file (apex, vf, custom object) from the server
	 * @param       bodyField    - name of field that holds the code e.g. Body|Markup
	 * @param       fromType     - sobject table prefix e.g. apex|static
	 * @param       ext          - file extension (cls|page|trigger|component|resource)
	 * @param       localVersion - local crash history version if applicable, null if not
	 * @param       searchInfo   - (optional) allows for opening to a specific line or or first instance of a token
	 **/	
	performLoadFile : function(bodyField, fromType, ext, localVersion, searchInfo) {
		if(ext === 'object') {
			var cfn = currentFile.replace('.object', '');
			d3vCode.getObjectMetadata(cfn, localVersion, searchInfo);
		} else if(ext === 'xml') {
			var cfn = currentFile.replace('.xml', '');
			d3vCode.loadPackageXML(cfn, localVersion, searchInfo);
		} else if(ext === 'theme') {
			var cfn = currentFile.replace('.theme', '');
			d3vCode.loadUITheme(cfn, localVersion, searchInfo);
		} else if(ext === 'aura') {
			var cfn = currentFile.substring(5, currentFile.indexOf('.aura'));
			d3vCode.loadFile(bodyField, fromType, ext, localVersion, searchInfo);
		} else {
			d3vCode.loadFile(bodyField, fromType, ext, localVersion, searchInfo);
		}
		
		d3vSync.send({ type : REQUEST_RECENT_FILES});
	},
	
	/**
	 * @description Set the API version displayed in the UI.
	 **/
	setApiVersion : function(version) {
		if(version && version.length) {
			$footVersion = $('.foot-version');
			
			if(version === 'resource type') {
				$footVersion.attr('title', 'change content type (shortcut: command + u)');
			} else if(version === '-') {
				$footVersion.attr('title', 'not applicable');
			} else {
				$footVersion.attr('title', 'update file version (shortcut: command + u)');
			}
		
			$footVersion.text(version);
			$('select#version-selector').val(version);
		}
	},
	
	/**
	 * @description Occasionally the currently selected action becomes invalid, when this happens, remove it from the typeahead
	 **/
	removeLastActionFromTypeahead : function() {
        d3vCode.removeFileFromTypeahead(lastAction);
        
        if(lastAction.indexOf('.aura-application') !== -1 || lastAction.indexOf('.aura-component') !== -1) {
        	var replaceToken = lastAction.indexOf('.aura-application') !== -1 ?
        		'.aura-application' : '.aura-component';
        	try {
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-controller'));
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-helper'));
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-style'));
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-documentation'));
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-renderer'));
	        	d3vCode.removeFileFromTypeahead(lastAction.replace(replaceToken, '.aura-svg'));
        	} catch(ex) {
        		//throw it out, unimportant
        	}
        }
	},
	
	/**
	 * @description Removes a file from the typeahead and cleans up the recent commands list
	 * @param       theFile - the file to delete from the code typeahead
	 **/
	removeFileFromTypeahead : function(theFile) {
        var $codeTypeahead = $('select#code-helper-input');
        $codeTypeahead.find('option:contains("' + theFile + '")').remove();
        d3vArchive.deleteRecentCommands([theFile]);
        $codeTypeahead.trigger('chosen:updated');		
	},
	
	/**
	 * @description Updates the class variable map, with the row of tokens for a single line
	 * @param       rowIndex - index of row to parse tokens on
	 * @return      dupeVars - list of variables being added that are already apart of the class variable map, but with a different type
	 **/	
	parseRowTokens : function(rowIndex) {
		var rowTokens = editor.session.getTokens(rowIndex);
		var rowTokenLength = rowTokens.length;
		var rowToken;
		var next1;
		var next2;
		var next3;
		var next4;
		var loweredRowVal;
		var spaceRegex = /\s+/gi;
		var dupeVars = [];	
		
		for(var j = 0; j < rowTokenLength; j++) {
			rowToken = rowTokens[j];
			loweredRowVal = rowToken.value.toLowerCase();
			
			if(rowToken.type === 'support.function' && apexLang[loweredRowVal]) {
			
				if(loweredRowVal === 'list' || loweredRowVal === 'set' || loweredRowVal === 'map') {
					if(j+1 < rowTokenLength) {
						j++;
						next1 = rowTokens[j];
						
						if(next1.type === 'keyword.operator' && next1.value === '<') {
							for(; j < rowTokenLength; j++) {
								if(rowTokens[j].type === 'keyword.operator' && rowTokens[j].value === '>') {
									if(j+1 < rowTokenLength) {
										j++;
										next2 = rowTokens[j];
										
										if(next2.type === 'text' && spaceRegex.test(next2.value)) {
											if(j+1 < rowTokenLength) {
												j++;
												next3 = rowTokens[j];
												
												if(next3.type === 'identifier') {
													if(j+1 < rowTokenLength) {
														j++;
														next4 = rowTokens[j];
														
														if(next4.type !== "lparen") {
															if(classVariableMap[next3.value] && classVariableMap[next3.value] !== rowToken.value) {
																dupeVars.push(next3.value);
															} else {
																classVariableMap[next3.value] = rowToken.value;
															}
														}
													} else {
														if(classVariableMap[next3.value] && classVariableMap[next3.value] !== rowToken.value) {
															dupeVars.push(next3.value);
														} else {
															classVariableMap[next3.value] = rowToken.value;
														}
													}
												}			
											}
										}
									}
									
									break;
								}
							}
						}			
					}
						
				} else if(j+1 < rowTokenLength) {
					j++;
					next1 = rowTokens[j];
					
					if(next1.type === 'text' && spaceRegex.test(next1.value)) {
						if(j+1 < rowTokenLength) {
							j++;
							next2 = rowTokens[j];
							
							if(next2.type === 'identifier') {
								if(j+1 < rowTokenLength) {
									j++;
									next3 = rowTokens[j];
									
									if(next3.type !== "lparen") {
										if(classVariableMap[next2.value] && classVariableMap[next2.value] !== rowToken.value) {
											dupeVars.push(next2.value);
										} else {
											classVariableMap[next2.value] = rowToken.value;
										}
									}
								} else {
									if(classVariableMap[next2.value] && classVariableMap[next2.value] !== rowToken.value) {
										dupeVars.push(next2.value);
									} else {
										classVariableMap[next2.value] = rowToken.value;
									}
								}
							}
						}
					}
				}
			}
		}
		
		return dupeVars;
	},
	
	/**
	 * @description Builds out a map of variable names to their types
	 **/
	setVariableMap : function() {
		classVariableMap = {};
		var dupeVars = [];
		
		if(!d3vCode.isActive()) {
			return;
		}
		
		for(var i = 0, end = editor.session.getLength(); i < end; i++) {
			dupeVars = dupeVars.concat(d3vCode.parseRowTokens(i));
		}
		
		for(var i = 0; i < dupeVars.length; i++) {
			delete classVariableMap[dupeVars[i]];
		}
	},
	
	/**
	 * @description Retrieves the current file from the server
	 * @param       bodyField    - name of field that holds the code e.g. Body|Markup
	 * @param       fromType     - sobject table prefix e.g. apex|static
	 * @param       ext          - file extension (cls|page|trigger|component|resource)
	 * @param       callback     - function executed when retrieve completes, has one 
	 *                             parameter containing the callback result
	 **/
	getCurrentFile : function(bodyField, fromType, ext, callback) {
		var hasBody = bodyField && bodyField.length;
		
		var namespaceClause = '';
		var namespace;
		var filename = currentFile.split('.')[0];
		var fileQuery;
		
		if(ext === LIGHTNING_EXT) {
			if(currentFileNamespace) {
				namespaceClause = " AND AuraDefinitionBundle.NamespacePrefix = '" + currentFileNamespace + "'";
			} else {
				namespaceClause = " AND AuraDefinitionBundle.NamespacePrefix = null";
			}
			
			fileQuery = "SELECT Source, AuraDefinitionBundleId, AuraDefinitionBundle.DeveloperName, " +
			            "LastModifiedBy.Name, LastModifiedDate, LastModifiedById, Id, AuraDefinitionBundle.ApiVersion " +
			            "FROM AuraDefinition WHERE AuraDefinitionBundle.DeveloperName = '" + filename + 
			            "' AND DefType = '" + fromType + "'" + namespaceClause;				
		} else {
			if(currentFileNamespace) {
				namespaceClause = " AND NamespacePrefix = '" + currentFileNamespace + "'";
			} else {
				namespaceClause = " AND NamespacePrefix = null";
			}
			
			fileQuery = "SELECT " + (hasBody ? bodyField + ", " : "")  + 
			            "Name, LastModifiedBy.Name, LastModifiedDate, LastModifiedById, Id" +
			            (fromType === 'static' ? ", ContentType " : ", ApiVersion ") +
			            "FROM " + fromType + ext + " WHERE Name = '" + filename + "'" + namespaceClause;				
		}
		
	    ServerAction.fileQuery(fileQuery, bodyField, function(callbackData) {
	    	callback(callbackData);
	    });
	},
	
	/**
	 * @description Configures the editor based on file information
	 * @param       fromType     - sobject table prefix e.g. apex|static
	 * @param       ext          - file extension (cls|page|trigger|component|resource)
	 * @param       fileResult   - file query result
	 * @return      modified fileResult
	 **/
	setFileInformation : function(fromType, ext, fileResult) {
        d3vCode.setSaveKey(fileResult);
        fileResult = fileResult[0] || fileResult;
        
        if(fromType === 'static') {
        	d3vCode.setApiVersion('resource type');
        } else if(fileResult.AuraDefinitionBundle && fileResult.AuraDefinitionBundle.ApiVersion) {
        	d3vCode.setApiVersion(fileResult.AuraDefinitionBundle.ApiVersion);
        } else {
        	d3vCode.setApiVersion(fileResult.ApiVersion);
        }
        
        editor.setReadOnly(fileResult.readOnly);
        if(fileResult.readOnly) { //the only read only files are non-text, display their results without highlights
        	d3vCode.plainTextMode();
        }

		currentFileId = fileResult.Id;
		
        if(ext.toLowerCase() === 'class') {
        	d3vCode.updateApexDefinition();
        }			
		
		if(fileResult && fileResult.ApiVersion) {
			$('select#version-selector').val(fileResult.ApiVersion);
		}
		
        if(fromType === 'static' && fileResult.ContentType) {
        	d3vCode.setStaticResourceHighlight(fileResult.ContentType);
        	
        	if(d3vUtil.isZipAdvanced(fileResult.ContentType, fileResult.Body)) {
        		d3vCode.buildZipMenu(fileResult);
        	}
        }
        
        return fileResult;
	},

	/**
	 * @description Loads a file from the server or local crash history
	 * @param       bodyField    - name of field that holds the code e.g. Body|Markup
	 * @param       fromType     - sobject table prefix e.g. apex|static
	 * @param       ext          - file extension (cls|page|trigger|component|resource)
	 * @param       localVersion - local crash history version if applicable, null if not
	 * @param       searchInfo   - (optional) allows for opening to a specific line or or first instance of a token
	 **/	
	loadFile : function(bodyField, fromType, ext, localVersion, searchInfo) {
		fileOpening  = true;
		
		d3vCode.getCurrentFile(bodyField, fromType, ext, function(callbackData) {
	    	if(callbackData === FILE_NOT_FOUND_ERROR) {
	    		d3vCode.removeLastActionFromTypeahead();
		        d3vCode.goToCodeDefaultState();
	    		d3vUtil.alert('file was not found', { scheme : 'negative'});
	    		return;
	    	}
	    
	        var result = JSON.parse(callbackData);
	        
	        result = d3vCode.setFileInformation(fromType, ext, result);

	        var openMsg = 'Last edited ';
	        if(result.LastModifiedBy && result.LastModifiedBy.Name) {
	        	openMsg += 'by ' + result.LastModifiedBy.Name + ' ';
	        }
	        openMsg += 'on ' + d3vUtil.salesforceDateMadeReadable(result.LastModifiedDate);
	        
	        d3vUtil.alert(openMsg, {scheme : 'positive'});	        		
			
			if(localVersion) {
				lastFile = localVersion;
			} else if(d3vUtil.isZipAdvanced(result.ContentType, result.Body)) {
				lastFile = null;
				d3vCode.setZipMessage(currentFile.split('.')[0]);
			} else {
				lastFile = result[bodyField] ? d3vUtil.decodeUtf8(atob(result[bodyField])) : '';
			}
			
			if(result.AuraDefinitionBundleId && result.AuraDefinitionBundleId.length) {
				currentBundleId = result.AuraDefinitionBundleId;
			} else {
				currentBundleId = null;
			}
			
			if(lastFile !== null) {
	        	editor.getSession().setValue(lastFile);
	        }
	        
	        editor.getSession().setAnnotations([]);
	        d3vCode.hideCoverageHighlights();
	        
	        if(lastFile) {
	        	d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
	        }
	        
			d3vUtil.resetEditorChange();
	        d3vCode.setForeignManaged();
	        d3vCode.updateFooterCoverage();
	        d3vCode.setVariableMap();
	        d3vCode.finishOpen();
	        
	        if(searchInfo) {
		        if(searchInfo.lineNumber) {
		        	editor.gotoLine(searchInfo.lineNumber);
		        } else if(searchInfo.token) {
		            d3vCode.performFind(false, false, searchInfo.token);
		        }	        
	        }		
		});
	},
	
	/**
	 * @description Sets ACE's mode based on static resource content type
	 * @param       contentType - the mime type of the current static resource
	 **/
	setStaticResourceHighlight : function(contentType) {
		if(contentType.indexOf('css') !== -1) {
			d3vCode.setMode("ace/mode/css");
		} else if(contentType.indexOf('js') !== -1 || contentType.indexOf('javascript') !== -1) {
			d3vCode.setMode("ace/mode/javascript");
		} else if(contentType.indexOf('xml') !== -1) {
			d3vCode.setMode("ace/mode/xml");
		} else if(contentType.indexOf('html') !== -1) {
			d3vCode.setMode("ace/mode/html");
		}
	},

	/**
	 * @description creates a new file
	 * @param       filename - type of file to create a new one of
	 **/   
	newFile : function(filename) {
	    d3vPopups.closeErrorPopups(CODE_SECTION);
	    d3vUtil.alert('new file ready', { scheme : 'positive'});
	    d3vCode.revertEditorDebug(true);
	    
	    if(filename === 'New Apex Class') {
	    	d3vCode.apexMode();
	    	editor.getSession().setValue(NEW_CLASS_CODE);
	    	d3vCode.enableTestFooter(true, false);
	    } else if(filename === 'New Test Class') {
	    	d3vCode.apexMode();
	    	editor.getSession().setValue(NEW_TEST_CODE);
	    	d3vCode.enableTestFooter(true, false);
	    } else if(filename === 'New Trigger') {
	    	d3vCode.apexMode();
	    	editor.getSession().setValue(NEW_TRIGGER_CODE);
	    	d3vCode.enableTestFooter(false, false);
	    } else if(filename === 'New Visualforce Component') {
	    	d3vCode.htmlMode();
	    	editor.getSession().setValue(NEW_COMPONENT_MARKUP);
	    	d3vCode.enableMinifyFooter(false, true, true);
	    } else if(filename === 'New Visualforce Page') {
	    	d3vCode.htmlMode();
	    	editor.getSession().setValue(NEW_PAGE_MARKUP);
	    	d3vCode.enableMinifyFooter(false, true, true);
	    } else if(filename === 'New Static Resource') {
	    	editor.getSession().setValue('');
	    	d3vCode.showMimeMainScreen();
	    	d3vPopups.showAnimatedModal('#mime-errors');
	    	$('div#generic-overlay').show();
	    	$('div#mime-close').hide();
	    	d3vCode.setZipFilename(ZIP_BASE_DISPLAY_NAME);
	    	d3vCode.enableMinifyFooter(false, true, true);
	    } else if(filename === 'New Custom Object') {
	    	editor.getSession().setValue(NEW_OBJECT_MARKUP);
	    	d3vCode.setMode("ace/mode/javascript");
	    	d3vCode.enableMinifyFooter(false, false, false);
	    } else if(filename === 'New Package XML') {
	    	d3vCode.htmlMode();
	    	editor.getSession().setValue(NEW_PACKAGE_MARKUP);	 
	    	d3vCode.enableMinifyFooter(false, true, false);   
	    } else if(filename === 'New UI Theme') {
	    	d3vCode.setMode("ace/mode/css");
	    	d3vCode.openDefaultCSS();
	    	d3vCode.enableMinifyFooter(false, true, false);
	    } else if(filename.indexOf('New Lightning ') !== -1) {
	    	var defType = filename.replace('New Lightning ', '').toUpperCase();
	    	
	    	d3vCode.setAuraHighlight(defType);
	    	editor.getSession().setValue(d3vCode.getLightningBaseCode(defType));
	    	d3vCode.setLightningFooter(defType, true);
	    }
	},

	/**
	 * @description Sets the editor to the state where you are viewing a zip file, as opposed to any of the files within the zip
	 * @param       zipName - name of zip to display
	 **/
	setZipMessage : function(zipName) {
		d3vCode.setMode(null);
		editor.setReadOnly(true);
		editor.getSession().setValue('Note: This is a zip file, you can modify its contents with the zip menu above.\n' +
			                         'To upload a new file, press command+u.\n\n' +
			                         'Resource Name: ' + zipName + '\n' +
			                         'Content Type:  application/zip');	
	},

	/**
	 * @description Handle Zip content switch
	 **/
	setZipSwitch : function() {
		d3vCode.setZipMessage('New File');                     
		contentTypeSwitch = 'application/zip';
		currentZip = new JSZip();
		d3vCode.showZipMenu();
		d3vCode.closeMimePopup();
	},

	/**
	 * @description Handle JS content switch
	 **/
	setJSSwitch : function() {
		d3vCode.resetZip();
		d3vCode.setJavascriptHighlights();
		contentTypeSwitch = 'text/javascript';
	},

	/**
	 * @description Handle CSS content switch
	 **/	
	setCSSSwitch : function() {
		d3vCode.resetZip();
		d3vCode.setCSSHighlights();
		contentTypeSwitch = 'text/css';
	},
	
	/**
	 * @description Handle HTML content switch
	 **/	
	setHTMLSwitch : function() {
		d3vCode.resetZip();
		d3vCode.setHTMLHighlights();
		contentTypeSwitch = 'text/html';
	},
	
	/**
	 * @description Handle XML content switch
	 **/	
	setXMLSwitch : function() {
		d3vCode.resetZip();
		d3vCode.setXMLHighlights();
		contentTypeSwitch = 'text/xml';
	},		
	
	/**
	 * @description Closes the mime popup and overlay
	 **/
	closeMimePopup : function() {
		$('div#mime-errors').hide();
		$('div#generic-overlay').hide();
		$('div#mime-close').hide();	
	},

	/**
	 * @description Sets highlights when the user selects javascript as the static resource type
	 **/	
	setJavascriptHighlights : function() {
		editor.getSession().setValue('');
		editor.setReadOnly(false);
		d3vCode.setMode("ace/mode/javascript");
		d3vCode.closeMimePopup();
	},

	/**
	 * @description Sets highlights when the user selects javascript as the static resource type
	 **/		
	setCSSHighlights : function() {
		editor.getSession().setValue('');
		editor.setReadOnly(false);
		d3vCode.setMode("ace/mode/css");
		d3vCode.closeMimePopup();
	},
	
	/**
	 * @description Sets highlights when the user selects text as the static resource type
	 **/		
	setTextHighlights : function() {
		editor.getSession().setValue('');
		editor.setReadOnly(false);
		d3vCode.setMode(null);
	},	
	
	/**
	 * @description Sets highlights when the user selects html as the static resource type
	 **/		
	setHTMLHighlights : function() {
		editor.getSession().setValue('');
		editor.setReadOnly(false);
		d3vCode.setMode("ace/mode/html");
		d3vCode.closeMimePopup();
	},	
	
	/**
	 * @description Sets highlights when the user selects xml as the static resource type
	 **/		
	setXMLHighlights : function() {
		editor.getSession().setValue('');
		editor.setReadOnly(false);
		d3vCode.setMode("ace/mode/xml");
		d3vCode.closeMimePopup();
	},		

	/**
	 * @description Manages the Recent Files list in the typeahead
	 * @param       $input - jquery object for #code-helper-input
	 * @param		filename - name of last action performed
	 **/
	manageRecentFiles : function($input, filename) {
		if(d3vArchive.addRecentCommand(filename)) {
			d3vCode.refreshRecentItems($input);
		}		
	},

	/**
	 * @description Refreshes the Recent Files list in the typeahead
	 * @param       $input - jquery object for #code-helper-input
	 **/	
	refreshRecentItems : function($input) {
		$input = $input || $('#code-helper-input');
		var $recent = $input.find('optgroup[label="Recent Files"]');
		var markup = d3vCode.getRecentCommandsMarkup();
		if($recent && $recent.length) {
			$recent.replaceWith(markup);
		} else {
			$input.find('optgroup[label="Commands"]').before(markup);
		}
							   		 
		$input.trigger("chosen:updated");	
	},

	/**
	 * @description Handles selection of an option for the code-action typeahead
	 * @param       filename - what was selected
	 * @param       fromRedo - true when this method was called from the redo command, false otherwise
	 **/
	codeSelectionAction : function(filename, fromRedo) {
		var $input  = $('select#code-helper-input');
	    var fnSplit = filename.split(" ");
	    var command = fnSplit[0];
	    
	    if(!fromRedo && command === "Open" && (key.command || key.ctrl)) {
	    	$input.val(lastAction).trigger('chosen:updated');
	    	d3vUtil.openFileInNewWindow(fnSplit[1]);
	    	return;
	    }
	    
	    if(!fromRedo && (key.command || key.ctrl)) {
	    	$input.val(lastAction).trigger('chosen:updated');
	    	d3vUtil.executeCommandInNewWindow(filename);
	    	return;
	    }	    
	    
		d3vCode.manageRecentFiles($input, filename);	    
	    
	    if(command === 'Go') {
	    	$input.val(lastAction).trigger('chosen:updated');
	    	d3vCode.openNewTab(filename);
	    	return;
	    }
	    
	    var changeFile = !fileModified || !lastAction || lastAction === filename || lastAction === 'Execute Anonymous' ||
	    	(fileModified && confirm('You have unsaved changes.  Are you sure you want to switch files?'));
	    	
	    if(changeFile) {
	    	lastAction           = filename;
		    currentFile          = null;
		    currentFileId        = null;
		    currentFileNamespace = null;
		    currentBundleId      = null;
		    currentZip           = null;
		    contentTypeSwitch    = null;
		    currentZippedFile    = null;
		    saving               = false;
		    
		    if($input.val() !== lastAction) {
		    	$input.val(lastAction).trigger('chosen:updated');
		    }
		    
		    d3vCode.resetSaveButtonLabel();
		    d3vCode.setApiVersion('-');
		    d3vUtil.setTabName();
		    d3vCode.showSaveIcon();
			editor.setReadOnly(false);
			d3vCode.resetForeignManaged();
			d3vCode.hideZipMenu();
			d3vCode.setFootCoverage();
			
		    if(command == "Open") {
		    	d3vCode.openFile(filename.substring(command.length + 1));
		    } else if(command == "New") {
		        d3vCode.newFile(filename);
		    } else if(command == "Execute") {
		        d3vCode.openExecuteAnonymous();
		    } else {
		        d3vUtil.alert("Unknown selection", { scheme : 'negative'});
		    }			  
	    } else {
	    	$input.val(lastAction).trigger('chosen:updated');
	    }
	},
	
	/**
	 * @description Initializes the annotation helper, which hides warnings on lightning code, because they arent accurate
	 **/
	initializeAnnotationHelper : function() {
		editor.getSession().on("changeAnnotation", function(evt) {
			if(lastAction && (lastAction.indexOf('.aura-') !== -1 || lastAction.indexOf('New Lightning ') !== -1)) {
				if(annotationFlag) {
					annotationFlag = false;
					return;
				}
				
				var newAnnos = [];
				var annos = editor.getSession().getAnnotations();
				
				for(var i = 0, end = annos.length; i < end; i++) {
					if(annos[i].type && annos[i].type.toLowerCase() !== 'warning') {
						newAnnos.push(annos[i]);
					}
				}
				
				annotationFlag = true;
				editor.getSession().setAnnotations(newAnnos);	
			}
		});	
	},

	/**
	 * @description Reset the footer save buttons label to "save"
	 **/
	resetSaveButtonLabel : function() {
		$('#fs-save').text('save');
	},
	
	/**
	 * @description Reset the footer save buttons label to "save"
	 **/
	changeSaveButtonToExecuteAnonymousButton : function() {
		$('#fs-save').text('execute');
	},	
	
	/**
	 * @description Generates the markup needed to populate the Recent Files list in the code typeahead
	 * @return		the Recent Files markup
	 **/
	getRecentCommandsMarkup : function() {
		var recents = d3vArchive.getRecentCommands();  
		var markup  = '';
		if(recents.length > 0) {
			markup += '<optgroup label="Recent Files">';
			for(var i = recents.length - 1; i >= 0; i--) {
				markup += '<option>' + recents[i] + '</option>';
			}
			markup += '</optgroup>';
		}
		
		return markup;
	},

	/**
	 * @description Instantiates the code typeahead with a list of files to open and actions to take.
	 **/	
	saveCustomObject : function() {
		d3vUtil.alert('saving object…');
		
		var metadata;
		
		try {
			metadata = JSON.parse(editor.getSession().getValue());
		} catch(ex) {
			saving = false;
			d3vUtil.alert('cannot save json is not valid');
			d3vPopups.displayMessage('JSON Parse Error', ex.message, ex);  
			d3vUtil.resetEditorChange();
			return;
		}
		
		var objectName = metadata.fullName;
		var oldName    = d3vCode.getNamespacedFilename().replace('.', '__');
		
		//I bet this breaks in some orgs, and what to -- to tell if fullname doesnt change?
		var instPrefix = installedPrefix + '__';
		if(oldName && oldName.indexOf(instPrefix) === 0) {
			oldName = oldName.replace(instPrefix, '');
		}
		
		if(currentFile && objectName !== d3vCode.getNamespacedFilename().replace('.', '__') && objectName != oldName) {
			d3vUtil.alert('cannot change fullName attribute', { scheme : 'negative'});
			saving = false;
			d3vUtil.resetEditorChange();
			return;
		}
		
		var package = d3vPush.getXMLString({
			classes     : [],
			pages       : [],
			triggers    : [],
			components  : [],
			resources   : [],
			sObjects    : ['\t\t<members>' + objectName + '</members>\n'],
			fields      : [],
			workflows   : [],
			validations : []
		}, false);
		
		package       = package.replace('</Package>', '\t<version>' + DEFAULT_VERSION + '</version>\n</Package>');
		var zip       = new JSZip();
		var objFolder = zip.folder('objects');
		
		zip.file('package.xml', package);
		
		var mdAsXML = '<?xml version="1.0" encoding="UTF-8"?><CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">' +
		              d3vUtil.json2xml(metadata, '\t') + '</CustomObject>';
		
		objFolder.file(objectName + '.object', mdAsXML);
		
		ServerAction.saveCustomObject(zip.generate(), 
		                    currentFileId, 
		                    lastSaveKey,
		                    function(callbackData) {
		                    
			callbackData = eval('(' + callbackData + ')');
			if($.type(callbackData) === "string") {
				callbackData = eval('(' + callbackData + ')');
			}
			
			var successful = false;
			
			if(callbackData.success === false && callbackData.name && callbackData.problem) {
				successful = false;
				saving     = false;
				d3vUtil.alert('save failed', { scheme : 'negative'});
				d3vPopups.displayMessage('Custom Object Save Error', callbackData.problem, callbackData); 
				return;
			}
			
			if(callbackData.deployResponse && callbackData.deployResponse.result) {
				if(callbackData.deployResponse.result.done) {
					successful = true;
					saving = false;
					
					if(callbackData.deployResponse.result.success) {
						d3vCode.completeObjectSave();
					} else {
						d3vCode.handleFailedObjectSave(callbackData.deployResponse.result);		
					}
				} else if(callbackData.deployResponse.result.id) {
					successful = true;
					currentPushIdCode = setInterval(function() {
						d3vCode.checkDeployStatus(callbackData.deployResponse.result.id);
					}, 3000);
				}
			}
			
			if(!successful) {
				callbackData = eval('(' + callbackData + ')');
				d3vUtil.alert('failed to save', { scheme : 'negative'});
				saving = false;
				d3vPopups.displayMessage('Save Failure', 'Custom object failed to save properly. ' +
				'Show API Response for more information.', callbackData);	
			}	
		});			
	},

	/**
	 * @description Handles the completion of an sobject save
	 **/	
	completeObjectSave : function(objectName) {
		d3vUtil.alert('save completed successfully!', { scheme : 'positive'});
		d3vUtil.resetEditorChange();
		d3vPopups.closeErrorPopups(CODE_SECTION);
		d3vCode.finishSave();
		
		if($('select#code-helper-input').val() === 'New Custom Object') {
			var objectName = '';
			
			if(editor.getSession().getValue()) {
				var asJSON = JSON.parse(editor.getSession().getValue());
				objectName = asJSON.fullName.replace('__c', '');
			}
			
			var fiveMinutesAgo = new Date(new Date().getTime() - 300000);
			
			ServerAction.queryTooling("SELECT Id, DeveloperName, NamespacePrefix FROM CustomObject WHERE LastModifiedDate >= " + 
			                          fiveMinutesAgo.toISOString() + " AND DeveloperName = '" + objectName + "'", function(callbackData) {
				callbackData = eval('(' + callbackData + ')');
				
				if(callbackData && callbackData.length) {
					d3vCode.handleNewFile(callbackData[0], '__c.object');
				}
			});
		} else {
			d3vCode.updateObjectSaveKey();
		}
		
	},
	
	/**
	 * @description Checks the status and handles the completion of a deploy operation
	 * @param deployId - id of deploy to check status of
	 **/
	checkDeployStatus : function(deployId) {
		ServerAction.checkDeployStatus(deployId, true, function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			var callbackResult = callbackData.checkDeployStatusResponse.result;
			
			if(currentPushIdCode && callbackResult && callbackResult.done) {
			    saving = false;
				if(callbackData.checkDeployStatusResponse.result.success) {
					d3vCode.completeObjectSave();
				} else {
					d3vCode.handleFailedObjectSave(callbackData.checkDeployStatusResponse.result);
				}

				clearInterval(currentPushIdCode);
				currentPushIdCode = null;				
			} else if(callbackResult.status === 'InProgress') {
				d3vUtil.alert('still saving...');
			} else {
				d3vUtil.alert('save failed!', { scheme : 'negative'});
				saving = false;
			}
		});
	},	
	
	/**
	 * @description Handler method for custom object saves that fail
	 * @param       result - save result information
	 **/	
	handleFailedObjectSave : function(result) {
		d3vUtil.alert('save failed', { scheme : 'negative'});
		d3vUtil.resetEditorChange();
		
		if(result.details.componentFailures) {
			d3vCode.displayAdvancedErrors(result.details.componentFailures, true, result);
		}
	},
	
	/**
	 * @description Builds out a map of all files classes and triggers in the org (aside.classes, aside.triggers)
	 **/
	buildFileMaps : function() {
		var short;
		
		for(var i = 0, endI = aside.files.length; i < endI; i++) {
			short = d3vCode.getFileNameFromAction(aside.files[i]);
		
			if(aside.files[i].indexOf('.cls') !== -1) {
				short = short.replace('.cls', '');
				aside.classes[short] = true;
			} else if(aside.files[i].indexOf('.trigger') !== -1) {
				short = short.replace('.trigger', '');
				aside.triggers[short] = true;
			}
		}	
	},
	
	/**
	 * @description Given an open command, returns the filename without namespace
	 * @param       command - command to get the filename from
	 **/
	getFileNameFromAction : function(command) {
		var short = null;
		var firstIndex;
		var lastIndex;
		
		if(command.indexOf('Open ') !== -1) {
			short = command.replace('Open ', '');
			firstIndex = short.indexOf('.');
			lastIndex = short.lastIndexOf('.');
			
			if(firstIndex !== -1 && firstIndex !== lastIndex) {
				short = short.substring(firstIndex + 1);
			}
		}
		
		return short;		
	},

	/**
	 * @description Instantiates the code typeahead with a list of files to open and actions to take.
	 **/
	instantiateCodeTypeahead : function() {
		var results    = aside.files;
		var $typeahead = $("select#code-helper-input");
		var markup     = '<option></option>';
		var classes    = '<optgroup label="Apex Classes">', hasClasses = false;
		var pages      = '<optgroup label="Visualforce Pages">', hasPages = false;
		var components = '<optgroup label="Visualforce Components">', hasComponents = false;
		var triggers   = '<optgroup label="Apex Triggers">', hasTriggers = false;
		var resources  = '<optgroup label="Static Resources">', hasResources = false;
		var objects    = '<optgroup label="Custom Objects">', hasObjects = false;
		var lightning  = '<optgroup label="Lightning Bundles">', hasLightning = false;
		var commands   = '<optgroup label="Commands">';

		
		for(var i = 0, endI = results.length; i < endI; i++) {
		    if(results[i].indexOf('.aura') !== -1) {
				lightning  += '<option>' + results[i] + '</option>';
				hasLightning = true;		    
		    } else if(results[i].indexOf('.cls') !== -1) {
				classes    += '<option>' + results[i] + '</option>';
				hasClasses = true;
			} else if(results[i].indexOf('.page') !== -1) {
				pages      += '<option>' + results[i] + '</option>';
				hasPages   = true;
			} else if(results[i].indexOf('.component') !== -1) {
				components += '<option>' + results[i] + '</option>';
				hasComponents = true;
			} else if(results[i].indexOf('.trigger') !== -1) {
				triggers   += '<option>' + results[i] + '</option>';
				hasTriggers = true;
			} else if(results[i].indexOf('.resource') !== -1) {
				resources  += '<option>' + results[i] + '</option>';
				hasResources = true;
			} else if(results[i].indexOf('__c.object') !== -1) {
				objects    += '<option>' + results[i] + '</option>';
				hasObjects  = true;
			} else {
				commands   += '<option>' + results[i] + '</option>';
			}
		}

		markup += d3vCode.getRecentCommandsMarkup();
		markup += commands + '</optgroup>';
		
		if(hasClasses) {
			markup += classes + '</optgroup>';
		}
		
		if(hasPages) {
			markup += pages + '</optgroup>';
		}
		
		if(hasComponents) {
			markup += components + '</optgroup>';
		}
		
		if(hasTriggers) {
			markup += triggers + '</optgroup>';
		}		
					
		if(hasResources) {
			markup += resources + '</optgroup>';
		}
		
		if(hasLightning) {
			markup += lightning + '</optgroup>';
		}
		
		if(hasObjects) {
			markup += objects + '</optgroup>';
		}

		markup += d3vCode.getPackageXMLMarkup();
		markup += d3vCode.getUIThemeMarkup();
		
		$typeahead.append(markup);
		var toDelete = [];
		var recent;
		$typeahead.find('optgroup[label="Recent Files"] option').each(function(idx, ele) {
			recent = $(ele).text();
			if($typeahead.find('option:contains("' + recent + '")').length === 1) {
				$(ele).remove();
				toDelete.push(recent);
			}
		});
		
		//Random stuff it makes sense to do now
		d3vArchive.deleteRecentCommands(toDelete);
				
		$typeahead.chosen({ 
						no_results_text: "no file names match that input", 
						placeholder_text: 'enter a command...', 
						search_contains: true,
						width: '400px' })
		          .change(function() {
		          	  d3vCode.codeSelectionAction($(this).val(), false);
		          }).on('chosen:showing_dropdown', function() {
		          	  setTimeout(function() {
		          	  	  $('ul.chosen-results').scrollTop(0);
		          	  }, 50);
		          });
		          
		
		d3vCode.resizeCodeTypeahead();
	},
	
	/**
	 * @description Generates the markup needed for saved package xmls to appear in the code typeahead
	 **/
	getPackageXMLMarkup : function() {
		var xml = '';
		
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(PACKAGE_XML_FILE + aside.org.orgId) === 0) {
				xml += '<option>Open ' + prop.replace(PACKAGE_XML_FILE + aside.org.orgId, '') + '.xml</option>';
			}
		}
		
		if(xml && xml.length) {
			return '<optgroup label="Package XMLs">' + xml + '</optgroup>';
		}
		
		return null;
	},
	
	/**
	 * @description Generates the markup needed for saved ui themes to appear in the code typeahead
	 **/
	getUIThemeMarkup : function() {
		var options = '';
		
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(UI_THEME_FILE) === 0) {
				options += '<option>Open ' + prop.replace(UI_THEME_FILE, '') + '.theme</option>';
			}
		}
		
		if(options && options.length) {
			return '<optgroup label="UI Themes">' + options + '</optgroup>';
		}
		
		return null;
	},	

	/**
	 * @description Removes the zip icon and replaces it with the specified filename
	 * @param       fn - the filename to use
	 **/
	setZipFilename : function(fn) {	
		$('#zip-handler-btn span').text(fn);	
	},

	/**
	 * @description Loads xml for a single package.xml file
	 * @param       packageName  - name of file to get xml of
	 * @param       localVersion - local crash history version if applicable, null if not
	 * @param       searchInfo   - (optional) allows for opening to a specific line or or first instance of a token
	 **/		
	loadPackageXML : function(packageName, localVersion, searchInfo) {
		d3vCode.updateFooterCoverage();
		
		var saved = localStorage[PACKAGE_XML_FILE + aside.org.orgId + packageName];
		
		if(saved && saved.length) {
			saved = JSON.parse(saved);
			lastFile = saved.code;
			d3vCode.htmlMode();
			editor.getSession().setValue(lastFile);
		    editor.getSession().setAnnotations([]);
	        d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
	        d3vCode.setForeignManaged();
	        d3vUtil.alert('Last edited ' + d3vUtil.salesforceDateMadeReadable(new Date(saved.time).toISOString()), { scheme : 'positive'}); 
	        d3vUtil.resetEditorChange();
	        d3vCode.finishOpen();
		} else {
			d3vUtil.alert('file not found', { scheme : 'negative'});
		}
	},
	
	/**
	 * @description Loads a ui theme
	 * @param       themeName  - name of ui theme to load
	 * @param       localVersion - local crash history version if applicable, null if not
	 * @param       searchInfo   - (optional) allows for opening to a specific line or or first instance of a token
	 **/		
	loadUITheme : function(themeName, localVersion, searchInfo) {
		d3vCode.updateFooterCoverage();
		
		var saved = localStorage[UI_THEME_FILE + themeName];
		
		if(saved && saved.length) {
			saved = JSON.parse(saved);
			lastFile = saved.code;
			d3vCode.setMode('ace/mode/css');
			editor.getSession().setValue(lastFile);
		    editor.getSession().setAnnotations([]);
	        d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
	        d3vCode.setForeignManaged();
	        d3vUtil.alert('Last edited ' + d3vUtil.salesforceDateMadeReadable(new Date(saved.time).toISOString()), { scheme : 'positive'}); 
	        d3vUtil.resetEditorChange();
	        d3vCode.finishOpen();
		} else {
			d3vUtil.alert('file not found', { scheme : 'negative'});
		}
	},	

	/**
	 * @description Obtains metadata information for a single object
	 * @param       objectName   - name of object to get metadata on
	 * @param       localVersion - local crash history version if applicable, null if not
	 * @param       searchInfo   - (optional) allows for opening to a specific line or or first instance of a token
	 **/		
	getObjectMetadata : function(objectName, localVersion, searchInfo) {
		d3vCode.updateFooterCoverage();
		
		ServerAction.readObjectMetadata(objectName, currentFileNamespace, function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			
			if(callbackData.readMetadataResponse && 
			   callbackData.readMetadataResponse.result && 
			   callbackData.readMetadataResponse.result.records && 
			   callbackData.readMetadataResponse.result.records.length) {

				if(callbackData.readMetadataResponse.result.records[0] === null) {
					d3vUtil.alert('object not found', { scheme : 'negative'});
					editor.setReadOnly(true);
					editor.getSession().setValue('');
					return;
				}

		    	d3vCode.setSaveKey(callbackData.readMetadataResponse.result);
		        var openMsg = 'Last edited on ' + d3vUtil.salesforceDateMadeReadable(callbackData.readMetadataResponse.result.LastModifiedDate);
		        d3vUtil.alert(openMsg);
		
				currentFileId = callbackData.readMetadataResponse.result.Id;				
				
				if(localVersion) {
					lastFile = localVersion;
				} else if(callbackData.readMetadataResponse.result.records[0] === null) {
					d3vUtil.alert('cannot load object', { scheme : 'negative'});
					editor.setReadOnly(true);
					editor.getSession().setValue('This object cannot be viewed or edited with ASIDE.');
					return;
				} else {
					lastFile = JSON.stringify(callbackData.readMetadataResponse.result.records[0], undefined, 4);
				}
				
		        editor.getSession().setValue(lastFile);
		        editor.getSession().setAnnotations([]);
		        d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
				d3vUtil.resetEditorChange();
		        d3vCode.setMode("ace/mode/javascript");
		        d3vCode.setForeignManaged();
		        d3vCode.finishOpen();
		        
		        var foldable = ['actionOverrides', 'businessProcesses', 'compactLayouts', 'fields', 'fieldSets', 'nameField', 'searchLayouts',
		                        'listViews', 'namedFilter', 'recordTypes', 'sharingReasons', 'sharingRecalculations', 'validationRules', 'webLinks'];
		        for(var i = 0, end = foldable.length; i < end; i++) {
		        	d3vCode.findAndFold('"' + foldable[i] + '":');
		        }
		        
		        if(searchInfo) {
			        if(searchInfo.lineNumber) {
			        	editor.gotoLine(searchInfo.lineNumber);
			        } else if(searchInfo.token) {
			            d3vCode.performFind(false, false, searchInfo.token);
			        }	        
		        }
			} else {
				d3vUtil.alert('failed to open ' + objectName + '.object :(', { scheme : 'negative'});
				d3vPopups.displayMessage('Open Failure', 'Failed to open sObject: ' + 
					objectName + '.  Show API Response for more information', callbackData); 
			}
		});
	},
	
	/** 
	 * @description Finds a specific piece of text and folds the editor at the line the text appears on
	 * @param       toFind - text to find
	 **/
	findAndFold : function(toFind) {
		var result = editor.find(toFind);
		var foldRange;
		
		if(result && result.start && result.end && result.start.row === result.end.row) {
			foldRange = editor.getSession().getFoldWidgetRange(result.start.row);
			if(foldRange) {
				editor.getSession().addFold('...', foldRange);
			}
		}
	},

	/**
	 * @description Adjusts the code typeahead to be taller, based on the size of the window
	 **/	
	resizeCodeTypeahead : function() {
		var typeaheadHeight = parseInt($(window).height() * 0.75);
		$('span#code-helper ul.chosen-results').css({ maxHeight : (typeaheadHeight + 'px')});	
	}
	
}   		    