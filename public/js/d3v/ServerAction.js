/*
 @description Provides all interaction with Heroku & Salesforce
 @date 		  6.6.2012
 @author 	  phil rymek

 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/
var ServerAction = {

	/**
	 * @description query salesforce.
	 * @param		queryString - soql query
	 * @param		callback	- in the form of function(result)
	 **/			
	query : function(queryString, callback) {
		ServerAction.post('/query?q=' + encodeURIComponent(queryString), callback);	
	},
	
	/**
	 * @description Sets the global debug info for extra error logging info
	 * @param       info - extra info to log
	 **/
	setGlobalDebugInfo : function(info) {
		globalDebugInfo = info;
	},
	
	/**
	 * @description Resets the global debug info
	 **/
	resetGlobalDebugInfo : function() {
		globalDebugInfo = '';
	},	

	/**
	 * @description query salesforce via tooling api
	 * @param		queryString - soql query
	 * @param		callback	- in the form of function(result)
	 **/				
	queryTooling : function(queryString, callback) {
		ServerAction.post('/tQuery?q=' + encodeURIComponent(queryString), callback);
	},
	
	/**
	 * @description Generic error logger
	 * @param       errorMsg   - error that occured
	 * @param       url        - what file it occured in
	 * @param       lineNumber - line it occured on
	 * @param       stackTrace - error stack trace
	 **/	
	logClientError : function(errorMsg, url, lineNumber, stackTrace) {
		errorMsg   = errorMsg   || '';
		url        = url        || '';
		lineNumber = lineNumber || '';
		stackTrace = stackTrace || '';
		
		if(globalDebugInfo) {
			stackTrace = 'gde: ' + globalDebugInfo + '; ' + stackTrace;
			ServerAction.resetGlobalDebugInfo();
		}
		
		ServerAction.post('/lce?file=' + url + '&ln=' + lineNumber + '&msg=' + errorMsg, stackTrace, function() {});
	},	
	
	/**
	 * @description query for a code file.
	 * @param		queryString - soql query results in file friendly format
	 * @param		type		- Body|Markup
	 * @param		callback	- in the form of function(result)
	 **/			
	fileQuery : function(queryString, type, callback) {
		ServerAction.post('/filequery?q=' + encodeURIComponent(queryString) + '&type=' + type, callback);
	},
	
	/**
	 * @description delete records from salesforce
	 * @param		ids      - list of ids of records to delete
	 * @param		callback - in the form of function(result)
	 **/		
	deleteRecords : function(ids, callback) {
		ServerAction.post('/delete', ids + '', callback);
	},

	/**
	 * @description create new records in salesforce
	 * @param		toInsert   - objects to insert
	 * @param		objectType - data type e.g. 'MyCustomObject__c'
	 * @param		callback   - in the form of function(result)
	 **/		
	createRecords : function(toInsert, objectType, callback) {
		if(!$.isArray(toInsert)) {
			toInsert = [toInsert];
		}		
	
		ServerAction.post('/insert?t=' + objectType, btoa(JSON.stringify(toInsert)), callback);
	},

	/**
	 * @description update existing records in salesforce
	 * @param		toUpdate   - objects to update
	 * @param		objectType - data type e.g. 'MyCustomObject__c'
	 * @param		callback   - in the form of function(result)
	 **/	
	updateRecords : function(toUpdate, objectType, callback) {
		if(!$.isArray(toUpdate)) {
			toUpdate = [toUpdate];
		}
		
		ServerAction.post('/update?t=' + objectType, btoa(JSON.stringify(toUpdate)), callback);
	},

	/**
	 * @description upsert records into salesforce
	 * @param		toUpsert   - objects to update
	 * @param		objectType - data type e.g. 'MyCustomObject__c'
	 * @param		externalId - api name of field to upsert based on
	 * @param		callback   - in the form of function(result)
	 **/	
	upsertRecords : function(toUpsert, objectType, externalId, callback) {
		if(!$.isArray(toUpsert)) {
			toUpsert = [toUpsert];
		}		
	
		ServerAction.post('/upsert?t=' + objectType + '&e=' + encodeURIComponent(externalId), btoa(JSON.stringify(toUpsert)), callback);
	},

	/**
	 * @description perform describe on sObjects
	 * @param		sObjects - list of sobject names to describe
	 * @param		callback - in the form of function(result)
	 **/	
	describeSObjects : function(sObjects, callback) {
		ServerAction.post('/describeSObject?s=' + encodeURIComponent(sObjects+''), callback);
	},

	/**
	 * @description perform describe on everything
	 * @param		callback - in the form of function(result)
	 **/		
	describeGlobal : function(callback) {
		ServerAction.post('/describeGlobal', callback);
	},
	
	/**
	 * @description save an ApexClass or ApexTrigger to salesforce
	 * @param		apexBody - objects to update
	 * @param		apexType - data type e.g. 'MyCustomObject__c'
	 * @param		filename - api name of field to upsert based on
	 * @param		key      - api name of field to upsert based on
	 * @param		version  - api name of field to upsert based on
	 * @param       recordId - id of record to update	 	 
	 * @param       parsedFilename - the filename parsed from the code
	 * @param       isRename - true when renaming a file
	 * @param		callback - in the form of function(result)
	 **/		
	saveApex : function(apexBody, apexType, filename, key, version, recordId, parsedFilename, isRename, callback) {
		lastPushCode = d3vUtil.getRandomString();

		ServerAction.post('/saveApex?t=' + encodeURIComponent(apexType) +
						'&f='   + encodeURIComponent(filename)       + 
						'&k='   + encodeURIComponent(key)            +
						'&v='   + encodeURIComponent(version)        +
						'&c='   + encodeURIComponent(lastPushCode)   +
						'&rid=' + encodeURIComponent(recordId)       +
						'&pfn=' + encodeURIComponent(parsedFilename) +
						'&ren=' + encodeURIComponent(isRename), btoa(d3vUtil.encodeUtf8(apexBody)), callback);
	},

	/**
	 * @description this method creates a d3v_Code_Update__c record.
	 *				its meant to be called after a successful call to saveApex and the record
	 *				contains basic infomation about the update.
	 *				should probably be changed to be called as apart of saveApex server side.
	 * @param		filename - objects to update
	 * @param		type     - data type e.g. 'MyCustomObject__c'
	 * @param		pushKey  - api name of field to upsert based on 	 
	 * @param		callback - in the form of function(result)
	 **/	
	registerCodeUpdate : function(filename, type, pushKey, callback) {
		ServerAction.post('/registerCodeUpdate?f=' + encodeURIComponent(filename) + '&t=' + encodeURIComponent(type) +
								  '&k=' + encodeURIComponent(pushKey), callback);
	},
	
	/**
	 * @description Obtains the data necessary to generate the coverage report
	 * @param       filter - the filter to apply to the coverage report
	 * @param       callback - in the form of function(result)
	 **/
	generateCoverageReport : function(filter, callback) {		
		ServerAction.post('/coverageReport?q=' + encodeURIComponent(filter), callback);
	},
	
	/**
	 * @description execute apex anonymously
	 * @param		toExecute - the apex code to execute
	 * @param		callback  - in the form of function(result)
	 **/	
	executeAnonymous : function(toExecute, callback) {
		ServerAction.post('/executeAnonymous', btoa(d3vUtil.encodeUtf8(toExecute)), callback);
	},

	/**
	 * @description creates a new visualforce file
	 * @param		markup   - visualforce markup
	 * @param		name     - name of new visualforce file
	 * @param		type     - component|page
	 * @param		callback - in the form of function(result)
	 **/		
	createVisualforce : function(markup, name, type, callback) {
		lastPushCode = d3vUtil.getRandomString();
		
		ServerAction.post('/createVF?t=' + encodeURIComponent(type) + 
		                '&n=' + encodeURIComponent(name) +
		                '&c=' + encodeURIComponent(lastPushCode), btoa(d3vUtil.encodeUtf8(markup)), callback);
	},

	/**
	 * @description updates a visualforce file
	 * @param		markup   - visualforce markup
	 * @param		id       - id of visualforce page or component to update
	 * @param		type     - component|page
	 * @param		callback - in the form of function(result)
	 **/		
	updateVisualforce : function(markup, id, type, callback) {
		ServerAction.post('/updateVF?t=' + encodeURIComponent(type) + 
		               '&id=' + encodeURIComponent(id)   +
		                '&c=' + encodeURIComponent(lastPushCode), btoa(d3vUtil.encodeUtf8(markup)), callback);
	},
	
	/**
	 * @description updates a lightning file
	 * @param		source   - lightning code
	 * @param		id       - id of AuraDefinition to update
	 * @param		callback - in the form of function(result)
	 **/		
	updateLightning : function(source, id, callback) {
		ServerAction.post('/updateLightning?id=' + encodeURIComponent(id), 
			btoa(d3vUtil.encodeUtf8(source)), 
			callback);
	},	
	
	/**
	 * @description creates a lightning file
	 * @param		source   - lightning code
	 * @param       defType  - Aura Definition Type
	 * @param       auraBundleName - Name of parent AuraDefinitionBundle.  Only required for new bundles
	 * @param       sourceFormat - XML|JS|CSS
	 * @param		callback - in the form of function(result)
	 **/		
	createLightning : function(source, defType, auraBundleName, sourceFormat, callback) {
		lastPushCode = d3vUtil.getRandomString();
		
		ServerAction.post('/createLightning?dt=' + encodeURIComponent(defType) + 
			'&n=' + encodeURIComponent(auraBundleName) + '&f=' + encodeURIComponent(sourceFormat), 
			btoa(d3vUtil.encodeUtf8(source)), 
			callback);
	},		

	/**
	 * @description creates a static resource
	 * @param		name     - name of new resource
	 * @param		type     - mime type of new resource
	 * @param		content  - static resource content
	 * @param       skipEncoding - allows you to skip encoding for pre-encoded files
	 * @param		callback - in the form of function(result)
	 **/		
	createStaticResource : function(name, type, content, skipEncoding, callback) {
		ServerAction.post('/createResource?name=' + encodeURIComponent(name) + '&type=' + encodeURIComponent(type), 
		                  skipEncoding ? content : btoa(d3vUtil.encodeUtf8(content)), callback);
	},

	/**
	 * @description updates a static resource
	 * @param		content  - static resource content
	 * @param		id       - id of static resource to update
	 * @param       type     - content type of static resource
	 * @param       skipEncoding - allows you to skip encoding for pre-encoded files
	 * @param		callback - in the form of function(result)
	 **/		
	updateStaticResource : function(content, id, type, skipEncoding, callback) {
		ServerAction.post('/updateResource?id=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(type), 
			skipEncoding ? content : btoa(d3vUtil.encodeUtf8(content)), callback);
	},

	/**
	 * @description search all code in the org for a string literal
	 * @param		toFind   - what to search for
	 * @param		callback - in the form of function(result)
	 **/		
	findInFiles : function(toFind, callback) {
		ServerAction.post('/fileSearch?s=' + encodeURIComponent(toFind), callback);
	},

	/**
	 * @description queues a unit test for execution
	 * @param		toRun    - the test class to execute the unit tests from
	 * @param		callback - in the form of function(result)
	 **/		
	runTest : function(toRun, callback) {
		ServerAction.post('/runTest?tr=' + toRun, callback);
	},
	
	/**
	 * @description Uses the refresh token to refresh the session
	 * @param       onReauth       - true when this method is called because an error occured 
	 *                               in the app, false when its called due to inactivity
	 * @param       reasonEndpoint - used to track errors, this is the url that generated the 
	 *                               error this method is trying to recover from, or '/refresh' 
	 *                               if its called due to inactivity.
	 *                               
	 **/			 
	refreshToken : function(onReauth, reasonEndpoint) {
		refreshWaitId = setTimeout(function() {
			if(refreshWaitId) {
				refreshWaitId = null;
				ServerAction.handleRefreshFailure(onReauth, reasonEndpoint);
			}
		}, REFRESH_MAX_WAIT);
		
		$.post('/refresh', function(callbackData) {
			clearTimeout(refreshWaitId);
			callbackData = eval('(' + callbackData + ')');

			if(callbackData.success) {
				CookieUtil.setCookieClone();
				
				if(onReauth) {			
					d3vUtil.handleSuccessfulReauthentication(onReauth, reasonEndpoint);
				}
			} else {
				ServerAction.relogin(onReauth, reasonEndpoint);
			}
		});	
	},	
	
	/**
	 * @description Simulate the user clicking the login button
	 * @param       onReauth       - true when this method is called because an error occured 
	 *                               in the app, false when its called due to inactivity
	 * @param       reasonEndpoint - used to track errors, this is the url that generated the 
	 *                               error this method is trying to recover from, or '/refresh' 
	 *                               if its called due to inactivity.
	 *                               
	 **/		
	relogin : function(onReauth, reasonEndpoint) {
		var loginParam = d3vUtil.isProductionEnvironment() ? 'autologp' : 'autologd';
		$('body').append('<iframe height="300" width="300" id="reauther" src="/login?' + 
		                 loginParam + '=1" style="position:absolute;left:-500px;top:0;" />');
		
        setTimeout(function() {
			try {
				$("#reauther").contents();
				var redirectUrl = $("#reauther").get(0).contentWindow.location.origin ||
				                  $("#reauther").get(0).contentWindow.location.hostname;
                var partialUrl = D3V_URL.replace('https://', '').replace('http://', '').replace('www.','');

				if(partialUrl && partialUrl.length > 0 && redirectUrl.indexOf(partialUrl) !== -1) {
					$("#reauther").remove();
				    d3vUtil.handleSuccessfulReauthentication(onReauth, reasonEndpoint);
				} else {
					ServerAction.handleRefreshFailure(onReauth, reasonEndpoint);
				}
			} catch(ex) {		
				ServerAction.handleRefreshFailure(onReauth, reasonEndpoint);
			}
		}, REAUTH_DELAY);
	},

	/**
	 * @description Handles an error occured within ASIDE
	 * @param       onReauth       - true when this method is called because an error occured 
	 *                               in the app, false when its called due to inactivity
	 * @param       reasonEndpoint - used to track errors, this is the url that generated the 
	 *                               error this method is trying to recover from, or '/refresh' 
	 *                               if its called due to inactivity.
	 *                               
	 **/		
	handleRefreshFailure : function(onReauth, reasonEndpoint) {
		localStorage.errorRecoveryInProcess = false;
		$.post('/logError?source=' + encodeURIComponent(reasonEndpoint));
		$(window).unbind('beforeunload');
		
		if(onReauth) {
			d3vUtil.handleFailedReauthentication();
		} else {
			d3vArchive.saveEmergencyCopy();
			
			alert('Your session has gone stale and cannot be recovered.  ' +
			      'You will not lose any work, but you will need to login again.  ' +
			      'Sorry for the inconvenience.');
			      
			d3vUtil.clearCookiesAndLogout();
		}		
	},

	/**
	 * @description Instantiates a new instance of ASIDE
	 * @param       filterLevel - level of code to retrieve
	 *                            "both" = packaged & unpackaged
	 *                            "pkgd" = packaged only
	 *                            "upkg" = unpackaged only
	 *                            "none" = load nothing (wack that we are calling this when loading nothing)
	 * @param		callback    - in the form of function(result)
	 **/			
	initASIDE : function(filterLevel, callback) {
		var orgId       = d3vUtil.getOrgId();
		var cookieNS    = CookieUtil.readCookie('d3vns' + orgId);
		var hasCookieNS = false;
		
		if(cookieNS) {
			hasCookieNS = true;
			cookieNS    = cookieNS.replace(NS_COOKIE_VALUE_PREFIX, '');
		}
		
		ServerAction.post('/start?flvl=' + encodeURIComponent(filterLevel) + 
		                         '&oid=' + encodeURIComponent(orgId)       + 
		                         '&ns='  + encodeURIComponent(cookieNS)    + 
		                         '&hns=' + hasCookieNS, callback);
	},
	
	/**
	 * @description get a list of all code files
	 * @param       filterLevel - level of code to retrieve
	 *                            "both" = packaged & unpackaged
	 *                            "pkgd" = packaged only
	 *                            "upkg" = unpackaged only
	 *                            "none" = load nothing (wack that we are calling this when loading nothing)
	 * @param		callback    - in the form of function(result)
	 **/			
	getCodeFileNames : function(filterLevel, callback) {
		ServerAction.post('/codeFileNames?flvl=' + encodeURIComponent(filterLevel), callback);
	},
	
	/**
	 * @description queue all unit tests in this org for execution
	 * @param		callback - in the form of function(result)
	 **/			
	runAllTests : function(callback) {
		ServerAction.post('/runAll', callback);
	},	
	
	/**
	 * @description queue some unit tests, determined by a where clause passed into this function
	 * @param		whereClause - where clause to add onto the query to pick which classes to queue
	 **/			
	runSomeTestsByQuery : function(whereClause, callback) {
		ServerAction.post('/runSomeByQuery?where=' + encodeURIComponent(whereClause), callback);
	},	
	
	/**
	 * @description queue some unit tests, selected by the user
	 * @param		toQueue - array of class names to queue
	 **/			
	runSomeTestsBySelection : function(toQueue, callback) {
		ServerAction.post('/runSomeBySelection', toQueue + '', callback);
	},			
	
	/**
	 * @description gets information which summarizes unit tests which are running, have ran, or will run.
	 * @param		whereClause - query tail for test results
	 * @return		unit test summary information
	 **/
	getUnitTestSummary : function(whereClause, callback) {
		ServerAction.post('/testResults?where=' + encodeURIComponent(whereClause), callback);
	},

	/**
	 * @description aborts a test class which is pending or running.
	 * @param		toAbort  - id of apextestqueueitem to abort
	 * @param		callback - handle result (success/failure) of abort operation
	 **/	
	abortTestExecution : function(toAbort, callback) {
		ServerAction.post('/abortTestExecution?id=' + encodeURIComponent(toAbort), callback);
	},
	
	/**
	 * @description Obtains a list of debug logs available to download
	 * @param		currentUserOnly  - filter the list to only display the current users logs
	 * @param		callback - handle debug log list
	 **/	
	getDebugLogList : function(currentUserOnly, callback) {
		ServerAction.post('/getLogList?f=' + currentUserOnly, callback);
	},
	
	/**
	 * @description Obtains debug log text
	 * @param		debugLogId - id of debug log to get
	 * @param		callback - handle debug log text
	 **/	
	getDebugLog : function(debugLogId, callback) {
		$.get('/getDebugLog?id=' + debugLogId, callback);
	},	
	
	/**
	 * @description Get 20 more logs of tracking.
	 * @param		callback	- in the form of function(result)
	 **/			
	resetLogAllowance : function(callback) {
		ServerAction.post('/resetLogAllowance?levels=' + encodeURIComponent(d3vUtil.getLogOptionsString()), callback);
	},	

	/**
	 * @description Log user out of d3v
	 **/	
	logout : function(callback) {
		ServerAction.post('/logout', callback);
	},

	/**
	 * @description Ping salesforce to keep session active
	 **/		
	ping : function() {
		ServerAction.post('/ping', function(callbackData) {});
	},

	/**
	 * @description Clones cookies, and resets the session handler in effort to manage the salesforce session
	 **/	
	manageSession : function() {
		CookieUtil.setCookiesFromClone();
		ServerAction.resetSessionHandler();
	},
	
	/**
	 * @description Resets the session keep alive handler to an initial state
	 **/
	resetSessionHandler : function() {
		if(orgName && orgName.length) {
			localStorage[COOKIE_PRE + TIMESTAMP] = (new Date()).getTime();
		
			if(pingTimerId) {
				clearInterval(pingTimerId);
			}
		
			pingTimerId = setInterval(ServerAction.keepAlive, SESSION_KEEP_ALIVE);
		}
	},
	
	/**
	 * @description Keeps the session alive, or kicks the user out if its been inactive too long
	 **/
	keepAlive : function() {
		var lastActionTime = parseInt(localStorage[COOKIE_PRE + TIMESTAMP]);
		
		if((new Date).getTime() - lastActionTime >= SESSION_KEEP_ALIVE - 60000 && CookieUtil.readCookie(COOKIE_PRE + COOKIE_RTK)) {
			ServerAction.refreshToken(false, '/refresh');
		} else {
			ServerAction.resetSessionHandler();
		}
	},
	
	/**
	 * @description Tracks a post event
	 * @param       category - google analytics event category
	 * @param       action - google analytics event action
	 * @param       resetTracking - true if this should reset the google analytics keep alive
	 **/
	trackEvent : function(category, action, resetTracking) {
		if(gaLoggingReady && window.ga && action && action.length) {
			var paramIndex = action.indexOf('?');
			
			try {
				if(paramIndex !== -1) {
					ga('send', 'event', category, action.substring(0, paramIndex));
				} else {
					ga('send', 'event', category, action);
				}
				
				if(resetTracking) {
					ServerAction.resetTracking();
				}
			} catch(ex) {
				console.log('tracking failure', ex);
			}
		}	
	},
	
	/**
	 * @description Attempt to keep the current google analytics session alive while the user still has aside open
	 **/
	resetTracking : function() {
		if(gaTrackingKey) {
			clearInterval(gaTrackingKey);
		}
		
		gaTrackingKey = setInterval(function() {
			ServerAction.trackEvent('KEEP-ALIVE', 'KEEP-ALIVE', false);
		}, TRACKING_REFRESH);
	},
	
	/**
	 * @description Wrapper for jquery post
	 * @param		url          - endpoint to post to
	 * @param		postData     - (optional) data to include
	 * @param		callback     - should speak for itself
	 * @param       errorHandler - (optional) custom error handler
	 **/		
	post : function(url, postData, callback, errorHandler) {
		ServerAction.manageSession();
		ServerAction.trackEvent('post', url, true);
				
		var envelope = {
			type:  "POST",
		  	url:   url,
		  	error: function(xhr, status, msg) {
		  		if(errorHandler) {
		  			errorHandler(xhr, status, msg);
		  		} else {
		  			ServerAction.handleServerException(xhr, status, msg, url);
		  		}
		  	}
		};
		
		if(postData instanceof Function) {
			callback      = postData;
		} else {
			envelope.data = postData;
		}
		
		envelope.success  = callback;
		
		$.ajax(envelope);		
	},

	/**
	 * @description Handle serverside errors
	 * @param		url      - endpoint to post to
	 * @param		postData - (optional) data to include
	 * @param		callback - should speak for itself
	 * @param		url      - post url that caused the error
	 **/		
	handleServerException : function(xhr, status, message, url) {
		if(!ignoreAllErrors) {
			d3vUtil.reauthenticate(url);  		
		} 
	},
	
	/**
	 * @description Get the query results of a push filter
	 * @param       filter   - the push filter to apply
	 * @param		callback - in the form of function(result)
	 **/		
	getPushFilterResults : function(filter, callback) {
		ServerAction.post('/getRetrievables', btoa(JSON.stringify(filter)), callback);
	},
	
	/**
	 * @description Obtains the metadata for a single object
	 * @param       objectNam    - name of object to get metadata of
	 * @param       objNamespace - name space of object to get metadata of
	 * @param       callback - in the form of function(result)
	 **/		
	readObjectMetadata : function(objectName, objNamespace, callback) {
		objNamespace = objNamespace || '';
		ServerAction.post('/getObjectMetadata?obj=' + encodeURIComponent(objectName) + '&ns=' + encodeURIComponent(objNamespace), callback);	
	},
	
	/**
	 * @description Get the query results of a push filter
	 * @param       types    - the <types> elements and their children which are apart of the package.xml
	 * @param       callback - in the form of function(result)
	 **/		
	retrieve : function(types, callback) {
		ServerAction.post('/retrieve', btoa(types), callback);	
	},

	/**
	 * @description Check the status and get the results of a retrieve when it is ready.
	 * @param       retrieveId - the retrieve id returned from a retrieve call
	 * @param       callback   - in the form of function(result)
	 **/		
	checkRetrieve : function(retrieveId, callback) {
		ServerAction.post('/checkRetrieve?id=' + retrieveId, callback);
	},

	/**
     * @description performs a custom object save when passed a base-64 encoded zip
     * @param       body      - the base 64 encoded zip file containing the object
     * @param       objectId  - id of object being updated
     * param        key       - key of object to validate
     * @param       callback  - in the form of function(result)
     **/
	saveCustomObject : function (body, objectId, key, callback) {
		objectId = objectId ? encodeURIComponent(objectId) : '';
		key      = key      ? encodeURIComponent(key)      : '';
		
		ServerAction.post('/saveCustomObject?id=' + objectId + '&key=' + key, body, callback);
	},

	/**
     * @description performs a deploy operations when passed a base-64 encoded zip file along with deploy options
     * @param       body              - the base 64 encoded zip file
     * @param       allowMissingFiles - Specifies whether a deploy succeeds even if files that are specified in package.xml but are not in the zip file.
     * @param       checkOnly         - Check if the deploy will succeed, but dont actually do the deploy
     * @param       ignoreWarnings    - Indicates whether a warning should allow a deployment to complete successfully (true) or not (false).
     * @param       purgeOnDelete     - If true, the deleted components in the destructiveChanges.xml manifest file aren't stored in the Recycle Bin.
     * @param       runAllTests       - If true, all Apex tests defined in the organization are run.  True no matter what for prod orgs.
     * @param       callback          - in the form of function(result)
     **/
	deploy : function (body, allowMissingFiles, checkOnly, ignoreWarnings, purgeOnDelete, runAllTests, callback) {
		ServerAction.post('/deploy?awf=' + allowMissingFiles + 
		                          '&co=' + checkOnly         + 
		                          '&iw=' + ignoreWarnings    + 
		                         '&pod=' + purgeOnDelete     + 
		                         '&rat=' + runAllTests, body, callback, function(xhr, status, msg) {
		                         
			d3vUtil.alert('deploy failed', { scheme : 'negative' });
			d3vPush.recoverFromDeploy();
			d3vPush.writeToPushConsole('*********** DEPLOYMENT FAILED ***********\n\nFAILURE: ' + msg);
		});
	},
	
	/**
	 * @description check the status of a deploy
	 * @param       statusId - from deploy callback result
	 * @param       detail   - true to add an extra level of detail in the deploy logs
     * @param       callback - in the form of function(result)
	 **/
	checkDeployStatus : function(statusId, detail, callback) {
		ServerAction.post('/checkDeployStatus?id=' + statusId + '&detail=' + detail, callback);
	}
}