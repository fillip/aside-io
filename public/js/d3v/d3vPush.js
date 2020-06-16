/*
 @author      Phil Rymek
 @description ASIDE Deploy Functionality
 @date        9.10.2013
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vPush = {

	/**
	 * @description Initializes the code coverage chart
	 **/
	setupCoveragePieChart : function() {
		$('div#coverage-chart').easyPieChart({
			barColor: function(percent) {
	            percent /= 100;
	            
	            var redTint   = Math.round(255 * percent) + 100;
	            var greenTint = 0;
	            
	            if(percent > 0.74) {
	                redTint   = Math.round(255 * (1-percent));
	                greenTint = Math.round(255 * (percent-.25));
	            }
	            
	            if(percent > 0.90) {
	                greenTint = Math.round(255 * (percent-.125));
	            } else if(percent > 0.99) {
	                greenTint = Math.round(255 * percent);
	            }
	            
	            redTint = redTint > 255 ? 255 : redTint;
	            greenTint = greenTint > 255 ? 255 : greenTint;
	            
	            return 'rgb(' + redTint + ',' + greenTint + ',0)';
			},
            scaleColor: false,
            animate: COVERAGE_ANIMATE_TIME,
            lineWidth: 10,
            lineCap: "square",
            size: 80,
            trackColor: "lightblue"
    	});
	},

	/**
	 * @description Updates the deploy status popup as information comes in
	 * @param       contents - the data to display
	 * @param       fromZip  - true if the contents are a zip file
	 **/
	updateDeployStatus : function(contents, fromZip) {
		if(fromZip) {
			$('div#pdr-table').html('<div id="pdr-accordion" style="width:100%;">' + d3vPush.getMarkupForDeploy(contents) + '</div>');
			$('div#pdr-accordion').accordion({
				header: 'h3', heightStyle: 'content'
			});			
			d3vPush.setDeployStatusTestsPending();
		} else {
			d3vPush.updateMarkupForDeploy(contents);
			d3vPush.resetTestResultDetails();
			d3vPush.setDeployStatusTestsFinal(contents);
			d3vPush.setDeployStatusTestDetail(contents);
		}
	},
	
	/**
	 * @description Builds out and assigns the markup for the deploy test detail section
	 * @param       contents - checkDeployStatus result containing runTestResult information
	 **/
	setDeployStatusTestDetail : function(contents) {
		var rtr = contents.checkDeployStatusResponse.result.details.runTestResult;
		
		if(rtr) {
			var failures;
			var warnings;
			var markup = '';
			
			if(rtr.failures) {
				failures = $.isArray(rtr.failures) ? rtr.failures : [rtr.failures];
				
				for(var i = 0, end = failures.length; i < end; i++) {
					markup += d3vPush.getTestFailureMarkup(failures[i]);
				}				
			}
			
			if(rtr.codeCoverageWarnings) {
				warnings = $.isArray(rtr.codeCoverageWarnings) ? rtr.codeCoverageWarnings : [rtr.codeCoverageWarnings];
				
				for(var i = 0, end = warnings.length; i < end; i++) {
					markup += d3vPush.getDeployWarningMarkup(warnings[i]);
				}					
			}

			if(rtr.codeCoverage && rtr.codeCoverage.length) {
				markup += d3vPush.getCodeCoverageExplanation(rtr.codeCoverage);
			}
			
			if(markup && markup.length) {
				$('div#pter-details').html('<div id="pter-accordion" style="width:100%;">' + markup + '</div>');
				$('div#pter-accordion').accordion({
					header: 'h3', heightStyle: 'content'
				});
			}
			
			$('div#deploy-status-popup-body span.stack-trace-link').unbind().click(d3vTest.stackTraceFileClickHandler);
		}
	},
	
	/**
	 * @description Returns the object id given the object name
	 * @param       objName - name of the object to get the id of
	 * @return      id of object, null when not found
	 **/
	getIdFromObjectName : function(objName) {
		objName = objName.toLowerCase();
		
		if(aside.objMap) {
			for(var prop in aside.objMap) {
				if(aside.objMap.hasOwnProperty(prop) && objName === aside.objMap[prop].toLowerCase()) {
					return prop;
				}
			}
		}
		
		return null;
	},
	
	/**
	 * @description Builds out the markup for unit test failures
	 * @param       failure - the failure to build out markup for.
	 * @return      the markup
	 **/
	getTestFailureMarkup : function(failure) {
		return 	'<h3 class="accordion-title">' +
					'<span class="bold-font">Failure: ' + failure.name + '.' + failure.methodName + '</span>' +
				'</h3>' +
				'<div class="accordion-body">' +
					'<span class="bold-font dark-grey">Message</span>' +
					'<div>' + d3vTest.addStackTraceLinks(failure.message) + '</div><br/>' +
					'<span class="bold-font dark-grey">Stack Trace</span>' +
					'<div>' + d3vTest.addStackTraceLinks(failure.stackTrace) + '</div>' +
				'</div>';
	},

	/**
	 * @description Builds out the markup for unit test warnings
	 * @param       warning - the warning to build out markup for.
	 * @return      the markup
	 **/	
	getDeployWarningMarkup : function(warning) {
		return 	'<h3 class="accordion-title">' +
					'<span class="bold-font">Warning: ' + (warning.name || 'General') + '</span>' +
				'</h3>' +
				'<div class="accordion-body">' +
					'<span class="bold-font dark-grey">Message</span>' +
					'<div>' + d3vTest.addStackTraceLinks(warning.message) + '</div>' +
				'</div>';	
	},

	/**
	 * @description Builds out the markup showing code coverage class by class and how the overall percentage is calculated.
	 * @param       coverage - the codeCoverage array from the deploys runTestResult
	 * @return      the markup
	 **/	
	getCodeCoverageExplanation : function(coverage) {
		return 	'<h3 class="accordion-title">' +
					'<span class="bold-font">Code Coverage</span>' +
				'</h3>' +
				'<div class="accordion-body">' +
					'<span class="bold-font dark-grey">Code coverage is listed class by class below:</span><br/><br/>' +
					'<table id="coverage-explanation">' +
						'<tr>' +
							'<th>Class Name</th>' +
							'<th>Total Lines</th>' +
							'<th>Lines Covered</th>' +
							'<th>Lines Uncovered</th>' +
							'<th>Coverage %</th>' +
						'</tr>' +
						d3vPush.getCodeCoverageTable(coverage) +
					'</table>' +
				'</div>';		
	},

	/**
	 * @description Builds out the markup for the code coverage table
	 * @param       coverage - code coverage information; the codeCoverage array from the deploys runTestResult
	 * @return      the table markup
	 **/		
	getCodeCoverageTable : function(coverage) {
		var lines = 0;
		var uncovered = 0;
		var markup = '';
		var linesCovered;
		var linesTotal;
		var linesUncovered;
		var linePercentage;
		
		for(var i = 0, end = coverage.length; i < end; i++) {
			linesUncovered = parseInt(coverage[i].numLocationsNotCovered);
			linesTotal     = parseInt(coverage[i].numLocations);
			linesCovered   = linesTotal - linesUncovered;
			lines         += linesTotal;
			uncovered     += linesUncovered;
			linePercentage = linesTotal === 0 ? 0 : parseInt(100 * (linesCovered / linesTotal))
			
			markup += '<tr>'
			       +      '<td>' + coverage[i].name + '</td>'
			       +      '<td>' + coverage[i].numLocations + '</td>'
			       +      '<td>' + linesCovered + '</td>'
			       +      '<td>' + coverage[i].numLocationsNotCovered + '</td>'
			       +      '<td>' + linePercentage + '%</td>'
			       +  '</tr>';
		}
		
		linePercentage = lines === 0 ? 0 : parseInt(100 * ((lines - uncovered) / lines));
		
		markup += '<tr><td></td><td/><td/><td/><td/></tr><tr>'
				+     '<td class="bold-font bluish">Total</td>'
				+     '<td>' + lines + '</td>'
				+     '<td>' + (lines - uncovered) + '</td>'
				+     '<td>' + uncovered + '</td>'
				+     '<td>' + linePercentage + '%</td>'
		        + '</tr>';
		
		return markup;
	},
	
	/**
	 * @description Determines if a filename is an existing package xml
	 * @param       filename - to check if is a package.xml file
	 * @return      true if it is, false if it is not
	 **/
	isPackageXML : function(filename) {
		var base = PACKAGE_XML_FILE + aside.org.orgId;
		var fn;
		filename = filename.toLowerCase();
		
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(base) === 0) {
				fn = prop.substring(base.length).toLowerCase();
				
				if(fn + '.xml' === filename) {
					return true;
				}
			}
		}	
		
		return false;
	},
	
	/**
	 * @description Initialize the deploy status popup test section to a neutral state
	 **/	
	setDeployStatusTestsPending : function() {
		$('div#pter-console table tr td').text("Calculating...");
		d3vPush.setTestResultMessage('deploying...');
		$('div#coverage-chart span.percent').text('N/A');
		$('div#coverage-chart').data('easyPieChart').update(0);
	},
	
	/**
	 * @description Replaces the context of the pter detail container with a simple message
     **/
	setTestResultMessage : function(message) {
		$('div#pter-details').addClass('p-detail-msg').html('<br/><br/><br/>' + message);
	},
	
	/**
	 * @description Resets the style and content of the test result details container
     **/
	resetTestResultDetails : function(message) {
		$('div#pter-details').removeClass('p-detail-msg').empty();
	},	

	/**
	 * @description Calculates and displays the code coverage
	 * @param       contents - contents to parse to calculate coverage
	 **/	
	setCodeCoverage : function(contents) {
		var coverage = contents.checkDeployStatusResponse.result.details.runTestResult.codeCoverage;

		if(!coverage || !coverage.length) {
			$('td#p-code-coverage').text('N/A');
			d3vPush.setTestResultMessage('no tests were executed for this deploy');
			return;
		}

		var percentage = d3vPush.calculateCoveragePercent(coverage);
		var $chart = $('div#coverage-chart');
		$chart.data('easyPieChart').update(percentage === 'N/A' ? 0 : percentage);
		
		setTimeout(function() {
			d3vPush.startPercentageClimb(percentage);
		}, 600);
	},
	
	/**
	 * @description Given deploy code coverage results, calculates the overall coverage.
	 * @param       coverage - the deploy code coverage result
	 * @return      the code coverage value, or N/A when there is no code to consider
	 **/
	calculateCoveragePercent : function(coverage) {
		if(!coverage || !coverage.length) {
			return 0;
		}

		var lines          = 0;
		var linesUncovered = 0;
		
		for(var i = 0, end = coverage.length; i < end; i++) {
			lines          += parseInt(coverage[i].numLocations);
			linesUncovered += parseInt(coverage[i].numLocationsNotCovered);
		}
		
		return lines > 0 ? parseInt(100 * ((lines - linesUncovered) / lines)) : 'N/A';
	},
	
	/**
	 * @description Animation of code coverage percentage rising with the pie chart.
	 * @param       percentage - the actual code coverage percentage
	 **/
	startPercentageClimb : function(percentage) {
		var $percentage = $('div#coverage-chart span.percent');
		
		if(percentage === 'N/A') {
			$percentage.text(percentage);
		} else {
			var timeoutValue = COVERAGE_ANIMATE_TIME / percentage;
			$percentage.text(0);
			var percentageClimbIntervalId;
			
			percentageClimbIntervalId = setInterval(function() {
				var lastPercent = parseInt($percentage.text());
				$percentage.text(++lastPercent);
				
				if(lastPercent === percentage) {
					clearInterval(percentageClimbIntervalId);
					$('td#p-code-coverage').text(percentage + '%');
				}
			}, timeoutValue);
		}
	},

	/**
	 * @description Displays deploy test execution status when it completes
	 * @param       contents - contents to parse test results from
	 **/
	setDeployStatusTestsFinal : function(contents) {
		var numRun       = parseInt(contents.checkDeployStatusResponse.result.details.runTestResult.numTestsRun);
		var numFailed    = parseInt(contents.checkDeployStatusResponse.result.details.runTestResult.numFailures);
		var numSucceeded = numRun - numFailed;
		var timeTaken    = parseInt(contents.checkDeployStatusResponse.result.details.runTestResult.totalTime);

		d3vPush.setDeployFailureReason(contents);

		$('td#p-num-success').text(numSucceeded);
		$('td#p-num-fails').text(numFailed);
		$('td#p-test-exec-time').text(timeTaken.toLocaleString('en') + ' ms');
		$('td#p-deploy-exec-time').text((new Date().getTime() - deployStartTime).toLocaleString('en') + ' ms');
		d3vPush.setCodeCoverage(contents);
	},
	
	/**
	 * @description Determines and list the primary deploy failure reason.
	 * @param       contents - deploy result
	 **/
	setDeployFailureReason : function(contents) {
		var result = contents.checkDeployStatusResponse.result;
		if(!result.success) {
			var numFailedTests = parseInt(result.details.runTestResult.numFailures);	
			var failReason;
			
			if(numFailedTests > 0) {
				failReason = 'Reason: Unit Test Failure';
			} else if(result.details.componentFailures) {
				failReason = 'Reason: Compilation Failure';
			} else if(result.details.runTestResult.codeCoverage && result.details.runTestResult.codeCoverage.length) {
				var coveragePercent = d3vPush.calculateCoveragePercent(result.details.runTestResult.codeCoverage);
				
				if(coveragePercent !== 'N/A' && coveragePercent < 75) {
					failReason = 'Reason: Code Coverage Inadequate';
				}
			}
			
			$('span#deploy-detail-marker').show().text(failReason || 'Reason: Unknown');
		}
	},

	/**
	 * @description Reads a zip file and builds out markup representing a list of the files within the zip.
	 * @param       zip - file to parse
	 * @return      the markup representing the zip files
	 **/
	getMarkupForDeploy : function(zip) {
		var markup    = '';
		
		for(var prop in zip.files) {
			if(zip.files.hasOwnProperty(prop)) {
				markup   += d3vPush.getDeployZipItemMarkup(zip.files[prop]);
		  	}
		}
		
		return markup;		
	},

	/**
	 * @description Updates list items in the deploy status popup with final result information
	 * @param       metadata - deploy results
	 **/	
	updateMarkupForDeploy : function(metadata) {
		var deploySuccesses = metadata.checkDeployStatusResponse.result.details.componentSuccesses;
		var deployFailures  = metadata.checkDeployStatusResponse.result.details.componentFailures;
		
		deploySuccesses = $.isArray(deploySuccesses) ? deploySuccesses : [deploySuccesses];
		deployFailures  = $.isArray(deployFailures)  ? deployFailures : [deployFailures];
		
		$('div#generic-message-body').html('');
		
		for(var i = 0, end = deployFailures.length; i < end; i++) {
			d3vPush.updateDeployMetadataItem(deployFailures[i]);
		}
		
		for(var i = 0, end = deploySuccesses.length; i < end; i++) {
			d3vPush.updateDeployMetadataItem(deploySuccesses[i]);
		}
	},
	
	/**
	 * @description Turns name of a saved package xml into similar json representation
	 * @param       packageName - name of saved package xml to get json from
	 * @returns     saved package xml as json
	 **/
	packageToJSON : function(packageName) {	
		packageName = packageName || '';
		var xml = localStorage[PACKAGE_XML_FILE + aside.org.orgId + packageName];
		
		if(xml && xml.length) {
			xml = JSON.parse(xml).code;
		} else {
			return {};
		}
		
		if(!packageName || !packageName.length || !d3vCode.isPackageXML(xml)) {
			return {};
		}
	
		var $div = $('<div>');
		$div.html(xml);
		var $types = $div.find('types');
		var grouped = {};
		var $ele;
		var $name;
		var $members;
		var $element;
		
		$types.each(function(idx, ele) {
			$ele = $(ele);
			$name = $ele.find('name');
			$members = $ele.find('members');
			
			if($name && $name.length) {
				grouped[$name.text()] = [];
			}
			
			$members.each(function(index, element) {
				$element = $(element);
				grouped[$name.text()].push($element.text());
			});
		});
		
		return grouped;
	},

	/**
	 * @description Builds out markup representing a single file within a zip file.
	 * @param       item      - the file to get markup for
	 * @param       lastClass - used to switch between "even" and "odd" css classes
	 * @return      the markup representing the file
	 **/
	getDeployZipItemMarkup : function(item, lastClass) {
		var isDirectory = item.name.lastIndexOf('/') === (item.name.length - 1);
		var isMetafile  = isDirectory ? false : item.name.indexOf('-meta.xml') !== -1;
		var isHidden    = isDirectory ? false : item.name.indexOf('.') === 0 || item.name.indexOf('/.') !== -1;
		
		if(!isHidden && !isDirectory && !isMetafile && item.name && item.name.indexOf('package.xml') === -1) {
			return '<h3 class="accordion-title" fn="' + item.name + '">' +
				       '<span class="bold-font">' + item.name + '</span>' +
				       '<span class="accordion-marker keep-right marker aborted" style="width: auto !important;">Pending</span>' +
				   '</h3>' +
				   '<div class="accordion-body" fn="' + item.name + '">' +
					   '<span class="bold-font dark-grey">Message</span>' +
					   '<div>Deploy is in progress, further details pending.</div>' +			   
				   '</div>';
		}
		
		return '';
	},

	/**
	 * @description Updates an existing metadata item with the test result
	 * @param       item - test result
	 **/	
	updateDeployMetadataItem : function(item) {
		if(!item || !item.fileName) {
			return;
		}
		
		var $marker = $('div#pdr-table h3[fn="' + item.fileName + '"] span.marker');
		
		if($marker && $marker.length) {
			var markerClass;
			var markerText = '';
			var bodyText   = '';
			
			if(item.deleted) {
				markerText = 'Delete ';
			} else if(item.created) {
				markerText = 'Create ';
			} else if(item.changed) {
				markerText = 'Update ';
			}
			
			if(item.success) {
				markerText += 'Successful';
				markerClass = 'successful';
				bodyText    = '<span class="bold-font dark-grey">Message</span>' +
				              '<div>This component did not encounter any issues during the deploy.</div>';
			} else {
				markerText  = item.problemType;
				globalProblem = item.problem;
				markerClass = 'failed';
				bodyText    = item.problem ? d3vTest.addStackTraceLinks(item.problem.replace(/\\n/gi, '<br/>')) : '';
				bodyText    = '<span class="bold-font dark-grey">' + item.problemType + '</span><div>' + bodyText + '</div>';
			}

			$marker.removeClass('aborted').addClass(markerClass).text(markerText);
			
			$('div#pdr-table div[fn="' + item.fileName + '"]').html(bodyText);
			$('div#deploy-status-popup-body span.stack-trace-link').unbind().click(d3vTest.stackTraceFileClickHandler);
		}
	},
	
	/**
	 * @description Returns true when the push section is active
	 * @return      true when active, false when not
	 **/
	isActive : function() {
		var $active = $('div#right span.mode-button.active');
		return $active && $active.length && $active.text() === 'push';
	},
	
	/**
	 * @description Opens the deploy status popup
	 * @param       showResults - switches the popup to display the "Console Output" section.
	 **/
	openDeployStatusPopup : function(showResults) {
		$('#generic-overlay').show();
		$('div#deploy-status-popup').show();
		
		if(showResults) {
			d3vPush.showDeployConsole();
			$('span#pco-btn').addClass('deploy-status-active').removeClass('deploy-status-inactive');
			$('span#pter-btn, span#pdr-btn').removeClass('deploy-status-active').addClass('deploy-status-inactive');
		}
		
		d3vPush.sizePushScreen();
	},
	
	/**
	 * @description Opens the deploy status popup
	 **/
	closeDeployStatusPopup : function() {
		$('#generic-overlay').hide();
		$('div#deploy-status-popup').hide();
		d3vPush.sizePushScreen();
	},	
	
	/**
	 * @description Sets the last retrieve and last deploy date displays within the push help popup.
	 **/
	setVariableDiplays : function() {
		$('span#lddd').text(d3vUtil.formatQueryDate(new Date(parseInt(d3vPush.getDeployTime()))));
		$('span#lrdd').text(d3vUtil.formatQueryDate(new Date(parseInt(d3vPush.getRetrieveTime()))));
	},
	
	/**
	 * @description Log the current time as the "last retrieve time"
	 **/
	logRetrieveTime : function() {
		localStorage[COOKIE_PRE + LAST_RETRIEVE_TIME + d3vUtil.getOrgId()] = (new Date()).getTime();
	},

	/**
	 * @description Get the last retrieve time
	 * @return      last retrieve time
	 **/	
	getRetrieveTime : function() {
		var lastRetrieve = localStorage[COOKIE_PRE + LAST_RETRIEVE_TIME + d3vUtil.getOrgId()];
		return lastRetrieve ? lastRetrieve : new Date(2000, 1, 1).getTime();
	},

	/**
	 * @description Log the current time as the "last deploy time"
	 **/
	logDeployTime : function() {
		localStorage[COOKIE_PRE + LAST_DEPLOY_TIME + d3vUtil.getOrgId()] = (new Date()).getTime();
	},

	/**
	 * @description Get the last deploy time
	 * @return      last deploy time
	 **/		
	getDeployTime : function() {
		var lastDeploy = localStorage[COOKIE_PRE + LAST_DEPLOY_TIME + d3vUtil.getOrgId()];
		return lastDeploy ? lastDeploy : new Date(2000, 1, 1).getTime();
	},	

	/**
	 * @description Open to the monitor deployments screen in salesforce
	 **/
	openInSalesforce : function() {
		d3vUtil.visitThroughFrontdoor('/changemgmt/monitorDeployments.apexp');
	},

	/**
	 * @description Initialize the deploy screen
	 **/
	initializePushScreen : function() {
		d3vPush.generateFilterPicklist(false);
		$('.post-deploy, #push-edit-filter').hide();
		d3vPush.setupMultiSortables();
		d3vPush.sizePushScreen();
		d3vPush.bindActions();
		d3vPush.toggleEmptyMessages();
		d3vPush.loadSettings();
		d3vPush.setupCoveragePieChart();
		d3vPopups.setupRetrieveVersionPopup();
		d3vPush.loadRetrieveVersion();
	},
	
	/**
	 * @description Loads and sets retrieve version preference
	 **/
	loadRetrieveVersion : function() {
		var retrieveVersion = localStorage[COOKIE_PRE + COOKIE_RETRIEVE_VERSION];
		
		if(retrieveVersion && retrieveVersion.length) {
			$('#package-xml-version').val(retrieveVersion);
		}
	},	
	
	/**
	 * @description Saves users retrieve version preference when they change them
	 **/
	changeRetrieveVersion : function() {
	   localStorage[COOKIE_PRE + COOKIE_RETRIEVE_VERSION] = $('#package-xml-version').val();
	},	
	
	/**
	 * @description Size elements on the push screen properly.
	 **/		
	sizePushScreen : function() {
		var $screen = $('div#push-content');
		var $header = $('div.push-header');
		var $footer = $('div#push-footer');

		$('div#pdr-table, div#pter, div#pco').height(parseInt($(window).height() * 0.7));
		$('div.push-block, div#push-controls').height($screen.height() - ($header.outerHeight() + $footer.outerHeight() + 70));
		$('div#pter-details').height($('div#pter').innerHeight() - $('div#pter-console table').outerHeight() - 20);
		
		d3vPush.setupTypeahead();
	},

	/**
	 * @description Initialize the chosen typeahead for filtering file selection
	 **/	
	setupTypeahead : function() {
		$('select#retrieve-filter').chosen('destroy');  
		
		$('select#retrieve-filter').chosen({ 
			no_results_text: "no filters match that input", 
			placeholder_text: 'Select Retrieve Filter', 
			search_contains: true
		});
	},

	/**
	 * @description Initialize the multi sortables
	 **/	
	setupMultiSortables : function() {
	    $('ul.sortable').multisortable({
	        items: "li",
	        receive: function(e) { 
	            d3vPush.deselectAll();
	            d3vPush.toggleEmptyMessages();
	            d3vPush.cleanDuplicates($(e.target));
	        },
	        remove: function(e) {
	        	d3vPush.toggleEmptyMessages();
	        },
	        stop: function(e) {
	            d3vPush.maintainEvenOddPattern();
	        },
	        start: function(e) {
	        	d3vPush.deselectInOpposite($(e.currentTarget));
	        }
	    }).bind('contextmenu', function() {
	        d3vPush.deselectInOpposite($(this));
	    }).click(function() {
	        d3vPush.deselectInOpposite($(this));
	    });
	    
		$('ul#available-to-retrieve').sortable('option', 'connectWith', 'ul#will-retrieve');
		$('ul#will-retrieve').sortable('option', 'connectWith', 'ul#available-to-retrieve');	
	},

	/**
	 * @description Corrects the distribution even/odd css classes over the deploy tables
	 **/	
	maintainEvenOddPattern : function() {
	    $('ul.deployable li:visible:even').removeClass('odd').addClass('even');
	    $('ul.deployable li:visible:odd').removeClass('even').addClass('odd');    
	},

	/**
	 * @description Deselects any selected items in the table which $that is not a member of
	 * @param       $that - the element to consider when determining what the opposite table is
	 **/	
	deselectInOpposite : function($that) {
	    var opposite = $that.attr('id') === 'will-retrieve' ? 'available-to-retrieve' : 'will-retrieve';
	    $('ul#' + opposite + ' li').removeClass('selected');
	},

	/**
	 * @description Deselects all items in the deploy tables
	 **/		
	deselectAll : function() {
	    setTimeout(function() {
	        $('ul.deployable li').removeClass('selected');
	    }, 100);
	},

	/**
	 * @description Moves items listed in the tables in the push section between one another.
	 * @param       all   - true means move all items in the from table, false means move only the selected items
	 * @param       $from - table to take items from
	 * @param		$to   - table to drop items into
	 **/		
	moveRetrievables : function(all, $from, $to) {
		var $move = all ? $from.find('li:visible') : $from.find('li.selected:visible');
		
		if($move.length) {
			$to.append($move);
			d3vPush.cleanDuplicates($to);
			d3vPush.deselectAll();
			d3vPush.maintainEvenOddPattern();
			d3vPush.toggleEmptyMessages();
			d3vUtil.alert('items moved successfully.');
		} else {
			d3vUtil.alert('nothing to move.');
		}
	},

	/**
	 * @description Cleans up duplicate entries in a table
	 * @param		$target - the target to clean up duplicate entries within
	 **/	
	cleanDuplicates : function($target) {
		var rowFileNames = {};
		var key;
		var $ele;
		
		$target.find('li').each(function(idx, ele) {
			$ele = $(ele);
			key  = $ele.find('span.file').text() + '_' + $ele.find('span.md-type').text();
			
			if(rowFileNames[key]) {
				$ele.remove();
			} else {
				rowFileNames[key] = true;
			}
		});
	},
	
	/**
	 * @description Moves all items from the "available" to the "will retrieve" table
	 **/
	addAll : function() {
		d3vPush.moveRetrievables(true, $('ul#available-to-retrieve'), $('ul#will-retrieve'));
	},

	/**
	 * @description Moves selected items from the "available" to the "will retrieve" table
	 **/	
	addSelected : function() {
		d3vPush.moveRetrievables(false, $('ul#available-to-retrieve'), $('ul#will-retrieve'));
	},
	
	/**
	 * @description Moves all items from the "will retrieve" to the "available" table
	 **/	
	removeAll : function() {
		d3vPush.moveRetrievables(true, $('ul#will-retrieve'), $('ul#available-to-retrieve'));
	},

	/**
	 * @description Moves selected items from the "will retrieve" to the "available" table
	 **/		
	removeSelected : function() {
		d3vPush.moveRetrievables(false, $('ul#will-retrieve'), $('ul#available-to-retrieve'));
	},
	
	/**
	 * @description Opens help and jumps directly to the log levels section
	 **/
	showRetrieveFilterHelp : function() {
		window.open('/help#retrieve-filters', '_blank');
	},	
	
	/**
	 * @description Begins the "Add Metadata" flow
	 **/
	addMetadata : function() {
		var filterName = $('#p-filter-name').val();
		
		if(d3vUtil.isValidFilename(filterName, true)) {
			if(!activeRetrieveFilter) {
				activeRetrieveFilter = d3vPush.getFilterObject();
			}
			
			d3vPopups.showAnimatedModal('#rf1-popup');
			d3vPush.initializeMetadataTypeahead();
		} else {
			d3vUtil.alert('you must enter a valid filename before adding metadata', { scheme : 'negative' });
		}
		
	},	
	
	/**
	 * @description Opens an an existing metadata filter for edit
	 * @param       rowId - id of metadata filter to edit
	 **/
	editMetadataFilter : function() {
		var rowId = $(this).closest('.retrieveable-group').attr('md-id');
		
		if(rowId && rowId.length && activeRetrieveFilter && activeRetrieveFilter.metadata && activeRetrieveFilter.metadata.length) {
			for(var i = 0, end = activeRetrieveFilter.metadata.length; i < end; i++) {
				if(activeRetrieveFilter.metadata[i].id === rowId) {
					d3vPush.openEditMetadataFilter(activeRetrieveFilter.metadata[i])
					return;
				}
			}
		} else {
			d3vUtil.alert('edit failed', { scheme : 'negative' });
		}
	},
	
	/**
	 * @description Opens the "Add Metadata" popup with selections staged
	 * @param       filter - the metadata filter to edit
	 **/
	openEditMetadataFilter : function(filter) {
		$('#rf-type').val(filter.type).attr('edit-id', filter.id);
		
		if(filter.method !== PKG_METHOD_XML) {
			$('input[name="rf-method"][value="' + filter.method + '"]').attr('checked', true);
		}
		
		if(filter.method === PKG_METHOD_QUERY) {
			$('#rf3-detail-query').val(filter.detail);
			$('#rf3-detail-member').val(filter.member);
		}
		
		if(filter.method === PKG_METHOD_WRITTEN) {
			$('#rf3-detail-written').val(filter.detail);		
		}
		
		d3vPopups.showAnimatedModal('#rf1-popup');
		d3vPush.initializeMetadataTypeahead();
	},
	
	/**
	 * @description Opens the metadata select type popup
	 **/
	addMetadataSelectType : function() {
		var mdType = $('#rf-type').val();
		
		if(!d3vUtil.isValidFilename(mdType)) {
			d3vUtil.alert('the file/package name chosen is not valid', { scheme : 'negative' });
			return;
		}
		
		var isMetadata = !d3vPush.isPackageXML(mdType);
		
		if(isMetadata) { 
			d3vPopups.showAnimatedModal('#rf2-popup');
		} else {
			d3vUtil.alert('package added to filter successfully', { scheme : 'positive' });
			d3vPush.addMetadataToFilter();
			d3vPush.addMetadataTopLevel();
		}
	},
	
	/**
	 * @description Opens the metadata select method popup
	 **/
	addMetadataMethod : function() {
		var retrieveMethod = $('input[name="rf-method"]:checked').val();
		
		if(retrieveMethod === PKG_METHOD_QUERY) {
			var currentQuery = $('#rf3-detail-query').val();
			
			if(!currentQuery) {
				currentQuery = 'SELECT Name FROM ' + $('#rf-type').val();
				$('#rf3-detail-query').val(currentQuery);
			}
			
			if(!$('#rf3-detail-member').val()) {
				$('#rf3-detail-member').val('Name');
			}
			
			d3vPopups.showAnimatedModal('#rf3query-popup');
		} else if(retrieveMethod === PKG_METHOD_WRITTEN) {
			d3vPopups.showAnimatedModal('#rf3written-popup');
		} else if(retrieveMethod === PKG_METHOD_WILDCARD) {
			d3vUtil.alert('metadata added to filter successfully', { scheme : 'positive' });
			d3vPush.addMetadataToFilter();
			d3vPush.addMetadataTopLevel();
		} else {
			d3vUtil.alert('select a retrieve method');
		}
	},	
	
	/**
	 * @description Opens the metadata select by query popup
	 **/
	addMetadataByQuery : function() {
		var detail = $('#rf3-detail-query').val();
		var member = $('#rf3-detail-member').val();
		
		if(detail && detail.length && member && member.length) {
			d3vPush.addMetadataToFilter();
			d3vPush.addMetadataTopLevel();
		} else {
			d3vUtil.alert('values required before continuing', { scheme : 'negative' });
		}
	},	
	
	/**
	 * @description Opens the metadata select by write out popup
	 **/
	addMetadataWrittenOut : function() {
		var detail = $('#rf3-detail-written').val();
		
		if(detail && detail.length) {
			d3vPush.addMetadataToFilter();
			d3vPush.addMetadataTopLevel();		
		} else {
			d3vUtil.alert('value is required before continuing', { scheme : 'negative' });
		}
	},	
	
	/**
	 * @description Opens the top level of the add metadata popup.
	 **/
	addMetadataTopLevel : function() {
		d3vPopups.showAnimatedModal('#manage-push-filter');
		d3vPush.resetMetadataInputs();
		d3vPush.refreshFilterForm();
	},
	
	/**
	 * @description Initializes the 'add metadata' autocomplete with package xml names and metadata sobject suggestions
	 **/ 
	initializeMetadataTypeahead : function() {
		var suggestions = 
			['AccountSettings', 'ActionLinkGroupTemplate', 'ActionOverride', 'ActivitiesSettings', 'AddressSettings', 'AnalyticSnapshot', 'ApexClass', 'ApexComponent', 'ApexPage', 'ApexTrigger', 'AppMenu', 'ApprovalProcess', 'ArticleType', 'AssignmentRules', 'AuthProvider', 'AuraDefinition', 'AuraDefinitionBundle', 'AutoResponseRules', 'BaseSharingRule', 'BrandingSet', 'BusinessHoursSettings', 'BusinessProcess', 'RecordType', 'CallCenter', 'CaseSettings', 'Certificate', 'ChatterAnswersSettings', 'ChatterExtensions (Pilot)', 'CleanDataService', 'CompanySettings', 'Community (Zone)', 'CommunityTemplateDefinition', 'CommunityThemeDefinition', 'CompactLayout', 'ConnectedApp', 'ContentAsset', 'ContractSettings', 'CorsWhitelistOrigin', 'CriteriaBasedSharingRule', 'CustomApplication', 'CustomApplicationComponent', 'CustomApplication', 'CustomFeedFilter', 'CustomField', 'CustomLabel', 'Custom Metadata Types (CustomObject)', 'CustomMetadata', 'CustomLabels', 'CustomObject', 'CustomObjectTranslation', 'CustomPageWebLink', 'CustomPermission', 'CustomSite', 'CustomTab', 'Dashboard', 'DataCategoryGroup', 'DelegateGroup', 'Document', 'DuplicateRule', 'EclairGeoData', 'EmailTemplate', 'EntitlementProcess', 'EntitlementSettings', 'EntitlementTemplate', 'ExternalServiceRegistration', 'ExternalDataSource', 'FieldSet', 'FileUploadAndDownloadSecuritySettings', 'FlexiPage', 'Flow', 'FlowDefinition', 'Folder', 'FolderShare', 'ForecastingSettings', 'GlobalValueSet', 'GlobalValueSetTranslation', 'GlobalPicklistValue', 'Metadata', 'Group', 'HomePageComponent', 'HomePageLayout', 'IdeasSettings', 'InstalledPackage', 'KeywordList', 'KnowledgeSettings', 'Layout', 'Letterhead', 'ListView', 'LiveAgentSettings', 'LiveChatAgentConfig', 'LiveChatButton', 'LiveChatDeployment', 'LiveChatSensitiveDataRule', 'ManagedTopics', 'MatchingRule', 'Metadata', 'MetadataWithContent', 'MilestoneType', 'MobileSettings', 'ModerationRule', 'NamedCredential', 'NamedFilter', 'NameSettings', 'Network', 'OpportunitySettings', 'OrderSettings', 'OwnerSharingRule', 'Package', 'retrieve()', 'PathAssistant', 'PathAssistantSettings', 'PermissionSet', 'PersonalJourneySettings', 'Picklist (Including Dependent Picklist)', 'PlatformCachePartition', 'Portal', 'PostTemplate', 'ProductSettings', 'Profile', 'ProfileActionOverride', 'ProfilePasswordPolicy', 'ProfileSessionSetting', 'Queue', 'QuickAction', 'QuoteSettings', 'RecordType', 'RemoteSiteSetting', 'Report', 'ReportType', 'Role', 'SamlSsoConfig', 'Scontrol', 'SearchLayouts', 'SearchSettings', 'SecuritySettings', 'SharingBaseRule', 'SharingReason', 'SharingRecalculation', 'SharingRules', 'SharingSet', 'SiteDotCom', 'MetadataWithContent', 'Skill', 'StandardValueSet', 'Metadata', 'StandardValueSetTranslation', 'StaticResource', 'SynonymDictionary', 'Territory', 'Territory2', 'Territory2Model', 'Territory2Rule', 'Territory2Settings', 'Territory2Type', 'TransactionSecurityPolicy', 'Translations', 'ValidationRule', 'WaveApplication', 'WaveDashboard', 'WaveDataflow', 'WaveDataset', 'WaveLens', 'WaveTemplateBundle', 'Wavexmd', 'WebLink', 'Workflow'];
		
		var base = PACKAGE_XML_FILE + aside.org.orgId;
		var fn;
		
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(base) === 0) {
				fn = prop.substring(base.length);
				suggestions.push(fn + '.xml');
			}
		}			
		
		var $input = $('#rf-type');
		
		if($input.hasClass('ui-autocomplete-input')) {
			$input.autocomplete('option', {source : suggestions});
		} else {
			$input.autocomplete({source : suggestions});
		}
	},
	
	/**
	 * @description If there is an active retrieve filter, uses it to refresh the filter form
	 **/
	refreshFilterForm : function() {
		if(activeRetrieveFilter) {
			d3vPush.populateFilterForm(activeRetrieveFilter);	
		}
	},
	
	/**
	 * @description Clears all inputs in the 'Add Metadata' flow
	 **/
	resetMetadataInputs : function() {
		$('#p-filter-name, #rf-type, #rf3-detail-query, #rf3-detail-member, #rf3-detail-written').val('');
		$('input[name="rf-method"]:checked').prop('checked', false);
		$('#rf-type').attr('edit-id', '');
	},
	
	/**
	 * @description Adds Metadata in the forms to the active filter
	 **/
	addMetadataToFilter : function() {
		if(activeRetrieveFilter) {
			var newMetadata = d3vPush.getMetadataToAdd();
			
			var isInsert = true;
			for(var i = 0, end = activeRetrieveFilter.metadata.length; i < end; i++) {
				if(activeRetrieveFilter.metadata[i].id === newMetadata.id) {
					isInsert = false;
					activeRetrieveFilter.metadata[i] = newMetadata;
					break;
				}
			}
			
			if(isInsert) {
				activeRetrieveFilter.metadata.push(newMetadata);
			}
			
			d3vPush.saveFilter();
		}
	},
	
	/**
	 * @description Builds out the metadata object for the entered information
     * @return      the metadata object to add to the filter
	 **/
	getMetadataToAdd : function() {
		var metadata = {};
		
		var $type = $('#rf-type');
		metadata.type = $type.val();
		metadata.method = d3vPush.isPackageXML(metadata.type) ? PKG_METHOD_XML : $('input[name="rf-method"]:checked').val();
		metadata.id = $type.attr('edit-id') || d3vUtil.getRandomString();
		
		if(metadata.method === PKG_METHOD_QUERY) {
			metadata.detail = $('#rf3-detail-query').val();
			metadata.member = $('#rf3-detail-member').val();
		} else if(metadata.method === PKG_METHOD_WRITTEN) {
			metadata.detail = $('#rf3-detail-written').val();
		}
		
		return metadata;
	},
	
	/**
	 * @description Filters the retrieve results (left box)
	 **/
	filterRetrieveResults : function() {
		var filterText = $('#retrieve-filter-filter').val().toLowerCase();
		var $source = $('#available-to-retrieve li .file, #available-to-retrieve li .modified-by, #available-to-retrieve li .md-type');
		var toHide = [];
		var toShow = [];
		
		if(filterText && filterText.length) {
			var $ele;
			$source.each(function(idx, ele) {
				if(ele.innerText.toLowerCase().indexOf(filterText) === -1) {
					toHide.push(ele);
				} else {
					toShow.push(ele);
				}
			});
			
			$(toHide).parent().hide();
			$(toShow).parent().show();
			d3vPush.toggleEmptyMessages();
		} else {
			$source.parent().show();
		}
		
		d3vPush.maintainEvenOddPattern();
	},
	
	/**
	 * @description Binds all actions related to the push section
	 **/
	bindActions : function() {
		$('span#p-add-all').unbind().click(d3vPush.addAll);
		$('span#p-add-sel').unbind().click(d3vPush.addSelected);
		$('span#p-rem-all').unbind().click(d3vPush.removeAll);
		$('span#p-rem-sel').unbind().click(d3vPush.removeSelected);	
		$('span#download-pkg').unbind().click(d3vPush.downloadPackageXML);
		$('span#p-clear-left').unbind().click(d3vPush.emptyAvailableTable);
		$('span#p-clear-right').unbind().click(d3vPush.emptyPackageTable);
		$('div#push-save-filter').unbind().click(d3vPush.saveFilter);
		
		$('div#push-add-metadata').unbind().click(d3vPush.addMetadata);
		$('div#rf1-next').unbind().click(d3vPush.addMetadataSelectType);
		$('div#rf2-back').unbind().click(d3vPush.addMetadata);
		$('div#rf2-next').unbind().click(d3vPush.addMetadataMethod);
		$('div#rf3written-back, div#rf3query-back').unbind().click(d3vPush.addMetadataSelectType);
		$('div#rf3written-next').unbind().click(d3vPush.addMetadataWrittenOut);
		$('div#rf3query-next').unbind().click(d3vPush.addMetadataByQuery);
		$('div#rf1-back').unbind().click(d3vPush.addMetadataTopLevel);
		
		$('select#retrieve-filter').unbind().change(d3vPush.selectPushFilter);
		$('div#push-delete-filter').unbind().click(d3vPush.deleteCurrentFilter);
		$('span#p-refresh-left').unbind().click(d3vPush.selectPushFilter);
		$('input#allow-missing-files').unbind().change(d3vPush.saveAllowMissingFilesSetting);
		$('input#validate-only').unbind().change(d3vPush.saveValidateOnlySetting);
		$('input#ignore-warnings').unbind().change(d3vPush.saveIgnoreWarningsSetting);
		$('input#purge-on-delete').unbind().change(d3vPush.savePurgeOnDeleteSetting);
		$('input#push-rat').unbind().change(d3vPush.saveRunAllTestsSetting);
		$('span#pdr-btn').click(d3vPush.showDeployResultsTable);
		$('span#pco-btn').click(d3vPush.showDeployConsole);
		$('span#pter-btn').click(d3vPush.showTestExecutionResultsTable);
		$('span#open-retrieve-help').click(d3vPush.showRetrieveFilterHelp);
		$('#package-xml-version').change(d3vPush.changeRetrieveVersion);
		
		$('#retrieve-filter-clear').click(d3vPush.clearFilterInput);
		$('#retrieve-filter-filter').keyup(d3vUtil.debounce(d3vPush.filterRetrieveResults, 300));
		
		$('span#push-show-deploy-status').click(function() {
			d3vPush.openDeployStatusPopup(false);
		});
		
		$('span#retrieve').unbind().click(function() {
			d3vPush.retrieve();
		});
		
		$('span#push-add-filter').unbind().click(d3vPush.addNewFilter);
		$('span#push-edit-filter').unbind().click(d3vPush.editSelectedFilter);
		
		var primaryDropZone   = document.getElementById('push-content');
		var overlayDropZone   = document.getElementById('generic-overlay');
		var deployPopDropZone = document.getElementById('deploy-status-popup');		
		
		primaryDropZone.addEventListener('dragover', d3vPush.recognizeDrag, false);
		primaryDropZone.addEventListener('drop', d3vPush.handleFileDrop, false);	
		primaryDropZone.addEventListener('dragleave', d3vPush.handleDragExit, false);

		overlayDropZone.addEventListener('dragover', d3vPush.recognizeDrag, false);
		overlayDropZone.addEventListener('drop', d3vPush.handleFileDrop, false);	
		overlayDropZone.addEventListener('dragleave', d3vPush.handleDragExit, false);
		
		deployPopDropZone.addEventListener('dragover', d3vPush.recognizeDrag, false);
		deployPopDropZone.addEventListener('drop', d3vPush.handleFileDrop, false);	
		deployPopDropZone.addEventListener('dragleave', d3vPush.handleDragExit, false);				
	},
	
	/**
	 * @description Clears the retrieve filter text input
	 **/
	clearFilterInput : function() {
		$('#retrieve-filter-filter').val('');
		d3vPush.filterRetrieveResults();
	},
	
	/**
	 * @description Starts the "Add Retrieve Filter" flow
	 **/
	addNewFilter : function() {
		d3vPopups.showAnimatedModal('#manage-push-filter');
		d3vPush.resetMetadataInputs();
		d3vPush.populateFilterForm(null);
		activeRetrieveFilter = null;
	},
	
	/**
	 * @description Starts the "Add Retrieve Filter" flow
	 **/
	editSelectedFilter : function() {
		d3vPush.processPushFilter(function(filter) {
			d3vPopups.showAnimatedModal('#manage-push-filter');
			activeRetrieveFilter = filter;
			d3vPush.populateFilterForm(activeRetrieveFilter);
			d3vPush.addMetadataTopLevel();
		});
	},	
	
	/**
	 * @description Show deploy results table
	 **/
	showDeployResultsTable : function() {
		$(this).addClass('deploy-status-active').removeClass('deploy-status-inactive');
		$('span#pter-btn, span#pco-btn').removeClass('deploy-status-active').addClass('deploy-status-inactive');
		$('div#pter').hide();
		$('div#pco').hide();
		$('div#pdr-table').show();
	},
	
	/**
	 * @description Show deploy console output
	 **/
	showDeployConsole : function() {
		$(this).addClass('deploy-status-active').removeClass('deploy-status-inactive');
		$('span#pter-btn, span#pdr-btn').removeClass('deploy-status-active').addClass('deploy-status-inactive');
		$('div#pter').hide();
		$('div#pdr-table').hide();
		$('div#pco').show();
	},	

	/**
	 * @description Show test execution results table
	 **/	
	showTestExecutionResultsTable : function() {
		$(this).addClass('deploy-status-active').removeClass('deploy-status-inactive');
		$('span#pdr-btn, span#pco-btn').removeClass('deploy-status-active').addClass('deploy-status-inactive');	
		$('div#pdr-table').hide();
		$('div#pco').hide();
		$('div#pter').show();
		d3vPush.sizePushScreen();
	},
	
	/**
	 * @description Writes text to the push console
	 * @param       newText - the new text to write to the console
	 * @param       reset   - true if you want to clear the console before writing the text
	 **/
	writeToPushConsole : function(newText, reset) {
		var $console = $('div#pco textarea');
		
		if(reset) {
			$console.text(aside.org.name);
		}
		
		var currentText = $console.text();
		$console.text(currentText + SF_DEPLOY + newText);
	},

	/**
	 * @description Empties the table containing files available to package.
	 **/	
	emptyAvailableTable : function() {
		d3vPush.emptyTable($('ul#available-to-retrieve'));
	},
	
	/**
	 * @description Empties the table containing files that will be packaged.
	 **/	
	emptyPackageTable : function() {
		d3vPush.emptyTable($('ul#will-retrieve'));
	},	
	
	/**
	 * @description Empties the specified table
	 * @param		$target - the table to empty
	 **/	
	emptyTable : function($target) {
		$target.find('li').remove();
		d3vPush.toggleEmptyMessages();
	},	

	/**
	 * @description Toggles the empty message, based on wether or not the table is empty.
	 * @param		$table - the table to toggle the message on
	 **/
	toggleEmptyMessage : function($table) {
		var $items = $table.find('li');
	 	
	 	if($items.length === 0) {
	 		$table.find('.empty-msg').show();
	 	} else {
	 		$table.find('.empty-msg').hide();
	 	}
	},
	
	/**
	 * @description Toggles the empty message on both tables.
	 **/	
	toggleEmptyMessages : function() {
		d3vPush.toggleEmptyMessage($('ul#will-retrieve'));
		d3vPush.toggleEmptyMessage($('ul#available-to-retrieve'));
	},

	/**
	 * @description Generates and downloads a package.xml for the selected metadata
	 **/		
	downloadPackageXML : function() {
		var pkgXML = d3vPush.getPackageXML();
		
		if(pkgXML) {
			var fileBlob = new Blob([pkgXML], {type: "text/plain;charset=" + document.characterSet});
			d3vUtil.alert('Package generated successfully!', { scheme : 'positive' });
			saveAs(fileBlob, 'package.xml');
		}		
	},
	
	/**
	 * @descrption Generates a package.xml for the selected metadata.
	 * @param      bodyOnly - only return the body of the package.xml e.g. just <types> and its children
	 * @return     package.xml as a string
	 **/
	getPackageXML : function(bodyOnly) {
		var $package = $('ul#will-retrieve li');
		
		if($package.length === 0) {
			d3vUtil.alert('nothing to package…');
			return null;
		}	
		
		var grouped = d3vPush.groupPackageContents($package);
		
		return d3vPush.getXMLString(grouped, bodyOnly || false);
	},
	
	/**
	 * @description Generates the <types> elements and their children as a string given results of groupPackageContents()
	 * @param       grouped - results from groupPackageContents()
	 * @return      <types> elements and their children as a string
	 **/
	getPackageTypes : function(grouped) {		
		var xml = '';
		
		for(var prop in grouped) {
			if(grouped.hasOwnProperty(prop)) {
				xml += d3vPush.getMemberXML(grouped[prop], prop);
			}
		}
		
		return xml;
	},	

	/**
	 * @description builds out a package.xml string
	 * @param       grouped  - metadata grouped by type
	 * @param       bodyOnly - get just the <types> elements and their children 
	 * @return      package xml string
	 **/	
	getXMLString : function(grouped, bodyOnly) {
		var version = $('#package-xml-version').val();
		var versionText = '';
		
		if(version && version.length) {
			versionText = '\t<version>' + version + '</version>\n';
		}	
	
		if(bodyOnly) {
			return d3vPush.getPackageTypes(grouped) + versionText;
		}
	
		return '<?xml version="1.0" encoding="UTF-8"?>\n'                    +
		       '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
					d3vPush.getPackageTypes(grouped)                         +
					versionText                                              +
		       '</Package>';
	},	

	/**
	 * @description returns the series of <member> elements for a single type
	 * @param       group - list of metadata elements to package e.g. ['MyFile1', 'MyFile2']
	 * @param       type  - type of metadata e.g. 'ApexClass'
	 * @return      member xml
	 **/		
	getMemberXML : function(group, type) {
		if(group.length) {
			var typesOpen  = '\t<types>\n';
			var typesClose = '\t</types>\n';
			var nameOpen   = '\t\t<name>';
			var nameClose  = '</name>\n';
			
			return typesOpen + group.join('') + nameOpen + type + nameClose + typesClose;
		}
		
		return '';
	},

	/**
	 * @description turns the html elements passed in into an object where they are grouped by type
	 * @param       grouped - metadata grouped by type
	 * @return      object containing metadata names grouped by type
	 **/	
	groupPackageContents : function($package) {
		var memberOpen  = '\t\t<members>';
		var memberClose = '</members>\n';
		var currentFilename;
		var relatedObject;
		var grouped = {};
					
		$.each($package, function(idx, ele) {
			currentFilename = $(ele).find('span.file').text();
			relatedObject   = $(ele).find('span.md-type').text();
			
			if(!$.isArray(grouped[relatedObject])) {
				grouped[relatedObject] = [];
			}
			
			grouped[relatedObject].push(memberOpen + currentFilename + memberClose);
		});
		
		return grouped;
	},
	
	/**
	 * @description Saves the filter in the form
	 **/
	saveFilter : function() {
		d3vUtil.alert('saving filter...');
		$('#rf-type').attr('edit-id', '');
		d3vPush.validateFilterSave(d3vPush.getFilterObject());
	},

	/**
	 * @description validates the ability to save a filter and saves it if it is valid
	 * @param		filter - the filter to save
	 **/	
	validateFilterSave : function(filter) {
		if(filter) {
			d3vPush.checkNameUnique(filter.uniqueName, function() {
				d3vPush.executeFilterInsert(filter);
			}, function() {
				d3vPush.executeFilterUpdate(filter);
			});	
		} else {
			d3vUtil.alert('You must enter a filter name.');
		}
	},

	/**
	 * @description Perform an update to the details of an existing filter.
	 * @param       filter - the filter to update
	 **/
	executeFilterUpdate : function(filter) {
		d3vArchive.updatePushFilter(filter);
		d3vUtil.alert('filter updated successfully!', { scheme : 'positive' });
		
		setTimeout(function() {
			d3vPush.generateFilterPicklist(false);
			d3vPush.updateOnloadFilterPicklist();
			d3vPush.updateOnloadFilter(filter);
		}, 500);
	},

	/**
	 * @description Perform an insert on a filter
	 * @param       filter - the filter to insert
	 **/	
	executeFilterInsert : function(filter) {
		d3vArchive.writePushFilter(filter);
		d3vUtil.alert('filter created successfully!', { scheme : 'positive' });
		
		setTimeout(function() {
			d3vPush.generateFilterPicklist(true);
			d3vPush.updateOnloadFilterPicklist();
		}, 500);
	},

	/**
	 * @description Verify that the filtername has not already been used
	 * @param		filterName - name of new filter
	 * @param		insertRow  - callback for what to do when the name is unique
	 * @param		updateRow  - callback for what to do when the name already exists
	 **/		
	checkNameUnique : function(filterName, insertRow, updateRow) {
		var rowNames = [];
		
		var validateNameUniqueness = function() {
			d3vArchive.readAll(TABLE_PUSH_FILTERS, function(val) {
				rowNames.push(val.uniqueName);
			}, function() {
				var isUnique = true;
				
				for(var i = 0, end = rowNames.length; i < end; i++) {
					if(filterName === rowNames[i]) {
						isUnique = false;
						break;
					}
				}
				
				if(isUnique) {
					insertRow(filterName);
				} else {
					updateRow(filterName);
				}
			});
		};
		
		validateNameUniqueness();
	},
	
	/**
	 * @description Get a filter object representing the data filled in the filter form
	 **/	
	getFilterObject : function() {
		var recordName = $('input#p-filter-name').val() || '';
		
		if(!recordName) {
			return null;
		}
		
		var hasFilters = activeRetrieveFilter && activeRetrieveFilter.metadata && activeRetrieveFilter.metadata.length ? true : false;
	
		var filter = {
			label      : recordName,
			uniqueName : recordName.replace(/[^\w\s]+/g,'').replace(/\s+/g, '_'),
			org		   : d3vUtil.getOrgId(),		
			metadata   : hasFilters ? activeRetrieveFilter.metadata : []
		};
		
		for(var i = 0, end = filter.metadata.length; i < end; i++) {
			if(!filter.metadata[i].id) {
				filter.metadata[i].id = d3vUtil.getRandomString();
			}
		}
		
		return filter;
	},
	
	/**
	 * @description Adds custom push filters to the onload filter choices
	 * @param       onload - should be true on load, to set default
	 **/
	updateOnloadFilterPicklist : function(onload) {
		var customFilters = 
			'<option value="both">Load Everything</option>' +
			'<option value="upkg">Load Only Unpackaged</option>' +
			'<option value="pkgd">Load Only Packaged</option>' +
			'<option value="none">Don\'t Load Anything</option>';
		
		d3vArchive.readAll(TABLE_PUSH_FILTERS, function(val) {
			//New retrieve updates to not work properly with this functionality
			customFilters += '<option value="' + val.id + '">Custom: ' + val.label + '</option>';
		}, function() {
			if(customFilters) {
				var $select = $('select#onload-filter');
				var oldVal = $select.val();
				$select.html(customFilters).val(oldVal);
			}			
			
			if(onload) {
				//Breaks ASIDE with new retrieve filters
				d3vCode.loadCodeFilter();
			}
		});	
	},

	/**
	 * @description Generates the list of available options in the filter typeahead
	 * @param		filter   - (optional) true/false -> true on update false when not
	 **/		
	generateFilterPicklist : function(filter) {
		var rowNames = []; 
		var $select  = $('select#retrieve-filter');
		var currentValue = $select.val();
		var orgId = d3vUtil.getOrgId();
		var customFilters = '';
		$select.empty().append('<option></option>');
		
		var buildSelectList = function() {
			d3vArchive.readAll(TABLE_PUSH_FILTERS, function(val) {
				customFilters += '<option value="' + val.id + '">' + val.label + '</option>';
			}, function() {
				if(customFilters) {
					$select.append('<optgroup label="Custom Filters">' + customFilters + '</optgroup>');
				}
				
				var standardFilters = '<optgroup label="Default Filters">';
				var defaultFilters = d3vPush.getDefaultFilters();
				
				for(var i = 0, end = defaultFilters.length; i < end; i++) {
					standardFilters += '<option value="' + defaultFilters[i].id + '">' + defaultFilters[i].label + '</option>';
				}
				
				standardFilters += '</optgroup>';
				
				$select.append(standardFilters);
				
				if(currentValue && currentValue.length) {
					$select.val(currentValue);
				} else if(filter) {
					$('#push-edit-filter').hide();
				}
				
				$select.trigger('chosen:updated');				
			});
		};
		
		buildSelectList();		
	},
	
	/**
	 * @description Handles selection of a filter in the filter typeahead
	 * @param       callback - function for processing the push filter
	 **/	
	selectPushFilter : function() {
		$('#retrieve-filter-filter').val('');
		d3vPush.emptyAvailableTable();
		$('#push-edit-filter').show();		
		d3vPush.processPushFilter(d3vPush.loadSelectedFilter);
	},

	/**
	 * @description Loads and processes a filter
	 * @param       callback - function for processing the push filter
	 **/	
	processPushFilter : function(callback) {
		var selected = $('select#retrieve-filter').val();
		
		if(!selected) {
			return;
		}
		
		if(selected.indexOf('default-') !== -1) {
			var defaultFilters = d3vPush.getDefaultFilters();
			
			for(var i = 0, end = defaultFilters.length; i < end; i++) {
				if(defaultFilters[i].id === selected) {
					callback(defaultFilters[i]);
					break;				
				}
			}			
		} else {
			d3vArchive.readFile(parseInt(selected), TABLE_PUSH_FILTERS, function(evt) {
				callback(evt.target.result);
			});
		}
	},
	
	/**
	 * @description Loads the specified filter; populating the filter form and the left table with the filter results
	 * @param       filter - the filter to apply
	 **/
	loadSelectedFilter : function(filter) {
		var addLabel;
		var request;
		var deletable = false;
		
		if(filter) {
			activeRetrieveFilter = filter;
			addLabel = 'Edit Filter';
			deletable = ('' + filter.id).indexOf('default-') === -1;
			request = d3vPush.getServerReadyFilter(filter);
			
			d3vUtil.alert('loading selected…');
			d3vPush.populateFilterForm(filter);	
			$('ul#available-to-retrieve div.empty-msg').text('loading...');					
						
			ServerAction.getPushFilterResults(request, function(result) {
				d3vPush.renderFilterResults(result, filter);
			});			
		}
		
		if(deletable) {
			$('div#push-delete-filter').show();
		} else {
			$('div#push-delete-filter').hide();
		}
	},

	/**
	 * @description Create a more lightweight filter with forced "order by name" so only the needed data is sent with the request to the server.
	 * @param       filter - the filter to minify
	 * @return      the minified filter
	 **/	
	getServerReadyFilter : function(filter) {
		var md;
		var request = [];
		
		for(var i = 0, end = filter.metadata.length; i < end; i++) {
			md = filter.metadata[i];
			
			if(md.method === PKG_METHOD_QUERY) {
				request.push(d3vPush.modifyFilterQuery(md.detail, md.member));
			}
		}
		
		return request;
	},

	/**
	 * @description Modifies a filter where clause so it is ready for the server
	 * @param       query - the query to adjust
	 * @param       (optional) alternateNameField - use a field other than the default Name field when sorting
	 * @return      the modified query
	 **/		
	modifyFilterQuery : function(query, alternateNameField) {
		query = d3vPush.addOrderByToQuery(query, alternateNameField);
		query = d3vPush.patchInFilterVariable(query);
		
		return query;
	},

	/**
	 * @description Modifies a filter where clause filling in the #LAST_DEPLOY and #LAST_RETRIEVE variables
	 * @param       query - the query to adjust
	 * @return      the modified query
	 **/	
	patchInFilterVariable : function(query) {
		query = query.replace(/\#last\_deploy/i, d3vUtil.formatQueryDate(new Date(parseInt(d3vPush.getDeployTime()))));
		query = query.replace(/\#last\_retrieve/i, d3vUtil.formatQueryDate(new Date(parseInt(d3vPush.getRetrieveTime()))));
		return query;
	},	

	/**
	 * @description Adds "ORDER BY Name" to a soql query if it does not already have it
	 * @param       query - the query to adjust
	 * @param       (optional) alternateNameField - use a field other than the default Name field when sorting
	 * @return      the modified query
	 **/		
	addOrderByToQuery : function(query, alternateNameField) {
		var lcQuery   = query.toLowerCase();
		var nameField = 'Name';
		
		if(lcQuery.indexOf(' order by ') !== -1 || (alternateNameField && alternateNameField.length && alternateNameField.indexOf('+') !== -1)) {
			return query;
		}
		
		if(alternateNameField) {
			nameField = alternateNameField;
		}
		
		var limitLocation = lcQuery.indexOf(' limit ');
		if(limitLocation === -1) {
			query += ' ORDER BY ' + nameField;
		} else {
			query = query.slice(0, limitLocation) + ' ORDER BY ' + nameField + query.slice(limitLocation);
		}
		
		return query;
	},
	
	/** 
	 * @description Builds out a map of Tooling Sobject Name -> main and sub field names
	 * @param       filter - to build a map from
	 * @return      the map
	 **/
	getFilterInfoMap : function(filter) {
		var map = {};
		
		if(filter && filter.metadata && filter.metadata.length) {
			for(var i = 0, end = filter.metadata.length; i < end; i++) {
				if(filter.metadata[i].method === PKG_METHOD_QUERY) { 
					map[filter.metadata[i].type] = {
						main : filter.metadata[i].member,
						subs : d3vPush.getQuerySubFields(filter.metadata[i])
					};
				}
			}
		}
		
		return map;
	},

	/**
	 * @description Build out an array of query sub fields to display in the retrieve results
	 * @param       metadata - the filter to process
	 **/
	getQuerySubFields : function(metadata) {
		if(metadata.method === PKG_METHOD_QUERY && metadata.detail && metadata.detail.length) {
			var query = $.trim(metadata.detail);
			query = query.substring(6);
			var fromLoc = query.toLowerCase().indexOf(' from ');
			query = $.trim(query.substring(0, fromLoc));
			var fields = query.split(',');
			var field;
			var lower;
			var subs = [];
			var lowerMember = metadata.member.toLowerCase();
			
			for(var i = 0, end = fields.length; i < end; i++) {
				field = $.trim(fields[i]);
				lower = field.toLowerCase();
				
				if(subs.length < 2 && lower && lower.length && lower !== 'id' && lowerMember.indexOf(lower) === -1) {
					subs.push(field);
				}
			}
			
			return subs;
		}
		
		return [];
	},

	/**
	 * @description Displays push filter results in the "available for retrieve" table.
	 * @param       results - the results to display
	 * @param       filter - that produced the results
	 **/		
	renderFilterResults : function(results, filter) {
		$('ul#available-to-retrieve div.empty-msg').text('Select a retrieve filter to find metadata to add to the package.xml');
		results = eval('(' + results + ')');
		
		var flattened;
		var markup = '';
		var rowMarkup;
		var filterInfo = d3vPush.getFilterInfoMap(filter);
		
		//results list is just PKG_METHOD_QUERY results, because other types dont require server interaction
		for(var i = 0, end = results.length; i < end; i++) {
			rowMarkup = d3vPush.getRetrievableMarkup(results[i], i, filterInfo);
			
			if(rowMarkup && rowMarkup.length) {
				markup += rowMarkup;
			}
		}
		
		var className;
		
		if(filter && filter.metadata && filter.metadata.length) {
			for(var i = 0, end = filter.metadata.length; i < end; i++) {
				className = (i + results.length) % 2 === 0 ? 'even' : 'odd';
				
				if(filter.metadata[i].method === PKG_METHOD_WILDCARD) {
					markup += d3vPush.generateResultRowMarkup(className, '*', filter.metadata[i].type, '');
				} else if(filter.metadata[i].method === PKG_METHOD_WRITTEN) {
					var members = filter.metadata[i].detail;
					if(members && members.length) {
						members = members.split(',');
						for(var j = 0, endJ = members.length; j < endJ; j++) {
							markup += d3vPush.generateResultRowMarkup(className, $.trim(members[j]), filter.metadata[i].type, '');
						}
					}
				} else if(filter.metadata[i].method === PKG_METHOD_XML) {
					var packageJSON = d3vPush.packageToJSON(filter.metadata[i].type.replace(/\.xml/gi, ''));
					
					if(packageJSON) {
						for(var prop in packageJSON) {
							if(packageJSON.hasOwnProperty(prop)) {
								
								for(var j = 0, endJ = packageJSON[prop].length; j < endJ; j++) {
									markup += d3vPush.generateResultRowMarkup(className, packageJSON[prop][j], prop, '');
								}
							}
						}
					}
				}
			}
		}
		
		$('ul#available-to-retrieve').append(markup);
		d3vPush.cleanDuplicates($('#available-to-retrieve'));
		d3vUtil.alert('filter applied successfully', { scheme : 'positive' });
		d3vPush.toggleEmptyMessages();
		d3vPush.maintainEvenOddPattern();
	},

	/**
	 * @description Parses the "main" attribute on a retrieve filter into the actual result
	 * @param       main - what to parse
	 * @param       row - query result row to plug data in from
	 * @return      the row name to display to the user
	 **/
	getRetrieveableRowName : function(main, row) {
		var result = '';
		
		if(main && main.length) {
			var tokens = main.split('+');
			var token;
			var endQuoteLoc;
			
			for(var i = 0, end = tokens.length; i < end; i++) {
				token = $.trim(tokens[i]);
				
				if(!token || !token.length) {
					continue;
				}
				
				endQuoteLoc = token.lastIndexOf('"');
				
				if(token.indexOf('"') === 0 && endQuoteLoc === token.length - 1 && endQuoteLoc > 0) {
					//if it starts and ends with quotes, its a literal
					
					result += token.substring(1, endQuoteLoc);
				} else if(token.indexOf('.') !== -1) {
					var objectSplit = token.split('.');
					
					if(objectSplit.length >= 2 && row[objectSplit[0]] && row[objectSplit[0]][objectSplit[1]]) {
						result += row[objectSplit[0]][objectSplit[1]];
					}				
				} else if(row[token]) {
					//if it doesnt, then its either a field or a parent lookup + field
					
					result += row[token];
				} else if(token.indexOf('TRANSLATE(') === 0) {
					//field translation
					
					token = token.replace('TRANSLATE(', '').replace(')', '');
					
					if(row[token]) {
						var translatedId = aside.objMap[row[token]];
						
						if(translatedId) {
							result += translatedId;
						} else {
							result += row[token];
						}
					}
				}
			}
		}
		
		return result;
	},

	/**
	 * @description Turns a retrievable row into the markup to display that row
	 * @param       row   - file to get markup for
	 * @param       index - order of markup in list of retrievables
	 * @param       filterInfo - results from getFilterInfoMap call
	 **/		
	getRetrievableMarkup : function(row, index, filterInfo) {
		var className = index % 2 === 0 ? 'even' : 'odd';
		var rowType   = row.type || row.attributes.type;
		var rowName   = d3vPush.getRetrieveableRowName(filterInfo[rowType].main, row);
		var subs      = filterInfo[rowType].subs;
		var rowSub = '';
		
		if(subs && subs.length) {
			var flat = {};
			var values = [];
			var val;
			d3vData.flatten(row, false, flat);
			
			for(var i = 0, end = subs.length; i < end; i++) {
				val = flat[subs[i].toLowerCase()];
				
				if(d3vUtil.isValidDate(val)) {
					val = d3vUtil.salesforceDateMadeReadable(new Date(val).toISOString(), true);
				}
				
				values.push(val);
			}
			
			rowSub = values.join(' - ');
		}
		
		ServerAction.resetGlobalDebugInfo();
		var rowSubMarkup = rowSub ? '<span class="modified-by">' + rowSub + '</span>' : '';		
		
		return d3vPush.generateResultRowMarkup(className, rowName, rowType, rowSubMarkup);
	},
	
	/**
	 * @description Builds out a retrieve result row
	 * @param       className - even or odd
	 * @param       rowName - name of metadata member to retrieve
	 * @param       rowType - metadata type of row
	 * @param       rowSubMarkup - markup for "sub" row
	 **/
	generateResultRowMarkup : function(className, rowName, rowType, rowSubMarkup) {
		return '<li class="' + className + '">' +
		           '<span class="file">' + 
		               rowName +
		           '</span>' +
		           '<span class="md-type keep-right">' + rowType + '</span>' +
		           rowSubMarkup +
		       '</li>';	
	},

	/**
	 * @description Populates the filter form from a filter object
	 * @param       filter - the filter to use when populating the form
	 **/		
	populateFilterForm : function(filter) {
		var isEmpty = true;
		
		if(filter) {
			$('input#p-filter-name').val(filter.label);
			
			if(filter.metadata && filter.metadata.length) {
				$('.start-adding-md').hide();
				var markup = [];
				for(var i = 0, end = filter.metadata.length; i < end; i++) {
					if(filter.metadata[i].method === PKG_METHOD_QUERY) {
						markup.push(d3vPush.getFilterMarkup(filter.metadata[i], filter.metadata[i].detail));
					} else if(filter.metadata[i].method === PKG_METHOD_WILDCARD) {
						markup.push(d3vPush.getFilterMarkup(filter.metadata[i], '<members>*</members>'));
					} else if(filter.metadata[i].method === PKG_METHOD_WRITTEN) {
						markup.push(d3vPush.getFilterMarkup(filter.metadata[i], filter.metadata[i].detail));
					} else if(filter.metadata[i].method === PKG_METHOD_XML) {
						markup.push(d3vPush.getFilterMarkup(filter.metadata[i], null));
					}
				}
				
				$('#push-filter-contents').html(markup.join(''));
				$('.rg-remove').unbind().click(d3vPush.deleteMetadataFilter);
				$('.rg-edit').unbind().click(d3vPush.editMetadataFilter);
				isEmpty = false;
			}																		
		}
		
		if(isEmpty) {
			$('.start-adding-md').show();
			$('#push-filter-contents').empty();		
		}
	},
	
	/**
	 * @description Deletes the chosen metadata filter / package from a retrieve filter
	 **/
	deleteMetadataFilter : function() {
		var groupId = $(this).closest('.retrieveable-group').attr('md-id');
		
		if(groupId && activeRetrieveFilter && activeRetrieveFilter.metadata && activeRetrieveFilter.metadata.length) {
			for(var i = 0, end = activeRetrieveFilter.metadata.length; i < end; i++) {
				if(activeRetrieveFilter.metadata[i].id === groupId) {
					activeRetrieveFilter.metadata.splice(i, 1);
					d3vPush.saveFilter();
					d3vPush.refreshFilterForm();
					d3vUtil.alert('delete successful!', { scheme : "positive"});
					return;
				}
			}
		}
		
		d3vUtil.alert('delete failed', { scheme : "negative"});
	},
	
	/**
	 * @description Generates markup for query retrieve filters
	 * @param       metadata - the metadata to generate markup for
	 * @param       detail   - what to display as the filter detail
	 * @returns     metadata as markup
	 **/
	getFilterMarkup : function(metadata, detail) {
		var markup = '<div class="retrieveable-group" md-id="' + (metadata.id || '') + '">' +
						'<div class="retrieveable-group-top">' +
							'<div class="rg-icon ' + (detail === null ? 'pkg-xml' : 'metadata') +'"></div>' +
							'<div class="rg-title keep-left">' + metadata.type + '&nbsp;(' + d3vUtil.capitalizeString(metadata.method) + ')</div>' +
							'<div class="rg-actions keep-right">' +
								'<span class="rg-edit">Edit</span>' +
								'<span class="rg-remove">Delete</span>' +
							'</div>' +
						'</div>';
		
		if(detail) {
			markup += '<div class="retrieveable-group-bottom">' +
					      detail +
					  '</div>'
		}				
					
		return markup + '</div>';
	},		

	/**
	 * @description Deletes the selected filter
	 **/		
	deleteCurrentFilter : function() {
		var key  = $('input#p-filter-name').val()
		                                   .replace(/[^\w\s]+/g,'')
		                                   .replace(/\s+/g, '_');
		
		if(key) {
			d3vArchive.delete(TABLE_PUSH_FILTERS, key);
			d3vUtil.alert('filter deleted successfully', { scheme : 'positive' });
			$('div#push-delete-filter, #push-edit-filter').hide();
			d3vPopups.closePopups();
			
			setTimeout(function() {
				d3vPush.generateFilterPicklist(true);
			}, 500);
		} else {
			d3vUtil.alert('this filter is not eligible for deletion');
		}
	},

	/**
	 * @description Validates and queues up a deploy of the zip passed in
	 * @param       zipFile - the binary zip file to deploy
	 **/
	deploy : function(zipFile) {
		if(d3vPush.isQueueingDeploy()) {
			d3vUtil.alert('a deploy is already in progress', { scheme : 'negative' });
			return;
		}
		
		var zip     = new JSZip(zipFile);
		var pkgPath = d3vPush.findFileInZip(zip, 'package.xml');
		
		if(pkgPath !== null) {
			if(pkgPath !== '') {
				d3vPush.renameDirectoryInZip(zip, pkgPath, "");
			}
			
			d3vPush.writeToPushConsole('Requesting deploy...', true);
			d3vPush.updateDeployStatus(zip, true);
			d3vPush.executeDeploy(zip.generate());	
		} else {
			d3vUtil.alert('deploy failed: no package.xml found', { scheme : 'negative' });
		}
	},
	
	/**
	 * @description Determines if a deploy is currently being queued.
	 * @return      true is a deploy is being queued, false if not
	 **/
	isQueueingDeploy : function() {
		return $('div#deploy-status-popup').is(':visible') && $('span#deploy-status-marker').text() === 'Deploy In Progress';
	},

	/**
	 * @description Queues up a deploy of the zip passed in
	 * @param       zipFile - the binary zip file to deploy
	 * @param       deployOptions - override user selected deploy options (optional)
	 **/	
	executeDeploy : function(zipFile, deployOptions) {
		d3vUtil.alert('starting deploy…');
		$('span#deploy-detail-marker').hide();
		d3vPush.showDeployStatusLoading();
		d3vPush.openDeployStatusPopup(true);
		$('span#deploy-status-marker').text('Deploy In Progress').removeClass('successful').removeClass('failed').addClass('aborted');
		deployStartTime = new Date().getTime();

		var allowMissingFiles = $('input#allow-missing-files').is(':checked');
		var validateOnly = $('input#validate-only').is(':checked');
		var ignoreWarnings = $('input#ignore-warnings').is(':checked');
		var purgeOnDelete = $('input#purge-on-delete').is(':checked');
		var runAllTests = $('input#push-rat').is(':checked');
				
		if(deployOptions) {
			allowMissingFiles = deployOptions.allowMissingFiles;
			validateOnly = deployOptions.validateOnly;
			ignoreWarnings = deployOptions.ignoreWarnings;
			purgeOnDelete = deployOptions.purgeOnDelete;
			runAllTests = deployOptions.runAllTests;		
		}
		
		ServerAction.deploy(zipFile, 
		                    allowMissingFiles, 
		                    validateOnly, 
		                    ignoreWarnings, 
		                    purgeOnDelete, 
		                    runAllTests, 
		                    function(callbackData) {
		                    
			callbackData = eval('(' + callbackData + ')');
			$('.post-deploy').show();
			
			if(callbackData.deployResponse && callbackData.deployResponse.result && callbackData.deployResponse.result.id) {
				d3vUtil.alert('deploy queued successfully!', { scheme : 'positive' });
				
				d3vPush.writeToPushConsole('Request ID for the current deploy task: ' + callbackData.deployResponse.result.id);
				d3vPush.writeToPushConsole('Waiting for server to finish processing the request...');
				d3vPush.writeToPushConsole('Request Status: Pending');
				
				currentPushId = setInterval(function() {
					d3vPush.checkDeployStatus(callbackData.deployResponse.result.id, true);
				}, DEPLOY_WAIT);				
			} else {
				d3vUtil.alert('failed to queue', { scheme : 'negative' });
				d3vPopups.displayMessage('Deploy Failure', 'Deploy failed.  Show API Response for more information.', callbackData);			
				d3vPush.writeDeployFailuresToConsole(callbackData.deployResponse.result);	
			}	
		});	
	},
	
	/**
	 * @description Checks the status and handles the completion of a deploy operation
	 * @param deployId - id of deploy to check status of
	 * @param detail   - true to get a higher level of detail about the deploy
	 **/
	checkDeployStatus : function(deployId, detail) {
		ServerAction.checkDeployStatus(deployId, detail, function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			var callbackResult = callbackData.checkDeployStatusResponse.result;
			
			if(currentPushId && callbackResult && callbackResult.done) {
				if(callbackData.checkDeployStatusResponse.result.success) {
					d3vUtil.alert('deploy completed successfully!', { scheme : 'positive' });
					d3vPush.logDeployTime();
					$('span#deploy-status-marker').text('Deploy Successful').removeClass('aborted').addClass('successful');	
					
					var createdDate = new Date(callbackData.checkDeployStatusResponse.result.createdDate);
					var completedDate = new Date(callbackData.checkDeployStatusResponse.result.completedDate);
					var deployTime = parseInt((completedDate - createdDate) / 1000);
					
					d3vPush.writeToPushConsole('Request Status: Succeeded');
					d3vPush.writeToPushConsole('*********** DEPLOYMENT SUCCEEDED ***********');
					d3vPush.writeToPushConsole(
						'Finished request ' + callbackData.checkDeployStatusResponse.result.id + ' successfully.\n' +
						'\nBUILD SUCCESSFUL' +
						'\nTotal time: ' + deployTime + ' seconds ' + 
						'\nFinished: SUCCESS');
								
				} else {
					d3vUtil.alert('deploy failed, command+shift+o for more info', { scheme : 'negative' });
					$('span#deploy-status-marker').text('Deploy Failed').removeClass('aborted').addClass('failed');
					d3vPush.writeDeployFailuresToConsole(callbackData.checkDeployStatusResponse.result);				
				}

				d3vPush.updateDeployStatus(callbackData, false);
				d3vPush.showDeployStatusClose();
				clearInterval(currentPushId);
				currentPushId = null;
			} else if(callbackResult.status === 'InProgress' || callbackResult.status === 'Pending') {
				d3vUtil.alert('deploy in progress...');
				
				var consoleOutput = 'Request Status: ' + callbackResult.status;
				if(callbackResult.stateDetail) {
					consoleOutput += ' -- ' + callbackResult.stateDetail;
				}
				
				d3vPush.writeToPushConsole(consoleOutput);
			} else {
				d3vUtil.alert('deploy failed', { scheme : 'negative' });
				d3vPopups.displayMessage('Deploy Failure', 'Deploy failure.  Show API Response for more information.', callbackData);
				d3vPush.recoverFromDeploy();
				d3vPush.writeDeployFailuresToConsole(callbackData.checkDeployStatusResponse.result);
			}
		});
	},
	
	/**
	 * @description Outputs deploy failures to the console
	 * @param       result - deploy result
	 **/
	writeDeployFailuresToConsole : function(result) {
		var text = 
			'Request Status: Failed\n\nBUILD FAILED\n' +
			'*********** DEPLOYMENT FAILED ***********\n' +
			'Request ID: ' + result.id + '\n\n' +
			'All Component Failures:\n';
		
		var failures = result.details.componentFailures;
		if(failures) {
			if(!$.isArray(failures)) {
				failures = [failures];
			}
			
			for(var i = 0, end = failures.length; i < end; i++) {
				text += (i+1) + '.  ' + failures[i].fileName;
				
				if(failures[i].lineNumber) {
					text += 
						' (line ' + failures[i].lineNumber + 
						(failures[i].columnNumber ? ', column ' + failures[i].columnNumber : '') + ')';					
				}
				
				text += ' -- ' + failures[i].problemType + ': ' + failures[i].problem + '\n';
			}	
		}

		var createdDate = new Date(result.createdDate);
		var completedDate = new Date(result.completedDate);
		var deployTime = parseInt((completedDate - createdDate) / 1000);
		
		text += 
			'*********** DEPLOYMENT FAILED ***********\n\n\n' + 
			'Total time: ' + deployTime + ' seconds\n' +
			'Finished: FAILURE';
		
		var $console = $('div#pco textarea');
		var consoleText = $console.text();
		
		if(consoleText.indexOf(text) === -1) {
			d3vPush.writeToPushConsole(text);
		}
	},
	
	/**
	 * @description Recovers from deploys which fail for unknown reasons
	 **/
	recoverFromDeploy : function() {
		d3vPush.showDeployStatusClose();
		clearInterval(currentPushId);
		currentPushId = null;
	},
	
	/**
	 * @description On the deploy status popup, shows the loading bar and hides the close button
	 **/
	showDeployStatusLoading : function() {
		$('div#deploy-popup-header img').show();
		$('div#deploy-popup-header div.button').hide();
	},

	/**
	 * @description On the deploy status popup, shows the close button bar and hides the loading bar
	 **/	
	showDeployStatusClose : function() {
		$('div#deploy-popup-header div.button').show();
		$('div#deploy-popup-header img').hide();
	},	
	
	/**
	 * @description Queues up a retrieve the contents on the right list
	 * @param       packageTypes (optional) - xml of <types> and its childrens
	 **/
	retrieve : function(packageTypes) {
		if(currentPushId) {
			d3vUtil.alert('a retrieve is already in progress', { scheme : 'negative' });
			return;
		}
		
		d3vUtil.alert('starting retrieve...');
		var pkgTypes = packageTypes || d3vPush.getPackageXML(true);
		
		if(pkgTypes) {
			ServerAction.retrieve(pkgTypes, function(callbackData) {
				callbackData = eval('(' + callbackData + ')');
				
				if(callbackData.retrieveResponse && callbackData.retrieveResponse.result && callbackData.retrieveResponse.result.id) {
					d3vUtil.alert('retrieve queued successfully!', { scheme : 'positive' });
					d3vPush.logRetrieveTime();
					
					currentPushId = setInterval(function() {
						d3vPush.checkRetrieveStatus(callbackData.retrieveResponse.result.id);
					}, RETRIEVE_WAIT);				
				} else {
					d3vUtil.alert('failed to queue', { scheme : 'negative' });
					d3vPopups.displayMessage('Retrieve Failure', 'Failed to retrieve.  Show API Response for more information.', callbackData);
				}

			});
		}
	},
	
	/**
	 * @description Checks the status and handles the completion of a retrieve operation
	 * @param @retrieveId - id of retrieve to check status of
	 **/
	checkRetrieveStatus : function(retrieveId) {
		ServerAction.checkRetrieve(retrieveId, function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			
			if(callbackData.checkRetrieveStatusResponse && currentPushId &&
			   callbackData.checkRetrieveStatusResponse.result && 
			   callbackData.checkRetrieveStatusResponse.result.zipFile) {
			   
				clearInterval(currentPushId);
				currentPushId = null;
				d3vUtil.alert('retrieve ready for download!', { scheme : 'positive' });

				var zip = new JSZip(callbackData.checkRetrieveStatusResponse.result.zipFile, {base64:true});
				d3vPush.renameDirectoryInZip(zip, "unpackaged/", "src/");
				d3vPush.setRetrieveUnixPermissions(zip);
				var fileBlob = d3vPush.b64toBlob(zip.generate(), "application/octet-stream");
				saveAs(fileBlob, 'retrieve.zip');
			} else {
				d3vUtil.alert('retrieve in progress...');
			}
		});
	},
	
	/**
	 * @description Renames a directory within a zip file
	 * @param       zip     - the zip containing the directory
	 * @param       oldName - directory to change name of
	 * @param       newName - directory to change name to
	 **/
	renameDirectoryInZip : function(zip, oldName, newName) {
		var newFileName;
		
		for(var prop in zip.files) {
			if(zip.files.hasOwnProperty(prop) && prop.indexOf(oldName) !== -1) {
				newFileName = zip.files[prop].name.replace(oldName, newName);
				
				if(newFileName) {
					zip.files[prop].name   = newFileName;
		    		zip.files[newFileName] = zip.files[prop];
		    	}
		    	
		    	delete zip.files[prop];
		  	}
		}			
	},
	
	/**
	 * @description Finds the location of a file within a zip file.
	 * @param       zip    - the zip to look for the file in
	 * @param       toFind - the name of the file to find
	 * @return      the location of the file if found, null if it is not found
	 **/
	findFileInZip : function(zip, toFind) {
		var idx;
		
		for(var prop in zip.files) {
			if(zip.files.hasOwnProperty(prop)) {
				idx = prop.toLowerCase().indexOf(toFind);
				
				if(idx !== -1) {
					return prop.substring(0, idx);
				}
		  	}
		}
		
		return null;
	},
	
	/**
	 * @description Turns base64 encoded data into a blob
	 * @from        http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
	 * @param       b64Data     - the data to convert to a blob
	 * @param       contentType - content type of the blob
	 * @param       sliceSize   - (optional) process base64 data in slices as opposed to all at once
	 **/
	b64toBlob : function(b64Data, contentType, sliceSize) {
	    contentType = contentType || '';
	    sliceSize = sliceSize || 1024;
	
	    function charCodeFromCharacter(c) {
	        return c.charCodeAt(0);
	    }
	
	    var byteCharacters = atob(b64Data);
	    var byteArrays = [];
	
	    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	        var slice = byteCharacters.slice(offset, offset + sliceSize);
	        var byteNumbers = Array.prototype.map.call(slice, charCodeFromCharacter);
	        var byteArray = new Uint8Array(byteNumbers);
	
	        byteArrays.push(byteArray);
	    }
	
	    var blob = new Blob(byteArrays, {type: contentType});
	    return blob;
	},
	
	/** 
	 * @description Handles drag over event
	 * @param       evt - drag event
	 **/
	recognizeDrag : function(evt) {
		if(d3vPush.isActive()) {
	    	evt.stopPropagation();
	    	evt.preventDefault();
	    	$('div#push-footer').text('File detected, drop it for retrieve/deploy.');	
	    }
	},

	/** 
	 * @description Inspects a file drop event to see if it a package.xml or zip file has been dropped, 
	 *              and if so attempts to do a retrieve/deploy.
	 * @param       evt - drop event
	 **/	
	handleFileDrop : function(evt) {
		if(!d3vPush.isActive()) {
			return;
		}
	
	    evt.stopPropagation();
	    evt.preventDefault();
	    var files = evt.dataTransfer.files;
	    if(files && files.length === 1) {
	    	files = files[0];
	    	
	    	var validFile = files.name && files.name.length &&
	    		((files.type && files.type.length) || 
	    		(files.name.indexOf('.xml') !== -1 || files.name.indexOf('.zip') !== -1));
	    	
	    	if(validFile) {
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
			        	} else if(theFile.name.indexOf('.xml') !== -1 || theFile.type.indexOf('text/xml') !== -1) {
			        		d3vUtil.alert('found package.xml, performing retrieve...');
			        		fileResult = d3vPush.arrayBufferToBinaryString(fileResult);
			        		d3vPush.retrieve(fileResult.substring(fileResult.indexOf('<types>')).replace('</Package>', '').replace('</package>', ''));
			        	} else if (theFile.name.indexOf('.zip') !== -1 || d3vUtil.isZipAdvanced(theFile.type, fileResult)) {
			        		d3vUtil.alert('found zip, performing deploy…');
			        		d3vPush.deploy(fileResult);
			        	} else {
			        		d3vUtil.alert('the push section only processes package.xml and .zip files', { scheme : 'negative' });
			        	}
			        };
				})(files);
			
			    reader.readAsArrayBuffer(files);    
		    } else {
		    	d3vUtil.alert('the push section only processes package.xml and .zip files', { scheme : 'negative' });
		    }
	    } else if(files && files.length > 1) {
	    	d3vUtil.alert('max one file at a time', { scheme : 'negative' });
	    }
	    
	    d3vPush.resetFooter();	
	},
	
	/**
	 * @description Converts an array buffer to a binary string
	 * @credit      belongs to http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
	 * @param       buffer - the array buffer to convert
	 * @return      the base 64 string
	 **/
	arrayBufferToBinaryString : function(buffer) {
	    var binary = '';
	    var bytes  = new Uint8Array(buffer);
	    var len    = bytes.byteLength;
	    
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode(bytes[ i ]);
	    }
	    
	    return binary;
	},

	/** 
	 * @description Handles drag exit event
	 * @param       evt - drag event
	 **/	
	handleDragExit : function(ext) {
		if(d3vPush.isActive()) {
			d3vPush.resetFooter();
		}
	},

	/**
	 * @description Resets the footer to its default state.
	 **/	
	resetFooter : function() {
		$('div#push-footer').text('Drop a Package.xml to retrieve, or a zip to deploy.');	
	},
	
	/**
	 * @description Loads the saved push help setting values.
	 **/
	loadSettings : function() {
		$('input#allow-missing-files').attr('checked', d3vPush.loadSetting(COOKIE_ALLOW_MISSING));
		$('input#validate-only').attr('checked', d3vPush.loadSetting(COOKIE_VALIDATE_ONLY));
		$('input#ignore-warnings').attr('checked', d3vPush.loadSetting(COOKIE_IGNORE_WARNINGS));
		$('input#purge-on-delete').attr('checked', d3vPush.loadSetting(COOKIE_DELETE_PURGE));
		$('input#push-rat').attr('checked', d3vPush.loadSetting(COOKIE_PUSH_RAT));
	},
	
	/**
	 * @description Saves the "allow missing files" setting.
	 **/
	saveAllowMissingFilesSetting : function() {
		d3vPush.saveSetting(COOKIE_ALLOW_MISSING, $('input#allow-missing-files').is(':checked'));
	},

	/**
	 * @description Saves the "validate only" setting.
	 **/
	saveValidateOnlySetting : function() {
		d3vPush.saveSetting(COOKIE_VALIDATE_ONLY, $('input#validate-only').is(':checked'));
	},	
	
	/**
	 * @description Saves the "ignore warnings" setting.
	 **/
	saveIgnoreWarningsSetting : function() {
		d3vPush.saveSetting(COOKIE_IGNORE_WARNINGS, $('input#ignore-warnings').is(':checked'));
	},	
	
	/**
	 * @description Saves the "purge on delete" setting.
	 **/
	savePurgeOnDeleteSetting : function() {
		d3vPush.saveSetting(COOKIE_DELETE_PURGE, $('input#purge-on-delete').is(':checked'));
	},	
	
	/**
	 * @description Saves the "run all tests" setting.
	 **/
	saveRunAllTestsSetting : function() {
		d3vPush.saveSetting(COOKIE_PUSH_RAT, $('input#push-rat').is(':checked'));
	},	
	
	/**
	 * @description Loads a push help setting.
	 * @param       settingName - the setting to load
	 * @return      the value of the setting
	 **/	
	loadSetting : function(settingName) {
		var setting = localStorage[COOKIE_PRE + settingName + d3vUtil.getOrgId()];
		return setting && setting === 'true';
	},
	
	/**
	 * @description Saves a push setting.
	 * @param       settingName  - name of setting to save
	 * @param       settingValue - value to save
	 **/
	saveSetting : function(settingName, settingValue) {
		localStorage[COOKIE_PRE + settingName + d3vUtil.getOrgId()] = settingValue;
	},
	
	/**
	 * @description Modifies all files in a zip to have 644 unix permsissions
	 * @param       zip - the zip file to modify
	 **/
	setRetrieveUnixPermissions : function(zip) {
		var tempFile;
		
		for(var fileName in zip.files) {
			if(zip.files.hasOwnProperty(fileName)) {
				if(zip.files[fileName].data) {
					zip.files[fileName].options.unixPermissions = JSZIP_FILE_PERMISSIONS;
				}
		  	}
		}		
	},
	
	/**
	 * @description Translates a retrieve filter to a filter which can be used to populate the command typeahead
	 * @param retrieveFilter - custom retrieve filter to translate to the old filter style which can be used on load
	 * @return loadFilter - retrieve filter in a format which can be used to seed the command typeahead 
	 **/
	prepareFilterForLoad : function(retrieveFilter) {
		var loadFilter = {
			id : retrieveFilter.id,
			classInclude : false,
			classWhere : '',
			pageInclude : false,
			pageWhere : '',
			triggerInclude : false,
			triggerWhere : '',
			componentInclude : false,
			componentWhere : '',
			resourceInclude : false,
			resourceWhere : '',
			objectInclude : false,
			objectWhere : '',
			lightningInclude : false,
			lightningWhere : ''																	
		};
		
		if(retrieveFilter && retrieveFilter.metadata && retrieveFilter.metadata.length) {
			var name;
			
			var allowed = {
				apexclass : { include : 'classInclude', where : 'classWhere' }, 
				apexpage : { include : 'pageInclude', where : 'pageWhere' }, 
				apextrigger : { include : 'triggerInclude', where : 'triggerWhere' }, 
				apexcomponent : { include : 'componentInclude', where : 'componentWhere' }, 
				staticresource : { include : 'resourceInclude', where : 'resourceWhere' }, 
				customobject : { include : 'objectInclude', where : 'objectWhere' },
				auradefinition : { include : 'lightningInclude', where : 'lightningWhere' }
			};
			
			for(var i = 0, end = retrieveFilter.metadata.length; i < end; i++) {
				name = retrieveFilter.metadata[i].type.toLowerCase();
				
				if(retrieveFilter.metadata[i].method === PKG_METHOD_QUERY && allowed[name]) {
					loadFilter[allowed[name].include] = true;
					loadFilter[allowed[name].where] = d3vPush.getWhereClause(retrieveFilter.metadata[i].detail) || '';
				}
			}
		}
		
		return loadFilter;
	},
	
	/**
	 * @description Gets the where clause from a query
	 * @param       query - to get the where clause from
	 * @return      the where clause
	 **/
	getWhereClause : function(query) {
		var lower = query.toLowerCase();
		var where = ' where ';
		var whereLoc = lower.indexOf(where);
		
		if(whereLoc !== -1) {
			return query.substring(whereLoc)
		}
		
		return '';
	},
	
	/**
	 * @description Updates the saved code filter, as long as it has the same id as the passed in filter
	 * @param       updatedFilter - to compare to the saved onload filter
	 **/
	updateOnloadFilter : function(updatedFilter) {
		var current = localStorage[COOKIE_PRE + d3vUtil.getOrgId() + NAMESPACE_FILTER];
		
		if(current && current.length && current !== 'both' && current !== 'none' && current !== 'upkg' && current !== 'pkgd') {
			var onloadFilter = JSON.parse(current);
			
			if(onloadFilter.id === updatedFilter.id) {
				d3vCode.changeCodeFilter();
			}
		}
	},
	
	/**
	 * @description Returns the default list of filters
	 * @return      the default set of filters
	 **/
	getDefaultFilters : function() {
		var oid = d3vUtil.getOrgId();
		var uid = CookieUtil.readCookie(COOKIE_PRE + COOKIE_UID);
		
		var defaultFilters = [{
			label : "Apex, Lightning, VF, Static Resources",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle",
				member : "DeveloperName"				
			}]
		},{
			label : "Objects and Layouts",
			metadata : [{
				type   : "CustomObject",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM CustomObject ORDER BY DeveloperName",
				member : 'DeveloperName + "__c"'
			},{
				type   : "CustomObject",
				method : PKG_METHOD_WRITTEN,
				detail : "Account, AccountContactRole, Asset, Campaign, CampaignMember, Case, CaseComment, CaseContactRole, Contact, ContentVersion, Contract, ContractContactRole, Event, Idea, KnowledgeArticle, Lead, Opportunity, OpportunityContactRole, OpportunityLineItem, PartnerRole, Product2, Question, Quote, QuoteLineItem, Reply, Site, Solution, Task, Territory, User, UserLicense"
			},{
				type   : "Layout",
				method : PKG_METHOD_QUERY,
				detail : "SELECT LastModifiedBy.Name, LastModifiedDate, TableEnumOrId, Name FROM Layout ORDER BY Name",
				member : 'TRANSLATE(TableEnumOrId) + "-" + Name'
			}]		
		},{
			label : "Flows and Workflows",
			metadata : [{
				type   : "Flow",
				method : PKG_METHOD_WILDCARD
			},{
				type   : "Workflow",
				method : PKG_METHOD_WILDCARD
			}]			
		},{
			label : "Profiles and Permission Sets",
			metadata : [{
				type   : "Profile",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedBy.Name, LastModifiedDate FROM Profile ORDER BY Name",
				member : 'Name'
			},{
				type   : "PermissionSet",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedBy.Name, LastModifiedDate FROM PermissionSet WHERE IsCustom = true ORDER BY Name",
				member : 'Name'
			}]			
		},{
			label : "Code Last Modified By Me",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedById = '" + uid + "'",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedById = '" + uid + "'",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedById = '" + uid + "'",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedById = '" + uid + "'",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedById = '" + uid + "'",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedById = '" + uid + "'",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified Today",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedDate = TODAY",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedDate = TODAY",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified By Me Today",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate = TODAY",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified By Me Within Last Week",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedById = '" + uid + "' AND LastModifiedDate >= LAST_WEEK",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified By Me Since Last Deploy",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_DEPLOY",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified By Me Since Last Retrieve",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedById = '" + uid + "' AND  LastModifiedDate >= #LAST_RETRIEVE",
				member : "DeveloperName"				
			}]
		},{
			label : "Code Modified Since Last Retrieve",
			metadata : [{
				type   : "ApexClass",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexPage",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexPage WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexComponent",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexComponent WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "ApexTrigger",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"
			},{
				type   : "StaticResource",
				method : PKG_METHOD_QUERY,
				detail : "SELECT Name, LastModifiedDate, LastModifiedBy.Name FROM StaticResource WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "Name"			
			},{
				type   : "AuraDefinitionBundle",
				method : PKG_METHOD_QUERY,
				detail : "SELECT DeveloperName, LastModifiedDate, LastModifiedBy.Name FROM AuraDefinitionBundle WHERE LastModifiedDate >= #LAST_RETRIEVE",
				member : "DeveloperName"				
			}]
		}];
		
		var wildcardMetadata = [];
		var wildcardReady = ["ActionLinkGroupTemplate", "ApexClass", "ApexComponent", "ApexPage", "ApexTrigger", "AppMenu", "ApprovalProcess", "ArticleType", "AssignmentRules", "AuthProvider", "AuraDefinitionBundle", "AutoResponseRules", "BaseSharingRule", "BrandingSet", "CallCenter", "Certificate", "CleanDataService", "Community (Zone)", "CommunityTemplateDefinition", "CommunityThemeDefinition", "CompactLayout", "ConnectedApp", "ContentAsset", "CorsWhitelistOrigin", "CriteriaBasedSharingRule", "CustomApplication", "CustomApplicationComponent", "CustomFeedFilter", "Custom Metadata Types (CustomObject)", "CustomMetadata", "CustomLabels", "CustomObjectTranslation", "CustomPageWebLink", "CustomPermission", "CustomSite", "CustomTab", "DataCategoryGroup", "DelegateGroup", "DuplicateRule", "EclairGeoData", "EntitlementProcess", "EntitlementTemplate", "EventDelivery", "EventSubscription", "ExternalServiceRegistration", "ExternalDataSource", "FieldSet", "FlexiPage", "Flow", "FlowDefinition", "GlobalValueSet", "GlobalValueSetTranslation", "Group", "HomePageComponent", "HomePageLayout", "InstalledPackage", "KeywordList", "Layout", "LiveChatAgentConfig", "LiveChatButton", "LiveChatDeployment", "LiveChatSensitiveDataRule", "ManagedTopics", "MatchingRule", "MilestoneType", "ModerationRule", "NamedCredential", "Network", "OwnerSharingRule", "PathAssistant", "PermissionSet", "PlatformCachePartition", "Portal", "PostTemplate", "Profile", "ProfilePasswordPolicy", "ProfileSessionSetting", "Queue", "QuickAction", "ReportType", "Role", "SamlSsoConfig", "Scontrol", "SharingRules", "SharingSet", "SiteDotCom", "Skill", "StandardValueSetTranslation", "StaticResource", "SynonymDictionary", "Territory", "Territory2", "Territory2Model", "Territory2Rule", "Territory2Type", "TransactionSecurityPolicy", "Translations", "WaveApplication", "WaveDashboard", "WaveDataflow", "WaveDataset", "WaveLens", "WaveTemplateBundle", "Wavexmd", "Workflow"];
		
		for(var i = 0, end = wildcardReady.length; i < end; i++) {
			wildcardMetadata.push({
				type : wildcardReady[i],
				method : PKG_METHOD_WILDCARD
			});
		}
		
		defaultFilters.push({
			label: "Wildcards",
			metadata : wildcardMetadata
		});
		
		for(var i = 0, end = defaultFilters.length; i < end; i++) {
			defaultFilters[i].uniqueName        = 'default-' + i;
			defaultFilters[i].org               = oid;
			defaultFilters[i].id                = defaultFilters[i].uniqueName;
			defaultFilters[i].name              = defaultFilters[i].uniqueName;			
		}
		
		return defaultFilters;
	}	
	
}