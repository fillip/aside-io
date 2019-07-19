#      author: Phil Rymek
#        date: 5.21.2012
# description: Contains all interaction with salesforce 
#			   that d3v requires as well as some utility functions.

require 'rubygems'
require 'soap/soap'
require 'rforce'
require './salesforce_meta.rb'
require './defaultDriver.rb'
require './client_auth_header_handler.rb'
require 'json'
require 'pg'

class D3VController
	
	attr_accessor :sfPartner, :sfMeta, :sfApex, :successfulLogin, :lrJSON, :defaultVersion, :userId
	
	BACKSLASH              = "\\"
	APEX_CLASS             = "ApexClass"
	APEX_PAGE              = "ApexPage"
	APEX_COMPONENT         = "ApexComponent"
	APEX_TRIGGER           = "ApexTrigger"
	STATIC_RESOURCE        = "StaticResource"
	CUSTOM_OBJECT          = "CustomObject"
	APEX_CLASS_SUFFIX      = ".cls"
	APEX_PAGE_SUFFIX       = ".page"
	APEX_COMPONENT_SUFFIX  = ".component"
	APEX_TRIGGER_SUFFIX    = ".trigger"
	STATIC_RESOURCE_SUFFIX = ".resource"
	CUSTOM_OBJECT_SUFFIX   = "__c.object"
	OPEN_FILE              = "Open "
	
	# initialize d3vController, called by every sinatra route in web.rb
	# call this method one of two ways
	# 1: username      - username to authenticate as
	#    password      -  users password
	#    securityToken - users security token
	#    endpoint      - test|prod
	#
	# 2: sessionId    - users session id
	#    endpoint     - partner api endpoint associated with session
	#    metaEndpoint - metadata api endpoint associated with session
	#    apexEndpoint - apex api endpoint associated with session
	#    anything     - only used to differentiate between call 1 and 2
	def initialize(*args)
		@defaultVersion = '44.0'
		
		case args.size
		when 4
			endpoint	  = args.pop
			securityToken = args.pop
			password 	  = args.pop
			username      = args.pop
			
			if endpoint == 'test'
				endpoint = 'https://test.salesforce.com'
			else
				endpoint = 'https://login.salesforce.com'
			end		
			
			@sfPartner = RForce::Binding.new endpoint + '/services/Soap/u/' + @defaultVersion
			return login(username, password, securityToken)
		when 5
			@userId      = args.pop
			apexEndpoint = args.pop
			metaEndpoint = args.pop
			endpoint     = args.pop
			sessionId    = args.pop
			sessionId    = sessionId == '{ success : false }' ? '' : sessionId
			
			@sfPartner = RForce::Binding.new(endpoint, sessionId)
			@sfPartner.init_server(endpoint)
			continueLogin(sessionId, metaEndpoint, apexEndpoint)
		end
	end
	
	def logClientError(msg, file, line, stackTrace)
		#if file == nil || file == ''
		#	return
		#end
	
		#psql = "dbname="    + ENV['DBN']  +
		#       " host="     + ENV['DBH']  +
		#       " user="     + ENV['DBU']  +
		#       " password=" + ENV['DBP']  +
		#       " port="     + ENV['DBPO'] +
		#       " sslmode=require" 
		       
		#conn      = PGconn.connect(psql)
		#timestamp = Time.now
		#day       = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
		#time      = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s
		
		#conn.prepare('statement1', 'INSERT INTO ClientError (day, epoch, time, msg, file, line, stack_trace) VALUES ($1, $2, $3, $4, $5, $6, $7);')
		#conn.exec_prepared('statement1', [day, timestamp.to_i, time, msg[0..255], file[0..127], line[0..4], stackTrace[0..1023]])
		
		#conn.flush
		#conn.finish			
	end
	
	# inserts a row into the auth fault table
	# ip        - ip address of user who hit error
	# param     - the 'state' parameter associated with the login
	# error     - the error encountered
	# errorDesc - detail about the error
	def logAuthFault(ip, state, error, errorDesc)
		#psql = "dbname="    + ENV['DBN']  +
		#       " host="     + ENV['DBH']  +
		#       " user="     + ENV['DBU']  +
		#       " password=" + ENV['DBP']  +
		#       " port="     + ENV['DBPO'] +
		#       " sslmode=require" 
		       
		#conn      = PGconn.connect(psql)
		#timestamp = Time.now
		#day       = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
		#time      = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s
		
		#conn.prepare('statement1', 'INSERT INTO AuthFault (ip_addr, day, epoch, time, state, key, err, err_desc) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);')
		#conn.exec_prepared('statement1', [ip, day, timestamp.to_i, time, state, '', error[0..126], errorDesc[0..254]])
		
		#conn.flush
		#conn.finish		
	end

	# inserts a row into the successful login table
	# ip - ip address of user who successful logged in
	#def logSuccessfulAuth(ip)
	#	psql = "dbname="    + ENV['DBN']  +
	#	       " host="     + ENV['DBH']  +
	#	       " user="     + ENV['DBU']  +
	#	       " password=" + ENV['DBP']  +
	#	       " port="     + ENV['DBPO'] +
	#	       " sslmode=require" 
	#	       
	#	conn      = PGconn.connect(psql)
	#	timestamp = Time.now
	#	day       = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
	#	time      = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s
	#	
	#	conn.prepare('statement1', 'INSERT INTO AuthenticatedLogin (ip_addr, day, epoch, time) VALUES ($1, $2, $3, $4);')	
	#	conn.exec_prepared('statement1', [ip, day, timestamp.to_i, time])
	#	
	#	conn.flush
	#	conn.finish			
	#end	
	
	# inserts a row indicating a hit to the /login or /frontdoor pages
	# ip     - ip address of user who hit site
	# source - login|frontdoor
	#def logHit(ip, source)
	#	psql = "dbname="    + ENV['DBN']  +
	#	       " host="     + ENV['DBH']  +
	#	       " user="     + ENV['DBU']  +
	#	       " password=" + ENV['DBP']  +
	#	       " port="     + ENV['DBPO'] +
	#	       " sslmode=require" 
	#	       
	#	conn      = PGconn.connect(psql)
	#	timestamp = Time.now
	#	day       = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
	#	time      = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s
	#	
	#	conn.prepare('statement1', 'INSERT INTO UnauthenticatedHit (ip_addr, day, epoch, time, location) VALUES ($1, $2, $3, $4, $5);')
	#	conn.exec_prepared('statement1', [ip, day, timestamp.to_i, time, source])
	#	
	#	conn.flush
	#	conn.finish		
	#end
	
	# inserts a row indicating an unrecoverable error occured
	# ip     - ip address of user who encountered the error
	# source - endpoint that caused the error
	def logFailedRecovery(ip, source)
		#psql = "dbname="    + ENV['DBN']  +
		#       " host="     + ENV['DBH']  +
		#       " user="     + ENV['DBU']  +
		#       " password=" + ENV['DBP']  +
		#       " port="     + ENV['DBPO'] +
		#       " sslmode=require" 
		       
		#conn      = PGconn.connect(psql)
		#timestamp = Time.now
		#day       = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
		#time      = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s

		#conn.prepare('statement1', 'INSERT INTO FatalError (ip_addr, day, epoch, time, method) VALUES ($1, $2, $3, $4, $5);')
		#conn.exec_prepared('statement1', [ip, day, timestamp.to_i, time, source[0..127]])

		#conn.flush
		#conn.finish
	end	
	
	# inserts a row indicating a serverside error
	# method     - method error occured in
	# error      - what went wrong
	# stackTrace - the stack trace from the error
	def logException(method, error, stackTrace)
		#psql = "dbname="    + ENV['DBN']  +
		#       " host="     + ENV['DBH']  +
		#       " user="     + ENV['DBU']  +
		#       " password=" + ENV['DBP']  +
		#       " port="     + ENV['DBPO'] +
		#       " sslmode=require" 
		#
		#conn       = PGconn.connect(psql)
		#timestamp  = Time.now
		#day        = timestamp.month.to_s + "/" + timestamp.day.to_s + "/" +  timestamp.year.to_s
		#time       = timestamp.hour.to_s + ":" + timestamp.min.to_s + ":" + timestamp.sec.to_s
		#stackTrace = stackTrace.kind_of?(Array) ? stackTrace.join(';') : stackTrace
		#endpoint1  = @sfApex.endpoint_url == nil ? '' : @sfApex.endpoint_url
		#endpoint2  = @sfPartner.url.host  == nil ? '' : @sfPartner.url.host
		
		#conn.prepare('statement1', 'INSERT INTO ServerError (day, epoch, time, method, message, trace) VALUES ($1, $2, $3, $4, $5, $6);')
		#conn.exec_prepared('statement1', [day, timestamp.to_i, time, method[0..63], error[0..511], endpoint1 + ';' + endpoint2 + ';' + stackTrace[0..900]])

		#conn.flush
		#conn.finish
	end		

	# used by initialize, instantiates various force.com apis
	# sid     - session id
	# metaEnd - metadata api endpoint associated with session
	# apexEnd - apex api endpoint associated with session
	def continueLogin(sid, metaEnd, apexEnd)
		begin
			#this line is interesting to me, why do I need it?
			#large posts fail without it
		    Rack::Utils.key_space_limit = 123456789
			@sfMeta = SalesforceMeta.new(sid, metaEnd)
			header  = ClientAuthHeaderHandler.new
			header.sessionid = sid
			@sfApex = ApexPortType.new(apexEnd)
			@sfApex.headerhandler << header		
			@successfulLogin = true
		rescue
			@successfulLogin = false
		end
	end
	
	# login to force, called by initialize
	# un - username
	# pw - password
	# st - security token
	def login(un, pw, st)
		begin
			lr      = @sfPartner.login un, pw + st
			sid     = lr.loginResponse.result.sessionId
			metaUrl = lr.loginResponse.result.metadataServerUrl
			@sfMeta = SalesforceMeta.new(sid, metaUrl)
			altEP  = metaUrl.split('.com/')[0] + '.com/services/Soap/s/'
			apexUrl = altEP + @defaultVersion
			header  = ClientAuthHeaderHandler.new
			header.sessionid = sid	
			@sfApex = ApexPortType.new(apexUrl)
			@sfApex.headerhandler << header
			@userId = lr.loginResponse.result.userInfo.userId
			@lrJSON = '{sid:"' + sid + '",' + 
				      'mep:"' + metaUrl + '",' +
				      'pep:"' + lr.loginResponse.result.serverUrl + '",' +
				      'uid:"' + @userId + '",' +
				      'aep:"' + apexUrl + '"}'
			@successfulLogin = true	
		rescue
			@lrJSON = 'false'
		end
	end
	
	# parses the namespace out of a filename
	# i.e. NAMESPACE.Filename returns NAMESPACE
	# filename - filename to parse
	# returns the namespace
	def getNamespacePrefix(filename)
		if filename.index('.') != nil
			fnSplit = filename.split('.')
			return fnSplit[0]
		end
		
		return ''
	end

	# parses the file out of a filename that has the namespace prefixed onto it
	# i.e. NAMESPACE.Filename returns Filename
	# filename - filename to parse
	# returns the filename without the namespace	
	def getFilename(filename)
		if filename.index('.') != nil
			fnSplit = filename.split('.')
			return fnSplit[1]
		end
		
		return filename
	end	

	# builds out a portion of a where clause to match the appropriate namespace prefix
	# namespacePrefix - the current files namespace prefix
	# returns a portion of a query's where clause targeting the specified namespacePrefix
	def getNamespacePrefixWhere(namespacePrefix)
		if namespacePrefix != ''
			return " NamespacePrefix = '" + namespacePrefix + "'"
		end
		
		return " NamespacePrefix = null"
	end

	# builds out a namespace prefix which can be prepended to metadata
	# namespacePrefix - the current files namespace prefix
	# returns a portion of a query's where clause targeting the specified namespacePrefix	
	def getNamespaceMetadataPrefix(namespace)
		if namespace != ''
			return namespace + '__'
		end
		
		return ''
	end

    # Saves apex.
    # apexBody       - the body of the apex.
    # apexType       - Class|Trigger
    # filename       - name of file to update
    # key            - last save key
    # version        - -1 to keep current version, else use specified version.
    # pushCode       - code generated client side
    # recordId       - id of record to update
    # parsedFilename - filename parsed out of the code
    # isRename       - true when this is a file rename    
    # retryAllowed   - will enable the fail - refresh token - retry flow
    # returns compiliation errors
	def saveApex(apexBody, apexType, filename, key, version, pushCode, recordId, parsedFilename, isRename, retryAllowed)
		begin	
			saveValidated = filename == 'A!NEW!FILE';
			toReturn      = '['

			if !saveValidated
				if apexType == 'Class'
					toReturn += validateClassKey(recordId, key) + ','
				elsif apexType == 'Trigger'
					toReturn += validateTriggerKey(recordId, key) + ','
				end
				
				toReturn = toReturn[0, toReturn.length-1] + ']'
				saveValidated = JSON.parse(toReturn)[0]['success']
			end
			
			if filename == 'A!NEW!FILE' && parsedFilename.size > 0
				validationResult = query("SELECT Id FROM Apex" + apexType + " WHERE Name = '" + parsedFilename + "' LIMIT 1")
				
				if validationResult.length > 0
					saveValidated = false
					
					toReturn += '{ "success" : false, "name" : "NAME_ALREADY_TAKEN", "problem" : ' + 
					            '"A file with this name already exists." }]'
				end
			end
			
			if saveValidated
				scripts     = Array.new
				tempClasses = []
				
				if filename != 'A!NEW!FILE'
					apexQuery   = "SELECT Id, ApiVersion, Body FROM Apex" + apexType + " WHERE Id = '" + recordId + "'"
					tempClasses = query(apexQuery)
		
					if tempClasses.length && tempClasses.length > 0
						tempClasses = tempClasses[0]
					end
				end
				
				versionNumber = nil
				if tempClasses == []
					versionNumber = @defaultVersion
					scripts << apexBody
				elsif version.to_i == -1
					versionNumber = tempClasses.ApiVersion
					scripts << apexBody
				else
					scripts << tempClasses.Body
					versionNumber = version + '.0' 
				end
				
				oldEndpoint          = @sfApex.endpoint_url
				@sfApex.endpoint_url = oldEndpoint[0,oldEndpoint.length-4] + versionNumber
				
				if apexType == 'Class'
					compileResult = compileClasses(scripts)
				elsif apexType == 'Trigger'
					compileResult = compileTriggers(scripts)
				end
				
				@sfApex.endpoint_url = oldEndpoint
				classBasedRows       = ''
	
	            if compileResult.result['success'] == 'true'
	            	if isRename && tempClasses.Id
	            		delete([tempClasses.Id])
	            	end
	            
					tempClasses = query("SELECT Id, LastModifiedById, LastModifiedDate, Name, NamespacePrefix, ApiVersion FROM Apex" + apexType + 
					                    " WHERE Id = '" + compileResult.result['id'] + "'")
			
					if tempClasses.length && tempClasses.length > 0
						tempClasses = tempClasses[0]
					end
					
					classBasedRows = '"LastModifiedById" : "' + tempClasses.LastModifiedById.to_s + '",' +
					                 '"LastModifiedDate" : "' + tempClasses.LastModifiedDate.to_s + '",' +
					                 '"NamespacePrefix" : "'  + tempClasses.NamespacePrefix.to_s  + '",' +
					                 '"ApiVersion" : "'       + tempClasses.ApiVersion.to_s       + '",'
				end
				
				return '{ "bodyCrc" : "' + (compileResult.result['bodyCrc']  ? compileResult.result['bodyCrc']  : '') + '",' +
						  '"column" : "' + (compileResult.result['column']   ? compileResult.result['column']   : '') + '",' +
						      '"Id" : "' + (compileResult.result['id']       ? compileResult.result['id']       : '') + '",' +
						    '"line" : "' + (compileResult.result['line']     ? compileResult.result['line']     : '') + '",' +
						    '"Name" : "' + (compileResult.result['name']     ? compileResult.result['name']     : '') + '",' +
						 '"problem" : "' + (compileResult.result['problem']  ? compileResult.result['problem']  : '') + '",' +
						 '"success" : "' + (compileResult.result['success']  ? compileResult.result['success']  : '') + '",' +
						 classBasedRows  +					 
						'"warnings" : "' + (compileResult.result['warnings'] ? compileResult.result['warnings'] : '') + '"}'
			end
			
			return toReturn
		rescue Exception => exception
			if exception.message.index("Apex compilation must run tests on this production org") != nil
				return '{ "bodyCrc" : "",' +
						  '"column" : "",' +
						      '"Id" : "",' +
						    '"line" : "",' +
						    '"Name" : "' + filename + '",' +
						 '"problem" : "Cannot save Apex code against this production org.  Write this code in a sandbox first, then deploy it to this production org.",' +
						 '"success" : "false",' +				 
						'"warnings" : ""}'				
			elsif exception.message.index("UNABLE_TO_LOCK_ROW") != nil
				return '{ "bodyCrc" : "",' +
						  '"column" : "",' +
						      '"Id" : "",' +
						    '"line" : "",' +
						    '"Name" : "' + filename + '",' +
						 '"problem" : "' + exception.message + '",' +
						 '"success" : "false",' +				 
						'"warnings" : ""}'				
			elsif exception.message.index("UNKNOWN_EXCEPTION") != nil
				return '{ "bodyCrc" : "",' +
						  '"column" : "",' +
						      '"Id" : "",' +
						    '"line" : "",' +
						    '"Name" : "' + filename + '",' +
						 '"problem" : "' + exception.message + '",' +
						 '"success" : "false",' +				 
						'"warnings" : ""}'					
			elsif retryAllowed && exception.message.index("Incorrect user name / password [faultcodesf:INVALID_LOGINfaultstringINVALID_LOGIN:") != nil
				return 'retry'
			else
				logException('saveApex(' + apexType + ', ' + filename + ')', exception.message, exception.backtrace)
				raise			
			end
		end
	end

	# validates that the user saving the file has the most recent version of the file
	# queryStr - get newest version of file to build key from
	# key      - key to validate against file queried for
	# lastModifiedById - id of user who last modified this file
	# lastModifiedName - name of user who last modified this file
	# returns json with success and error info	
	def validateKeyFull(queryStr, key, lastModifiedById, lastModifiedName)
		
		if lastModifiedById != nil && lastModifiedName != nil
			classes = queryTooling(queryStr)
		else 
			classes = query(queryStr)
		end
		
		if classes.length
			classes = classes[0]
		else
			return generateKeyCheckResult(true, nil, nil, nil, nil, nil)
		end
		
		if classes.length == 0
			return generateKeyCheckResult(true, nil, nil, nil, nil, nil)
		else
			if lastModifiedById != nil && lastModifiedById != '' && lastModifiedName != nil && lastModifiedName != ''
				return generateKeyCheckResult(false, classes['Id'], lastModifiedById, lastModifiedName, classes['LastModifiedDate'], key)
			end
			
			return generateKeyCheckResult(false, classes.Id, classes.LastModifiedById, classes.LastModifiedBy.Name, classes.LastModifiedDate, key)
		end		
	end

	# validates that the user saving the file has the most recent version of the file
	# queryStr - get newest version of file to build key from
	# key      - key to validate against file queried for
	# returns json with success and error info
	def validateKey(queryStr, key)
		validateKeyFull(queryStr, key, nil, nil)
	end

	# validates a save key for an ApexClass
	# fileId - id of file to validate key of
	# key  - key to validate
	def validateObjectKey(fileId, key)
		query = "SELECT Id, LastModifiedDate FROM CustomObject WHERE Id = '" + fileId + "'"
		validateKeyFull(query, key, 'undefined', 'someone else')
	end

	# validates a save key for an ApexClass, checking for save to server conflicts
	# recordId - id of record to validate
	# key  - key to validate
	def validateClassKey(recordId, key)
		query = "SELECT Id, LastModifiedById, LastModifiedDate, LastModifiedBy.Name FROM ApexClass WHERE Id = '" + recordId + "'"
		validateKey(query, key)
	end

	# validates a save key for an ApexTrigger, checking for save to server conflicts
	# recordId - id of record to validate
	# key  - key to validate
	def validateTriggerKey(recordId, key)
		query = "SELECT Id, LastModifiedById, LastModifiedDate, LastModifiedBy.Name FROM ApexTrigger WHERE Id = '" + recordId + "'"
		validateKey(query, key)
	end
	
	# queries salesforce for the data necessary for the coverage report
	# filter - the filter to use
	def generateCoverageReport(filter)
	    baseSOQL    = 'SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate '
		filteredRes = queryTooling(baseSOQL + filter)
		
		if filter == ''
			fullRes = filteredRes
		else
			fullRes = queryTooling(baseSOQL)
		end
		
		coverageResults = Array.new
		coverageResults[0] = filteredRes
		coverageResults[1] = fullRes
		
		return coverageResults
	end
	
	# generates json to return on key validation
	# fnfe      - true|false file queries for fnfe
	# fileId    - first part of key to compare against users key
	# lmbId     - second part of key to compare against users key
	# lmbName   - name of user who last modified the file
	# epochTime - third part of key to compare against users key
	# key       - key to validate
	def generateKeyCheckResult(fnfe, fileId, lmbId, lmbName, epochTime, key)
		if fnfe
			return '{ "success" : false, "name" : "FNFE", "problem" : "File not found!" }' 
		elsif key == (fileId + '-' + lmbId + '-' + epochTime)
			return '{ "success" : true, "name" : "", "problem" : "" }'
		end
		
		shortFid = fileId[0..14]
		shortLmb = lmbId[0..14]
		
		if key == (shortFid + '-' + lmbId + '-' + epochTime)
			return '{ "success" : true, "name" : "", "problem" : "" }'
		elsif key == (shortFid + '-' + shortLmb + '-' + epochTime)
			return '{ "success" : true, "name" : "", "problem" : "" }'
		elsif key == (fileId + '-' + shortLmb + '-' + epochTime)
			return '{ "success" : true, "name" : "", "problem" : "" }'
		end
		
		return '{ "success" : false, "name" : "CONFLICT_DURING_SAVE", ' +
			   '"problem" : "Please reopen this file and merge in your changes, ' + lmbName + ' contributed a more recent version." }'
	end
	
	# in order to sosl successfully
	# token with reserved characters that need to be escaped
	# token - what to escape
	# returns the escaped token
	def tokenEscape(token)
		reservedCharacters = {
		  '?' => "\\?",
		  '&' => "\\&",
		  '|' => "\\|",
		  '!' => "\\!",
		  '{' => "\\{",
		  '}' => "\\}",
		  '[' => "\\[",
		  ']' => "\\]",
		  '(' => "\\(",
		  ')' => "\\)",
		  '^' => "\\^",
		  '~' => "\\~",
		  '*' => "\\*",
		  ':' => "\\:",
		  '\\' => '\\\\',
		  '"' => '\"',
		  "'" => "\\'",
		  '+' => "\\+",
		  '-' => "\\-",
		  '%' => "\\%"
		}
		
		return token.gsub(/(\?|\&|\||\!|\{|\}|\[|\]|\(|\)|\^|\~|\*|\:|\\|\"|\'|\+|\-|\%)/) { reservedCharacters[$1] }		
	end
	
	# find in files
	# token - what to find
	# returns what it found
	def findInFiles(token)
		begin
			names  = Array.new
			token  = tokenEscape(token)
			
			result = sosl('FIND {"' + token + '" OR "' + token + '*"} IN ALL FIELDS RETURNING ApexClass(Name, Body, NamespacePrefix, LastModifiedDate order by Name), ApexPage(Name, NamespacePrefix, LastModifiedDate, Markup order by Name), ApexTrigger(Name, NamespacePrefix, LastModifiedDate, Body order by Name), ApexComponent(Name, NamespacePrefix, LastModifiedDate, Markup order by Name) limit 100')
			
			if result != nil && 
			   result.searchResponse != nil && 
			   result.searchResponse.result != nil && 
			   result.searchResponse.result.searchRecords != nil
			   
			    puts result
			   
				searchRecords = JSON.parse(result.searchResponse.result.searchRecords.to_json)

				if result.searchResponse.result.searchRecords.length == 1
					names << searchRecords['record']
				elsif result.searchResponse.result.searchRecords.length > 1
					
					searchRecords.each {
						|item|
						names << item['record']
					}
				end
			end
			
			return names
		rescue Exception => exception
			logException('findInFiles(' + token + ')', exception.message, exception.backtrace)
			raise		
		end
	end

    # Saves a code update notice to the database
    # filename - name of updated file
    # type     - Page/Component/Trigger/Class
    # pushKey  - unique key to identify this push
	def registerCodeUpdate(filename, type, pushKey)
		if @successfulLogin
			begin
				original    = filename
				namespace   = getNamespacePrefix(filename)
				filename    = original + '.' + type
				mdNamespace = getNamespaceMetadataPrefix(namespace)
				
				results = query("SELECT Id FROM " + mdNamespace + "ASIDE_Code_Update__c WHERE " + mdNamespace + "Filename__c = '" + filename + "'")
				
				if results.length > 0
					delete(getIds(results))
				end
				
				codeUpdate = [
					'type', mdNamespace + 'ASIDE_Code_Update__c',
					mdNamespace + 'Filename__c', filename,
					mdNamespace + 'Type__c', type,
					mdNamespace + 'Push_Code__c', pushKey
				]
				
				@sfPartner.create :sObject => codeUpdate
			rescue Exception => exception
				logException('registerCodeUpdate(' + type + ',' + original + ')', exception.message, exception.backtrace)
				raise
			end
		end
	end
	
	# given a list of records, returns a list of ids
	# list    - records to get ids from
	# returns list of ids
	def getIds(list)
		ids = Array.new

		list.each {
			|item|
			ids << item.Id
		}			
		
		return ids
	end
	
	#logout of d3v
	#sessionId - session id to revoke
	def logout(sessionId)
		if @successfulLogin
			begin
				@sfPartner.logout
			rescue Exception => exception
			
			end
		end	
	end

	# executes a soql query via rest
	# queryStr - the soql query
	# returns query results	
	def query(queryStr) 
		querySoap(queryStr)
	end

	# executes a soql query via rest
	# queryStr - the soql query
	# returns query results
	def queryRest(queryStr)
		HTTPClient.new.get_content(
			'https://' + @sfPartner.url.host + '/services/data/v' + @defaultVersion + '/query?q=' + URI::escape(queryStr), 
			'', 
			{'Authorization' => 'OAuth ' + @sfPartner.session_id})
	end	

	# executes a tooling api query
	# queryStr - the soql query
	# returns query results
	def queryTooling(queryStr)
		begin
			result = HTTPClient.new.get_content(
				'https://' + @sfPartner.url.host + '/services/data/v' + @defaultVersion + '/tooling/query?q=' + URI::escape(queryStr), 
				'', 
				{'Authorization' => 'OAuth ' + @sfPartner.session_id})
			
			result = JSON.parse(result)
			
			if result['records']
				return result['records']
			end
			
			return Array.new
		rescue Exception => ex
			return nil
		end
	end	
	
	
	# executes a soql query via soap
	# queryStr - the soql query
	# returns query results
	def querySoap(queryStr)
		if @successfulLogin
			qr = @sfPartner.query :queryString => queryStr
			
			if qr.Fault
				return qr.Fault
			elsif qr.queryResponse.result.records
				return qr.queryResponse.result.records
			else
				return Array.new
			end
		end
	end

	# executes a soql query via soap.  uses queryMore to retrieve all records of a given type.
	# queryStr - the soql query
	# locator  - query locator for when queryMore needs to be used
	# results  - the list of results so far, pass an empty array initial call
	# returns query results	
	def queryAll(queryStr, locator, results)
		if @successfulLogin
			queryMore = false
			
			if queryStr == nil
				qr = @sfPartner.queryMore :queryLocator => locator
				queryMore = true
			else
				qr = @sfPartner.query :queryString => queryStr
			end
			
			if qr.Fault
				return qr.Fault
			else
				if queryMore && qr.queryMoreResponse
					response = qr.queryMoreResponse
				elsif !queryMore && qr.queryResponse
					response = qr.queryResponse
				end
				
				if response.result.records
					results = results + response.result.records

					if response.result.done || response.result.queryLocator == nil
						return results
					else 
						queryAll(nil, response.result.queryLocator, results)
					end					
				else 
					return results
				end
			end
		end	
	end
	
	# executes a sosl query
	# soslStatement - the sosl query
	# returns search results
	def sosl(soslStatement)
		if @successfulLogin
			@sfPartner.search :searchString => soslStatement
		end
	end
	
	# insert data
	# objs - json string of what to insert
	# objType - object type of data being inserted
	def insert(objs, objType)
		if @successfulLogin
			begin
				inserts = JSON.parse(objs)
				result  = @sfPartner.create inserts.collect{|toInsert| [:sObject, {:type => objType}.merge(toInsert)]}.flatten
				return result.to_json
			rescue Exception => exception
				logException('insert(' + objType + ')', exception.message, exception.backtrace)
				raise
			end			
		end
	end

	# update data
	# objs - json string of what to insert
	# objType - object type of data being updated
	def update(objs, objType)
		if @successfulLogin
			begin		
				updates = JSON.parse(objs)
				result  = @sfPartner.update updates.collect{|toUpdate| [:sObject, {:type => objType}.merge(toUpdate)]}.flatten
				return result.to_json
			rescue Exception => exception
				logException('update(' + objType + ')', exception.message, exception.backtrace)
				raise
			end					
		end
	end
	
	# parses the page tag in the content passed in, to determine if automatic file generation needs to occur
	# content      - to parse
	# matchResults - hash containing info about which automatic generation tags have been used
	# returns content with auto file generation hash tag removed so the file can first be compiled
	def parsePageTag(content, matchResults)
		startIndex        = content.index('<apex:')
		endIndex          = content.index('>', startIndex)
		pageTag           = content[startIndex..endIndex]
		controllerMatch   = pageTag.match(/\scontroller="#([A-Za-z0-9\_]*)"/i)
		standardCtrlMatch = pageTag.match(/\sstandardcontroller="([A-Za-z0-9\_]*)"/i)
		toReturn          = content
		
		if controllerMatch == nil
			extensionsMatch = pageTag.match(/(\sextensions=")(?:[A-Za-z0-9\_]+[,\s]+)*(#([A-Za-z0-9\_]*)\s*\,?)[A-Za-z0-9\_,\s]*"/i)
			
			if standardCtrlMatch != nil && extensionsMatch != nil
				if extensionsMatch[2].index(',') == nil
					toReturn = content.sub(extensionsMatch[0], '')
				else
					toReturn = content.sub(extensionsMatch[0], extensionsMatch[0].sub(extensionsMatch[2], ''))
				end
			end
		elsif standardCtrlMatch == nil
			toReturn = content.sub(controllerMatch[0], '')
		end	
		
		matchResults[:ctrl]    = controllerMatch
		matchResults[:stdCtrl] = standardCtrlMatch
		matchResults[:ext]     = extensionsMatch
		
		return toReturn
	end
	
	# auto generates a controller and test class
	# name            - name of vf page to generate controller for
	# content         - content of vf page
	# modified        - savable version of content
	# pushCode        - to validate save
	# result          - result of saving new vf page
	# controllerMatch - match result from parsePageTag()
	# type            - ApexPage | ApexComponent
	def autoGenerateControllerAndTest(name, content, modified, pushCode, result, controllerMatch, type)
		apexClassName = name + controllerMatch[1]
		apexClass = "public with sharing class " + apexClassName + " {\n\n" +
		            "\tpublic " + apexClassName + "() {\n\n\t}\n\n}"
            
        saveApex(apexClass, 'Class', 'A!NEW!FILE', '', '', pushCode, nil, '', false, false)
		
		testClass = "@isTest\nprivate class " + apexClassName + "Test {\n\n" +
		            "\tprivate static testMethod void testConstructor() {\n" +
		            "\t\t" + apexClassName + " ctrl = new " + apexClassName + "();\n" +
		            "\t\tSystem.assertNotEquals(null, ctrl);\n\t}\n\n}"
		
		saveApex(testClass, 'Class', 'A!NEW!FILE', '', '', pushCode, nil, '', false, false)
		
		content.sub!(controllerMatch[0], ' controller="' + apexClassName + '"')
		updateVisualforce(content, type, result.createResponse.result[:id], pushCode)	
	end

	# auto generates an extension and test class
	# name              - name of vf page to generate controller for
	# content           - content of vf page
	# modified          - savable version of content
	# pushCode          - to validate save
	# result            - result of saving new vf page
	# standardCtrlMatch - match result from parsePageTag()	
	# extensionsMatch   - match result from parsePageTag()	
	def autoGenerateExtensionAndTest(name, content, modified, pushCode, result, standardCtrlMatch, extensionsMatch)
		apexClassName = name + extensionsMatch[3]
		standardCtrl  = standardCtrlMatch[1]
		ctrlVar       = standardCtrl.length > 3 ? standardCtrl[0..2].downcase : standardCtrl.downcase
		
		apexClass = "public with sharing class " + apexClassName + " {\n\n" +
		            "\tpublic " + standardCtrl + " " + ctrlVar + " {get; set;}\n\n" + 
		            "\tpublic " + apexClassName + "(ApexPages.StandardController ctrl) {\n" +
		            "\t\t" + ctrlVar + " = (" + standardCtrl + ") ctrl.getRecord();\n\t}\n\n}"
		            
		saveApex(apexClass, 'Class', 'A!NEW!FILE', '', '', pushCode, nil, '', false, false)
		
		testClass = "@isTest\nprivate class " + apexClassName + "Test {\n\n" +
		            "\tprivate static testMethod void testConstructor() {\n" +
		            "\t\tApexPages.StandardController stdCtrl =\n" +
		            "\t\t\tnew ApexPages.StandardController(new " + standardCtrl + "());\n\n" +
		            "\t\t" + apexClassName + " ctrl = new " + apexClassName + "(stdCtrl);\n\n" +
					"\t\tSystem.assertNotEquals(null, ctrl);\n\t}\n\n}"
		
		saveApex(testClass, 'Class', 'A!NEW!FILE', '', '', pushCode, nil, '', false, false)
					
		content.sub!(/(\sextensions="[A-Za-z0-9\_,\s]*)#[A-Za-z0-9\_]*([A-Za-z0-9\_,\s]*")/i, '\1' + apexClassName + '\2')		
		updateVisualforce(content, 'ApexPage', result.createResponse.result[:id], pushCode)		
	end
	
	# if an auto generation hash tag has been used, generates the appropriate code
	# name              - name of vf page to generate controller for
	# content           - content of vf page
	# modified          - savable version of content
	# pushCode          - to validate save
	# result            - result of saving new vf page
	# controllerMatch   - match result from parsePageTag()	
	# standardCtrlMatch - match result from parsePageTag()	
	# extensionsMatch   - match result from parsePageTag()	
	# type              - ApexPage | ApexComponent
	def autoGenerateCode(name, content, modified, pushCode, result, controllerMatch, standardCtrlMatch, extensionsMatch, type)
		if controllerMatch != nil
			autoGenerateControllerAndTest(name, content, modified, pushCode, result, controllerMatch, type)
		elsif standardCtrlMatch != nil && extensionsMatch != nil
			autoGenerateExtensionAndTest(name, content, modified, pushCode, result, standardCtrlMatch, extensionsMatch)
		end	
	end
	
	# creates a new visualforce file
	# content  - markup of new file
	# type     - ApexPage|ApexComponent
	# name     - name of new vf file
	# pushCode - code generated client side
	def createVisualforce(content, type, name, pushCode)
		if @successfulLogin
			begin
				matchResults    = {}
				modified        = parsePageTag(content, matchResults)
				name            = getFilename(name)
				namespacePrefix = getNamespacePrefix(name)
				prefixWhere     = getNamespacePrefixWhere(namespacePrefix)
				
				result = @sfPartner.create :sObject => [
													   	:type, type,
													   	:Markup, modified,
													   	:Name, name,
													   	:MasterLabel, name
													   ]
				
				tempVF = Array.new
				if result.createResponse.result.success		
					autoGenerateCode(name, content, modified, pushCode, result, matchResults[:ctrl], matchResults[:stdCtrl], matchResults[:ext], type)
					
					tempVF = query("SELECT Id, Name, LastModifiedById, LastModifiedDate, NamespacePrefix, ApiVersion FROM " + type + " WHERE Id = '" + result.createResponse.result[:id] + "'")
	
					if tempVF.length && tempVF.length > 0
						tempVF = tempVF[0]
					end		
				end
				
				vfSaveResult = Array.new
				vfSaveResult[0] = result
				vfSaveResult[1] = tempVF
				return vfSaveResult
			rescue Exception => exception
				if exception.message.index("UNABLE_TO_LOCK_ROW") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'				
				elsif exception.message.index("UNKNOWN_EXCEPTION") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'					
				else			
					logException('createVisualforce(' + type + ', ' + name + ')', exception.message, exception.backtrace)
					raise
				end
			end
		end
	end

	# updates an existing visualforce file
	# content  - markup of file
	# type     - ApexPage|ApexComponent
	# id       - id of file to update
	# pushCode - code generated client side
	def updateVisualforce(content, type, id, pushCode)
		if @successfulLogin
			begin
				result = @sfPartner.update :sObject => [
													   	:type, type,
													   	:Markup, content,
													   	:Id, id
													   ]
													   
				tempVF = Array.new
				if result.updateResponse.result.success								   
					tempVF = query("SELECT Id, Name, LastModifiedById, LastModifiedDate, ApiVersion FROM " + type + " WHERE Id = '" + id + "'")
	
					if tempVF.length && tempVF.length > 0
						tempVF = tempVF[0]
					end	
				end
				
				vfSaveResult = Array.new
				vfSaveResult[0] = result
				vfSaveResult[1] = tempVF
				return vfSaveResult
			rescue Exception => exception
				if exception.message.index("UNABLE_TO_LOCK_ROW") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'				
				elsif exception.message.index("UNKNOWN_EXCEPTION") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'					
				else			
					logException('updateVisualforce(' + type + ')', exception.message, exception.backtrace)
					raise
				end
			end										   
		end
	end	

	# creates a new static resource
	# name    - name of the file
	# mime    - file mime type
	# content - content of file
	def createStaticResource(name, mime, content)
		if @successfulLogin
			begin
				name            = getFilename(name)
				namespacePrefix = getNamespacePrefix(name)
				prefixWhere     = getNamespacePrefixWhere(namespacePrefix)
			
				result = @sfPartner.create :sObject => [
													   	:type, 'StaticResource',
													   	:Body, content,
													   	:Name, name,
													   	:ContentType, mime
													   ]
													   
				tempResource = Array.new
				if result.createResponse.result.success								   
					tempResource = query("SELECT Id, LastModifiedById, LastModifiedDate, NamespacePrefix, Body FROM StaticResource WHERE Id = '" + result.createResponse.result[:id] + "'")
	
					if tempResource.length && tempResource.length > 0
						tempResource = tempResource[0]
					end
				end
				
				srSaveResult    = Array.new
				srSaveResult[0] = result
				srSaveResult[1] = tempResource
				
				if !isEditableMimeType(mime)
					srSaveResult[2] = true
				end
				
				return srSaveResult		
			rescue Exception => exception
				logException('createStaticResource()', exception.message, exception.backtrace)
				raise	
			end					
		end
	end	
	
	# determines if the static resources mime type is one which is editable within aside
	# mime - mime type of current file
	# return true when the current file is editable within aside
	def isEditableMimeType(mime)
		allowable = [
			'text/css', 
			'text/javascript',
			'application/css', 
			'application/javascript',	
			'application/x-css', 
			'application/x-javascript',						 
			'text/plain', 
			'application/text', 
			'text/html', 
			'text/xml'];
			
		return allowable.include? mime
	end
	
	def createLightning(source, name, defType, sourceFormat)
		if @successfulLogin
			begin
				resourceName = nil
				resourcePrefix = nil
				
				if name.index('.') == nil
					bundle = query("SELECT Id FROM AuraDefinitionBundle WHERE DeveloperName = '" + name + "'")
					resourceName = name
				else
					nameSplit = name.split('.')
					resourceName = nameSplit[1]
					resourcePrefix = nameSplit[0]
					
					bundle = query("SELECT Id FROM AuraDefinitionBundle WHERE DeveloperName = '" + resourceName + 
						"' AND NamespacePrefix = '" + resourcePrefix + "'")
				end
				
				parentId = nil
				if bundle != nil && bundle.length && bundle.length > 0
					parentId = bundle[0][:Id]
				else
					bundleResult = @sfPartner.create :sObject => [
														   	:type, 'AuraDefinitionBundle',
														   	:ApiVersion, @defaultVersion,
														   	:DeveloperName, resourceName,
														   	:MasterLabel, resourceName,
														   	:NamespacePrefix, resourcePrefix,
														   	:Description, resourceName
														   ]
							
					puts bundleResult													   
					if bundleResult.createResponse.result.success 
						parentId = bundleResult.createResponse.result[:id]
					end
				end
				
				result = @sfPartner.create :sObject => [
													   	:type, 'AuraDefinition',
													   	:Source, source,
													   	:AuraDefinitionBundleId, parentId,
													   	:DefType, defType,
													   	:Format, sourceFormat
													   ]				

				tempLightning = Array.new
				if result.createResponse.result.success								   
					tempLightning = query("SELECT Id, LastModifiedById, LastModifiedDate, AuraDefinitionBundleId, " +
						"AuraDefinitionBundle.ApiVersion, AuraDefinitionBundle.DeveloperName, " +
						"AuraDefinitionBundle.NamespacePrefix FROM AuraDefinition WHERE Id = '" + 
						result.createResponse.result[:id] + "'")
	
					if tempLightning.length && tempLightning.length > 0
						tempLightning = tempLightning[0]
					end	
				end
				
				lightningSaveResult = Array.new
				lightningSaveResult[0] = result
				lightningSaveResult[1] = tempLightning
				return lightningSaveResult
			rescue Exception => exception
				if exception.message.index("UNABLE_TO_LOCK_ROW") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'				
				elsif exception.message.index("UNKNOWN_EXCEPTION") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'					
				else			
					logException('createLightning(' + parentId + ', ' + name + ')', exception.message, exception.backtrace)
					raise
				end
			end
		end	
	end
	
	# updates a lightning resource
	# content - file contents
	# id      - AuraDefinition Id
	def updateLightning(content, id)
		if @successfulLogin
			begin
				result = @sfPartner.update :sObject => [
													   	:type, 'AuraDefinition',
													   	:Source, content,
													   	:Id, id
													   ]
													   
				tempLightning = Array.new
				if result.updateResponse.result.success								   
					tempLightning = query("SELECT Id, LastModifiedById, LastModifiedDate FROM AuraDefinition WHERE Id = '" + id + "'")
	
					if tempLightning.length && tempLightning.length > 0
						tempLightning = tempLightning[0]
					end	
				end
				
				lightningSaveResult = Array.new
				lightningSaveResult[0] = result
				lightningSaveResult[1] = tempLightning
				return lightningSaveResult
			rescue Exception => exception
				if exception.message.index("UNABLE_TO_LOCK_ROW") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'				
				elsif exception.message.index("UNKNOWN_EXCEPTION") != nil
					return '{ "bodyCrc" : "",' +
							  '"column" : "",' +
							      '"Id" : "",' +
							    '"line" : "",' +
							    '"Name" : "' + filename + '",' +
							 '"problem" : "' + exception.message + '",' +
							 '"success" : "false",' +				 
							'"warnings" : ""}'					
				else			
					logException('updateLightning()', exception.message, exception.backtrace)
					raise
				end
			end										   
		end	
	end
	
	# updates an existing static resource
	# content - markup of file
	# id      - id of file to update
	# type    - content type of static resource
	def updateStaticResource(content, id, type)
		if @successfulLogin
			begin
				result = @sfPartner.update :sObject => [
													   	:type, 'StaticResource',
													   	:Body, content,
													   	:Id, id,
													   	:ContentType, type
													   ]
													   
				tempResource = Array.new
				if result.updateResponse.result.success								   
					tempResource = query("SELECT Id, Name, LastModifiedById, LastModifiedDate, Body FROM StaticResource WHERE Id = '" + id + "'")
	
					if tempResource.length && tempResource.length > 0
						tempResource = tempResource[0]
					end
				end
				
				srSaveResult    = Array.new
				srSaveResult[0] = result
				srSaveResult[1] = tempResource
				
				if !isEditableMimeType(type)
					srSaveResult[2] = true
				end
				
				return srSaveResult		
			rescue Exception => exception
				logException('updateStaticResource()', exception.message, exception.backtrace)
				raise	
			end					
		end
	end	

	# delete rows
	# recordIds - what to delete	
	def delete(recordIds)
		if @successfulLogin
			begin
				result = @sfPartner.delete recordIds.collect{ |id| [:id, id] }.flatten
	
				if result.deleteResponse.result[0]
					return result.deleteResponse.result[0]
				else
					return result.deleteResponse.result
				end
			rescue Exception => exception
				logException('delete()', exception.message, exception.backtrace)
				raise	
			end		
		end
	end

	# upsert rows
	# objType - what table to upsert to
	# externalIdName - name of field to upsert on
	# objs - the data that to upsert
	def upsert(objType, externalIdName, objs)
		if @successfulLogin
			begin
				upserts = JSON.parse(objs)
				upserts = upserts.collect{|toUpsert| [:sObject, {:type => objType}.merge(toUpsert)]}.flatten
				upserts.insert(0, :externalIdFieldName)
				upserts.insert(1, externalIdName)
				result = @sfPartner.upsert upserts
				return result.to_json
			rescue Exception => exception
				logException('upsert(' + objType + ', ' + externalIdName + ')', exception.message, exception.backtrace)
				raise	
			end					
		end
	end
	
	# returns an instance of the metadata api
	# version - specify the version of metadata api to generate
	def getMetadataAPI(version)
		metaUrl    = @sfMeta.instance_variable_get('@url')
		currentUrl = metaUrl.scheme + '://' + metaUrl.host + metaUrl.path
		urlMatch   = currentUrl.match(/\/services\/soap\/m\/(\d+\.\d)\//i)
		currentUrl = currentUrl.gsub('/' + urlMatch[1] + '/', '/' + version + '/')
		return SalesforceMeta.new(@sfMeta.instance_variable_get('@session_id'), currentUrl)	
	end
	
	#used for debugging purposes only, allows you to check the status of the deployd3vobjects and fields calls
	def checkStatus(idToCheck)
		oldMeta = getMetadataAPI('29.0')
    	oldMeta.checkStatus(idToCheck)	
	end
	
	# reads files used for d3v install
	def getFileContents(pathToFile)
		file = File.open(pathToFile, "rb")
		a = file.read
		file.close
		return a
	end	
	
	# determines if an object exists
	# objId - id of the object
	# returns true if the object exists
	def objectExists(objId)
		if objId
			res = queryTooling("SELECT Id FROM CustomObject WHERE Id = '" + objId + "'")
			
			return res.length > 0 ? true : false
		else
			return false
		end
	end

    # saves a custom object by performing a deploy
    # body     - the base 64 encoded zip file
    # objectId - id of object to save
	# saveKey  - save key to validate
    # return a status id which should be sent to checkDeployStatus()	
	def saveCustomObject(body, objectId, saveKey)
    	if @successfulLogin
    		begin
    			valid = true
    			    			
    			if objectId != nil && objectId != ''
	    			if !objectExists(objectId)
	    				return generateKeyCheckResult(true, nil, nil, nil, nil, nil)
	    			end    			
    			
    				validation = JSON.parse(validateObjectKey(objectId, saveKey))
    				valid = validation['success']
    			end
    			
    			if valid
    				@sfMeta.deploy(body, 'true', 'false', 'true', 'false', 'false')
    			else
    				return validation
    			end
    		rescue Exception => exception
				logException('saveCustomObject(' + saveKey + ', ' + objectId + ')', exception.message, exception.backtrace)
				raise	    		
    		end
    	end	
	end

    # performs a deploy operations when passed a base-64 encoded zip file along with deploy options
    # body              - the base 64 encoded zip file
    # allowMissingFiles - Specifies whether a deploy succeeds even if files that are specified in package.xml but are not in the zip file.
    # checkOnly         - Check if the deploy will succeed, but dont actually do the deploy
    # ignoreWarnings    - Indicates whether a warning should allow a deployment to complete successfully (true) or not (false).
    # purgeOnDelete     - If true, the deleted components in the destructiveChanges.xml manifest file aren't stored in the Recycle Bin.
    # runAllTests       - If true, all Apex tests defined in the organization are run.  True no matter what for prod orgs.
    # return a status id which should be sent to checkDeployStatus()
    def deploy(body, allowMissingFiles, checkOnly, ignoreWarnings, purgeOnDelete, runAllTests)
    	if @successfulLogin
    		begin
    			@sfMeta.deploy(body, allowMissingFiles, checkOnly, ignoreWarnings, purgeOnDelete, runAllTests)
    		rescue Exception => exception
				logException('deploy(' + allowMissingFiles + ', ' + purgeOnDelete + ', ' + runAllTests + ')', exception.message, exception.backtrace)
				raise	    		
    		end
    	end
    end
    
    # check the status of a deploy, used to get deploy result
    # statusId - status id obtained from deploy call
    # includeDetails - true to include a higher level of detail on the deployment
    # returns status results
    def checkDeployStatus(statusId, includeDetails)    
    	if @successfulLogin
    		begin
    			@sfMeta.checkDeployStatus(statusId, includeDetails)
    		rescue Exception => exception
				logException('checkDeployStatus(' + includeDetails + ')', exception.message, exception.backtrace)
				raise	    		
    		end    			
    	end
    end
    
    # perform a retrieve when passed the body of a package xml
    # body - body of package.xml i.e. <types> and its children
    # returns the status id which can be used to get the retrieve result	
	def retrieve(body)
		if @successfulLogin
			begin
				@sfMeta.retrieve(body)
    		rescue Exception => exception
				logException('retrieve()', exception.message, exception.backtrace)
				raise	    		
    		end				
		end
	end

    # reads a specific objects metadata
    # objectName      - name of object to read metadata of
    # namespacePrefix - namespace of object
    # returns object metadata	
	def getObjectMetadata(objectName, namespacePrefix)
		if @successfulLogin
			begin
				mdName          = objectName
				namespaceClause = ' AND NamespacePrefix = null'
				
				if namespacePrefix && namespacePrefix.length > 1
					mdName          = namespacePrefix + '__' + objectName
					namespaceClause = " AND NamespacePrefix = '" + namespacePrefix + "'"
				end
				
				result = @sfMeta.getObjectMetadata(mdName)
				
				if result[:readMetadataResponse] && 
				   result[:readMetadataResponse][:result] && 
				   result[:readMetadataResponse][:result][:records] && 
				   result[:readMetadataResponse][:result][:records].length

					qtRes = queryTooling("SELECT Id, LastModifiedDate FROM CustomObject WHERE DeveloperName = '" + objectName.sub('__c', '') + "'" + namespaceClause)
					if qtRes && qtRes.length > 0
						result[:readMetadataResponse][:result][:Id] = qtRes[0]["Id"]
						result[:readMetadataResponse][:result][:LastModifiedDate] = qtRes[0]["LastModifiedDate"]						
					end
				end
				
				return result
    		rescue Exception => exception
				logException('getObjectMetadata()', exception.message, exception.backtrace)
				raise	    		
    		end				
		end	
	end

    # check the status of a retrieve, used to get retrieve result
    # statusId - status id obtained from retrieve call
    # returns result including base64 encoded zip retrieve result	
	def checkRetrieveStatus(statusId)
		if @successfulLogin
			begin
				@sfMeta.checkRetrieveStatus(statusId)
    		rescue Exception => exception
				logException('checkRetrieveStatus()', exception.message, exception.backtrace)
				raise	    		
    		end				
		end
	end
	
	#get list of debug logs
	#currentUserFilter - true to only return debug logs for this user, false for all
	def getDebugLogList(currentUserFilter)
		if @successfulLogin
			begin
				whereClause = ''
				if currentUserFilter == "true"
					whereClause = "WHERE LogUserId = '" + @userId + "'"
				end
			
				query("SELECT Id, DurationMilliseconds, LogLength, LogUser.Name, " +
				      "Operation, StartTime, Status FROM ApexLog " + whereClause   + 
				      " ORDER BY StartTime DESC LIMIT 100")	
    		rescue Exception => exception
				logException('getDebugLogList(' + currentUserFilter + ')', exception.message, exception.backtrace)
				raise	    		
    		end		
		end
	end
	
	#get debug log by id
	#logId - id of debug log to retrieve
	def getDebugLog(logId)
		if @successfulLogin
			begin
				HTTPClient.new.get_content(
					'https://' + @sfPartner.url.host + '/apexdebug/traceDownload.apexp?id=' + logId, 
					'', 
					{'Authorization' => 'OAuth ' + @sfPartner.session_id})
    		rescue Exception => exception
				logException('getDebugLog()', exception.message, exception.backtrace)
				raise	    		
    		end						
		end
	end
	
	#resets your debug logs
	# levels - debug log levels comma separated (ApexCode, ApexProfiling, Callout, Database, System, Validation, Visualforce, Workflow)
	def resetDebugLogs(levels)
		if @successfulLogin
			begin
				oldTrace = queryTooling('SELECT Id FROM TraceFlag WHERE TracedEntityId = \'' + @userId + '\'')
				
				if oldTrace.length > 0
					oldTraceId = oldTrace[0]['Id']
					
					HTTPClient.new.delete(
						'https://' + @sfPartner.url.host + '/services/data/v' + @defaultVersion + '/tooling/sobjects/TraceFlag/' + oldTraceId, 
						nil, 
						{'Authorization' => 'OAuth ' + @sfPartner.session_id, 'Content-Type' => 'application/json'})					
				end
			
				splitLevels = levels.split(',')
				
				startDate = DateTime.now
				endDate = startDate + 0.75
				startDate = startDate.to_s
				endDate = endDate.to_s
				
				debugLevel = queryTooling('SELECT Id FROM DebugLevel WHERE DeveloperName = \'ASIDELog\'')
				debugLevelId = ''
				
				if debugLevel.length == 0
					result = HTTPClient.new.post(
						'https://' + @sfPartner.url.host + '/services/data/v' + @defaultVersion + '/tooling/sobjects/DebugLevel', 
						'{"ApexCode" : "' + splitLevels[0] + '", "ApexProfiling" : "' + splitLevels[1] + '", "Callout" : "' + splitLevels[2] + '", "Database" : "' + splitLevels[3] + '", "System" : "' + splitLevels[4] + '", "Validation" : "' + splitLevels[5] + '", "Visualforce" : "' + splitLevels[6] + '", "Workflow" : "' + splitLevels[7] + '", "DeveloperName" : "ASIDELog", "MasterLabel" : "ASIDELog"}', 
						{'Authorization' => 'OAuth ' + @sfPartner.session_id, 'Content-Type' => 'application/json'})
										
					debugLevelId = JSON.parse(result.body)['id']
				else
					debugLevelId = debugLevel[0]['Id']
				end
				
				result = HTTPClient.new.post(
					'https://' + @sfPartner.url.host + '/services/data/v' + @defaultVersion + '/tooling/sobjects/TraceFlag', 
					'{"ApexCode" : "' + splitLevels[0] + 
				    '", "ApexProfiling" : "' + splitLevels[1] + 
				    '", "Callout" : "' + splitLevels[2] + 
				    '", "Database" : "' + splitLevels[3] + 
				    '", "System" : "' + splitLevels[4] + 
				    '", "Validation" : "' + splitLevels[5] + 
				    '", "Visualforce" : "' + splitLevels[6] + 
				    '", "Workflow" : "' + splitLevels[7] + 
				    '", "TracedEntityId" : "' + @userId + 
				    '", "StartDate" : "' + startDate + 
				    '", "ExpirationDate" : "' + endDate + 
				    '", "LogType" : "DEVELOPER_LOG", "DebugLevelId" : "' + debugLevelId + '"}', 
					{'Authorization' => 'OAuth ' + @sfPartner.session_id, 'Content-Type' => 'application/json'})
					
    		rescue Exception => exception 
				#logException('resetDebugLogs()', exception.message, exception.backtrace)
				#raise	   
				
				return exception.message
    		end						
		end
	end
	
	# execute apex anonymously
	# toExecute - what to execute
	# returns execution results
	def executeAnonymous(toExecute)
		if @successfulLogin
			begin
				result = @sfApex.executeAnonymous(:string => toExecute)
				return '{"column":"' + 
						(result.result.column ? result.result.column : '') + 
						'",' +
						'"compileProblem":"' + 
						(result.result.compileProblem ? result.result.compileProblem : '') + 
						'",' +
						'"compiled":"' + 
						(result.result.compiled ? result.result.compiled : '') + 
						'",' +
						'"exceptionMessage":"' + 
						(result.result.exceptionMessage ? result.result.exceptionMessage : '') + 
						'",' +
						'"exceptionStackTrace":"' + 
						(result.result.exceptionStackTrace ? result.result.exceptionStackTrace : '') + 
						'",' +
						'"line":"' + (result.result.line ? result.result.line : '') + 
						'",' +
						'"success":"' + 
						(result.result.success ? result.result.success : '') + '"}'
			rescue Exception => exception
				if (exception.message['REQUEST_LIMIT_EXCEEDED:']) != nil
					return '{"column":"1",' +
							'"compileProblem":"' + exception.message + '",' +
							'"compiled":"",' +
							'"exceptionMessage":"' + exception.message + '",' +
							'"exceptionStackTrace":"",' +
							'"line":"2",' +
							'"success":"false"}'					
				else
					logException('executeAnonymous()', exception.message, exception.backtrace)
					raise
				end	
			end		
		end
	end

	# compile apex classes
	# toCompile - what to compile
	# returns compilation results	
	def compileClasses(toCompile)
		if @successfulLogin
			return @sfApex.compileClasses(:scripts => toCompile)
		end
	end

	# compile apex triggers
	# toCompile - what to compile
	# returns compilation results		
	def compileTriggers(toCompile)
		if @successfulLogin
			return @sfApex.compileTriggers(:scripts => toCompile)
		end
	end

	# queues a single unit test for execution
	# toRun - the name of the class to execute unit tests from
	def runTest(toRun)
		if @successfulLogin
			begin
				fn = getFilename(toRun)
				ns = getNamespacePrefix(toRun)
				nq = getNamespacePrefixWhere(ns)					
							
				results = query("SELECT Id FROM ApexClass WHERE Name = '" + fn + "' AND " + nq)
				if results.length && results.length > 0
					results = results[0]
				end
				
				return queueUnitTests([results.Id])
			rescue Exception => exception
				logException('runTest()', exception.message, exception.backtrace)
				raise	
			end		
		end
	end

	# runs unit tests
	# (DEPRECATED -- use queueUnitTests)
	# runAll - true / false do you wanna run all?
	# toRun  - what test classes do you want to execute in the form of a list of ids
	def runTests(runAll, toRun)
		if @successfulLogin
			begin
				@sfMeta.runTests(runAll, toRun, @sfApex.endpoint_url)
			rescue Exception => exception
				logException('runTests(' + runAll + ')', exception.message, exception.backtrace)
				raise	
			end
		end
	end
	
	# describes a list of sobjects
	# toDescribe - a list of sobject api names to describe
	def describeSObject(toDescribe)
		if @successfulLogin
			@sfPartner.describeSObjects toDescribe.collect{ |toDesc| [:sObjectType, toDesc] }.flatten
		end
	end
	
	# describe EVERYTHING!
	def describeGlobal
		if @successfulLogin
			@sfPartner.describeGlobal
		end
	end
	
	# Initializes aside - loads up list of code available, organization info, user info, and a list of objects by id
	# orgId       - id of org being loaded
	# userId      - id of user using aside
	# filterLevel - level of code to retrieve (see server action definition for more info)
	# endpoint    - test or login
	# namespace   - value of namespace cookie if it exists, or empty string
	# hasNamespaceCookie - true if the namespace was read from cookie
	# returns object describing this org and user
	def initAside(orgId, userId, filterLevel, endpoint, namespace, hasNamespaceCookie)
		if @successfulLogin
			begin
				files             = getCodeFileNames(filterLevel)
				info              = getInstallInfo(endpoint, orgId)
				user              = getUserInfo(userId)
				objMap            = getObjectMap(user['admin'])				
				aside             = Hash.new
				aside['files']    = files
				aside['org']      = info
				aside['user']     = user
				aside['objMap']   = objMap
				info['namespace'] = determineNamespace(endpoint, namespace, hasNamespaceCookie)
				
				return aside.to_json
			rescue Exception => exception
				logException('initAside()', exception.message, exception.backtrace)
			end
		end
	end
	
	# get a list of object by id
	# isAdmin - true if current user is an admin
	# returns list of object by id
	def getObjectMap(isAdmin)
		objMap   = Hash.new
		
		if isAdmin
			results  = queryTooling('SELECT Id, DeveloperName FROM CustomObject')
			
			results.each {
				|res|
				
				objMap[res['Id']] = res['DeveloperName'] + '__c'
			}
		end
		
		return objMap
	end
	
	# figures out the namespace for the current org
	# endpoint    - test or login
	# namespace   - value of namespace cookie if it exists, or empty string
	# hasNamespaceCookie - true if the namespace was read from cookie
	# returns the namespace of the current org or empty string if there is no namespace
	def determineNamespace(endpoint, namespace, hasNamespaceCookie)		
		if hasNamespaceCookie
			return namespace
		end
		
		if endpoint == 'login'
			randomName = (0...8).map { (65 + rand(26)).chr }.join
			result     = createStaticResource(randomName, 'text/plain', '')
			namespace  = result[1].NamespacePrefix
			toDelete   = result[1].Id
			delete([toDelete])
			return namespace
		end
		
		return ''
	end
	
	# gets information about the current user
	# userId - id of current user
	# returns user information
	def getUserInfo(userId)
	    userQuery = "SELECT UserName, FirstName, Profile.PermissionsModifyAllData, Profile.PermissionsAuthorApex, UserPreferencesApexPagesDeveloperMode " +
	                "FROM User WHERE Id = '" + userId  + "'";	
	    userInfo  = Hash.new
	    
	    if userId == nil || userId == ''
	    	return userInfo
	    end
	    
	    results = query(userQuery)
	    
	    if results != nil && results.kind_of?(Array) && results.length > 0
	    	userInfo['username']  = results[0].Username
	    	userInfo['userId']    = userId
	    	userInfo['firstname'] = results[0].FirstName
	    	userInfo['admin']     = results[0].Profile.PermissionsModifyAllData && results[0].Profile.PermissionsAuthorApex
	    	userInfo['devMode']   = results[0].UserPreferencesApexPagesDeveloperMode
	    end
	    
	    return userInfo
	end
	
	# gets various information about the or
	# endpoint - login or test
	# orgId    - id of the current org
	# returns information about the org
	def getInstallInfo(endpoint, orgId)
    	info = Hash.new
    	
    	info['orgId']       = orgId
    	info['sandbox']     = endpoint == 'test'
    	info['name']        = getOrganizationName
    	info['endpoint']    = endpoint
    	
    	return info	
	end
	
	# obtain the name of the current org
	# return name of the current org
	def getOrganizationName
		results = query('SELECT Name FROM Organization')
		
		if results != nil && results.kind_of?(Array) && results.length > 0
			return results[0].Name
		end
		
		return ''
	end
	
	# type ahead search contents
	# filterLevel - level of code to retrieve (see server action definition for more info)
	def getCodeFileNames(filterLevel)
    	codeNames = [ "Execute Anonymous",
                      "Go to Apex Developers Guide",
                      "Go to Developer Forums",
                      "Go to Salesforce Stack Exchange",
                      "Go to Visualforce Developers Guide",	
                      "New Apex Class", 
                      "New Custom Object",
                      "New Package XML",
                      "New Static Resource",
                      "New Test Class",
                      "New Trigger",
                      "New UI Theme",
                      "New Visualforce Component", 
                      "New Visualforce Page",
                      "New Lightning Application",
                      "New Lightning Controller",
                      "New Lightning Component",
					  "New Lightning Design",
					  "New Lightning Documentation",                      
                      "New Lightning Event",
                      "New Lightning Helper",                      
                      "New Lightning Interface",
					  "New Lightning Renderer",
					  "New Lightning Style",
					  "New Lightning SVG",
					  "New Lightning Tokens" ]
        
        codeFiles    = []		        
        queryWhere   = ''
        qwLightning  = ''
       
        if filterLevel == 'pkgd'	
        	queryWhere  = 'WHERE NamespacePrefix != null'
        	qwLightning = 'WHERE AuraDefinitionBundle.NamespacePrefix != null'
        elsif filterLevel == 'upkg'
        	queryWhere  = 'WHERE NamespacePrefix = null'
        	qwLightning = 'WHERE AuraDefinitionBundle.NamespacePrefix = null'
        elsif filterLevel != 'none' && filterLevel != 'both'
        	filterLevel = JSON.parse(filterLevel)
        end
        
        if filterLevel == 'both' || filterLevel == 'upkg' || filterLevel == 'pkgd'
        	pageFiles      = queryAll("SELECT Name, NamespacePrefix FROM ApexPage " + queryWhere + " ORDER BY NamespacePrefix, Name", nil, Array.new)
        	componentFiles = queryAll("SELECT Name, NamespacePrefix FROM ApexComponent " + queryWhere + " ORDER BY NamespacePrefix, Name", nil, Array.new)
        	classFiles     = queryAll("SELECT Name, NamespacePrefix FROM ApexClass " + queryWhere + " ORDER BY NamespacePrefix, Name", nil, Array.new)
        	triggerFiles   = queryAll("SELECT Name, NamespacePrefix FROM ApexTrigger " + queryWhere + " ORDER BY NamespacePrefix, Name", nil, Array.new)
        	srFiles        = queryAll("SELECT Name, NamespacePrefix FROM StaticResource " + queryWhere + " ORDER BY NamespacePrefix, Name", nil, Array.new)
        	customObjects  = queryTooling("SELECT DeveloperName, NamespacePrefix FROM CustomObject " + queryWhere + " ORDER BY NamespacePrefix, DeveloperName")
        	lightningFiles = queryTooling("SELECT Id, AuraDefinitionBundleId, AuraDefinitionBundle.NamespacePrefix, AuraDefinitionBundle.DeveloperName, DefType FROM AuraDefinition " + qwLightning + " ORDER BY AuraDefinitionBundle.DeveloperName, DefType")
        	
        	if pageFiles != nil && pageFiles.kind_of?(Array)
        		codeFiles += pageFiles
        	end
        	
        	if componentFiles != nil && componentFiles.kind_of?(Array)
        		codeFiles += componentFiles
        	end
        	
        	if classFiles != nil && classFiles.kind_of?(Array)
        		codeFiles += classFiles
        	end
        	
        	if triggerFiles != nil && triggerFiles.kind_of?(Array)
        		codeFiles += triggerFiles
        	end
        	
        	if srFiles != nil && srFiles.kind_of?(Array)
        		codeFiles += srFiles
        	end
        	
        	if customObjects != nil && customObjects.kind_of?(Array)
        		codeFiles += customObjects
        	end
        	
        	if lightningFiles != nil && lightningFiles.kind_of?(Array)
        		codeFiles += lightningFiles
        	end
		elsif filterLevel != 'none'
        	if filterLevel['classInclude']
				queryResult = query("SELECT Name, NamespacePrefix FROM ApexClass " + filterLevel['classWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end	
			
        	if filterLevel['pageInclude']
				queryResult = query("SELECT Name, NamespacePrefix FROM ApexPage " + filterLevel['pageWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end	
			
        	if filterLevel['componentInclude']
				queryResult = query("SELECT Name, NamespacePrefix FROM ApexComponent " + filterLevel['componentWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end	
			
        	if filterLevel['triggerInclude']
				queryResult = query("SELECT Name, NamespacePrefix FROM ApexTrigger " + filterLevel['triggerWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end
			
        	if filterLevel['resourceInclude']
				queryResult = query("SELECT Name, NamespacePrefix FROM StaticResource " + filterLevel['resourceWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end
			
        	if filterLevel['objectInclude']
				queryResult = query("SELECT DeveloperName, NamespacePrefix FROM CustomObject " + filterLevel['objectWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end		
			
        	if filterLevel['lightningInclude']
				queryResult = queryTooling("SELECT Id, AuraDefinitionBundleId, AuraDefinitionBundle.NamespacePrefix, AuraDefinitionBundle.DeveloperName, DefType FROM AuraDefinition " + filterLevel['lightningWhere'])
					
				if queryResult.kind_of?(Array)
					codeFiles += queryResult
				end
			end																					
		end
		
		codeFiles.each {
			|file|
			
			namespace = ''
			if file[:NamespacePrefix]
				namespace = file.NamespacePrefix + '.'
			elsif file["NamespacePrefix"]
				namespace = file["NamespacePrefix"] + '.'
			elsif file["AuraDefinitionBundleId"] && file["AuraDefinitionBundle"]["NamespacePrefix"]
				namespace = file["AuraDefinitionBundle"]["NamespacePrefix"] + '.'
			end
			
			if file[:type] == APEX_CLASS
				codeNames << OPEN_FILE + namespace + file.Name + APEX_CLASS_SUFFIX
			elsif file[:type] == APEX_PAGE
				codeNames << OPEN_FILE + namespace + file.Name + APEX_PAGE_SUFFIX
			elsif file[:type] == APEX_TRIGGER
				codeNames << OPEN_FILE + namespace + file.Name + APEX_TRIGGER_SUFFIX
			elsif file[:type] == APEX_COMPONENT
				codeNames << OPEN_FILE + namespace + file.Name + APEX_COMPONENT_SUFFIX
			elsif file[:type] == STATIC_RESOURCE
				codeNames << OPEN_FILE + namespace + file.Name + STATIC_RESOURCE_SUFFIX
			elsif file["AuraDefinitionBundleId"]
				codeNames << OPEN_FILE + namespace + file["AuraDefinitionBundle"]["DeveloperName"] + ".aura-" + file["DefType"].downcase
			elsif file["DeveloperName"] 
				codeNames << OPEN_FILE + namespace + file["DeveloperName"] + CUSTOM_OBJECT_SUFFIX
			end
		}
		
		return codeNames
	end

	# queries for apex, visualforce, and static resources in a format which is safe for transport
	# query - the file query
	# type -  Markup | Body
	# retryAllowed - will enable the fail - refresh token - retry flow
	# returns unescaped and base 64 encoded file
	def fileQuery(fQuery, type, retryAllowed)
		begin
			qr = query(fQuery)
			
			if qr == nil
				return 'relogin'
			elsif qr.length > 0
				qr = qr[0]
			elsif qr.length == 0
				return 'FNFE'
			end
			
			codeBody   = ''
			returnBody = ''
			isResource = fQuery.include? " FROM staticresource "			
			
			if isResource
				if isEditableMimeType(qr[:ContentType])
					qr[:readOnly] = false
				elsif qr[:ContentType] == 'application/zip' || 
				      qr[:ContentType] == 'application/octet-stream' ||
				      qr[:ContentType] == 'application/x-zip-compressed'
					qr[:readOnly] = true
					qr[:isZip] = true
				else 
					errorMsg = "Note: This file cannot be viewed with ASIDE, to download it press command+shift+d.\n" +
					           "To update this file press command+u.\n\n" +
					           "Resource Name: " + qr[:Name] + "\n" +
					           "Content Type:  " + qr[:ContentType]
				           				
					qr[:Body] = Base64.encode64(errorMsg).gsub(/\n/, '')
					qr[:readOnly] = true	
				end
			else
				qr[:readOnly] = false
				if type == 'Markup' && qr.Markup != nil
					qr[:Markup] = Base64.encode64(qr.Markup).gsub(/\n/, '')
				elsif type == 'Body' && qr.Body != nil
					qr[:Body] = Base64.encode64(qr.Body).gsub(/\n/, '')
				elsif type == 'Source' && qr.Source != nil
					qr[:Source] = Base64.encode64(qr.Source).gsub(/\n/, '')
				end
			end
			
			return qr.to_json
		rescue Exception => exception
			if retryAllowed && exception.message.index("Incorrect user name / password [faultcodesf:INVALID_LOGINfaultstringINVALID_LOGIN:") != nil
				return 'retry'
			else
				logException('fileQuery()', exception.message, exception.backtrace)
				raise			
			end
		end
	end
	
	# queues unit tests selected by the user
	def runSomeTestsBySelection(toSelect)
		if @successfulLogin
			begin
				queryBase = "SELECT Id FROM ApexClass WHERE "
				toSelect.each_with_index {
					|className, i|
					fn = getFilename(className)
					ns = getNamespacePrefix(className)
					nq = getNamespacePrefixWhere(ns)
					
					queryBase += "(Name = '" + fn + "' AND " + nq + ") OR "
				}

				someClasses = query(queryBase[0, queryBase.length - 4])
				
				toQueue = Array.new
				someClasses.each {
					|aClass|
					toQueue << aClass.Id
				}
				
				return queueUnitTests(toQueue)
			rescue Exception => exception
				logException('runSomeTestsBySelection()', exception.message, exception.backtrace)
				raise	
			end
		end
	end

	# queues unit tests by user provided query
	def runSomeTestsByQuery(whereClause)
		if @successfulLogin
			begin
				someClasses = query("SELECT Id FROM ApexClass WHERE " + whereClause)
				
				if !someClasses.kind_of?(Array)
					return []
				end
				
				toQueue = Array.new
		
				someClasses.each {
					|aClass|
					toQueue << aClass.Id
				}
				
				return queueUnitTests(toQueue)
			rescue Exception => exception
				logException('runSomeTestsByQuery(' + whereClause + ')', exception.message, exception.backtrace)
				raise	
			end				
		end
	end

	# queues all unit tests for async execution
	def runAllTests
		if @successfulLogin
			begin
				allClasses = query("SELECT Id FROM ApexClass")
				toQueue = Array.new
				allClasses.each {
					|aClass|
					toQueue << aClass.Id
				}
				
				return queueUnitTests(toQueue)
			rescue Exception => exception
				logException('runAllTests()', exception.message, exception.backtrace)
				raise	
			end				
		end
	end
	
	# queues unit tests for async execution
	# testIds - array of apexclass ids containing unit tests to queue for execution
	# returns a success object
	def queueUnitTests(testIds)
		if @successfulLogin
			toQueue = Array.new
			testIds.each_with_index {
				|testClassId, i|
				index = (i / 199).floor
				if !toQueue[index]
					toQueue[index] = Array.new
				end
				
				toQueue[index] << testClassId
			}
			
			successful = true
			lastResult = nil
			
			#strange bug fix (now reverted): switched the order of type and ApexClassId to get this working after porting to cedar
			#11/4/2015: interestingly upgrading to cedar-14 resolves this, so I flipped it back			
			toQueue.each {
				|testClassIds|
				if successful
					lastResult = @sfPartner.create testClassIds.collect{|testId| [:sObject, {:type => 'ApexTestQueueItem', :ApexClassId => testId}]}.flatten
					successful = !!defined?(lastResult.createResponse.result.success) && lastResult.createResponse.result.success
				end
			}
			
			return lastResult
		end
	end
	
	# builds a list of unit test results queued, running, and completed
	# where - where clause for selecting tests
	# retryAllowed - will enable the fail - refresh token - retry flow
	# returns a list of unit test results
	def getUnitTestResultInformation(where, retryAllowed)
		if @successfulLogin
			begin
				queuedTests    = getUnitTestQueue(where)
				testResults    = getUnitTestResults
				completedTests = Array.new
				pendingTests   = Array.new
				toReturn       = Array.new
				testMethods    = {}
	
				if !queuedTests.kind_of?(Array)
					return queuedTests
				end
				
				queuedTests.each {
					|unitTest|
					unitTestResults = getTestResults(unitTest.ExtendedStatus)
					
					if !unitTest.ApexClass
						next
					end
					
					testClass = {
						:className  => (unitTest.ApexClass[:NamespacePrefix] ? unitTest.ApexClass[:NamespacePrefix] + '.' : '') + unitTest.ApexClass[:Name],
						:status     => determineStatus(unitTest.Status, unitTest.ExtendedStatus),
						:timestamp  => unitTest.CreatedDate,
					    :extStatus  => parseExtendedStatus(unitTest.Status, unitTest.ExtendedStatus),
					    :type       => unitTest[:type],
					    :key        => unitTest.Id + unitTest.ApexClassId,
					    :unitTests  => Array.new,
					    :successful => unitTestResults[:successful],
					    :failed     => unitTestResults[:failed]
					}
					
					if unitTest.Status == 'Queued' || unitTest.Status == 'Preparing' || unitTest.Status == 'Processing'
						pendingTests << testClass
					else
						completedTests << testClass
					end
				}
				
				testResults.each {
					|unitTest|
					
					unitTestResult = {
						:methodName => unitTest.MethodName == "<compile>" ? "Compiler Error" : unitTest.MethodName,
						:message    => unitTest.Message,
						:stackTrace => unitTest.StackTrace				
					}
					
					testMethodKey = unitTest.QueueItemId + unitTest.ApexClassId
					if !testMethods[testMethodKey]
						testMethods[testMethodKey] = Array.new
					end
					
					testMethods[testMethodKey] << unitTestResult
				}
	
				completedToReturn = Array.new
				completedTests.each {
					|testClass|
					if !testMethods[testClass[:key]].nil?
						testClass[:unitTests] = testMethods[testClass[:key]]
						completedToReturn << testClass
					end
				}
	
				toReturn << pendingTests
				toReturn << completedToReturn
	
				return toReturn
			rescue Exception => exception
				if retryAllowed && exception.message.index("Incorrect user name / password [faultcodesf:INVALID_LOGINfaultstringINVALID_LOGIN:") != nil
					return 'retry'
				else
					logException('getUnitTestResultInformation(' + where + ')', exception.message, exception.backtrace)
					raise
				end
			end					
		end
	end
	
	# parses the status into something more useful
	#
	# status - ApexTestQueueItem status field
	# extStatus - ApexTestQueueItem extendedstatus field
	# returns something more useful
	def determineStatus(status, extStatus)
		if status == 'Completed'
			testResults = getTestResults(extStatus)
			if testResults[:failed] == 0
				return 'Successful'
			end
			
			return 'Failed'
		end
		
		return status
	end

	# parses the extended status field into to an object containing
	# information about number of tests executed, failures, and successes.
	#
	# extStatus - extended status to parse	
	# returns an object with test result data
	def getTestResults(extStatus)
		if extStatus == nil || extStatus.delete(' ') == ''
		return {
			:successful => -1,
			:failed => -1,
			:total => -1
		}			
		end
		
	    if extStatus['('] != nil
	    	extStatus['('] = ''
	    end
	    if extStatus[')'] != nil
	    	extStatus[')'] = ''
	    end

		statusSplit = extStatus.split('/')
		numSuccessful = statusSplit[0].to_i
		numTotal = statusSplit[1].to_i
		numFailed = numTotal - numSuccessful
			
		return {
			:successful => numSuccessful,
			:failed => numFailed,
			:total => numTotal
		}
	end
	
	# parses the extended status field into a pretty sentence explaining the same thing
	#
	# classStatus - async apex queue item status.  completed|aborted|failed|etc…
	# extStatus   - extended status to parse
	def parseExtendedStatus(classStatus, extStatus)
		testResults = getTestResults(extStatus)
		if classStatus == 'Aborted'
			return testResults[:successful].to_s + ' tests aborted'
		end
		
		return testResults[:successful].to_s + ' successful, ' + testResults[:failed].to_s + ' failed'
	end
	
	# gets the apex test queue history
	# where - where clause for selecting unit tests
	def getUnitTestQueue(where)
		query("SELECT Id, CreatedDate, CreatedById, CreatedBy.Name, ApexClass.Name, ApexClass.NamespacePrefix, Status, " +
		      "ExtendedStatus, ParentJobId, ApexClassId FROM ApexTestQueueItem " + where)
	end
	
	# gets the apex unit test result history
	def getUnitTestResults
		query("SELECT Id, TestTimestamp, Outcome, ApexClass.Name, ApexClass.NamespacePrefix, MethodName, Message, StackTrace, " +
		      "AsyncApexJobId, QueueItemId, ApexClassId, ApexLogId FROM ApexTestResult " +
		      "WHERE AsyncApexJobId <> null AND QueueItemId <> null AND ApexClassId <> null ORDER BY TestTimestamp desc")
	end
	
	# Aborts a test class from running / during execution
	# apexTestQueueItemId - test instance to abort
	def abortTestClassExecution(apexTestQueueItemId)
		if @successfulLogin
			begin
				testInstance = [
					:type, 'ApexTestQueueItem',
					:Status, 'Aborted',
					:Id, apexTestQueueItemId
				]
				
				@sfPartner.update :sObject => testInstance
			rescue Exception => exception
				logException('abortTestClassExecution()', exception.message, exception.backtrace)
				raise	
			end					
		end
	end	
	
	# execute a simple query just to keep session alive
	def ping
		if @successfulLogin
			begin
				query("SELECT Id FROM User WHERE Id = '" + @userId + "'")
			rescue Exception => exception
				logException('ping()', exception.message, exception.backtrace)
				raise	
			end			
		end
	end
	
	#get the files which match the sent filter. 
	def getRetrievables(filter)
		if @successfulLogin
			begin
				codeFiles = []
				
				
				filter.each {
					|item|
					queryResult = queryTooling(item)
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end					
				}
				
=begin		
				if filter['classInclude']
					queryResult = query("SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM ApexClass " + filter['classWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end
				end
				
				if filter['pageInclude']
					queryResult = query("SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM ApexPage " + filter['pageWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end			
				end
				
				if filter['componentInclude']
					queryResult = query('SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM ApexComponent ' + filter['componentWhere']) 
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end			
				end
		
				if filter['triggerInclude']
					queryResult = query("SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM ApexTrigger " + filter['triggerWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end			
				end
				
				if filter['resourceInclude']
					queryResult = query("SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM StaticResource " + filter['resourceWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end			 
				end
				
				if filter['objectInclude']
					queryResult = queryTooling("SELECT Id, DeveloperName, LastModifiedDate, NamespacePrefix FROM CustomObject " + filter['objectWhere'])

					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end							
				end
				
				if filter['tabInclude']
					queryResult = queryTooling("SELECT Id, DeveloperName, LastModifiedDate, LastModifiedBy.Name, NamespacePrefix FROM CustomTab " + filter['tabWhere'])

					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end							
				end				
				
				if filter['fieldInclude']
					queryResult = queryTooling("SELECT Id, DeveloperName, TableEnumOrId, LastModifiedDate, NamespacePrefix FROM CustomField " + filter['fieldWhere'])
					
					if queryResult.kind_of?(Array)										
						codeFiles += queryResult
					end							
				end
				
				if filter['workflowInclude']
					queryResult = queryTooling("SELECT Id, Name, LastModifiedDate, TableEnumOrId, NamespacePrefix FROM WorkflowRule " + filter['workflowWhere'])
					
					if queryResult.kind_of?(Array)			
						codeFiles += queryResult
					end					
				end
				
				if filter['validationInclude']
					queryResult = queryTooling("SELECT Id, ValidationName, LastModifiedDate, TableEnumOrId, NamespacePrefix FROM ValidationRule " + filter['validationWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end
				end	
				
				if filter['profileInclude']
					queryResult = queryTooling("SELECT Id, Name, LastModifiedDate, LastModifiedBy.Name FROM Profile " + filter['profileWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end
				end	
				
				if filter['psInclude']
					queryResult = query("SELECT Id, Name, NamespacePrefix, LastModifiedDate, LastModifiedBy.Name FROM PermissionSet " + filter['psWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end
				end	
				
				if filter['layoutInclude']
					queryResult = queryTooling("SELECT Id, Name, NamespacePrefix, LastModifiedDate, LastModifiedBy.Name, TableEnumOrId FROM Layout " + filter['layoutWhere'])
					
					if queryResult.kind_of?(Array)
						codeFiles += queryResult
					end
				end																				
=end		
				return codeFiles
			rescue Exception => exception
				logException('getRetrievables()', exception.message, exception.backtrace)
				raise	
			end	
		end
	end
end