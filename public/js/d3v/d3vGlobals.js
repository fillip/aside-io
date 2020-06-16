/*
 @description d3v global variables
 @date 		  7.20.2012
 @author	  phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

//ace editor
var editor;
var rightEditor;

//in the following format: <fileid>-<userid>-<timestamp>
var lastSaveKey = null;

//slickgrid stuff
var grid;
var dataView;
var data = [];
var columns = [];
var cctColumns;
var cctDataView;
var cctGrid;
var columnFilters = {};
var cctColumnFilters = {};
var currentFile = null;
var currentFileNamespace = null;
var currentZip = null;
var currentZippedFile = null;
var lastAction  = null;
var saving = false;
var queryLocator = null;
var lastSuccessfulQuery = '';
var editorDebugRevert = null;

//alert stuff
var timeoutId = null;
var uninterruptableAlert = false;

//unit test
var unitTestResults = [];
var pendingTestResults = [];
var testTimerId = null;

//other
var pNub = null;
var lastFile = null;
var lastTestResults = null;
var lastPushCode = null;
var orgName = null;
var currentFileId = null;
var currentBundleId = null;
var timeoutIdModeButtons = null;
var currentPushId = null;
var currentPushIdCode = null;
var ignoreAllErrors = false;
var deployStartTime;
var isProductionEnv;
var fileModified = false;
var fileOpening  = false;
var coverageHighlights = false;
var contentTypeSwitch = null;
var globalDebugInfo = '';
var foreignManaged = false;
var installedPrefix;
var aside;
var vfAutoCompleteLoaded = false;
var classVariableMap = {};
var editorCurrentLine = -1;
var includeLocalAC = true;
var intercom;
var browserVisibilityId;
var browserVisibilityState;
var tabFlashId;
var aceDiffer;
var diffEditorText;
var lastFocusedEditor;
var codeCoverageCSV;
var gaTrackingKey;
var gaLoggingReady = false;
var resizeEndTimer;
var activeRetrieveFilter;
var annotationFlag = false;

//session maintenance
var cookieClone = {};
var numPingAttempts;
var pingTimerId;
var gme = false;
var refreshWaitId;
var unloadTimerId;

//does this really need to be here?
var checkboxSelector = new Slick.CheckboxSelectColumn({
    cssClass: "slick-cell-checkboxsel"
});

//archival stuff
var db;
var openRequest;