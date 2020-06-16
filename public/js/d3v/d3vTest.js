/*
 @description d3v unit test functionality
 @date 10.24.2012
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var d3vTest = {

	/**
	 * @description Returns true when the test section is active
	 * @return      true when active, false when not
	 **/
	isActive : function() {
		var $active = $('div#right span.mode-button.active');
		return $active && $active.length && $active.text() === 'test';
	},
	
	/**
	 * @description Open to the test execute screen in salesforce
	 **/
	openInSalesforce : function() {
		d3vUtil.visitThroughFrontdoor('/ui/setup/apex/ApexTestQueuePage');
	},

	/**
	 * @description Builds out the coverate report csv
	 * @param       reportData - the data to generate the report from
	 **/	
	buildCoverageReport : function(reportData) {
		var unfiltered = reportData[1];
		reportData = reportData[0];
		
		var endline   = '\n';
		var delimeter = ',';
		var report    = 'Class Name,Coverage (%),Total Lines,Lines Uncovered,Lines Covered,Remaining Coverage (%),% Of Organization Total,Organization Potential Gain (%)\n\n';
		var totalLines;
		var coverage;
		var remaining;
		var ofTotal;
		var gain;
		var coverageSplit;
		var row;
		var completeLines     = 0;
		var completeUncovered = 0;
		var completeCovered   = 0;
		var orgLinesTotal     = 0;
		
		for(var i = 0, end = reportData.length; i < end; i++) {
			row        = reportData[i];
			totalLines = row.NumLinesUncovered + row.NumLinesCovered;
			
			completeLines     += totalLines;
			completeUncovered += row.NumLinesUncovered;
			completeCovered   += row.NumLinesCovered;
		}
		
		for(var i = 0, end = unfiltered.length; i < end; i++) {
			row = unfiltered[i];
			orgLinesTotal += row.NumLinesUncovered + row.NumLinesCovered;
		}
		
		for(var i = 0, end = reportData.length; i < end; i++) {
			row        = reportData[i];
			
			if(row.ApexClassOrTrigger && row.ApexClassOrTrigger.Name && row.ApexClassOrTrigger.Name.length) {
				totalLines = row.NumLinesUncovered + row.NumLinesCovered;
				coverage   = d3vTest.formatPercentage(row.NumLinesCovered, totalLines);
				remaining  = d3vTest.addZerosToCoverage(100 - parseFloat(coverage));
				ofTotal    = d3vTest.formatPercentage(totalLines, orgLinesTotal);
				gain       = Math.round(((parseFloat(remaining) / 100) * parseFloat(ofTotal)) * 100) / 100;
				
				report += row.ApexClassOrTrigger.Name + delimeter + 
				          coverage                    + delimeter + 
				          totalLines                  + delimeter + 
				          (row.NumLinesUncovered||'0')+ delimeter + 
				          row.NumLinesCovered         + delimeter + 
				          remaining                   + delimeter +
				          ofTotal                     + delimeter +
				          gain                        + endline;
			}
		}
		
		var completeCoverage = d3vTest.formatPercentage(completeCovered, completeLines);

		report += endline           + 'Total,'  + 
		          completeCoverage  + delimeter + 
		          completeLines     + delimeter + 
		          completeUncovered + delimeter + completeCovered;

		return report;
	},

	/**
	 * @description Builds out the coverate report html table
	 * @param       reportData - the data to generate the report from
	 **/	
	getCoverageSummary : function(reportData) {
		var unfiltered = reportData[1];
		reportData = reportData[0];
		
		var coverageSummary = {
			completeLines : 0,
			completeUncovered : 0,
			completeCovered : 0,
			orgLinesTotal : 0,
			code : []
		};
		
		var totalLines;
		var coverage;
		var remaining;
		var ofTotal;
		var gain;
		var row;
		
		for(var i = 0, end = reportData.length; i < end; i++) {
			row = reportData[i];
			
			if(row.ApexClassOrTrigger) {
				totalLines = row.NumLinesUncovered + row.NumLinesCovered;
				
				coverageSummary.completeLines     += totalLines;
				coverageSummary.completeUncovered += row.NumLinesUncovered;
				coverageSummary.completeCovered   += row.NumLinesCovered;
			}
		}
		
		for(var i = 0, end = unfiltered.length; i < end; i++) {
			row = unfiltered[i];
			
			if(row.ApexClassOrTrigger) {
				coverageSummary.orgLinesTotal += row.NumLinesUncovered + row.NumLinesCovered;
			}
		}
		
		for(var i = 0, end = reportData.length; i < end; i++) {
			row = reportData[i];
			
			if(row.ApexClassOrTrigger && row.ApexClassOrTrigger.Name && row.ApexClassOrTrigger.Name.length) {
				totalLines = row.NumLinesUncovered + row.NumLinesCovered;
				coverage   = d3vTest.formatPercentage(row.NumLinesCovered, totalLines);
				remaining  = d3vTest.addZerosToCoverage(100 - parseFloat(coverage));
				ofTotal    = d3vTest.formatPercentage(totalLines, coverageSummary.orgLinesTotal);
				gain       = Math.round(((parseFloat(remaining) / 100) * parseFloat(ofTotal)) * 100) / 100;
				
				coverageSummary.code.push({
					name       : row.ApexClassOrTrigger.Name,
					coverage   : parseFloat(coverage),
					totalLines : totalLines,
					uncovered  : (row.NumLinesUncovered || '0'),
					covered    : row.NumLinesCovered,
					remaining  : parseFloat(remaining),
					ofTotal    : parseFloat(ofTotal),
					gain       : gain,
					id         : i
				});			
			}
		}

		return coverageSummary;
	},	
	
	/**
	 * @description Opens the coverage filter option on the coverage popup
	 **/
	openCoverageFilter : function() {
		$('#cct-pager, #cct-grid-container').hide();
		$('#cct-filter-info').show();
	},
	
	/**
	 * @description Closes the coverage filter option on the coverage popup
	 **/
	closeCoverageFilter : function() {
		$('#cct-filter-info').hide();
		$('#cct-pager, #cct-grid-container').show();
		d3vTest.generateCoverageReport();
		d3vTest.saveCoverageFilter();
	},	
	
	/**
	 * @description Clear the coverage filter option
	 **/
	clearCoverageFilter : function() {
		$('#coverage-report-where').val('');
		d3vTest.closeCoverageFilter();
		d3vTest.saveCoverageFilter();
	},		

	/**
	 * @description Cancels the apply filter operation
	 **/	
	cancelApplyFilter : function() {
		$('#cct-filter-info').hide();
		$('#cct-pager, #cct-grid-container').show();	
	},
	
	/**
	 * @description Turns a numerator and denominator into formatted percentage
	 **/
	formatPercentage : function(numerator, denominator) {
		var pct = denominator == 0 ? 0 : ((numerator / denominator) * 100);
		pct     = Math.round(pct * 100) / 100;
		return d3vTest.addZerosToCoverage(pct);
	},
	
	/**
	 * @description Pads a decimal with 0's such that all numbers have 2 digits after the decimal
	 * @param       coverage - the percentage to append zeros to
	 * @return      coverage with extra zeros appended
	 **/
	addZerosToCoverage : function(coverage) {
		coverage = '' + coverage;
		if(coverage.indexOf('.') === -1) {
			coverage += '.00';
		} else {
			var coverageSplit = coverage.split('.')[1] + '';
			if(coverageSplit.length == 1) {
				coverage += '0';
			}
		}	
		
		return coverage;
	},
	
	/**
	 * @description Saves need to be triggered by a user from safari, so there is this method :(
	 **/
	downloadSafariReport : function() {
		saveAs(codeCoverageCSV.content, codeCoverageCSV.name);
		codeCoverageCSV = null;
		d3vUtil.alert('report generated successfully!', { scheme : 'positive' });
		$('button#coverage-report-download-safari').hide();
		$('button#coverage-report-download').show();
	},

	/**
	 * @description Generates and downloads the coverate report csv
	 **/	
	generateCoverageCSV : function() {
		var baseSOQL = 'SELECT Id, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate ';
		var soql     = baseSOQL + $('input#coverage-report-where').val();      
		soql         = d3vPush.addOrderByToQuery(soql, 'ApexClassOrTrigger.Name');
		
		d3vUtil.alert('generating report…');
		$('div#cct-pct').hide();
		$('img#coverage-report-waiting').show();
		
		ServerAction.generateCoverageReport(soql.substring(baseSOQL.length, soql.length), function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			
			if(callbackData && callbackData.length) {
				var today    = new Date();
				today        = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
				var filename = 'CoverageResults_' + today + '_' + orgName.replace(/\./g, '-') + '.csv';
				var csv      = d3vTest.buildCoverageReport(callbackData);
				var csvBlob  = new Blob([csv], {type: "text/csv;charset=" + document.characterSet});
				d3vTest.saveCoverageFilter();
				$('img#coverage-report-waiting').hide();
				$('div#cct-pct').show();
				
				if(d3vUtil.isSafari()) {
					codeCoverageCSV = { content : csvBlob, name : filename};
					d3vUtil.alert('report generated, press again to download');
					$('button#coverage-report-download').hide();
					$('button#coverage-report-download-safari').show().unbind().click(d3vTest.downloadSafariReport);
				} else {
					saveAs(csvBlob, filename);
					d3vUtil.alert('report generated successfully!', { scheme : 'positive' });
					$('button#coverage-report-download').show();
				}
			} else {
				d3vUtil.alert('error generating report, run all tests and try again', { scheme : 'negative' });
				$('button#coverage-report-download').show();				
			}					
		});	
	},

	/**
	 * @description Generates and renders the coverate report
	 **/		
	generateCoverageReport : function() {
		var baseSOQL = 'SELECT Id, ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate ';
		var soql     = baseSOQL + $('input#coverage-report-where').val();      
		soql         = d3vPush.addOrderByToQuery(soql, 'ApexClassOrTrigger.Name');
		
		d3vUtil.alert('updating report…');
		$('div#cct-pct').hide();
		$('img#coverage-report-waiting').show();
		
		ServerAction.generateCoverageReport(soql.substring(baseSOQL.length, soql.length), function(callbackData) {
			callbackData = eval('(' + callbackData + ')');
			
			if(callbackData && callbackData.length) {
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

			    cctColumns = [{
		    		id: "name",
			        name: "Class",
			        field: "name",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "coverage",
			        name: "Coverage (%)",
			        field: "coverage",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "totalLines",
			        name: "Total Lines",
			        field: "totalLines",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "uncovered",
			        name: "Lines Uncovered",
			        field: "uncovered",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "covered",
			        name: "Lines Covered",
			        field: "covered",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "remaining",
			        name: "Remaining Coverage (%)",
			        field: "remaining",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "ofTotal",
			        name: "% Of Organization Total",
			        field: "ofTotal",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}, {
		    		id: "gain",
			        name: "Organization Potential Gain (%)",
			        field: "gain",
			        width: 100,
			        resizable: true,
			        selectable: true, 
			        sortable: true
		    	}];
		    	
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
							    		    	
			    cctDataView = new Slick.Data.DataView();
			    cctGrid = new Slick.Grid("#cct-grid", cctDataView, cctColumns, options);   
			    
			    //handle paging
			    cctDataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
			        var isLastPage = pagingInfo.pageSize * (pagingInfo.pageNum + 1) - 1 >= pagingInfo.totalRows;
			        var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
			        var options = cctGrid.getOptions();
			    
			        if (options.enableAddRow != enableAddRow) {
			            cctGrid.setOptions({enableAddRow: enableAddRow});
			        }
			    });
			
			    //handle cctGrid navigation
			    cctGrid.onKeyDown.subscribe(function (e) {
			        // select all rows on ctrl-a
			        if (e.which != 65 || !e.ctrlKey) {
			            return false;
			        }
			
			        var rows = [];
			        for (var i = 0; i < cctDataView.getLength(); i++) {
			            rows.push(i);
			        }
			
			        cctGrid.setSelectedRows(rows);
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
			
			    //handle cctGrid sort
			    cctGrid.onSort.subscribe(function (e, args) {
			        sortdir = args.sortAsc ? 1 : -1;
			        sortcol = args.sortCol.field;
			    
			        if ($.browser.msie && $.browser.version <= 8) {
			            cctDataView.fastSort(sortcol, args.sortAsc);
			        } else {
			            cctDataView.sort(comparer, args.sortAsc);
			        }
			    }); 
			    
			    //handle nifty row checkbox selection stuff
			    cctGrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));        
			
			    //instantiate pager and column picker
			    var pager = new Slick.Controls.Pager(cctDataView, cctGrid, $("#cct-pager"));
			    	    
			    var columnpicker = new Slick.Controls.ColumnPicker(cctColumns, cctGrid, options);
			
			    //tell grid what to update when row count changes
			    cctDataView.onRowCountChanged.subscribe(function (e, args) {
			        cctGrid.updateRowCount();
			        cctGrid.render();
			    });
			    
			    //tell grid what to update when row data changes
			    cctDataView.onRowsChanged.subscribe(function (e, args) {
			        cctGrid.invalidateRows(args.rows);
			        cctGrid.render();
			    });
			
			    //Make the inputs tie into filtering & grid refreshing
			    $(cctGrid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
			        cctColumnFilters[$(this).data("columnId")] = $.trim($(this).val());
			        cctDataView.refresh();
			    });
			
			    //When columns are reordered, make sure header row updates with it
			    cctGrid.onColumnsReordered.subscribe(function (e, args) {
			        d3vData.updateHeaderRow(cctColumns, cctColumnFilters);
			        cctColumns = cctGrid.getColumns();
			    });
			
			    //When resized are reordered, make sure header row updates with it
			    cctGrid.onColumnsResized.subscribe(function (e, args) {
			        d3vData.updateHeaderRow(cctColumns, cctColumnFilters);
			    });
		    	
		    	cctGrid.setColumns(cctColumns);	
			
			    //Generic cctDataView setup
			    var coverageSummary = d3vTest.getCoverageSummary(callbackData);
			    cctDataView.beginUpdate();
			    cctDataView.setItems(coverageSummary.code);
			    cctDataView.endUpdate();			    
			    	
			    $('#cct-grid div.slick-headerrow').hide();
			    $('img#coverage-report-waiting').hide();
			    d3vTest.sizeViewport();
			    
			    var orgCodeCoverage = parseInt((coverageSummary.completeCovered / coverageSummary.completeLines) * 100);
			    var $pct = $('div#cct-pct');
			    	
				$pct.text('Overall Coverage: ' + orgCodeCoverage + '% (' + 
				                      coverageSummary.completeCovered + ' / ' + coverageSummary.completeLines + ')').show();
				
				if(orgCodeCoverage < 75) {
					$pct.addClass('red-font').removeClass('green-font');
				} else {
					$pct.removeClass('red-font').addClass('green-font');
				}
				                      
				d3vUtil.alert('coverage updated successfully', { scheme : 'positive' });
			} else {
				d3vUtil.alert('error generating report, run all tests and try again', { scheme : 'negative' });			
			}					
		});
	},
	
	/**
	 * @description Saves the current coverage filter
	 **/
	saveCoverageFilter : function() {
		localStorage[COOKIE_REPORT_FILTER + d3vUtil.getOrgId()] = $('input#coverage-report-where').val();
	},

	/**
	 * @description Loads the existing coverage filter, for this specific org
	 **/	
	loadCoverageFilter : function() {
		$('input#coverage-report-where').val(localStorage[COOKIE_REPORT_FILTER + d3vUtil.getOrgId()] || '');
	},
	
	/**
	 * @description Sizes the coverage slickgrids viewport.
	 **/
	sizeViewport : function() {	
		if(cctGrid) {
			cctGrid.resizeCanvas();
		}
	},	

	/**
	 * @description Opens the code coverage report popup
	 **/
	openCoverageReportPopup : function() {
		var tableHeight = parseInt($(window).height() * 0.85);
		$('#generic-overlay').show();
		$('#code-coverage-table').height(tableHeight).show();
		
		d3vTest.generateCoverageReport();
	},
	
	/**
	 * @description Resizes the code coverage dialog on window resize
	 **/
	resizeCoverageDialog : function() {
		var $table = $('#code-coverage-table');
		
		if($table.is(':visible')) {
			var tableHeight = parseInt($(window).height() * 0.85);
			$table.height(tableHeight);
			d3vTest.sizeViewport();
		}
	},

	/**
	 * @description Clears test filter history
	 **/
	clearTestFilters : function() {
		if(confirm('Are you sure you want to delete the test filter history?')) {
			d3vArchive.deleteAll(TABLE_TEST_FILTER, function() {
				d3vTest.populateFilterTypeahead(true);
			});
		}
	},

	/**
	 * @description Generates markup for the test result status markers (e.g. Successful, Failed, Error, Aborted)
	 * @param       status        - status to generate marker for
	 * @param       additionalCSS - extra css to add
	 **/	
	getStatusMarker : function(status, additionalCSS) {
		return '<span class="marker ' + additionalCSS + ' ' + status.toLowerCase() + '">' + status + '</span>';
	},
	
	/**
	 * @description Generates a row for the unit test result div
	 * @param		rowIndex - index of this row
	 * @param		unitTestResult - test result object
	 *
	 **/
	generateTestResultRow : function(rowIndex, unitTestResult) {
		var compilerError = unitTestResult.unitTests[0].methodName === 'Compiler Error';
		
		if(unitTestResult && unitTestResult.extStatus === "-1 tests aborted") {
			unitTestResult.extStatus = 'Execution Cancelled';
		}
		
		var markup = '<div>' +
		             	'<span class="large-font">' + 
		             		unitTestResult.className + 
		             	'</span>'  +
		                d3vTest.getStatusMarker(compilerError ? 'Error' : unitTestResult.status, 'keep-right') + 
		             '</div>' +
		             '<div class="result-row-info">' +
		             	'<span>' + 
		             		(compilerError ? 'Compile failure, 0 tests ran' : unitTestResult.extStatus) + 
		             	'</span>' +
		             	'<span class="keep-right italic-font">' + 
		             		d3vUtil.salesforceDateMadeReadable(unitTestResult.timestamp, true) + 
		             	'</span>' + 
		         	 '</div>';  		
		         	 
		var rowClass = 'test-class-row' + (rowIndex % 2 === 0 ? '' : ' test-class-row-odd');
		return $('<div rowkey="' + unitTestResult.key + '" class="' + rowClass + '">' + markup + '</div>');      
	},

	/**
	 * @description Adds an entry to the filter typeahead.
	 * @param		filter - the filter to add
	 **/
	addFilterToTypeahead : function(filter) {
		var $filterTypeahead  = $('input#tr-filter');
		var isInListAlready   = false;
		
		try {
			var typeaheadContents = $filterTypeahead.autocomplete('option', 'source');
			
			for(var i = 0, end = typeaheadContents.length; i < end; i++) {
				if(typeaheadContents[i] === filter) {
					isInListAlready = true;
					break;
				}
			}
			
			if(localStorage) {
				localStorage[COOKIE_PRE + LAST_TEST_FILTER] = filter;
			}		
			
			if(!isInListAlready) {
				$filterTypeahead.autocomplete('option', 'source').splice(0, 0, filter);
				d3vArchive.write(TABLE_TEST_FILTER, 'trf', filter);		
			}
		} catch(ex) {
			//i dont care enough about this error to do anything about it.
			//section=test seems to grumble about the above code
		}
	},

	/**
	 * @description Initially populates the filter typeahead.
	 * @param       reset - (optional) - send true to reset the typeahead to 'ORDER BY CreatedDate desc, Status asc'
	 **/		
	populateFilterTypeahead : function(reset) {
	    var filterHistory = [
	    	"ORDER BY CreatedDate desc, Status asc",
	    	"WHERE Status <> 'Aborted' ORDER BY CreatedDate desc, Status asc",
	    	"WHERE Status = 'Completed' ORDER BY CreatedDate desc, Status asc",
	    	"WHERE Status = 'Failed' ORDER BY CreatedDate desc, Status asc",
	    	"WHERE ApexClass.Name = 'MyClass' ORDER BY CreatedDate desc, Status asc"
	    ]; 

		var $testResultFilter = $('input#tr-filter');
	    $testResultFilter.autocomplete({ source : filterHistory });
	    
	    if(reset) {
	    	localStorage[COOKIE_PRE + LAST_TEST_FILTER] = "ORDER BY CreatedDate desc, Status asc";
	    }
	    
	    if(localStorage && localStorage[COOKIE_PRE + LAST_TEST_FILTER]) {
	    	$testResultFilter.val(localStorage[COOKIE_PRE + LAST_TEST_FILTER]);
	    }
	    
	    d3vArchive.readAll(TABLE_TEST_FILTER, function(result) {
	    	if(result.org && aside && aside.org && aside.org.orgId && result.org === aside.org.orgId) {
	    		$testResultFilter.autocomplete('option', 'source').splice(0, 0, result.data);
	    	}
	    });	
	},

	/**
	 * @description Queues all unit tests for execution in the current org
	 **/	
	runAllTests : function() {
		if(confirm('Are you sure you want to run all tests?')) {
			d3vUtil.alert('queueing all unit tests for execution...');
			ServerAction.runAllTests(d3vTest.handleQueuedTestResult);		
		}
	},
	
	/**
	 * @description Executes any unit tests in the current file, and displays results.
	 **/
	executeCurrentTest : function() {
	    if(currentFile && currentFile.indexOf('.') !== -1) {
	        var fn  = d3vCode.getNamespacedFilename();
	        var ext = d3vCode.getCurrentExtension();

			var editorContents      = editor.getSession().getValue();
	        var loweredContents     = editorContents.toLowerCase();
	        var containsTestMethod1 = loweredContents.indexOf('testmethod') !== -1;
	        var containsTestMethod2 = loweredContents.indexOf('@istest') !== -1;
	        
	        if(ext === 'cls') {
	        	if(containsTestMethod1 || containsTestMethod2) {
	        		d3vTest.runUnitTestsByFile(fn);
	        	} else {
	        		d3vUtil.alert('cannot run unit test on this file', { scheme : 'negative' });
	        	}
	        } else if(ext === 'xml') {
	        	if(d3vCode.isPackageXML(editorContents)) {
	        		d3vPush.retrieve(editorContents.substring(editorContents.indexOf('<types>')).replace('</Package>', '').replace('</package>', ''));
	        	} else {
	        		d3vUtil.alert('this package xml is invalid, and cannot be retrieved', { scheme : 'negative' });
	        	}
	        } else {
	        	d3vUtil.alert('cannot run unit test on this file', { scheme : 'negative' });
	        }
	    }
	},	

	/**
	 * @description Rerun unit test results
	 **/	
	rerunTest : function() {
        var file = $(this).attr('to-view');
        d3vTest.runUnitTestsByFile(file.substring(0, file.lastIndexOf('.')), true);
	},	
	
	/**
	 * @description Run unit tests for a single file
	 * @param		filename  - filename containing unit tests to run
	 * @param       fromRerun - true when this method is called as a result of rerunning a test
	 **/	
	runUnitTestsByFile : function(filename, fromRerun) {
		d3vUtil.alert('test being queued for execution…');
		
        ServerAction.runTest(filename, function(callbackData) {        
			callbackData = JSON.parse(callbackData);
			
			if(callbackData.createResponse && callbackData.createResponse.result) {
				d3vUtil.alert('test successfully queued for execution', { scheme : 'positive' });
				
	        	if(fromRerun) {
	        		setTimeout(d3vTest.populateResultTable, 1000);
	        	}			
			} else {
				d3vPopups.displayMessage(
					'Test Queue Error', 
					'An error occured while attempting to queue unit tests for execution.  Click "Show API Response" for more detail.', callbackData, TEST_SECTION);
			}	        
        });
	},	

	/**
	 * @description Generates the row which displays all queued tests.
	 * @param		queuedTests- A list tests to designate as queued.
	 * @return		the markup for this row.
	 **/	
	generatingPendingTestRow : function(queuedTests) {
		if(queuedTests && queuedTests.length) {
			if(window.raiftt !== 15000 || !window.raiftt) {
				window.raiftt = 15000;
				d3vTest.startupTestRefreshTimer();
			}
			
			var verbiage = queuedTests.length > 1 ? 'classes' : 'class';
			return $('<div class="queued-row">' + 
			         	queuedTests.length + 
			         ' test ' + verbiage + ' queued, pending, or processing…</div>');
		} else {
			if(window.raiftt === 15000 || !window.raiftt) {
				window.raiftt = 150000;
				d3vTest.startupTestRefreshTimer();
			}		
		}
		
		return '';
	},

	/**
	 * @description Finds a specific test result by name
	 * @param		rowKey - unique row identifier
	 * @return		test result found
	 **/		
	findTestResult : function(rowKey) {
		for(var i = 0, end = unitTestResults.length; i < end; i++) {
			if(unitTestResults[i].key === rowKey) {
				return unitTestResults[i];
			}
		}
	},

	/**
	 * @description Test result row click handler
	 **/	
	handlePendingTestRowClick : function() {
		var $header = $('div#test-results-detailed');
		var $body   = $('div#results-by-method');
		$header.empty().height(PENDING_HEADER_HEIGHT);
		$body.empty();
		
		d3vTest.buildPendingHeader($header);
		d3vTest.buildPendingBody($body)
	},

	/**
	 * @description Builds the markup to display the pending result header
	 * @param		$header - dom location to inject header
	 **/		
	buildPendingHeader : function($header) {
		var verbiage = pendingTestResults.length !== 1 ? 'classes are' : 'class is';
		var markup = 
		    '<div class="xtra-huge-font bold-font">' +
				pendingTestResults.length +	    				    			    			    	
		    '</div>' +
		    '<span class="large-font cold-grey bold-font">' +
		    	'test ' + verbiage + ' queued, pending, or processing.'
		    '</span>';
		    
		$header.append(markup);
	},

	/**
	 * @description Builds the markup to display the pending result body
	 * @param		$header - dom location to inject body
	 **/			
	buildPendingBody : function($body) {
		var markup = 
		    '<div class="full-size scrolls">';

		for(var i = 0, end = pendingTestResults.length; i < end; i++) {
			markup += 
				'<div class="pending-test">' +
					'<span class="open-pending">' +
						pendingTestResults[i].className +
					'</span>' +
					'<span class="keep-right abort-test" to-abort="' + pendingTestResults[i].key + '">x</span>' +					
				'</div>';
		}
		
		$body.append(markup + '</div>');
		$('span.open-pending').unbind().click(d3vTest.openPendingTestInNewWindow);
		$('span.abort-test').unbind().click(d3vTest.cancelPendingTest);
	},	

	/**
	 * @description Cancels a pending test so it doesnt end up running.
	 **/	
	cancelPendingTest : function() {
		var $that = $(this);
		
		if(confirm('Are you sure you want to abort ' + $that.siblings().text() + '?')) {
			var testInstanceId = $that.attr('to-abort').substring(0, 18);
			ServerAction.abortTestExecution(testInstanceId, function(callbackData) {
				var results = eval('(' + callbackData + ')');
				if(results.updateResponse.result.success) {
					d3vUtil.alert('test cancelled successfully', { scheme : 'positive' });
				} else {
					d3vUtil.alert('failed to cancel test execution', { scheme : 'negative' });
				}
			});
		}
	},

	/**
	 * @description Test result row click handler
	 **/	
	handleCompletedTestRowClick : function() {
		var testResult = d3vTest.findTestResult($(this).attr('rowkey'));
		var $header = $('div#test-results-detailed');
		var $body   = $('div#results-by-method');
		$header.empty().height(RESULT_HEADER_HEIGHT);
		$body.empty();
		
		d3vTest.buildClassHeader(testResult, $header);
		d3vTest.buildMethodList(testResult, $body);
		d3vTest.sizeMethodTable();
	},

	/**
	 * @description Sizes the unit test method accordion div
	 **/		
	sizeMethodTable : function() {
		//235 is height of right column header with buffer
		$('div#results-by-method').height($('div#test-results').outerHeight() - 235);
	},

	/**
	 * @description Assembles the markup required for the test method accordion.
	 * @param		testResult - unit test results, a list of apextestqueueitem and their related results
	 * @param		$body      - where to append the accordion
	 **/
	buildMethodList : function(testResult, $body) {
		var testMethods = testResult.unitTests;
		var markup = '';
		
		if(testMethods && testMethods.length) {
			var successful; 
			var statusType;
			var accordionBody;
			var compilerError;
			var aborted = testResult.status === 'Aborted';
			var testMethodHeader;
					
			for(var i = 0, end = testMethods.length; i < end; i++) {
				compilerError    = testMethods[i].methodName === 'Compiler Error';
				successful       = testMethods[i].message === null && testMethods[i].stackTrace === null;
				testMethodHeader =
					'<div>' +
						'<span class="tr-summary">REPLACE_ME_PLZ</span>' +
						'<span class="button view-method" mn="' + testMethods[i].methodName + '">View Method</span>' +
					'</div>';
					
				if(aborted) {
					statusType = 'Aborted';
					accordionBody = testMethodHeader.replace('REPLACE_ME_PLZ', 'Execution of this test was cancelled.');
				} else if(compilerError) {
					statusType = 'Error';
					accordionBody = 
						testMethodHeader.replace('REPLACE_ME_PLZ', 'This unit test did not compile.') +
						'<br /><br />' +
						'<span class="bold-font dark-grey">Message</span>' +
						'<div>' + d3vTest.addStackTraceLinks(testMethods[i].message) + '</div>';
				} else if(successful) {
					statusType = 'Successful';
					accordionBody = testMethodHeader.replace('REPLACE_ME_PLZ', 'This test executed as expected.');		
				} else {
					statusType = 'Failed';
					accordionBody = 
						testMethodHeader.replace('REPLACE_ME_PLZ', 'This unit test failed to execute as expected.') +
						'<br /><br />' +
						'<span class="bold-font dark-grey">Message</span>' +
						'<div>' + d3vTest.addStackTraceLinks(testMethods[i].message) + '</div><br/>' +
						'<span class="bold-font dark-grey">Stack Trace</span>' +
						'<div>' + d3vTest.addStackTraceLinks(testMethods[i].stackTrace) + '</div>';				
				}
				
				markup +=
					'<h3 class="accordion-title">' +
						'<span class="bold-font test-header-limiter">' + testMethods[i].methodName + '</span>' +
						d3vTest.getStatusMarker(statusType, 'keep-right test-method-marker') +
					'</h3>' +
					'<div class="accordion-body">' +
						accordionBody +
					'</div>';
			}
			
			$body.append('<div class="accordion">' + markup + '</div>');
			$('div#test-content span.stack-trace-link').unbind().click(d3vTest.stackTraceFileClickHandler);
			$('span.view-method').unbind().click(d3vTest.openToMethod);
			$('div.accordion').accordion({
		        header: "h3",
		        heightStyle: "content"	
			});
		}
	},

	/**
	 * @description Handles the "View Method" link click
	 * @param
	 **/	
	openToMethod : function() {
		var $that     = $(this);
		var extension = $that.hasClass('trigger') ? '.trigger' : '.cls';
		d3vUtil.openFileInNewWindow($.trim($('span#test-class-name').text()) + '.cls', { token : $that.attr('mn') });
	},
	
	/**
	 * @description Handles clicking of a class or trigger in an interactive stack trace.
	 **/	
	stackTraceFileClickHandler : function() {
		var $that     = $(this);
		var extension = $that.hasClass('trigger') ? '.trigger' : '.cls';
		d3vUtil.openFileInNewWindow($that.attr('fn') + extension, { lineNumber : parseInt($that.attr('ln')) } );
	},

	/**
	 * @description Assembles the markup required for the test class header.
	 * @param		testResult - info on the test class.
	 * @param		$header    - where to append the generated markup
	 **/	
	buildClassHeader : function(testResult, $header) {
		var resultOverview;
		var compilerError = testResult.unitTests[0].methodName === 'Compiler Error';
		
		if(testResult.status === 'Aborted') {
			resultOverview =
				'<span>Cancelled execution of test methods</span>';
		} else if(compilerError) {
			resultOverview =
				'<span>This class could not compile, no tests ran.</span>';
			testResult.status = 'Error';
		} else {
			resultOverview =
				'<span>Out of </span>' +
				'<span class="test-num">' + 
				  (parseInt(testResult.successful) + parseInt(testResult.failed)) + 
				'</span>' +
				'<span> tests, </span>' +
				'<span class="test-num">' + testResult.successful + '</span>' +
				'<span> passed, and </span>' +
				'<span class="test-num">' + testResult.failed + '</span>' +
				'<span> failed</span>';
		}
	
		var markup = 
		    '<div class="as-ellipsis large-font">' +
		    	'<span id="test-class-name" class="huge-font">' + 
		    		testResult.className + 
		    	'</span>' +
		    	'<br />' +
		    	'<span class="bold-font italic-font bluish">' + 
		    		d3vUtil.salesforceDateMadeReadable(testResult.timestamp, true) + 
		    	'</span>' +
		    	'<br />' +		    	
		    	d3vTest.getStatusMarker(testResult.status, 'keep-left larger-marker small-top-marg med-font') +
	    		'<span to-view="' + testResult.className + 
	    			'.cls" class="keep-left button view-class small-top-marg small-left-marg med-font">View Class</span>' +
	    		'<span to-view="' + testResult.className + '.cls" class="keep-left button rerun small-top-marg med-font">Rerun</span>' +
		    	'<br /><br />' +
		    	resultOverview +			    				    			    			    	
		    '</div>';
		    
		$header.append(markup);
		$('span.view-class').unbind().click(d3vTest.openTestInNewWindow);
		$('span.rerun').unbind().click(d3vTest.rerunTest);
	},

	/**
	 * @description Opens the pending test class in a new instance of d3v
	 **/
	openPendingTestInNewWindow : function() {
		var file = $(this).text();
		d3vUtil.openFileInNewWindow(file + '.cls');
	},	
	
	/**
	 * @description Opens the test class result clicked in a new instance of d3v
	 **/
	openTestInNewWindow : function() {
		var file = $(this).attr('to-view');
		d3vUtil.openFileInNewWindow(file);
	},	

	/**
	 * @description Turns on the auto refreshing that occurs when viewing the test tab
	 **/
	startupTestRefreshTimer : function() {
		if(testTimerId) {
			clearInterval(testTimerId);
		}
		
		testTimerId = setInterval(d3vTest.populateResultTable, window.raiftt);
	},

	/**
	 * @description Turns off the auto refreshing that occurs when viewing the test tab
	 **/	
	shutdownTestRefreshTimer : function() {
		if(testTimerId) {
			clearInterval(testTimerId);
			testTimerId = null;
			window.raiftt = null;
		}
	},

	/**
	 * @description Queries salesforce and populates the unit test 
	 *              table with the results
	 **/
	populateResultTable : function() {
		if(!d3vTest.isActive()) {
			d3vTest.shutdownTestRefreshTimer();
			return;
		}	
	
		var filter = $('input#tr-filter').val();
		d3vTest.addFilterToTypeahead(filter);
		
	    ServerAction.getUnitTestSummary(filter, function(callbackData) {
	    	ServerAction.setGlobalDebugInfo('populateResultTable() - filter=' + filter + ' - cbd=' + callbackData);
	    	var results        = eval('(' + callbackData + ')');
	    	var $testResults   = $('div#test-results');
	    	unitTestResults    = results[1];
	    	pendingTestResults = results[0];
	    	$testResults.empty().unbind();
	    	
	    	if(!unitTestResults || (unitTestResults.length === 0 && pendingTestResults.length === 0)) {
	    		if(unitTestResults) {
	    			d3vPopups.closeErrorPopups(TEST_SECTION);    		
	    		} else {
					d3vPopups.displayMessage('Test Result Error', 'An error occured while attempting to obtain a test result summary.' +
					                         "  To fix this error, check that the query you have defined on the 'set view' popup is valid.", results, TEST_SECTION);		    			
	    		}
	    		
	    		ServerAction.resetGlobalDebugInfo();
	    		d3vUtil.alert('no tests to display');
	    		$testResults.append('<div class="tests-no-results">nothing to display</div>');
	    		$('div#test-results-detailed').empty()
	    		                              .append('<div class="no-test-detail">' +
	    		                                      	'click a row to see test results' +
	    		                                      '</div>');
				if(window.raiftt === 15000 || !window.raiftt) {
					window.raiftt = 150000;
					d3vTest.startupTestRefreshTimer();
				}                                 
	    	} else {
	    		d3vPopups.closeErrorPopups(TEST_SECTION);
	    		ServerAction.resetGlobalDebugInfo();
	    		d3vUtil.alert('successfully refreshed', { scheme : 'positive' });
		    	$testResults.append(d3vTest.generatingPendingTestRow(pendingTestResults));
		    	
		    	for(var i = 0, end = unitTestResults.length; i < end; i++) {
		    		$testResults.append(d3vTest.generateTestResultRow(i, unitTestResults[i]));
		    	}

		    	if($('div.pending-test').length) {
		    		d3vTest.handlePendingTestRowClick();
		    	}
		    	
		    	$('div.test-class-row').unbind().click(d3vTest.handleCompletedTestRowClick);
		    	$('div.queued-row').unbind().click(d3vTest.handlePendingTestRowClick);
		    	$('div#test-results').hide().show(0); //chrome disappearing scrollbar bug fix	
	    	}
	    });	
	},

	/**
	 * @description Queues unit tests for execution.  
	 *              The tests run are based on the where clause entered into the run some tests input.
	 **/	
	queueTestsBySelection : function() {
	    var selected = $('select#the-chosen-one').val();
	    d3vTest.saveRunBySelectionOptions();
	    
	    if(selected && selected.length) {
		    d3vUtil.alert('queueing tests by selection…');
		    var toRun = [];	    
			var pkg;
			var pkgContents;
			var namespace = aside.org.namespace ? aside.org.namespace + '.' : '';
			
		    for(var i = 0, end = selected.length; i < end; i++) {
		    	if(selected[i].indexOf('.xml') === -1) {
		    		toRun.push(selected[i]);
		    	} else {
		    		pkg = selected[i].replace('.xml', '');
		    		pkgContents = d3vPush.packageToJSON(pkg);
		    		
		    		if(pkgContents.ApexClass && pkgContents.ApexClass.length) {
		    			for(var j = 0, pkgEnd = pkgContents.ApexClass.length; j < pkgEnd; j++) {
		    				if(pkgContents.ApexClass[j].indexOf('*') !== -1) {
		    					continue;
		    				}
		    				
		    				if(namespace && namespace.length && pkgContents.ApexClass[j].indexOf(namespace) !== 0) {
		    					toRun.push(namespace + pkgContents.ApexClass[j]);
		    				} else {
		    					toRun.push(pkgContents.ApexClass[j]);
		    				}
		    			}
		    		}
		    	}
		    }
		    
		    if(toRun && toRun.length) {
		    	ServerAction.runSomeTestsBySelection(toRun.join(','), d3vTest.handleQueuedTestResult);	
		    } else {
		    	d3vUtil.alert('no tests to run');
		    }
			    
	    } else {
	    	d3vUtil.alert('you must select an apex class or package.xml to run');
	    }
	},
	
	/**
	 * @description Refreshes the apex unit test result table and informs the user
	 **/
	refreshResultTable : function() {
		d3vUtil.alert('refreshing test history...');
	    d3vTest.populateResultTable();	
	},	
	
	/**
	 * @description Handles server results when unit tests are requested to execute
	 * @param       callbackData - server result from queueing unit tests
	 **/ 
	handleQueuedTestResult : function(callbackData) {
		callbackData = JSON.parse(callbackData);
		
		if(callbackData.createResponse && callbackData.createResponse.result) {
			d3vUtil.alert('tests successfully queued', { scheme : 'positive' });
			setTimeout(d3vTest.populateResultTable, 1000);				
		} else {
			d3vPopups.displayMessage(
				'Test Queue Error', 
				'An error occured while attempting to queue unit tests for execution.  Click "Show API Response" for more detail.', callbackData, TEST_SECTION);
		}		
	},

	/**
	 * @description Queues unit tests for execution.  
	 *              The tests run are based on the where clause entered into the run some tests input.
	 **/	
	queueTestsByQuery : function() {
	    d3vUtil.alert('queueing tests by query...');
		ServerAction.runSomeTestsByQuery($('input#tests-to-query').val(), function(callbackData) {
			d3vTest.handleQueuedTestResult(callbackData);
			d3vTest.saveRunSomeQuery();
		});
	},

	/**
	 * @description Saves the selected options in the 'run by selection' input of the 'run some' popup
	 **/
	saveRunBySelectionOptions : function() {
		localStorage[COOKIE_PRE + aside.org.orgId + RUN_BY_SELECTION] = $('#the-chosen-one').val() || '';
	},
	
	/**
	 * @description Loads the query used within the 'run by query' popup
	 **/
	loadRunBySelectionOptions : function() {
		var selection = localStorage[COOKIE_PRE + aside.org.orgId + RUN_BY_SELECTION];
		
		if(selection && selection.length) {
			$('#the-chosen-one').val(selection.split(','))
			                    .trigger('chosen:updated');
		}
	},	
	
	/**
	 * @description Saves the query used within the 'run by query' popup
	 **/
	saveRunSomeQuery : function() {
		localStorage[COOKIE_PRE + aside.org.orgId + RUN_BY_QUERY] = $('input#tests-to-query').val();
	},
	
	/**
	 * @description Loads the query used within the 'run by query' popup
	 **/
	loadRunSomeQuery : function() {
		var whereClause = localStorage[COOKIE_PRE + aside.org.orgId + RUN_BY_QUERY];
		
		if(!whereClause) {
			whereClause = "Name like 'MyNamespace_%'";
		}
		
		$('input#tests-to-query').val(whereClause);	
	},	

	/**
	 * @description Initializes the typeahead for the test section
	 *              Wont do anything if it has already been called.
	 **/	
	initializeTestTypeahead : function() {
	    var $chosen = $('select#the-chosen-one');
	    var alreadyInitialized = $chosen.find('option').length > 1;
	    
	    if(alreadyInitialized) {
	    	return;
	    }
	    
		var $chosen = $('select#the-chosen-one');
		var markup  = ''; 
		var current;
		var short;
		customApexClasses = [];
		
		for(var i = 0, end = aside.files.length; i < end; i++) {
			current = aside.files[i];
			
			if(current.indexOf('.cls') !== -1) {
				current = current.replace('Open ', '');
				short = current.replace('.cls', '');
				markup += '<option value="' + short + '">' + current + '</option>';
				
				if(aside.org.namespace) {
					current = current.replace(aside.org.namespace + '.', '');
				}
				
				customApexClasses.push(short);
			}
		}
	
		for(var prop in localStorage) {
			if(localStorage.hasOwnProperty(prop) && prop.indexOf(PACKAGE_XML_FILE + aside.org.orgId) === 0) {
				current = prop.replace(PACKAGE_XML_FILE + aside.org.orgId, '');
				markup += '<option>' + current + '.xml</option>';
			}
		}		
		
		var chosenWidth = parseInt($(window).width() * 0.45) - 24;
		
		$chosen.width(chosenWidth)
		       .append(markup)
	           .chosen({
	           		no_results_text: "No apex class or package.xml name matches that input.", 
	           		search_contains:true,
	           		width: '100%'});
	           		
	    //Fixes issue where text is initially cutoff in firefox
	    $('div#the_chosen_one_chosen li.search-field input').width(400);
	},
	
	/**
	 * @description Updates the list of classes which tests can be ran on
	 * @param       fn - the name of the class to add
	 **/
	addToTestTypeahead : function(fn) {
		$('select#the-chosen-one').append('<option>' + fn + '</option>')
		                          .trigger('chosen:updated');
	},

	/**
	 * @description Initializes the test section of d3v
	 * @param       evt - drop event
	 **/	
	initializeTestSection : function() {
	    d3vTest.sizeMethodTable();
	    $('span#test-all-link').click(d3vTest.runAllTests);
	    $('div#run-by-query').click(d3vTest.queueTestsByQuery);
	    $('div#run-specific').click(d3vTest.queueTestsBySelection);
	    $('span#filter-results-link').click(function() {
	    	d3vPopups.showAnimatedModal('#tr-filter-popup');
	    });
	    
	    $('span#test-some-link').click(function() {
	    	d3vPopups.showAnimatedModal('#run-some-popup');
	    });
	    
	    var dropZone = document.getElementById('test-content');
	    dropZone.addEventListener('dragover', d3vUtil.preventDefaultBehavior, false);	
	    dropZone.addEventListener('dragleave', d3vUtil.preventDefaultBehavior, false);	
	    dropZone.addEventListener('drop', d3vTest.handleFileDrop, false);
	},
	
	/**
	 * @description Handler for test section file drops
	 **/
	handleFileDrop : function(evt) {
		if(!d3vTest.isActive()) {
			return;
		}
			
	    evt.stopPropagation();
	    evt.preventDefault();
	    	
		d3vUtil.alert('the test section does not support dropping files', { scheme : 'negative' });
	},
	
	/**
	 * @description Adds links to the supplied stack trace, allowing click-to-open for triggers/classes 
	 * @param       stackTrace    - stack trace to parse
	 * @return      modified stack trace with links added
	 **/
	addStackTraceLinks : function(stackTrace) {
		if(stackTrace && stackTrace.length) {
			stackTrace = d3vUtil.escapeTags(stackTrace.replace(/\.\<init\>\:/gi, '.init:'));
			var lines  = stackTrace.split('\n');
			var parseResult;
			var newLine;
			var linkedTrace = '';
			
			for(var i = 0, endI = lines.length; i < endI; i++) {
				newLine = lines[i];
				
				parseResult = d3vTest.parseAndUpdateStackTrace(lines[i], /(Class|Trigger)\.([a-z0-9_\.]+)\:\sline\s(\d+)\,\scolumn\s\d+/gi, 2);
				if(parseResult.changed) {
					newLine = parseResult.newLine;
				} else {
					parseResult = d3vTest.parseAndUpdateStackTrace(lines[i], /([a-z0-9_\.]+)\:\sline\s(\d+)\,\scolumn\s\d+/gi, 1);
					if(parseResult.changed) {
						newLine = parseResult.newLine;
					}
				}
				
				linkedTrace += newLine + '\n';
			}
			
			return linkedTrace;
		}
		
		return '';
	},

	/**
	 * @description Parses and updates a stack trace given a regex
	 * @param       stackTrace    - stack trace to parse
	 * @param		regex         - regex to parse stack track against
	 * @param       fnIndex       - index of filename in regex match
	 * @return      modified stack trace with links added
	 **/	
	parseAndUpdateStackTrace : function(line, regex, fnIndex) {
		var links = [];
		d3vTest.matchStackTraceLinks(regex, line, links, fnIndex);
		
		var color;
		var asLink;
		var original = line;
		for(var i = 0, end = links.length; i < end; i++) {
			if(links[i].fr.indexOf('by: ') === 0) {
				continue;
			}
			
			type   = links[i].ft === 'T' ? 'trigger' : 'class';
	
			asLink = 
				'<span fn="' + links[i].fn + '" ' +
				      'ln="' + links[i].ln + '" ' + 
				      'class="stack-trace-link ' + type +  '">' +
					links[i].fr +
				'</span>';		
			
			
			line = line.replace(links[i].fr, asLink);
		}
		
		return {
			newLine : line,
			changed : line != original
		};
	},

	/**
	 * @description parses the stack trace determining what to replace with links
	 * @param       regex      - regex to use for parsing, to match against class/trigger lines
	 * @param       stackTrace - stack trace to parse
	 * @param       links      - passed in by reference, the list of links to be generated
	 * @param       fnIndex    - index of filename in regex match
	 **/	
	matchStackTraceLinks : function(regex, stackTrace, links, fnIndex) {
		var filename;
		var fnSplit;
		var isTrigger = false;
		var isClass = false;
		
		while(match = (regex.exec(stackTrace))) {
			filename  = match[fnIndex];
			fnSplit   = filename.split('.');
			isTrigger = match[0].indexOf('Trigger.') === 0;
			isClass   = match[0].indexOf('Class.') === 0;
			
			if(fnSplit.length > 1 && (aside.triggers[fnSplit[1]] || aside.classes[fnSplit[1]])) {
				found = true;
				filename = fnSplit[0] + '.' + fnSplit[1];
			} else if(fnSplit.length > 0 && (aside.triggers[fnSplit[0]] || aside.classes[fnSplit[0]])) {
				found = true;
				filename = fnSplit[0];
			}
			
			links.push({fr: match[0],  //full matched row
						fn: filename, //file name
						ln: match[fnIndex + 1], //line
						ft: match[0].substring(0, 1)}); //tells you the type T or C.  
		}
	}	

}