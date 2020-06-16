/*
 @description Handles communication between instances of ASIDE.
 @date 4.16.2015
 @author phil rymek

 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vSync = {

	/**
	 * @description Send a message to all other tabs
	 * @param       content - the message to send
	 * @param       needsResponse - true if the sender wants a response
	 **/
	send : function(content, needsResponse) {
		var toSend = {
			value     : content.value     || content,
			from      : content.from      || aside.instance,
			to        : content.to        || null,
			handler   : aside.instance
		};
	
		intercom.emit('notice', {message: toSend});
	},

	/**
	 * @description Handler for listening to messages
	 * @param       content - the message to receive
	 **/	
	receive : function(content) {
		content = content.message;
		
		if(d3vSync.validateMessage(content)) {
			return;
		}
		
		if(content.value.type === REQUEST_STATUS) {
			if(aside && aside.instance && aside.instance.length && content.value.id && content.value.id.length) {
				var shortInstance = aside.instance.substring(0, 9);
				localStorage[STATUS_PREFIX + content.value.id + shortInstance] = JSON.stringify(d3vSync.getInstanceStatus());
			}
		} else if(content.value.type === REQUEST_CLOSE) {
			window.close();
		} else if(content.value.type === REQUEST_SWITCH) {
			d3vSync.performSwitch();
		} else if(content.value.type === REQUEST_ADD_FILE) {
			d3vCode.updateCodeList(content.value.payload.action, 
			                       content.value.payload.namespaced, 
			                       $('select#code-helper-input'), 
			                       content.value.payload.extension);
		} else if(content.value.type === REQUEST_REMOVE_FILE) {
			d3vCode.removeFileFromTypeahead(content.value.payload);
		} else if(content.value.type === REQUEST_SETTING_SYNC) {
			d3vCode.loadAllSettings();
		} else if(content.value.type === REQUEST_TAB_FLASH) {
			d3vUtil.flashForAttention();
		} else if(content.value.type === REQUEST_TAB_RESET) {
			d3vUtil.setTabName();
		} else if(content.value.type === REQUEST_RECENT_FILES) {
			d3vCode.refreshRecentItems();
		}
	},
	
	/**
	 * @description Initialize intercom
	 **/
	initialize : function() {
		intercom = Intercom.getInstance();
		intercom.on('notice', d3vSync.receive);	
	},
	
	/**
	 * @description Executes the tab switch.
	 *              Unfortunately this is very limited for browser security purposes,
	 *              and the only way to switch tabs consistently with JS is with an alert().
	 *              As an alternative the user can choose to execute a soft tab switch, where
	 *              the document.title changes in an obnoxious way so as to make it obvious which tab
	 *              the user needs to select in their browser (Not yet implemented).
	 **/
	performSwitch : function() {
		alert(SWITCH_MESSAGE);
	},

	/**
	 * @description Requests all other tabs reset their title to what it should be based on the current state
	 **/
	requestTabReset : function() {
		d3vSync.send({ 
			type : REQUEST_TAB_RESET
		});
	},
	
	/**
	 * @description Requests all other tabs sync to the state of the settings
	 **/
	requestSettingSync : function() {
		var needsSync = $('#synchronize-settings').is(':checked');
		
		if(needsSync) {
			d3vSync.send({ 
				type : REQUEST_SETTING_SYNC
			});		
		}	
	},
	
	/**
	 * @description Gets the status of the current ASIDE instance, e.g. what mode its in and what file is open.
	 * @return      the current instance's status
	 **/
	getInstanceStatus : function() {
		var status = {};
		
		if(d3vCode.isActive()) {
			status.mode = CODE_SECTION;
			status.file = currentFile || lastAction || '';
			status.full = d3vCode.getCompleteFilename() || '';
			status.modified = fileModified;
			
			if(status.file && currentZippedFile) {
				status.zipFile = currentZippedFile;
			}
		} else if(d3vTest.isActive()) {
			status.mode = TEST_SECTION;
		} else if(d3vData.isActive()) {
			status.mode  = DATA_SECTION;
			status.query = $('input#query-source').val() || '';
		} else {
			status.mode = PUSH_SECTION;
		}
		
		status.type = d3vSync.getInstanceStatusType();
		status.instance = aside.instance;
		
		return status;
	},
	
	/**
	 * @description Determines if a messages should be thrown out
	 * @param       content      - the message to validate
	 * @return      true when the message should be thrown out, false when it should be read
	 **/
	validateMessage : function(content) {
		if(!d3vUtil.isAsideInitialized()) {
			return true;
		}

		if(content.handler === aside.instance) {
			return true;
		}
		
		if(content.to !== null && content.to !== aside.instance) {
			return true;
		}
		
		if(content.from === aside.instance) {
			return true;
		}
		
		return false;
	},
	
	/**
	 * @description Requests that other tabs update their state
	 **/
	sendTabUpdateRequest : function() {
		d3vSync.send({ type : REQUEST_TAB_UPDATE });
	},

	/**
	 * @description Deletes tab status stored from local storage
	 * @param       requestId - used to identify which local storage to target
	 **/
	clearTabStatus : function(requestId) {
	    var toRemove = [];
	    
	    for(var prop in localStorage) {
	        if(localStorage.hasOwnProperty(prop) && prop.indexOf(STATUS_PREFIX + requestId) === 0) {
	            toRemove.push(prop);
	        }
	    }
	    
	    for(var i = 0, end = toRemove.length; i < end; i++) {
	        delete localStorage[toRemove[i]];
	    }
	},
		
	/**
	 * @description Reads tab status from local storage
	 * @param       requestId - used to identify which local storage to target
	 * return       list of tab statuses, excluding the current tab
	 **/
	readTabStatus : function(requestId) {
	    var tabStatus = [];
	    
	    tabStatus.push(d3vSync.getInstanceStatus());

	    for(var prop in localStorage) {
	        if(localStorage.hasOwnProperty(prop) && prop.indexOf(STATUS_PREFIX + requestId) === 0) {
	            tabStatus.push(JSON.parse(localStorage[prop]));
	        }
	    }
	    
	    return tabStatus;
	},
	
	/**
	 * @description Send a status request
	 * @param       callback - handler for the status request
	 **/
	sendStatusRequest : function(callback) {
		var requestId = d3vUtil.getRandomString(10);
		d3vSync.clearTabStatus(requestId);
		
		d3vSync.send({ 
			type  : REQUEST_STATUS,
			id    : requestId
		});
		
		setTimeout(function() {
			var tabStatus = d3vSync.readTabStatus(requestId);
			d3vSync.clearTabStatus('');
			callback(tabStatus);
		}, STATUS_TIMEOUT);	
	},
	
	/**
	 * @description Sends a request to other aside instances to add a new file to their typeaheads.
	 * @param       action     - the last action taken (e.g. 'Open ' + full file name)
	 * @param       namespaced - namespaced version of filename
	 * @param       extension  - the new file's extension
	 **/
	sendAddFileRequest : function(action, namespaced, extension) {
		d3vSync.send({ 
			type    : REQUEST_ADD_FILE, 
			payload : {
				action     : action,
				namespaced : namespaced, 
				extension  : extension
			}
		});
	},
	
	/**
	 * @description Sends a request to other aside instances to remove a file from their typeaheads.
	 * @param       action - the action to remove from the typeahead
	 **/
	sendRemoveFileRequest : function(action) {
		d3vSync.send({ 
			type    : REQUEST_REMOVE_FILE, 
			payload : action
		});
	},
	
	/** 
	 * @description Removes the current tab from the tab status local storage
	 **/
	removeCurrentInstanceStatus : function() {
		if(aside && aside.org && aside.org.orgId) {
			var key = INSTANCE_STATUS + aside.org.orgId;
			
			if(localStorage[key] && localStorage[key].length) {
				var tabStorage = JSON.parse(localStorage[key]); 
				
				if(tabStorage[aside.instance]) {
					delete tabStorage[aside.instance];
				}
			}	
		}
	},
	
	/**
	 * @description Initializes tab visibility (focus) handlers
	 **/
	initializeVisibilityTracking : function() {
		var hidden;
		var state;
		var visibilityChange; 
		
		if (typeof document.hidden !== "undefined") {
			hidden = "hidden";
			visibilityChange = "visibilitychange";
			browserVisibilityState = "visibilityState";
		} else if (typeof document.mozHidden !== "undefined") {
			hidden = "mozHidden";
			visibilityChange = "mozvisibilitychange";
			browserVisibilityState = "mozVisibilityState";
		} else if (typeof document.msHidden !== "undefined") {
			hidden = "msHidden";
			visibilityChange = "msvisibilitychange";
			browserVisibilityState = "msVisibilityState";
		} else if (typeof document.webkitHidden !== "undefined") {
			hidden = "webkitHidden";
			visibilityChange = "webkitvisibilitychange";
			browserVisibilityState = "webkitVisibilityState";
		}
		
		document.addEventListener(visibilityChange, function() {
			d3vSync.handleVisibilityState(document[browserVisibilityState]);
		}, false);
		
		d3vSync.handleVisibilityState(document[browserVisibilityState]);
	},
	
	/**
	 * @description visibility state change handler
	 * @param       visibilityState - either "hidden" or "visible"
	 **/
	handleVisibilityState : function(visibilityState) {
		if(visibilityState && visibilityState.length) {
			if(visibilityState === VISIBILITY_VISIBLE) {
				d3vSync.handleVisibilityStateVisible();
			} else if(visibilityState === VISBILITY_HIDDEN) {
				d3vSync.handleVisibilityStateHidden();
			}
		}
	},
	
	/**
	 * @description Handler when visibilty change event occurs for "visible" state
	 **/
	handleVisibilityStateVisible : function() {
		d3vUtil.setTabName();
		d3vSync.killTabRefreshInterval();
		d3vSync.startTabRefreshInterval();
	},
	
	/**
	 * @description Handler when visibilty change event occurs for "hidden" state
	 **/
	handleVisibilityStateHidden : function() {
		d3vSync.killTabRefreshInterval();
	},	
	
	/**
	 * @description Starts the tab refresher
	 **/
	startTabRefreshInterval : function() {
		d3vSync.refreshTabState();
		
		browserVisibilityId = setInterval(function() {
			d3vSync.refreshTabState();
		}, VISIBILITY_TIMEOUT);
	},
	
	/**
	 * @description Stops the tab refresher
	 **/
	killTabRefreshInterval : function() {
		if(browserVisibilityId) {
			clearInterval(browserVisibilityId);
		}
	},
	
	/**
	 * @description Updates the tab panel with the state of all aside instances
	 **/
	refreshTabState : function() {
		if(!d3vUtil.isAsideInitialized()) {
			return;
		}
		
		d3vSync.sendStatusRequest(function(result) {
			if(result && result.length) {
				var uniqueStatus  = {};
				var tabPanel      = {};
				var fileSplit;
				
				for(var i = 0, end = result.length; i < end; i++) {
					uniqueStatus[result[i].instance] = result[i];
				}
				
				var sortable = [];
				for(var prop in uniqueStatus) {
					if(uniqueStatus.hasOwnProperty(prop)) {
						if(uniqueStatus[prop].file && uniqueStatus[prop].file.length) {
							fileSplit = uniqueStatus[prop].file.split('.');
							uniqueStatus[prop].file = fileSplit[0];
							
							if(fileSplit.length > 1) {
								uniqueStatus[prop].ext = fileSplit[1];
							}
						} else {
							uniqueStatus[prop].file = uniqueStatus[prop].mode || '';
						}
						
						uniqueStatus[prop].isCurrent = prop === aside.instance;
						
						if(!uniqueStatus[prop].isCurrent) {
							sortable.push([uniqueStatus[prop].file.toLowerCase() + '.' + prop, uniqueStatus[prop]]);
						}
					}
				}
				
				sortable.sort();
				tabPanel.items = sortable;
				
				if(d3vSync.renderTabPanel(tabPanel)) {
					d3vSync.handleTabSwitch();
				}
			}
		});		
	},
	
	/**
	 * @description Switch to another tab via the tab panel
	 **/
	handleTabSwitch : function() {
		$('.instance-file').click(function() {
			var $that = $(this);
			
			if($that.hasClass('current-tab')) {
				return;
			}
			
			var isAlertStyle  = true;
			var $switchOption = $('#synchronize-switch');
			
			if($switchOption && $switchOption.length) {
				isAlertStyle = $switchOption.val() === 'alert';
			}
			
			if(!isAlertStyle) {
				d3vSync.requestTabReset();
			}
			
			d3vSync.send({ 
				type : (isAlertStyle ? REQUEST_SWITCH : REQUEST_TAB_FLASH), 
			    to   : $that.attr('instance')
			});
		});	
	},
	
	/**
	 * @description Renders out the tab panel
	 * @param       tabPanel - tab panel info
	 **/
	renderTabPanel : function(tabPanel) {
		var markup = '';
		var needsRefresh = true;
		
		if(tabPanel.items && tabPanel.items.length) {
			var currentKey  = d3vSync.getCurrentTabState();
			var incomingKey = d3vSync.getIncomingTabState(tabPanel.items);
			needsRefresh    = currentKey !== incomingKey;
			
			if(needsRefresh) {
				markup += d3vSync.getTabPanelTypeMarkup(tabPanel.items);	
			}
		}
		
		if(needsRefresh) {
			$('div#instance-tabs').html(markup);  	    	
		}
		
		return needsRefresh;
	},
	
	/**
	 * @description Builds and returns the markup for a section of the tab panel of a given type
	 * @param       tabs - other ASIDE tabs to display
	 * @return      markup to display on the tab panel
	 **/
	getTabPanelTypeMarkup : function(tabs) {
		var body = '';
		var info;
		var extraClasses;
		var completeFilename = '';
		
		for(var i = 0, end = tabs.length; i < end; i++) {
			info = tabs[i][1];
			
			if(info.isCurrent) {
				extraClasses = ' current-tab'
			} else {
				extraClasses = '';
			}
			
			if(i < 9) {
				info.title = 'shortcut: ctrl+' + (i+1);
			}
			
			completeFilename = (info.modified ? '*' : '') + 
			                   info.file + (info.ext ? '.' + info.ext : ' section') +
			                   (info.zipFile ? ' [' + info.zipFile + ']' : '');
			
			body += '<div class="instance-file unselectable ' + extraClasses + '" instance="' + 
			        info.instance + '" title="' + info.title + '" extension="' + 
			        (info.ext || '') + '">' + completeFilename + '</div>';
		}
		
		return body;
	},
	
	/**
	 * @description Generates a string representing the current tab state
	 * @return      string representing the current tab state
	 **/
	getCurrentTabState : function() {
		var descriptor = '';
		
		$('#instance-tabs').find('.instance-file').each(function(idx, ele) {
		    descriptor += $(ele).text() + $(ele).attr('instance');
		});
		
		return descriptor;
	},
	
	/**
	 * @description Generates a string representing the incoming tab state
	 * @return      string representing the incoming tab state
	 **/
	getIncomingTabState : function(items) {
		var descriptor = '';
		
		for(var i = 0, end = items.length; i < end; i++) {
			descriptor += (items[i][1].modified ? '*' : '') + 
			              items[i][1].file + 
			              (items[i][1].zipFile ? ' [' + items[i][1].zipFile + ']' : '') + 
			              items[i][1].instance;
		}
		
		return descriptor;
	},
	
	/**
	 * @description Uses diff-match-patch algorithm to strings together.
	 * @param       originalCode - the original version of the code
	 * @param       modifiedCode - the original version modified
	 * @param       serverCode   - the original version modified in a different way than the modifiedCode
	 * @return      the code merged together
	 **/
	diffMatchPatch : function(originalCode, modifiedCode, serverCode) {
		var dmp  = new diff_match_patch();
		var diff = dmp.diff_main(originalCode, modifiedCode, true);
		
		//if (diff.length > 2) {
		//	dmp.diff_cleanupEfficiency(diff);
		//}
		
		var patchList = dmp.patch_make(originalCode, modifiedCode, diff);
		var patchText = dmp.patch_toText(patchList);
	  	var patches   = dmp.patch_fromText(patchText);
	  
		return dmp.patch_apply(patches, serverCode);
	},
	
	/**
	 * @description Computes the difference between two strings
	 * @param       baseVersion - original string to consider
	 * @param       modifiedVersion - modified version of base version
	 * @return      difference result information
	 **/
	computeDiff : function(baseVersion, modifiedVersion) {
		var dmp = new diff_match_patch();
		var diffResult = dmp.diff_main(baseVersion, modifiedVersion);
		dmp.diff_cleanupSemantic(diffResult);
		return diffResult;
	},	
	
	/**
	 * @description Verifies success of a diff match patch
	 * @param       dmpResult - result of a diff match patch
	 * return       true when diff match patch was successful, else false
	 **/
	verifyDMP : function(dmpResult) {
		if(dmpResult && dmpResult.length) {
			var matches = dmpResult[1];
			
			for(var i = 0, end = matches.length; i < end; i++) {
				if(!matches[i]) {
					return false;
				}
			}
			
			return true;
		}
		
		return false;
	},

	/**
	 * @description Shows a user the server version in the diff editor
	 **/	
	stageMerge : function() {
		//open second editor -- if it isnt open
		d3vUtil.showDiffEditor();
		d3vUtil.sizeEditor();
		
		//put server text in it
		d3vUtil.alert('save conflict detected, getting server version...');
		
		var cfs = currentFile.split('.');
		var ext = cfs[1].toLowerCase();
		var fromType = ext.indexOf('static') === -1 ? 'apex' : 'static';
		var bodyField = 'Body';
		
		if(ext == "page" || ext == "component") {
			bodyField = "Markup";
		} else if(ext === "cls") {
			ext = "class";
		} else if(ext.indexOf('aura-') !== -1) {
			ext = 'aura';
			fromType = d3vCode.getAuraType(d3vCode.getCurrentExtension()).type;
			bodyField = 'Source';
		}
		
		d3vCode.getCurrentFile(bodyField, fromType, ext, function(callbackData) {
			saving = false;
			
	    	if(callbackData === FILE_NOT_FOUND_ERROR) {
	    		d3vUtil.alert('failed to resolve conflict', { scheme : 'negative'});
	    		return;
	    	}
	    	
	        var result = JSON.parse(callbackData);
	        var serverCode = result[bodyField];
	        
	        d3vCode.setSaveKey(result);
	        
	        if(serverCode && serverCode.length) {
	        	serverCode = d3vUtil.decodeUtf8(atob(serverCode));
	        	rightEditor.getSession().setValue(serverCode);
	        	d3vUtil.alert('displaying conflict difference');
	        }	        
		});		
	},

	/**
	 * @description Attempts to merge simple conflicts automatically using diff match patch
	 **/
	resolveConflict : function() {
		d3vUtil.alert('save conflict detected, attempting merge...');
		
		var cfs = currentFile.split('.');
		var ext = cfs[1].toLowerCase();
		var fromType = ext.indexOf('static') === -1 ? 'apex' : 'static';
		var bodyField = 'Body';
		
		if(ext == "page" || ext == "component") {
			bodyField = "Markup";
		} else if(ext === "cls") {
			ext = "class";
		}
		
		d3vCode.getCurrentFile(bodyField, fromType, ext, function(callbackData) {
	    	if(callbackData === FILE_NOT_FOUND_ERROR) {
	    		d3vUtil.alert('failed to resolve conflict', { scheme : 'negative'});
	    		return;
	    	}
	    	
	        var result = JSON.parse(callbackData);
	        var serverCode = result[bodyField];
	        
	        if(serverCode && serverCode.length) {
	        	serverCode = d3vUtil.decodeUtf8(atob(serverCode));
	        	var cursorPositionMarker = POSITION_MARKER + d3vUtil.getRandomString(8);
	        	editor.insert(cursorPositionMarker);
	        	
	        	var modifiedCode = editor.getSession().getValue();
	        	var dmpResult = d3vSync.diffMatchPatch(lastFile, modifiedCode, serverCode);
	        	
	        	if(d3vSync.verifyDMP(dmpResult) && dmpResult[0] && dmpResult[0].length) {
	        		var mergeMsg = 'merged changes from  ';
			        if(result.LastModifiedBy && result.LastModifiedBy.Name) {
			        	mergeMsg += result.LastModifiedBy.Name + ' successfully, saving...';
			        }
	        		
	        		d3vUtil.alert(mergeMsg);
					result = d3vCode.setFileInformation(fromType, ext, result);	
					lastFile = dmpResult[0];
					editor.getSession().setValue(lastFile);
					d3vSync.restoreCursorPosition(cursorPositionMarker);
					var differences = d3vSync.computeDiff(modifiedCode, lastFile);
					
			        editor.getSession().setAnnotations([]);
			        d3vCode.hideCoverageHighlights();
			        
			        if(lastFile) {
			        	d3vArchive.write(TABLE_CODE_HISTORY, d3vCode.getCompleteFilename(), lastFile);
			        }
			        
					d3vUtil.resetEditorChange();
			        d3vCode.setForeignManaged();
			        d3vCode.updateFooterCoverage();
			        d3vCode.setVariableMap();
			        d3vCode.determineSaveType(true);			
	        	} else {
	        		var resolveType = $('input[name="resolve-conflicts"]:checked').val();
	        		d3vSync.restoreCursorPosition(cursorPositionMarker);	
	        		
	        		if(resolveType === 'auto-man') {
		        		d3vUtil.alert('failed to resolve conflict, reverting to manual merge', { scheme : 'negative'});
		        		d3vSync.stageMerge();      		
	        		} else {
		        		d3vUtil.alert('failed to resolve conflict', { scheme : 'negative'});
		        		saving = false;        		
	        		}
	        	}
	        }	        
		});	
	},
	
	/**
	 * @description Restores cursor position to the cursor position marker location
	 * @param       cursorPositionMarker - string which identifies cursor position
	 **/
	restoreCursorPosition : function(cursorPositionMarker) {
		editor.find(cursorPositionMarker);
		editor.insert('');
		editor.session.getUndoManager().reset();	
	},
	
	/**
	 * @description Gets the display type for the current instance
	 * @return      type of what is being viewed in the current instance of aside
	 **/	
	getInstanceStatusType : function() {
		var currentType = '';
		
		if(d3vCode.isActive()) {
			if(lastAction && lastAction.length) {
				if(lastAction.indexOf('.cls') !== -1 || lastAction === 'New Apex Class' || lastAction === 'New Test Class') {
					currentType = 'Classes';
				} else if(lastAction.indexOf('.page') !== -1 || lastAction === 'New Visualforce Page') {
					currentType = 'Pages';
				} else if(lastAction.indexOf('.component') !== -1 || lastAction === 'New Visualforce Component') {
					currentType = 'Components';
				} else if(lastAction.indexOf('.trigger') !== -1 || lastAction === 'New Trigger') {
					currentType = 'Triggers';
				} else if(lastAction.indexOf('.resource') !== -1 || lastAction === 'New Static Resource') {
					currentType = 'Resources';
				} else if(lastAction.indexOf('.object') !== -1 || lastAction === 'New Custom Object') {
					currentType = 'Objects';
				} else if(lastAction.indexOf('.xml') !== -1 || lastAction === 'New Package XML') {
					currentType = 'XML';
				} else if(lastAction.indexOf('.theme') !== -1 || lastAction === 'New UI Theme') {
					currentType = 'Themes';
				}
			} else {
				currentType = 'Sections';
			}
		} else {
			currentType = 'Sections';
		}
		
		return currentType;
	}

};