require './default.rb'

require 'soap/rpc/driver'

class ApexPortType < ::SOAP::RPC::Driver
  DefaultEndpointUrl = "https://na10-api.salesforce.com/services/Soap/s/24.0"
  MappingRegistry = ::SOAP::Mapping::Registry.new

  Methods = [
    [ "",
      "compileAndTest",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileAndTest"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileAndTestResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ],
    [ "",
      "compileClasses",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileClasses"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileClassesResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ],
    [ "",
      "compileTriggers",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileTriggers"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "compileTriggersResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ],
    [ "",
      "executeAnonymous",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "executeAnonymous"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "executeAnonymousResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ],
    [ "",
      "runTests",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "runTests"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "runTestsResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ],
    [ "",
      "wsdlToApex",
      [ ["in", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "wsdlToApex"], true],
        ["out", "parameters", ["::SOAP::SOAPElement", "http://soap.sforce.com/2006/08/apex", "wsdlToApexResponse"], true] ],
      { :request_style =>  :document, :request_use =>  :literal,
        :response_style => :document, :response_use => :literal }
    ]
  ]

  def initialize(endpoint_url = nil)
    endpoint_url ||= DefaultEndpointUrl
    super(endpoint_url, nil)
    self.mapping_registry = MappingRegistry
    init_methods
  end

private

  def init_methods
    Methods.each do |definitions|
      opt = definitions.last
      if opt[:request_style] == :document
        add_document_operation(*definitions)
      else
        add_rpc_operation(*definitions)
        qname = definitions[0]
        name = definitions[2]
        if qname.name != name and qname.name.capitalize == name.capitalize
          ::SOAP::Mapping.define_singleton_method(self, qname.name) do |*arg|
            __send__(name, *arg)
          end
        end
      end
    end
  end
end

