# RForce Meta
# Slightly modified by Phil Rymek

require 'net/https'
require 'uri'
require 'zlib'
require 'stringio'
require 'cgi'
require 'rubygems'

gem 'builder', '>= 2.0.0'
require 'builder'

#gem 'facets', '>= 2.4'
#require 'facets/openhash'

require 'rforce/soap_response_rexml'
begin; require 'rforce/soap_response_hpricot'; rescue LoadError; end
begin; require 'rforce/soap_response_expat'; rescue LoadError; end

class SalesforceMeta
  # Use the fastest XML parser available.
  def self.parser(name)
      RForce.const_get(name) rescue nil
  end
  
  SoapResponse = 
    parser(:SoapResponseExpat) ||
    parser(:SoapResponseHpricot) ||
    parser(:SoapResponseRexml)
  
  Envelope = <<-HERE
<?xml version="1.0" encoding="utf-8" ?>
<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Header>
     <ns1:SessionHeader soapenv:mustUnderstand="0" xsi:type="ns1:SessionHeader"
         xmlns:ns1="http://soap.sforce.com/2006/04/metadata">
        <ns1:sessionId>%s</ns1:sessionId>
     </ns1:SessionHeader>
     <ns2:CallOptions soapenv:mustUnderstand="0" xsi:type="ns2:SessionHeader"
         xmlns:ns2="http://soap.sforce.com/2006/04/metadata">
        <ns2:client>apex_eclipse/16.0.200906151227</ns2:client>
     </ns2:CallOptions>
     <ns3:DebuggingHeader soapenv:mustUnderstand="0" xsi:type="ns3:DebuggingHeader"
         xmlns:ns3="http://soap.sforce.com/2006/04/metadata">
        <ns3:debugLevel xsi:nil="true" />
     </ns3:DebuggingHeader>
  </soapenv:Header>
  <soapenv:Body>
    %s
  </soapenv:Body>
</soapenv:Envelope>  
  HERE

  # SOAP envelope for apex wsdl
  ApexEnvelope = <<-STUFF
<?xml version="1.0" encoding="utf-8" ?>
<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soapenv:Header>
     <ns1:SessionHeader soapenv:mustUnderstand="0" xsi:type="ns1:SessionHeader"
         xmlns:ns1="http://soap.sforce.com/2006/08/apex">
        <ns1:sessionId>%s</ns1:sessionId>
     </ns1:SessionHeader>
     <ns2:CallOptions soapenv:mustUnderstand="0" xsi:type="ns2:SessionHeader"
         xmlns:ns2="http://soap.sforce.com/2006/08/apex">
        <ns2:client>apex_eclipse/16.0.200906151227</ns2:client>
     </ns2:CallOptions>
     <ns3:DebuggingHeader soapenv:mustUnderstand="0" xsi:type="ns3:DebuggingHeader"
         xmlns:ns3="http://soap.sforce.com/2006/08/apex">
        <ns3:debugLevel xsi:nil="true" />
     </ns3:DebuggingHeader>
  </soapenv:Header>
  <soapenv:Body>
    %s
  </soapenv:Body>
</soapenv:Envelope>  
  STUFF
  
  def create(opts)
    # Create XML text from the arguments.
    expanded = ''
    @builder = Builder::XmlMarkup.new(:target => expanded)
    @builder.tag! :create, :xmlns => "http://soap.sforce.com/2006/04/metadata" do |b|
      b.tag! :metadata, "xsi:type" => "ns2:CustomField", "xmlns:ns2" => "http://soap.sforce.com/2006/04/metadata" do |c|
        opts.each { |k,v| c.tag! k, v }
      end
    end
    
    call_remote(expanded)
  end
  
  # executes unit tests
  # runAll    - true or false
  # toExecute - list of ids of test classes to execute
  # apexUrl   - url of apex api endpoint
  def runTests(runAll, toExecute, apexUrl)
    classesToExecute = ''
    
    toExecute.each {
      |toExec| classesToExecute += '<classes>' + toExec + '</classes>'
    }
  
	expanded = '<runTests xmlns="http://soap.sforce.com/2006/08/apex">'                                  +
			     '<apex xmlns:ns2="http://soap.sforce.com/2006/08/apex" xsi:type="ns2:RunTestsRequest">' +
			       '<allTests>' + runAll + '</allTests>'                                                 +
			       classesToExecute																		 +      
			     '</apex>' 																				 +
			   '</runTests>'  
			   
    call_remote_apex(expanded, apexUrl)  
  end
  
  # copy of call_remote for the apex api
  # sends out a soap call to the apex ws
  # expanded - body of envelope
  # apexUrl  - url of apex ap endpoint
  def call_remote_apex(expanded, apexUrl)
    request = (ApexEnvelope % [@session_id, expanded])
    request = encode(request)

    headers = {
      'Connection' => 'Keep-Alive',
      'Content-Type' => 'text/xml',
      'SOAPAction' => '""',
      'User-Agent' => 'activesalesforce rforce/1.0'
    }

    headers['Accept-Encoding'] = 'gzip'
    headers['Content-Encoding'] = 'gzip'

	aep = URI.parse(apexUrl)
	http = Net::HTTP.new(aep.host, aep.port)
	http.use_ssl = true

    response = http.post(aep.path, request, headers)

    content = decode(response)
    SoapResponse.new(content).parse
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
 	expanded =  '<deploy xmlns="http://soap.sforce.com/2006/04/metadata">' +
 			 		'<ZipFile>' +
 			 			body +
 			 		'</ZipFile>' +
 			 		'<DeployOptions>' +
 			 			'<allowMissingFiles>' + allowMissingFiles  + '</allowMissingFiles>' +
 			 			'<checkOnly>'         + checkOnly          + '</checkOnly>'         +
 			 			'<ignoreWarnings>'    + ignoreWarnings     + '</ignoreWarnings>'    +
 			 			'<purgeOnDelete>'     + purgeOnDelete      + '</purgeOnDelete>'     +
 			 			'<runAllTests>'       + runAllTests        + '</runAllTests>'       +
 			 			'<rollbackOnError>true</rollbackOnError>'  +
 			 			'<performRetrieve>false</performRetrieve>' +
 			 			'<singlePackage>true</singlePackage>'      +
 			 		'</DeployOptions>' +
 			 	'</deploy>'
 	
 	call_remote(expanded)     
  end

  # check the status of a deploy, used to get deploy result
  # statusId - status id obtained from deploy call
  # includeDetails - true to include a higher level of detail on the deployment
  # returns status results
  def checkDeployStatus(statusId, includeDetails)
 	expanded =	'<checkDeployStatus xmlns="http://soap.sforce.com/2006/04/metadata">' +
 					'<asyncProcessId>' + statusId + '</asyncProcessId>'               +
 					'<includeDetails>' + includeDetails + '</includeDetails>'         + 
 	            '</checkDeployStatus>'
 	
 	call_remote(expanded)   
  end

  # reads a specific objects metadata
  # objectName - name of object to read metadata of
  # returns object metadata
  def getObjectMetadata(objectName)
 	expanded =  '<readMetadata xmlns="http://soap.sforce.com/2006/04/metadata">' +
 			 		'<metadataType>CustomObject</metadataType>' + 
 			 		'<fullNames>' + objectName + '</fullNames>' + 
 			 	'</readMetadata>'
 	
 	call_remote(expanded) 
  end
  
  # perform a retrieve when passed the body of a package xml
  # body - body of package.xml i.e. <types> and its children
  # versionNumber - version number that should be used for the retrieve
  # returns the status id which can be used to get the retrieve result
  def retrieve(body, versionNumber)
 	expanded =  '<retrieve xmlns="http://soap.sforce.com/2006/04/metadata">' +
 			 		'<retrieveRequest>'  + 
 			 			'<apiVersion>'   + versionNumber + '</apiVersion>' +
 			 			'<unpackaged>'   +
 			 				body         + 
 			 			'</unpackaged>'  +
 			 		'</retrieveRequest>' +
 			 	'</retrieve>'
 	
 	call_remote(expanded) 
  end
  
  # check the status of a retrieve, used to get retrieve result
  # statusId - status id obtained from retrieve call
  # returns result including base64 encoded zip retrieve result
  def checkRetrieveStatus(statusId)
 	expanded =	'<checkRetrieveStatus xmlns="http://soap.sforce.com/2006/04/metadata">' +
 					'<asyncProcessId>' + statusId + '</asyncProcessId>'                 + 
 	            '</checkRetrieveStatus>'
 	
 	call_remote(expanded)   
  end
  
  def destroy(opts)
    expanded = ''
    @builder = Builder::XmlMarkup.new(:target => expanded)
    @builder.tag! :delete, :xmlns => "http://soap.sforce.com/2006/04/metadata" do |b|
      b.tag! :metadata, "xsi:type" => "ns2:CustomField", "xmlns:ns2" => "http://soap.sforce.com/2006/04/metadata" do |c|
        opts.each { |k,v| c.tag! k, v }
      end
    end
    call_remote(expanded)
  end
  
  def initialize(aSessionId, aServerUrl)
    @session_id = aSessionId
    init_server( @session_id, aServerUrl )
  end
  
  def init_server(session_id, url)
    @url = URI.parse(url)
    @server = Net::HTTP.new(@url.host, @url.port)
    @server.use_ssl = @url.scheme == 'https'
    @server.verify_mode = OpenSSL::SSL::VERIFY_NONE
  end
  
  # Call a method on the remote server.  Arguments can be
  # a hash or (if order is important) an array of alternating
  # keys and values.
  def call_remote(expanded)
    # Fill in the blanks of the SOAP envelope with our
    # session ID and the expanded XML of our request.
    request = (Envelope % [@session_id, expanded])
    
    # gzip request
    request = encode(request)

    headers = {
      'Connection' => 'Keep-Alive',
      'Content-Type' => 'text/xml',
      'SOAPAction' => '""',
      'User-Agent' => 'activesalesforce rforce/1.0'
    }

    headers['Accept-Encoding'] = 'gzip'
    headers['Content-Encoding'] = 'gzip'

    # Send the request to the server and read the response.
    response = @server.post2(@url.path, request.lstrip, headers)

    # decode if we have encoding
    content = decode(response)

    SoapResponse.new(content).parse
  end
  
  # decode gzip
  def decode(response)
    encoding = response['Content-Encoding']

    # return body if no encoding
    if !encoding then return response.body end

    # decode gzip
    case encoding.strip
    when 'gzip' then
      begin
        gzr = Zlib::GzipReader.new(StringIO.new(response.body))
        decoded = gzr.read
      ensure
        gzr.close
      end
      decoded
    else
      response.body
    end
  end

  # encode gzip
  def encode(request)
    begin
      ostream = StringIO.new
      gzw = Zlib::GzipWriter.new(ostream)
      gzw.write(request)
      ostream.string
    ensure
      gzw.close
    end
  end
  
end

# extend Rforce

module RForce
  class Binding
    def session_id
      @session_id
    end
  end
end