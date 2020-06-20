# Copyright (c) 2020, Phil Rymek
# All rights reserved.
#
#        date: 7.18.2012
# description: Contains all sinatra related code.
#			   Provides endpoits for all javascript-ruby communication.
#			   ServerAction.js contains more info on how to utilize this code.


require 'sinatra'
require './D3VController.rb'
require 'json'
require 'rack-ssl-enforcer'
require 'rack-timeout'

#use Rack::Timeout, service_timeout: 25
#use Rack::SslEnforcer

# serve up the app for people who have d3v cookies
# for people who dont have the cookies serve up the login page
get '/' do
	if request.cookies['d3vsid'] && request.cookies['d3vmep'] && 
	   request.cookies['d3vaep'] && request.cookies['d3vpep'] && request.cookies['d3vuid']
		File.open('d3v.html', File::RDONLY)
	else
		queryParam = params[:query]
		
		if queryParam != nil && queryParam != ''
			halfHrFromNow = Time.new + 1800
			response.set_cookie('d3vpbq', :value => queryParam, :expires => halfHrFromNow)
		end
		
		redirect '/login'
	end
end

# serve up login page
get '/login' do
	File.open('d3vLogin.html', File::RDONLY)
end

# serve up help page
get '/help' do
	File.open('help.html', File::RDONLY)
end

# serve up updates page
get '/updates' do
	File.open('updates.html', File::RDONLY)
end

# serve up about page
get '/about' do
	File.open('about.html', File::RDONLY)
end

# serve up shortcuts page
get '/shortcuts' do
	File.open('shortcuts.html', File::RDONLY)
end

# serve up shortcuts page
get '/shutdown' do
	File.open('shutdown.html', File::RDONLY)
end

# serve up instance page
get '/new_instance' do
	File.open('instance.html', File::RDONLY)
end

#oauth based login endpoint
get '/auth' do
    endpoint = params[:state]
    clientId = ENV['CID']
    clientSecret = ENV['SEC']
    redirectUri = ENV['URL'] + '/auth'

	resp = HTTPClient.new.post 'https://' + endpoint + '.salesforce.com/services/oauth2/token', 
	                    	   { 'grant_type'    => 'authorization_code',
	                             'client_id'     => clientId,
	                             'client_secret' => clientSecret,
	                             'redirect_uri'  => redirectUri,
	                             'code'          => params[:code] }	
	                             	
	if resp.body
		content = JSON.parse(resp.body)
		twentyFourHoursFromNow = Time.new + 86400
		eightFromNow = Time.new + 28800
		
		if content['access_token']
			ctrl = D3VController.new
			version = ctrl.getVersionNumber
			
			if content['instance_url'] =~ /\.((na|cs|ap|eu)\d{1,3})\.my\.salesforce\.com/
				baseUrl = 'https://' + $1 + '-api.salesforce.com/services/Soap'	
			elsif content['instance_url'].index('.my.salesforce.com') || content['instance_url'].index('emea.salesforce.com') || content['instance_url'].index('ap.salesforce.com')
				baseUrl = content['instance_url'] + '/services/Soap'
			else
				content['instance_url'] =~ /https\:\/\/(\w+)\.salesforce\.com/
				baseUrl = 'https://' + $1 + '-api.salesforce.com/services/Soap'			
			end

			content['id'] =~ /\.salesforce\.com\/id\/(\w+)\/(\w+)/
			
			response.set_cookie('d3vsid', :value => content['access_token'], :expires => eightFromNow)
			response.set_cookie('d3vaep', :value => baseUrl + '/s/' + version, :expires => eightFromNow)
			response.set_cookie('d3vmep', :value => baseUrl + '/m/' + version + '/' + $1, :expires => eightFromNow)
			response.set_cookie('d3vpep', :value => baseUrl + '/u/' + version + '/' + $1, :expires => eightFromNow)
			response.set_cookie('d3vuid', :value => $2, :expires => eightFromNow)	
			response.set_cookie('d3vrtk', :value => content['refresh_token'], :expires => twentyFourHoursFromNow)
			response.set_cookie('d3vend', :value => endpoint,  :expires => twentyFourHoursFromNow)
			
			if request.cookies['d3vpbq']
				redirect '/?query=' + URI::escape(request.cookies['d3vpbq'])
			end
				
			redirect '/'
		elsif content['error']
			ctrl = D3VController.new
			ctrl.logAuthFault(request.ip, '', content['error'], content['error_description'])
			response.set_cookie('d3vlf1', :value => content['error'], :expires => eightFromNow)
			response.set_cookie('d3vlf2', :value => content['error_description'], :expires => eightFromNow)
		end
	end
		
	redirect '/login'                 
end

#frontdoor login endpoint
get '/frontdoor' do
	ctrl = D3VController.new
	version = ctrl.getVersionNumber

	pep = 'https://' + params[:ins] + '-api.salesforce.com/services/Soap/u/' + version + '/' + params[:oid]
	aep = 'https://' + params[:ins] + '-api.salesforce.com/services/Soap/s/' + version
	mep = 'https://' + params[:ins] + '-api.salesforce.com/services/Soap/m/' + version + '/' + params[:oid]
	
	twentyFourHoursFromNow = Time.new + 86400
	eightFromNow = Time.new + 28800
	
	response.set_cookie('d3vpep', :value => pep, :expires => eightFromNow)
	response.set_cookie('d3vaep', :value => aep, :expires => eightFromNow)
	response.set_cookie('d3vmep', :value => mep, :expires => eightFromNow)
	response.set_cookie('d3vuid', :value => params[:uid], :expires => eightFromNow)
	response.set_cookie('d3vsid', :value => params[:sid], :expires => eightFromNow)
	response.set_cookie('d3vend', :value => params[:end],  :expires => eightFromNow)
	
	redirect '/'
end

#logout endpoint
post '/logout' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	ctrl.logout(request.cookies['d3vsid'])
end

# login request endpoint
post '/login' do
	ctrl = D3VController.new(params[:un], params[:pw], params[:st], params[:ep])	
	return ctrl.lrJSON
end

# refresh token
post '/refresh' do
	refresh(request, response, true)
end

# log clientside error
post '/lce' do
	ctrl = D3VController.new
	request.body.rewind
	ctrl.logClientError(params[:msg], params[:file], params[:ln], request.body.read)
end

# tooling api query request endpoint
post '/tQuery' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
						 
	qr = ctrl.queryTooling(params[:q])
	
	if qr == nil
		return nil
	else
		return qr.to_json
	end
end

# query request endpoint
post '/query' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
						 
	qr = ctrl.query(params[:q])
	
	if qr == nil
		return 'relogin'
	else
		return qr.to_json
	end
end

# queries for code should use this endpoint, difference being
# the code is unescaped and base 64 encoded before returning it to the client
post '/filequery' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	res = ctrl.fileQuery(params[:q], params[:type], true)
	
	if res == 'retry'
		resp = refresh(request, response, false)
		resp = resp == '{ success : false }' ? request.cookies['d3vsid'] : resp
		ctrl = D3VController.new(resp, request.cookies['d3vpep'], 
								 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])		
								 
		
		return ctrl.fileQuery(params[:q], params[:type], false)
	else
		return res
	end	
end

# endpoint for deleting records
post '/delete' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	request.body.rewind
	res = ctrl.delete(request.body.read.split(','))
	return res.to_json
end

# endpoint for updating records
post '/update' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	request.body.rewind
	objs = Base64.decode64(request.body.read)
	objType = params[:t]
	ctrl.update(objs, objType)
end

# endpoint for inserting records
post '/insert' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	request.body.rewind
	objs = Base64.decode64(request.body.read)
	objType = params[:t]
	ctrl.insert(objs, objType)
end

# endpoint for upserting records
post '/upsert' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	request.body.rewind
	objs = Base64.decode64(request.body.read)
	objType = params[:t]
	externalId = params[:e]							
	ctrl.upsert(objType, externalId, objs)
end

# endpoint for generating coverage report
post '/coverageReport' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	result = ctrl.generateCoverageReport(params[:q])
	return result.to_json
end

# endpoint for describeSObject call
post '/describeSObject' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	toDescribe = params[:s]
	result     = ctrl.describeSObject(toDescribe.split(','))
	return result.to_json
end

# endpoint for describeGlobal call
post '/describeGlobal' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	result     = ctrl.describeGlobal
	return result.to_json	
end

# endpoint for saving apex classes and triggers
post '/saveApex' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	request.body.rewind		 
	apexBody = Base64.decode64(request.body.read)
	apexType = params[:t]
	filename = params[:f]
	key		 = params[:k]
	version	 = params[:v]
	
	res = ctrl.saveApex(apexBody, apexType, filename, key, version, params[:c], params[:rid], params[:pfn], params[:ren] == 'true', true)
	
	if res == 'retry'
		resp = refresh(request, response, false)
		resp = resp == '{ success : false }' ? request.cookies['d3vsid'] : resp
		ctrl = D3VController.new(resp, request.cookies['d3vpep'], 
								 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])		
								 
		
		return ctrl.saveApex(apexBody, apexType, filename, key, version, params[:c], params[:rid], params[:pfn], params[:ren] == 'true', false)
	else
		return res
	end
end

# endpoint for registering a code update.
# perhaps should just be baked into the saveApex call
post '/registerCodeUpdate' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])							 
	filename = params[:f]
	type     = params[:t]
	pushKey  = params[:k]
	ctrl.registerCodeUpdate(filename, type, pushKey);
end

# endpoint for executing anonymous apex
post '/executeAnonymous' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	request.body.rewind	
	toExecute = Base64.decode64(request.body.read)
	ctrl.executeAnonymous(toExecute)
end

# endpoint for creating a visualforce page
post '/createVF' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	request.body.rewind
	content = Base64.decode64(request.body.read)
	type    = params[:t]
	name    = params[:n]			 
	result  = ctrl.createVisualforce(content, type, name, params[:c])
	return result.to_json
end

# endpoint for creating a static resource
post '/createResource' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	request.body.rewind 
	result  = ctrl.createStaticResource(params[:name], params[:type], Base64.decode64(request.body.read))
	return result.to_json
end

# endpoint for updating a static resource
post '/updateResource' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	request.body.rewind		 
	result  = ctrl.updateStaticResource(request.body.read, params[:id], params[:type])
	return result.to_json
end

# endpoint for updating a visualforce page
post '/updateVF' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	request.body.rewind
	content = Base64.decode64(request.body.read)
	type    = params[:t]
	id      = params[:id]		 
	result  = ctrl.updateVisualforce(content, type, id, params[:c])
	return result.to_json
end

# endpoint for updating a lightning resource
post '/updateLightning' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	request.body.rewind
	source = Base64.decode64(request.body.read)	
	result = ctrl.updateLightning(source, params[:id])
	return result.to_json
end

# endpoint for creating a lightning resource
post '/createLightning' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	request.body.rewind
	source = Base64.decode64(request.body.read)	
	result = ctrl.createLightning(source, params[:n], params[:dt], params[:f])
	return result.to_json
end

# endpoint for executing sosl
post '/fileSearch' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	sosl   = params[:s]
	result = ctrl.findInFiles(sosl)
	return result.to_json
end

# endpoint for queueing a single test class for exeuction
post '/runTest' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	result = ctrl.runTest(params[:tr])
	return result.to_json
end

post '/start' do
	resp = refresh(request, response, false)
	resp = resp == '{ success : false }' ? request.cookies['d3vsid'] : resp
	ctrl = D3VController.new(resp, request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	ctrl.initAside(params[:oid], request.cookies['d3vuid'], params[:flvl], request.cookies['d3vend'], params[:ns], params[:hns] == 'true')
end

#endpoint for getting a list all of code files in this org
post '/codeFileNames' do
	resp = refresh(request, response, false)
	resp = resp == '{ success : false }' ? request.cookies['d3vsid'] : resp
	ctrl = D3VController.new(resp, request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	#ctrl.logSuccessfulAuth(request.ip)
	ctrl.getCodeFileNames(params[:flvl])
end

#for tracking errors
post '/logError' do
	ctrl = D3VController.new
	ctrl.logFailedRecovery(request.ip, params[:source])
end

#endpoint for getting unit test results
post '/testResults' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	res = ctrl.getUnitTestResultInformation(params[:where], true)
	
	if res == 'retry'
		resp = refresh(request, response, false)
		resp = resp == '{ success : false }' ? request.cookies['d3vsid'] : resp
		ctrl = D3VController.new(resp, request.cookies['d3vpep'], 
								 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])		
								 
		
		return ctrl.getUnitTestResultInformation(params[:where], false).to_json
	else
		return res.to_json
	end	
end

#endpoint for queueing all tests for execution
post '/runAll' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	ctrl.runAllTests.to_json
end

#endpoint for running specific tests by a user provided query
post '/runSomeByQuery' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	ctrl.runSomeTestsByQuery(params[:where]).to_json
end

#endpoint for running specific tests selected by the user
post '/runSomeBySelection' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	request.body.rewind
	ctrl.runSomeTestsBySelection(request.body.read.split(',')).to_json
end

#endpoint for cancelling pending apex test class
post '/abortTestExecution' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	return ctrl.abortTestClassExecution(params[:id]).to_json
end

#initiates download of the requested debug log
get '/getDebugLog' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	asStr = ctrl.getDebugLog(params[:id]).to_str
    content_type 'text/plain'
    attachment "ApexLog.txt"	
	asStr
end

#gets a list of available debug logs
post '/getLogList' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	return ctrl.getDebugLogList(params[:f]).to_json
end

#reset the current users log allowance
post '/resetLogAllowance' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	return ctrl.resetDebugLogs(params[:levels])
end

#ping to keep session alive
post '/ping' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	ctrl.ping
	return ''
end

#retrieves files in mass for retrieve
post '/getRetrievables' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
	
	request.body.rewind	
	filter = JSON.parse(Base64.decode64(request.body.read))
	return ctrl.getRetrievables(filter).to_json
end

#read metadata for a single object synchronously
post '/getObjectMetadata' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])

	ctrl.getObjectMetadata(params[:obj], params[:ns]).to_json
end

#kickoff a retrieve
post '/retrieve' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	request.body.rewind	
	pkgBody = Base64.decode64(request.body.read)
	ctrl.retrieve(pkgBody).to_json
end

#check retrieve status and get results
post '/checkRetrieve' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	ctrl.checkRetrieveStatus(params[:id]).to_json
end

#save custom object endpoint
post '/saveCustomObject' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
				
	request.body.rewind		 
	ctrl.saveCustomObject(request.body.read, params[:id], params[:key]).to_json
end

#perform a deploy
post '/deploy' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
						 
	request.body.rewind
	ctrl.deploy(request.body.read, params[:awf], params[:co], params[:iw], params[:pod], params[:rat]).to_json
end

#get the status of a deploy
post '/checkDeployStatus' do
	ctrl = D3VController.new(request.cookies['d3vsid'], request.cookies['d3vpep'], 
							 request.cookies['d3vmep'], request.cookies['d3vaep'], request.cookies['d3vuid'])
							 
	ctrl.checkDeployStatus(params[:id], params[:detail]).to_json
end

post '/vars' do
	return '{ "cid" : "' + ENV['CID'] + '", "url" : "' + ENV['URL'] + '", "gid" : "' + 
		(ENV['GID'] ? ENV['GID'] : '') + '" }'
end

helpers do
	def refresh(request, response, forClient)
		if request.cookies['d3vrtk'] && request.cookies['d3vpep']
			endpoint = request.cookies['d3vpep'].split('services/Soap')[0]
			if endpoint =~ /\.((na|cs|ap|eu)\d{1,3})\.my\.salesforce\.com/
				endpoint = 'test'
			elsif endpoint.index('.my.salesforce.com') || endpoint.index('emea.salesforce.com') || endpoint.index('ap.salesforce.com')
				endpoint = 'login'
			else
				endpoint = endpoint.match(/cs\d{1,3}/i) == nil ? 'login' : 'test'
			end
			
			resp = HTTPClient.new.post 'https://' + endpoint + '.salesforce.com/services/oauth2/token', 
			                    	   { 'grant_type'    => 'refresh_token',
			                    	     'refresh_token' => request.cookies['d3vrtk'],
			                             'client_id'     => ENV['CID'],
			                             'client_secret' => ENV['SEC'] }	
		
			if resp.body
				content = JSON.parse(resp.body)
				if content['access_token']
					twentyFourHoursFromNow = Time.new + 86400
					eightHoursFromNow = Time.new + 28800
					response.set_cookie('d3vsid', :value => content['access_token'], :expires => eightHoursFromNow)
					response.set_cookie('d3vaep', :value => request.cookies['d3vaep'], :expires => eightHoursFromNow)
					response.set_cookie('d3vmep', :value => request.cookies['d3vmep'], :expires => eightHoursFromNow)
					response.set_cookie('d3vpep', :value => request.cookies['d3vpep'], :expires => eightHoursFromNow)
					response.set_cookie('d3vuid', :value => request.cookies['d3vuid'], :expires => eightHoursFromNow)	
					response.set_cookie('d3vrtk', :value => request.cookies['d3vrtk'], :expires => twentyFourHoursFromNow)
					
					if forClient
						return '{ success : true }'
					else
						return content['access_token']
					end
				else
					ctrl = D3VController.new
					arg1 = request.cookies['d3vpep'] == nil ? 'null' : request.cookies['d3vpep']
					arg2 = content['error'] == nil ? 'null' : content['error']
					arg3 = content['error_description'] == nil ? 'null' : content['error_description']
					arg4 = request.ip == nil ? 'null' : request.ip
					ctrl.logAuthFault(arg4, 'refresh(1)', 'tried: ' + arg1, arg2 + arg3)			
					return '{ success : false }'
				end
			end
		end

		ctrl = D3VController.new
		arg1 = request.ip == nil ? 'null' : request.ip
		arg2 = request.cookies['d3vpep'] == nil ? 'null' : request.cookies['d3vpep']
		arg3 = endpoint == nil ? 'null' : endpoint
		arg4 = request.base_url == nil ? 'null' : request.base_url
		
		if arg2 != nil && arg3 != nil && arg2 != 'null' && arg3 != 'null'
			ctrl.logAuthFault(arg1, 'refresh(2)', 'tried: ' + arg2, 'claimed: ' + arg3 + ' and ' + arg4)
		end
		
		return '{ success : false }'		
	end
end