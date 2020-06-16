/*
 @description local code history implementation
 @date 2.26.2013
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vArchive = {

   /**
	* @description Adds an entry to the recent command history
	* @param	   recentCommand - the command to add
	* @return	   true on successful add, false on failure
	**/
	addRecentCommand : function(command) {
		if(command.indexOf('.') === -1) {
			return false;
		}
		
		var orgId  = d3vUtil.getOrgId();
	 	var recent = localStorage[RECENT_COMMANDS + orgId];
	 	
	 	if(recent && recent.indexOf(command) !== -1) {
	 		recent = recent.replace(command + ';', '');
	 		recent += command + ';';
	 		localStorage[RECENT_COMMANDS + orgId] = recent;
	 	} else {
		 	if(recent && recent.indexOf(';') !== -1) {
			 	var recents = recent.split(';');
			 	
			 	if(recents.length - 1 >= MAX_RECENTS) {
			 		recent = '';
			 		for(var i = 1, endI = recents.length - 1; i < endI; i++) {
			 			recent += recents[i] + ';';
			 		}
			 		
			 		localStorage[RECENT_COMMANDS + orgId] = recent;
			 	}	 	
		 	} else if(!recent || (recent && recent.indexOf(';') === -1)) {
		 		localStorage[RECENT_COMMANDS + orgId] = '';
		 	}
		 	
		 	localStorage[RECENT_COMMANDS + orgId] += command + ';';	 	
	 	}
	 	
	 	return true;
	},

   /**
	* @description Saves a one-off backup copy to idb.
	**/	
	saveEmergencyCopy : function() {
		var currExt = d3vCode.getCurrentExtension();
		if(currentFile && currExt !== TYPE_RESOURCE && currExt !== TYPE_OBJECT && aside && aside.org && aside.org.orgId) {
			var completeName = d3vCode.getCompleteFilename();
			localStorage[BACKUP_EXT + aside.org.orgId + completeName] = 'true';
			d3vArchive.write(TABLE_CODE_BACKUP, completeName + BACKUP_EXT, editor.getSession().getValue());
		}
	},
	
	/**
	 * @description Removes the local storage flag that tells aside to check local storage for a crash version
	 * @param       completeName - the complete name of the file to check, including extension and namespace
	 **/
	removeEmergencyCopyReminder : function(completeName) {
		//I dont think this line ever does anything, but its also harmless.
		delete localStorage[BACKUP_EXT + completeName];
		
		if(aside && aside.org && aside.org.orgId) {
			delete localStorage[BACKUP_EXT + aside.org.orgId + completeName];
		}	
	},
	
   /**
	* @description Gets the recent command history
	**/
	getRecentCommands : function() {
		var orgId  = d3vUtil.getOrgId();
		
		if(localStorage[RECENT_COMMANDS + orgId] && localStorage[RECENT_COMMANDS + orgId].indexOf(';') !== -1) {
		 	var recents    = localStorage[RECENT_COMMANDS + orgId].split(';');
		 	recents.length = recents.length - 1;
		 	return recents;		
		}
		
		return [];
	},	

   /**
	* @description Deletes a recent command from history
	* @param       toDelete - recent files to delete
	**/
	deleteRecentCommands : function(toDelete) {
		var recents = d3vArchive.getRecentCommands();
		if(recents.length) {
			var updated = [];
			for(var i = 0; i < recents.length; i++) {
				if($.inArray(recents[i], toDelete) === -1) {
					updated.push(recents[i]);
				}
			}
			
			if(updated.length) {
				localStorage[RECENT_COMMANDS + d3vUtil.getOrgId()] = updated.join(';') + ';';
			}
		}
	},	
	
	/**
	 * @description opens the local history dialog and builds the local history table
	 **/
	openLocalHistoryDialog : function() {
		if((currentFile && currentFile.length) || lastAction === 'Execute Anonymous') {
		    var gpOpen = d3vPopups.showGlobalPanel('Local History', '#local-history');
		    
		    if(gpOpen) {
				d3vArchive.refreshLocalHistoryDialog();
			}
		} else {
			d3vUtil.alert('open a file before trying to view history');
		}
	},
	
	/**
	 * @description Refresh the local history dialog with the newest entries.
	 * @param       inform - let the user know about the refresh operation
	 **/
	refreshLocalHistoryDialog : function(inform) {
		if(inform) {
			d3vUtil.alert('history refreshed successfully', { scheme : 'positive' });
		}
	
		if($('#local-history').is(':visible')) {
			$('div#history-table').empty();
		    var completeFilename;
		    
		    if(lastAction === 'Execute Anonymous') {
		    	completeFilename = 'ExecuteAnonymous';
		    } else {
		    	completeFilename = d3vCode.getCompleteFilename();
		    }
		    
		    d3vArchive.readFiles(completeFilename + BACKUP_EXT, d3vArchive.addRowToHistoryDialog);
		    d3vArchive.readFiles(completeFilename, d3vArchive.addRowToHistoryDialog);		
		}		
	},

	/**
	 * @description adds a row to the local history dialog
	 **/	
	addRowToHistoryDialog : function(row, idx) {
		if(row.org && aside && aside.org && aside.org.orgId && row.org === aside.org.orgId) {
			var isNotBackup = row.name.indexOf(BACKUP_EXT) === -1;
			var displayName = isNotBackup ? 'Save Backup' : 'Crash Backup';
			var odd = idx % 2 === 0 ? 'd3v-table-row-odd' : '';
			var backupStyle = isNotBackup ? 'green-font' : 'red-font';
			
	    	var markup = '<div filename="'  + row.name 
	    	           +      '" version="' + row.id
	    	           +        '" class="d3v-table-row previous-version ' + odd + '">' 
	    	           +      '<span class="history-timestamp">' 
	    	           +          d3vUtil.salesforceDateMadeReadable(new Date(row.timestamp).toISOString(), false)
	    	           +      '</span>'	    	           
	    	           +      '<span class="history-fn ' + backupStyle + '">'
	    	           +          displayName
	    	           +      '</span>'	    	           
	    	           +  '</div>';
	    	           
			$('div#history-table').append(markup);
			$('div.previous-version').unbind().click(d3vArchive.handleHistoryRowClick);
		}
	},
	
	/**
	 * @description Handles row click in the file history dialog
	 **/
	handleHistoryRowClick : function() {
		var $that = $(this);
		var openSelectVal = $('#lh-open-select').val();
		
		if(openSelectVal === 'aside' || openSelectVal === 'left') {
			d3vArchive.diffArchive($that);
		} else {
			d3vArchive.downloadArchive($that);
		}
	},

	/**
	 * @description Show a diff of the current file and the version in local history
	 **/	
	diffArchive : function($that) {
		var filename = $that.attr('filename');
		var tableName = filename.substring(filename.length - BACKUP_EXT.length, filename.length) === BACKUP_EXT ?
		                TABLE_CODE_BACKUP : TABLE_CODE_HISTORY;
		d3vArchive.readFile(parseInt($that.attr('version')), tableName, d3vArchive.diffArchiveVersion);	
	},

	/**
	 * @description display diff of file read from indexeddb
	 * @param		event - result of d3vArchive.readFile
	 **/		
	diffArchiveVersion : function(event) {
		d3vUtil.resizeWindow();
		
		var openSelectVal = $('#lh-open-select').val();
		
		if(openSelectVal === 'aside') {
			d3vUtil.showDiffEditor();
			d3vUtil.dragResizeEditors();		
			rightEditor.getSession().setValue(event.target.result.data);
		} else {
			editor.getSession().setValue(event.target.result.data);
		}
	},	
	
	/**
	 * @description click handler for local history table rows.
	 *              download a previous version of the specified file
	 **/
	downloadArchive : function($that) {
		var filename = $that.attr('filename');
		var tableName = filename.substring(filename.length - BACKUP_EXT.length, filename.length) === BACKUP_EXT ?
		                TABLE_CODE_BACKUP : TABLE_CODE_HISTORY;
		d3vArchive.readFile(parseInt($that.attr('version')), tableName, d3vArchive.downloadArchiveVersion);
	},

	/**
	 * @description click handler for local history table rows.
	 *              download a previous version of the specified file
	 * @param		event - result of d3vArchive.readFile
	 **/	
	downloadArchiveVersion : function(event) {
		var archive = event.target.result;
		d3vUtil.alert('downloading archive…');
		saveAs(new Blob([archive.data], {type: "text/plain;charset=" + document.characterSet}), archive.name);		
	},
	
	/**
	 * @description formats a datetime in milliseconds since epoch
	 * @param		timestamp - milliseconds since epoch
	 * @return		formatted date time.
	 **/
	formatEpochTime : function(timestamp) {
		timestamp    = parseInt(timestamp);
		var toFormat = new Date(timestamp);
		return toFormat.toLocaleDateString() + ' ' + toFormat.toLocaleTimeString();
	},

	/**
	 * @description initializes the indexed db used for archival
	 **/		
	initializeArchive : function() {
		if(window.indexedDB !== undefined) {
			indexedDB = window.indexedDB;
		} else if(window.webkitIndexedDB !== undefined) {
			indexedDB = window.webkitIndexedDB;
		} else if(window.mozIndexedDB !== undefined) {
			indexedDB = window.mozIndexedDB;
		}
		
		if(!indexedDB) {
			return;
		}
		
		IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
		IDBKeyRange    = window.IDBKeyRange    || window.webkitIDBKeyRange;
		openRequest    = indexedDB.open(STORAGE_PREFIX + DATABASE_NAME, 11);
		
		openRequest.onupgradeneeded = function(evt) {
			var tempDB = evt.target.result;
			d3vArchive.initializeTable(tempDB, TABLE_CODE_HISTORY);
			d3vArchive.initializeTable(tempDB, TABLE_SOQL);
			d3vArchive.initializeTable(tempDB, TABLE_TEST_FILTER);
			d3vArchive.initializeTable(tempDB, TABLE_CODE_BACKUP);
			d3vArchive.initializeTable(tempDB, TABLE_PUSH_FILTERS);
		};
		
		openRequest.onsuccess = function(evt) {
			db = evt.target.result;
			
			db.onerror = function(e) {
				e.preventDefault(); //Fixes Firefox ConstraintError bug
			};			
		};
		
		openRequest.onerror = function(evt) {
			evt.preventDefault();
			d3vArchive.handleIDBError(evt);
		};
	},
	
	/**
	 * @description Generic IDB error handler.  Tells user shit hit the fan and kicks 'em out of aside.
	 * @param       evt (optional) - additional info about this error, logged to console
	 **/
	handleIDBError : function(evt) {
		if(evt) {
			console.log('Encountered Indexed Database Error', evt);
		}
		
		d3vUtil.kickoutUser('An error has occurred, ASIDE.IO is unable to access your browser\'s local storage.  ' +
		                    'To resolve this error, you will need to alter your browser\'s privacy settings ' +
		                    'such that cookies, local storage, and indexed database are all enabled.');
	},
	
	/**
	 * @description Checks to see if d3v's indexed db contains the table specified by tableName,
	 *              if it doesnt, the table is created.
	 * @param		tempDB    - temporary db instance
	 * @param		tableName - name of table to create
	 **/
	initializeTable : function(tempDB, tableName) {
		if(!tempDB.objectStoreNames.contains(tableName)) {
			var objStore = tempDB.createObjectStore(tableName, {keyPath: "id", autoIncrement: true});
			objStore.createIndex(INDEX_NAME, INDEX_NAME, {unique: (tableName !== TABLE_CODE_HISTORY && tableName !== TABLE_CODE_BACKUP)})
		}
	},
	
	/**
	 * @description gets a table ready for transaction
	 * @param       tableName       - name of table to retrieve
	 * @param       transactionType - transaction type e.g. readonly|???
	 **/
	getTable : function(tableName, transactionType) {
		if(db) {
			ServerAction.setGlobalDebugInfo('getTable() - (' + tableName + ', ' + transactionType + ', ' + printStackTrace().join('\n') + ')');
			var dbTrans = db.transaction([tableName], transactionType).objectStore(tableName);
			ServerAction.resetGlobalDebugInfo();
			return dbTrans;
		} else {
			d3vArchive.handleIDBError();
		}
	},

	/**
	 * @description deletes all rows from a table
	 * @param		tableName - name of table to delete from
	 * @param       callback  - (optional) success callback
	 **/	
	deleteAll : function(tableName, callback) {
		if(!indexedDB) {
			return;
		}
			
		var table  = d3vArchive.getTable(tableName, TRANSACTION_WRITE);
		var request = table.clear();
		
		request.onsuccess = function(evt) {
			d3vUtil.alert('delete successful!', { scheme : 'positive'});
			
			if(callback) {
				callback();
			}
		};
		
		request.onerror = function(evt) {
			d3vUtil.alert('delete failed', { scheme : 'negative'});
			d3vPopups.displayMessage('Delete Failure', 'A delete failure has occured (Table: ' + tableName + ')', evt);	
		};		
	},

	/**
	 * @description deletes the oldest few number of records from a table
	 * @param		tableName - name of table to delete from
	 * @param       numToKeep - the number of records in the table that should remain after this method call
	 **/		
	deleteOldest : function(tableName, numToKeep) {
		if(!indexedDB) {
			return;
		}
			
		var table = d3vArchive.getTable(tableName, TRANSACTION_WRITE);

		table.count().onsuccess = function(event) {
			var count = event.target.result;
			var numToDelete = count - numToKeep;
			
			if(numToDelete > 0) {
				var range = IDBKeyRange.lowerBound(0);
				table.openCursor(range).onsuccess = function(eve) {
				    var result = eve.target.result;
				    if(!!result == false)
				      return;
				    
				    if(numToDelete > 0) {
				    	table.delete(result.value.id);
				    } else {
				    	return;
				    }
				    
				    numToDelete--;
				    result.continue();				
				};
			}
		};
	},

	/**
	 * @description deletes the oldest few number of records from code history, by filename
	 * @param		filename  - the filename to delete records by
	 * @param       numToKeep - the number of records in the table (by filename) that should remain after this method call
	 **/		
	deleteOldestFiles : function(filename, numToKeep) {
		if(!indexedDB) {
			return;
		}

		var isBackup  = filename.substring(filename.length - BACKUP_EXT.length, filename.length) === BACKUP_EXT;
		var tableName = isBackup ? TABLE_CODE_BACKUP : TABLE_CODE_HISTORY;
			
		var table = d3vArchive.getTable(tableName, TRANSACTION_WRITE);
		var range = IDBKeyRange.only(filename);

		if(isBackup) {
			numToKeep = 1;
		}
		
		table.index("name").count(range).onsuccess = function(event) {
			var count = event.target.result;
			var numToDelete = count - numToKeep;
			
			if(numToDelete > 0) {
				range = IDBKeyRange.lowerBound(0);
				table.index("name").openCursor(range).onsuccess = function(event) {
					var cursor = event.target.result;
					
				  	if(cursor) {
				  		if(numToDelete > 0) {
				  			table.delete(cursor.value.id);
				  			numToDelete--;
				  		} else {
				  			return;
				  		}
				  		
					    cursor.continue();
				    }
				};
			}			
		};
	},

	/**
	 * @description writes a code version to local storage
	 * @param       tableName - name of table to write to
	 * @param       content   - the content of the file to store
	 * @param       name      - name of content
	 **/	
	write : function(tableName, name, content) {
		if(!indexedDB) {
			return;
		}
			
		var now = (new Date()).getTime();
	    var newData = { data: content, timestamp: now };
	    
	    if(aside && aside.org && aside.org.orgId) {
	    	newData.org = aside.org.orgId;
	    }
	    
	    
	    if(tableName === TABLE_CODE_HISTORY || tableName == TABLE_CODE_BACKUP) {
	    	newData[INDEX_NAME] = name;
	    	d3vArchive.writeIfDifferentThanPreviousVersion(name, newData);
	    } else {
	    	newData[INDEX_NAME] = content.toLowerCase().replace(/\s/g, '');
		    var table = d3vArchive.getTable(tableName, TRANSACTION_WRITE);
		    table.add(newData);
		    
		    var numToKeep = tableName === TABLE_SOQL ? 
		                    $('input#query-history-length').val() : 
		                    $('input#filter-history-length').val();
		                 
		    d3vArchive.deleteOldest(tableName, parseInt(numToKeep));
	    }
	},
	
	/**
	 * @description writes a push filter to IDB
	 * @param       filter - the filter to write
	 **/	
	writePushFilter : function(filter) {
		if(!indexedDB) {
			return;
		}
			
		filter.timestamp = (new Date()).getTime();
	    filter[INDEX_NAME] = filter.uniqueName;
	    var table = d3vArchive.getTable(TABLE_PUSH_FILTERS, TRANSACTION_WRITE);
	    table.add(filter);
	},	
	
	/**
	 * @description updates an existing filter
	 * @param       filter - new version of filter
	 **/	
	updatePushFilter : function(filter) {
		var range = IDBKeyRange.only(filter.uniqueName);

		d3vArchive.getTable(TABLE_PUSH_FILTERS, TRANSACTION_WRITE).index("name").openCursor(range).onsuccess = function(event) {
			var cursor  = event.target.result;
			filter.id   = cursor.value.id;
			filter.name = filter.uniqueName;
			cursor.update(filter);
		};	
	},	

	/**
	 * @description writes to the code history table if the new version is different than the previous
	 * @param       filename - filename to read previous version of
	 * @param       newData  - new data to write and compare against previous verison
	 **/	
	writeIfDifferentThanPreviousVersion : function(filename, newData) {
		if(!filename || !filename.length) {
			return;	
		}
	
		var tableName = filename.substring(filename.length - BACKUP_EXT.length, filename.length) === BACKUP_EXT ?
		                TABLE_CODE_BACKUP : TABLE_CODE_HISTORY;
		                
		var range = IDBKeyRange.only(filename);

		d3vArchive.getTable(tableName, TRANSACTION_READ).index("name").openCursor(range, 'prev').onsuccess = function(event) {
			var cursor = event.target.result;
			var table = d3vArchive.getTable(tableName, TRANSACTION_WRITE);
			
			if(!cursor || (cursor && newData.data !== cursor.value.data && (newData.timestamp - cursor.value.timestamp >= HISTORY_SAVE_BUFFER))) {
				table.add(newData);
				d3vArchive.deleteOldestFiles(filename, parseInt($('input#code-history-length').val()));
				d3vArchive.refreshLocalHistoryDialog();
			}
		};	
	},

	/**
	 * @description reads multiple versions from code history table
	 * @param       filename     - filename to read previous versions of
	 * @param       handleResult - what to do with each row
	 * @return      what was read
	 **/	
	readFiles : function(filename, handleResult) {
		if(!indexedDB) {
			return;
		}

		var tableName = filename.substring(filename.length - BACKUP_EXT.length, filename.length) === BACKUP_EXT ?
		                TABLE_CODE_BACKUP : TABLE_CODE_HISTORY;
			
		var range = IDBKeyRange.only(filename);
		var index = 0;
		d3vArchive.getTable(tableName, TRANSACTION_READ).index("name").openCursor(range, 'prev').onsuccess = function(event) {
			var cursor = event.target.result;
		  	if(cursor) {
		  		handleResult(cursor.value, index++);
			    cursor.continue();
		    }
		};	
	},

	/**
	 * @description reads a single file from code history table
	 * @param       id           - id of file to read
	 * @param		tableName    - name of table to read from
	 * @param       handleResult - what to do with the row
	 * @return      what was read
	 **/	
	readFile : function(id, tableName, handleResult) {
		if(!indexedDB) {
			return;
		}
		
		return d3vArchive.getTable(tableName, TRANSACTION_READ).get(id).onsuccess = function(event) {
			handleResult(event);
		};
	},

	/**
	 * @description reads all records from a particular table
	 * @param       tableName    - name of table to read from
	 * @param       handleResult - function, what to do with each record
	 * @param       handleComplete (optional) - callback for oncomplete
	 **/	
	readAll : function(tableName, handleResult, handleComplete) {
		if(!indexedDB) {
			return;
		}
		
		var table = d3vArchive.getTable(tableName, TRANSACTION_READ);
		
		if(table) {
			var keyRange      = IDBKeyRange.lowerBound(0);
			
			var cursorRequest;
			if(tableName === TABLE_PUSH_FILTERS) {
				cursorRequest = table.openCursor(keyRange, 'prev');
			} else {
				cursorRequest = table.openCursor(keyRange);
			}			
			
		    cursorRequest.onsuccess = function(e) {
		    	var result = e.target.result;
		    	if(!!result == false) {
		    		if(handleComplete) {
		    			handleComplete();
		    		}
		    		
		      		return;
		      	}
		
		    	handleResult(result.value);
		    	result.continue();
		  	};
		  	
		    cursorRequest.onerror = function(evt) {
		    	console.log('read all fail', evt);
		    }
	    }
	},
	
	/**
	 * @description Deletes a specific record from a table
	 * @param       tableName - the table which contains the record to delete
	 * @param       key       - the primary key which specifies the record to delete
	 **/
	delete : function(tableName, key) {
		var range = IDBKeyRange.only(key);

		d3vArchive.getTable(tableName, TRANSACTION_WRITE).index("name").openCursor(range).onsuccess = function(event) {
			var cursor  = event.target.result;
			cursor.delete();
		};	
	}
}