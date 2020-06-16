/*
 @description d3v data functionality
 @date 7.19.2012
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vData = {

	/**
	 * @description Returns true when the data section is active
	 * @return      true when active, false when not
	 **/
	isActive : function() {
		var $active = $('div#right span.mode-button.active');
		return $active && $active.length && $active.text() === 'data';
	},
	
	/**
	 * @description Open to the monitor deployments screen in salesforce
	 **/
	openInSalesforce : function() {
		d3vUtil.visitThroughFrontdoor('/home/showAllTabs.jsp');
	},	
	
	/**
	 * @description Clears all data in the soql history
	 **/
	clearSOQLHistory : function() {
		if(confirm('Are you sure you want to delete the query history?')) {
			d3vArchive.deleteAll(TABLE_SOQL, function() {
				setTimeout(d3vData.populateSOQLTypeahead, 300);
			});
		}
	},
	
	/**
	 * @description Opens the share query popup
	 **/
	shareQuery : function() {
		var currentQuery = $('input#query-source').val();
		
		if(lastSuccessfulQuery) {
			$('textarea#share-query').text(D3V_URL + '?query=' + encodeURIComponent(lastSuccessfulQuery));
			d3vPopups.showAnimatedModal('#share-query-popup');
		} else {
			d3vUtil.alert('you must execute the query before sharing it');
		}
	},
	
	/**
	 * @description Adds a new row to the database and grid.
	 * @param       args - from slickgrid onAddRow event
	 **/
	addNewData : function(args) {
	    var fieldName;
	    for(var prop in args.item) {
	        if(args.item.hasOwnProperty(prop)) {
	            fieldName = prop;
	        }
	    }
	
	    var newValue  = args.item[fieldName];
	    var objName   = d3vData.getObjectNameFromQuery(lastSuccessfulQuery);
	    
	    if(!objName) {
	    	d3vUtil.alert('must query before adding data', { scheme : 'negative' });
	    	return;
	    }
	    
	    var toInsert  = {};
	    toInsert[fieldName] = newValue;
	    
	    d3vUtil.alert('inserting record...');
	    ServerAction.createRecords([toInsert], objName, function(callbackData) {
	    	var response = eval('(' + callbackData + ')');

	    	if(response.Fault) {
	    		d3vUtil.alert('insert failed', { scheme : 'negative' });
	    	} else if(response.createResponse.result.success) {
	            var item = {"id": response.createResponse.result.id};
	            $.extend(item, args.item);
	            dataView.addItem(item);
	            d3vUtil.alert(item.id + ' has been added.', { scheme : 'positive' });
	            d3vPopups.closeErrorPopups();
	    	} else {
	    		d3vUtil.alert('insert failed', { scheme : 'negative' });
				d3vPopups.displayMessage('Insert Error', response.createResponse.result.errors.message, response);          		
	    	}	            
	    });            
	},
	
	/**
	 * @description Gets the object name from the query-source input.
	 * @param       query - the query to pull the object name from
	 * @return      object name as string
	 **/
	getObjectNameFromQuery : function(query) {
	    query          = query.toLowerCase();
		var soqlFrom   = 'from';
		var postFrom   = query.substring(query.lastIndexOf(soqlFrom) + soqlFrom.length, query.length);
		var queryMatch = postFrom.match(/\s+([\d\w]+)/i);
		
		if(queryMatch && queryMatch.length) {
			return queryMatch[1];
		}
	},

	/**
	 * @description Updates database data when data in the slickgrid is changed.
	 * @param       args - from slickgrid onCellChange event
	 **/
	updateData : function(args) {
	    columns       = grid.getColumns();
	    var recordId  = args.item.id;
	    var fieldName = columns[args.cell].id;
	    var newValue  = args.item[fieldName];
	    var objName   = d3vData.getObjectNameFromQuery(lastSuccessfulQuery);

	    if(!objName) {
	    	d3vUtil.alert('must query before updating data', { scheme : 'negative' });
	    	return;
	    }
		
		var toUpdate  = {
			id: recordId
		};
		
		toUpdate[fieldName] = newValue;
	
		d3vUtil.alert('updating ' + recordId + '...');
	    ServerAction.updateRecords([toUpdate], $.trim(objName), function(callbackData) {
	    	var response = eval('(' + callbackData + ')');
	    	
	    	if(response.Fault) {
	    		d3vUtil.alert(recordId + ' has failed to update', { scheme : 'negative' });
	    	} else if(response.updateResponse.result.success) {
	    		d3vUtil.alert(recordId + ' has updated successfully.', { scheme : 'positive' });
	    	} else {
	    		d3vUtil.alert(recordId + ' has failed to update', { scheme : 'negative' });
				d3vPopups.displayMessage('Update Error', response.updateResponse.result.errors.message, response);          		
	    	}
	    });     
	},
	
	/**
	 * @description Instead of requerying for data post delete to see the grid update,
	 * 				This function just drops the selected rows from the grid and tells
	 *				the grid to update.
	 * @param		selectedRows - the rows that were selected for deletion.
	 **/
	postDeletionGridUpdate : function(selectedRows) {
		while(selectedRows.length > 0) {
			var itemToDelete = selectedRows.pop();
			dataView.deleteItem(data[itemToDelete].id);
		}
		
		grid.invalidate();
		grid.render();
		grid.setSelectedRows([]);			
	},

	/**
	 * @description The javscript remoting call that actually deletes the data from the server.
	 * @param		records      - list of ids of records to delete
	 * @param       batchNumber  - current batch number being deleted
	 * @param       totalBatches - total number of batches that will be executed before the delete is complete
	 **/
	executeDelete : function(records, batchNumber, totalBatches) {
		ServerAction.deleteRecords(records, function(callbackData) {
			callbackData = JSON.parse(callbackData);
			var batchProgress = '(batch: ' + batchNumber + ' / ' + totalBatches + ')';
			
			if(callbackData.success) {
				d3vUtil.alert('Delete completed successfully ' + batchProgress, { scheme : 'positive' });
			} else {
				d3vUtil.alert('Delete failed ' + batchProgress, { scheme : 'negative' });
			}
		});			
	},
	
	/**
	 * @description Performs a deletion
	 * @param		selectedRows - the selected rows
	 * @param		objectName - sobject type that rows are representative of
	 **/
	performDeletion : function(selectedRows, objectName) {
		var toDelete = [];
		var totalBatches = parseInt(selectedRows.length / DELETE_PER_CALL) + 1;
		var currentBatch;
		
		for(var i = 0; i < selectedRows.length; i++) {
			currentBatch = parseInt(i / DELETE_PER_CALL);
			
			if(i % DELETE_PER_CALL == 0 && i != 0) {
				d3vUtil.alert('deleting records (batch: ' + currentBatch + ' / ' + totalBatches + ')...', {showTime : ALERT_DISPLAY_TIME_LONG});
				d3vData.executeDelete(toDelete, currentBatch, totalBatches);
				toDelete = [];
			}
		
			toDelete.push(data[selectedRows[i]].id);
		}
	
		d3vUtil.alert('deleting records (batch: ' + totalBatches + ' / ' + totalBatches + ')...', {showTime : ALERT_DISPLAY_TIME_LONG});
		d3vData.executeDelete(toDelete, totalBatches, totalBatches);			
	},
	
	/**
	 * @description Determines if the selected rows are deleteable
	 * @param		selectedRows - the selected rows
	 * @return		true when deleteable, false when not
	 **/
	areDeletable : function(selectedRows) {
		if(selectedRows.length == 0) {
			d3vUtil.alert('You must select data to delete.');
			return false;
		}
	
		var $qSource = $('input#query-source');
		var objectName = '';
	
		if(d3vData.validateQuery($qSource)) {
			return d3vData.getObjectNameFromQuery($qSource.val().toLowerCase());
		} else {
			d3vUtil.alert('I can\'t delete those records without a query in the input');
			return false;
		}			
	},
	
	/**
	 * @description Deletes the selected rows.
	 **/
	deleteSelectedRows : function() {
		var selectedRows = grid.getSelectedRows();
		var objectName   = d3vData.areDeletable(selectedRows);
	
		if(objectName && 
		   confirm('Are you sure you want to delete the ' + 
		            selectedRows.length + ' selected records?')) {
	
			d3vData.performDeletion(selectedRows, objectName);
			d3vData.postDeletionGridUpdate(selectedRows);
	
		}
	},

	
	/**
	 * @description Toggles the header filter row open and close.
	 **/
	toggleFilterRow : function() {
		var $headerRow = $('#myGrid div.slick-headerrow');
		if ($headerRow.is(":visible")) {
			$headerRow.hide();
			d3vUtil.sizeViewport();
		} else {
			$headerRow.show();
			d3vUtil.sizeViewport();
		}
	},
	
	/**
	 * @description Function that encompasess the entire export feature.
	 **/
	exportToCSV : function() {
		if(d3vData.verifyExport()) {
			d3vUtil.alert('export successful, downloading...', { scheme : 'positive' });
			saveAs(new Blob([d3vData.performExport()], {type: "text/csv;charset=" + document.characterSet}), 'export.csv');
		}
	},
	
	/**
	 * @description Generates a string csv of the data
	 * @return		csv as string
	 **/
	performExport : function() {
		var csv = '';
		var firstI = true;
		for(var i = 0; i < columns.length; i++) {
			if(columns[i].id != "_checkbox_selector") {
				if(firstI) {
					csv += columns[i].name;
				} else {
					csv += "," + columns[i].name;
				}
				
				firstI = false;
			} 
		}
		
		csv += '\n';
		
		for(var i = 0, endI = data.length; i < endI; i++) {
			var firstJ = true;
			for(var j = 0, endJ = columns.length; j < endJ; j++) {
				if(columns[j].id && data[i][columns[j].id] !== undefined && data[i][columns[j].id] !== null) {
					if(firstJ) {
						csv += ('' + data[i][columns[j].id]).replace(",","");
						firstJ = false;
					} else {
						csv += "," + ('' + data[i][columns[j].id]).replace(",","");
					}
				}
			}
			
			csv += '\n';
		}
		
		return csv;	
	},
	
	/**
	 * @description Verifies if there is anything to export.
	 * @return		true if there is, false if there is not.
	 **/
	verifyExport : function() {
		if(data.length === 0) {
			d3vUtil.alert('Nothing to export.');
			return false;
		}			
		
		return true;
	},

	/**
	 * @description Updates the filters on the header row.
	 * @param       cols - columns to update
	 * @param       colFilters - slickgrid column filters (optional)
	 **/
	updateHeaderRow : function(cols, colFilters) {
		cols = cols || columns;
		colFilters = colFilters || columnFilters;
		
		for (var i = 1; i < cols.length; i++) {
			if (cols[i].id !== "selector") {
				var header = grid.getHeaderRowColumn(cols[i].id);
				$(header).empty();
				$("<input type='text'>")
					.data("columnId", cols[i].id)
					.width($(header).width() - 4)
					.val(colFilters[cols[i].id])
					.appendTo(header);
			}
		}
	},
	
	/**
	 * @description Sets the dataView to have data based on the data variable.
	 **/	
	populateGrid : function() {
		d3vData.alterGridData(data);			
	},

	/**
	 * @description Updates the dataview with new data
	 * @param		newGridData - new data for the dataView
	 **/	
	alterGridData : function(newGridData) {
		dataView.beginUpdate();
		grid.setSelectedRows([]);
		dataView.setItems(newGridData);
		dataView.endUpdate();				
	},
	
	/**
	 * @description Sets the dataView to have no data.
	 **/
	emptyGrid : function() {
		d3vData.alterGridData([]);
	},
	
	/**
	 * @description Refreshes the data in the grid
	 **/
	refreshGrid : function() {
		d3vData.emptyGrid();
		d3vData.populateGrid();
		d3vData.updateHeaderRow();	
	},
	
	/**
	 * @description Opens the current grid row detail page in salesforce
	 **/
	openGridRowInSalesforce : function() {
		var $that = $(this);
		var rid   = $that.attr('rid');
		
		if(rid && rid.length) {
			d3vUtil.visitThroughFrontdoor('/' + $that.attr('rid'));
		}
	},

	/**
	 * @description Queries for the value of the selected cell in salesforce global search
	 **/	
	queryFieldInSalesforce : function() {
		var $that = $(this);
		var token = $that.attr('token');
		
		if(token && token.length) {
			d3vUtil.visitThroughFrontdoor('/_ui/search/ui/UnifiedSearchResults?str=' + token);
		}
	},	

	/**
	 * Initialize the data section
	 **/	
	initialize : function() {
	    var dropZone = document.getElementById('data-content');

	    dropZone.addEventListener('dragover', d3vUtil.preventDefaultBehavior, false);	
	    dropZone.addEventListener('dragleave', d3vUtil.preventDefaultBehavior, false);	    
	    dropZone.addEventListener('drop', d3vData.handleFileDrop, false);
	},
	
	/**
	 * @description Handler for test section file drops
	 * @param       evt - drop event
	 **/
	handleFileDrop : function(evt) {
		if(!d3vData.isActive()) {
			return;
		}
			
	    evt.stopPropagation();
	    evt.preventDefault();
	    	
		d3vUtil.alert('the data section does not support dropping files', { scheme : 'negative' });
	},	
	
	/**
	 * @description Flattens an objects parameters into sfdc style dot notation in lowercase
	 *              e.g. record.LastModifiedBy.Name to record['lastmodifiedby.name']
	 * @taken-from  http://stackoverflow.com/questions/963607/compressing-object-hierarchies-in-javascript
	 * @param		obj - to flatten
	 * @param		includeProptotype - true if you also want to traverse the chain
	 * @param		into - flatten obj into this
	 * @param		prefix - (optional) new property name prefic
	 * @return		obj + into
	 **/	
    flatten : function(obj, includePrototype, into, prefix) {
	    into = into || {};
	    prefix = prefix || "";
	
	    for (var k in obj) {
	        if (includePrototype || obj.hasOwnProperty(k)) {
	            var prop = obj[k];
	            if (prop && typeof prop === "object" &&
	                !(prop instanceof Date || prop instanceof RegExp)) {
	                d3vData.flatten(prop, includePrototype, into, prefix + k.toLowerCase() + ".");
	                delete into[prefix + k];
	            }
	            else {
	                into[prefix + k.toLowerCase()] = prop;
	                
	                if(prefix + k !== 'type') {
	                	delete into[prefix + k];
	                }
	            }
	        }
	    }
	
	    return into;
	},
	
	/**
	 * @description Unflattens a flattened object (e.g. obj['attr/name/hai'] => obj.attr.name.hai
	 * @param       table - object to unflatten
	 * @returns     unflattened object
	 * @taken-from  http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
	 **/
	unflatten : function(table) {
	    var result = {};
	
	    for (var path in table) {
	        var cursor = result, length = path.length, property = "", index = 0;
	
	        while (index < length) {
	            var char = path.charAt(index);
	
	            if (char === "[") {
	                var start = index + 1,
	                    end = path.indexOf("]", start),
	                    cursor = cursor[property] = cursor[property] || [],
	                    property = path.slice(start, end),
	                    index = end + 1;
	            } else {
	                var cursor = cursor[property] = cursor[property] || {},
	                    start = char === "/" ? index + 1 : index,
	                    bracket = path.indexOf("[", start),
	                    dot = path.indexOf("/", start);
	
	                if (bracket < 0 && dot < 0) var end = index = length;
	                else if (bracket < 0) var end = index = dot;
	                else if (dot < 0) var end = index = bracket;
	                else var end = index = bracket < dot ? bracket : dot;
	
	                var property = path.slice(start, end);
	            }
	        }
	
	        cursor[property] = table[path];
	    }
	
	    return result[""];
	},	
	
	/**
	 * @description Puts new data into the grid
	 * @param 		newData - query results
	 * @param 		query - the query the user typed in to get that new data
	 **/	
	setGridData : function(newData, query) {
		data = newData;
		
		if(data.length > 0) {
			d3vUtil.alert('Found ' + data.length + ' results', { scheme : 'positive' });

			for(var i = 0, end = data.length; i < end; i++) {
				d3vData.flatten(data[i], false, data[i]);
			}
		}
	},

	/**
	 * @description Parses the query passed in and creates a list of fields that the user has selected
	 * @param		query - query to parse and generate list from
	 * @return		list of fields user has selected within query
	 **/
	getSelectList : function(query) {
		var whatWasSelected = query.substring(7).split(' from ')[0];
	    whatWasSelected = $.trim(whatWasSelected)
	    var selectList = whatWasSelected.split(",");
	    for(var i = 0; i < selectList.length; i++) {
	        selectList[i] = $.trim(selectList[i])
	    }
	    
	    return selectList;	
	},

	/**
	 * @description Examines query to set the slickgrids columns
	 * @param		query   - query to parse and create columns from
	 * @param		addedId - true when the user DID not query for the id field
	 **/	
	setupColumns : function(query, addedId) {
		columns.length = 0;
		var lower;
		var colNames = d3vData.getSelectList(query);
	    columns.push(checkboxSelector.getColumnDefinition());
	    
	    for(var i = 0, endI = colNames.length; i < endI; i++) {
	    	lower = colNames[i].toLowerCase();
	    	if(lower !== 'id' || (lower === 'id' && !addedId)) {

		    	columns.push({
		    		id: colNames[i],
			        name: colNames[i],
			        field: colNames[i],
			        width: 100,
			        editor: Slick.Editors.Text, 
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	});
	    	}
	    }	
	
	    grid.setColumns(columns);		
	},
	
	/**
	 * @description Takes a list of results, and sets the slickgrid up with appropriate data and columns
	 * @param 		results - query results
	 * @param 		query   - the query the user typed in to get those results
	 * @param		addedId - true when the user DID not query for the id field
	 **/
	processQueryResults : function(result, query, addedId) {
		d3vData.setupColumns(query, addedId);
		d3vData.setGridData(result, query);
		d3vData.refreshGrid();		
	},

	/**
	 * @description Validates that the query is, at least to some degree, valid.
	 * @param		$qSource - text input jQuery object which holds the query
	 * @return		true when query is valid, false when not
	 **/
	validateQuery : function($qSource) {
		var basicValidation = $qSource && $qSource.length && $qSource.val();

		if(basicValidation) {
			var queryString = $qSource.val().toLowerCase();
			var objectName  = d3vData.getObjectNameFromQuery(queryString);
			var selectLoc   = queryString.indexOf('select');
			var fromLoc		= queryString.indexOf(' from ');
			
			if(selectLoc == 0 && fromLoc > selectLoc && objectName && objectName.length) {
				return true;
			}
		
			return false;
		}
	
		return false;
	},

	/**
	 * @description Adds an entry to the soql typeahead.
	 * @param		query - the query to add
	 **/
	addSOQLToTypeahead : function(query) {
		var nonsavingQueries = [
			'SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate ORDER BY ApexClassOrTrigger.Name ASC'
		];
		
		var basicQuery = $.trim(query.toLowerCase());
		for(var i = 0, end = nonsavingQueries.length; i < end; i++) {
			if(basicQuery === $.trim(nonsavingQueries[i].toLowerCase())) {
				return;
			}
		}
		
		var $ac = $('input#query-source');
		var completer = $ac.autocomplete('option');
		
		if(completer.source && completer.source.length) {
			var found = false;
			
			for(var i = 0, end = completer.source.length; i < end; i++) {
				if(completer.source[i] === query) {
					found = true;
					break;
				}
			}
			
			if(!found) {
				$ac.autocomplete('option', 'source').splice(0, 0, query);
			}
		}
		
		d3vArchive.write(TABLE_SOQL, 'soql', query);
	},

	/**
	 * @description Initially populates the soql typeahead.
	 **/	
	populateSOQLTypeahead : function() {
	    var soqlHistory = [
	    	'SELECT Id, Name FROM ',
	    	'SELECT Id, Name, LastModifiedDate, CreatedDate FROM ',
	    	'SELECT Id, Name, LastModifiedDate, CreatedDate, LastModifiedById, CreatedById FROM ',
	    	'SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate ORDER BY ApexClassOrTrigger.Name ASC'
	    ]; 

	    $('input#query-source').autocomplete({ source : soqlHistory });
	    
	    d3vArchive.readAll(TABLE_SOQL, function(result) {
	    	if(result.org && aside && aside.org && aside.org.orgId && result.org === aside.org.orgId) {
	    		$('input#query-source').autocomplete('option', 'source').splice(0, 0, result.data);
	    	}
	    });
	},

	/**
	 * @description Executes the query in the input
	 **/
	performQuery : function() {
		d3vData.emptyGrid();
		var $qSource = $('input#query-source');
		lastSuccessfulQuery = '';
		
		if(d3vData.validateQuery($qSource)) {
			d3vUtil.alert('querying…');
			var query = $.trim($qSource.val());
            
			//I dont know why adding the id server side is failing
			//so hard, so doing it client side instead.
			var selection = query.toLowerCase().split('from')[0];
			var addedId   = false;
			if(selection.match(/(\s|,)+id(\s|,)+/i) === null) {
			    query = query.replace(/select\s/i, 'SELECT id, ');
			    addedId = true;
			}		
			
			if(d3vData.isToolingObject($qSource)) {
				ServerAction.queryTooling(query, function(callbackData) {
					d3vData.handleQueryResults(callbackData, query, addedId);
				});			
			} else {
				ServerAction.query(query, function(callbackData) {
					d3vData.handleQueryResults(callbackData, query, addedId);
				});			
			}
		} else {
			d3vUtil.alert('There is something not quite right about that query...');
		}
	},	
	
	/**
	 * @description Returns true when the query sent in is against a table only queryable via the tooling api
	 * @param       $query - the query the test
	 * @returns     true (need to use tooling api to query) / false (dont need to)
	 **/
	isToolingObject : function($query) {
		var objectName = d3vData.getObjectNameFromQuery($query.val().toLowerCase()).toLowerCase();
	
		return ["apexclassmember", "apexcodecoverage", "apexcodecoverageaggregate", "apexcomponentmember", "apexemailnotification", "apexexecutionoverlayaction", "apexexecutionoverlayresult", "apexlog", "apexorgwidecoverage", "apexpagemember", "apexresult", "apextestqueueitem", "apextestresult", "apextriggermember", "assignmentrule", "auradefinition", "auradefinitionbundle", "autoresponserule", "businessprocess", "compactlayout", "compactlayoutiteminfo", "compactlayoutinfo", "containerasyncrequest", "customfield", "customfieldmember", "customobject", "customtab", "datatype", "debuglevel", "deploydetails", "emailtemplate", "entitydefinition", "entitylimit", "entityparticle", "fielddefinition", "fieldset", "flexipage", "flow", "flowdefinition", "heapdump", "historyretentionjob", "homepagecomponent", "homepagelayout", "keywordlist", "layout", "lookupfilter", "menuitem", "metadatacontainer", "moderationrule", "ownerchangeoptioninfo", "pathassistant", "pathassistantstepinfo", "pathassistantstepitem", "posttemplate", "profile", "profilelayout", "publisher", "queryresult", "quickactiondefinition", "quickactionlist", "quickactionlistitem", "recentlyviewed", "relationshipdomain", "relationshipinfo", "sandboxinfo", "sandboxprocess", "searchlayout", "servicefielddatatype", "scontrol", "soqlresult", "standardaction", "symboltable", "traceflag", "transactionsecuritypolicy", "userentityaccess", "userfieldaccess", "validationrule", "weblink", "workflowalert", "workflowfieldupdate", "workflowoutboundmessage", "workflowrule", "workflowtask"].indexOf(objectName) !== -1;
	},
	
	/**
	 * @description Handles the results from performQuery
	 * @param       callbackData - results from ServerAction.query
	 * @param       query        - query which resulted in the…results
	 * @param       addedId      - true when 'id' has been added to the query, e.g. not selected by the user, false otherwise
	 **/
	handleQueryResults : function(callbackData, query, addedId) {
		if(!callbackData) {
			d3vUtil.alert('an error occured while executing that query', { scheme : 'negative' });
			return;
		}
		
		callbackData = JSON.parse(callbackData);

		if(callbackData.detail) {
			var errorMessage;
			
			for(var prop in callbackData.detail) {
				if(callbackData.detail.hasOwnProperty(prop) && prop.indexOf('Fault') !== -1) {
					errorMessage = prop;
					break;
				}
			}

			errorMessage = callbackData.detail[errorMessage].exceptionMessage;
			if(errorMessage && errorMessage.length) {
				if(errorMessage.length >= MAX_ERROR_LENGTH) {
					d3vUtil.alert('query failed', { scheme : 'negative' });
					d3vPopups.displayMessage('Query Error', callbackData.faultstring, callbackData);
				} else {
					d3vUtil.alert(errorMessage, { scheme : 'negative' });
				}
			}
		} else {
			d3vPopups.closeErrorPopups();
			lastSuccessfulQuery = query;
			d3vData.addSOQLToTypeahead(lastSuccessfulQuery);
			
            if(callbackData.length === 0) {
               	d3vUtil.alert('No results found.');
            }
            
            d3vData.processQueryResults(callbackData, query.toLowerCase(), addedId);
            d3vUtil.sizeViewport();				
		}		
	}

}		