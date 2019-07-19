require 'xsd/qname'

# {http://soap.sforce.com/2006/08/apex}DebuggingInfo
class DebuggingInfo
  @@schema_type = "DebuggingInfo"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["debugLog", "SOAP::SOAPString"]]

  attr_accessor :debugLog

  def initialize(debugLog = nil)
    @debugLog = debugLog
  end
end

# {http://soap.sforce.com/2006/08/apex}PackageVersionHeader
class PackageVersionHeader
  @@schema_type = "PackageVersionHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["packageVersions", "PackageVersion[]"]]

  attr_accessor :packageVersions

  def initialize(packageVersions = [])
    @packageVersions = packageVersions
  end
end

# {http://soap.sforce.com/2006/08/apex}SessionHeader
class SessionHeader
  @@schema_type = "SessionHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["sessionId", "SOAP::SOAPString"]]

  attr_accessor :sessionId

  def initialize(sessionId = nil)
    @sessionId = sessionId
  end
end

# {http://soap.sforce.com/2006/08/apex}DisableFeedTrackingHeader
class DisableFeedTrackingHeader
  @@schema_type = "DisableFeedTrackingHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["disableFeedTracking", "SOAP::SOAPBoolean"]]

  attr_accessor :disableFeedTracking

  def initialize(disableFeedTracking = nil)
    @disableFeedTracking = disableFeedTracking
  end
end

# {http://soap.sforce.com/2006/08/apex}AllowFieldTruncationHeader
class AllowFieldTruncationHeader
  @@schema_type = "AllowFieldTruncationHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["allowFieldTruncation", "SOAP::SOAPBoolean"]]

  attr_accessor :allowFieldTruncation

  def initialize(allowFieldTruncation = nil)
    @allowFieldTruncation = allowFieldTruncation
  end
end

# {http://soap.sforce.com/2006/08/apex}DebuggingHeader
class DebuggingHeader
  @@schema_type = "DebuggingHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["categories", "LogInfo[]"], ["debugLevel", "SOAP::SOAPString"]]

  attr_accessor :categories
  attr_accessor :debugLevel

  def initialize(categories = [], debugLevel = nil)
    @categories = categories
    @debugLevel = debugLevel
  end
end

# {http://soap.sforce.com/2006/08/apex}AllOrNoneHeader
class AllOrNoneHeader
  @@schema_type = "AllOrNoneHeader"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["allOrNone", "SOAP::SOAPBoolean"]]

  attr_accessor :allOrNone

  def initialize(allOrNone = nil)
    @allOrNone = allOrNone
  end
end

# {http://soap.sforce.com/2006/08/apex}CallOptions
class CallOptions
  @@schema_type = "CallOptions"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["client", "SOAP::SOAPString"]]

  attr_accessor :client

  def initialize(client = nil)
    @client = client
  end
end

# {http://soap.sforce.com/2006/08/apex}compileAndTest
class CompileAndTest
  @@schema_type = "compileAndTest"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["compileAndTestRequest", ["CompileAndTestRequest", XSD::QName.new("http://soap.sforce.com/2006/08/apex", "CompileAndTestRequest")]]]

  def CompileAndTestRequest
    @compileAndTestRequest
  end

  def CompileAndTestRequest=(value)
    @compileAndTestRequest = value
  end

  def initialize(compileAndTestRequest = nil)
    @compileAndTestRequest = compileAndTestRequest
  end
end

# {http://soap.sforce.com/2006/08/apex}compileAndTestResponse
class CompileAndTestResponse
  @@schema_type = "compileAndTestResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "CompileAndTestResult"]]

  attr_accessor :result

  def initialize(result = nil)
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}compileClasses
class CompileClasses
  @@schema_type = "compileClasses"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["scripts", "SOAP::SOAPString[]"]]

  attr_accessor :scripts

  def initialize(scripts = [])
    @scripts = scripts
  end
end

# {http://soap.sforce.com/2006/08/apex}compileClassesResponse
class CompileClassesResponse
  @@schema_type = "compileClassesResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "CompileClassResult[]"]]

  attr_accessor :result

  def initialize(result = [])
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}compileTriggers
class CompileTriggers
  @@schema_type = "compileTriggers"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["scripts", "SOAP::SOAPString[]"]]

  attr_accessor :scripts

  def initialize(scripts = [])
    @scripts = scripts
  end
end

# {http://soap.sforce.com/2006/08/apex}compileTriggersResponse
class CompileTriggersResponse
  @@schema_type = "compileTriggersResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "CompileTriggerResult[]"]]

  attr_accessor :result

  def initialize(result = [])
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}executeAnonymous
class ExecuteAnonymous
  @@schema_type = "executeAnonymous"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["string", ["SOAP::SOAPString", XSD::QName.new("http://soap.sforce.com/2006/08/apex", "String")]]]

  def String
    @string
  end

  def String=(value)
    @string = value
  end

  def initialize(string = nil)
    @string = string
  end
end

# {http://soap.sforce.com/2006/08/apex}executeAnonymousResponse
class ExecuteAnonymousResponse
  @@schema_type = "executeAnonymousResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "ExecuteAnonymousResult"]]

  attr_accessor :result

  def initialize(result = nil)
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}runTests
class RunTests
  @@schema_type = "runTests"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["runTestsRequest", ["RunTestsRequest", XSD::QName.new("http://soap.sforce.com/2006/08/apex", "RunTestsRequest")]]]

  def RunTestsRequest
    @runTestsRequest
  end

  def RunTestsRequest=(value)
    @runTestsRequest = value
  end

  def initialize(runTestsRequest = nil)
    @runTestsRequest = runTestsRequest
  end
end

# {http://soap.sforce.com/2006/08/apex}runTestsResponse
class RunTestsResponse
  @@schema_type = "runTestsResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "RunTestsResult"]]

  attr_accessor :result

  def initialize(result = nil)
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}wsdlToApex
class WsdlToApex
  @@schema_type = "wsdlToApex"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["info", "WsdlToApexInfo"]]

  attr_accessor :info

  def initialize(info = nil)
    @info = info
  end
end

# {http://soap.sforce.com/2006/08/apex}wsdlToApexResponse
class WsdlToApexResponse
  @@schema_type = "wsdlToApexResponse"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_qualified = "true"
  @@schema_element = [["result", "WsdlToApexResult"]]

  attr_accessor :result

  def initialize(result = nil)
    @result = result
  end
end

# {http://soap.sforce.com/2006/08/apex}ExecuteAnonymousResult
class ExecuteAnonymousResult
  @@schema_type = "ExecuteAnonymousResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["column", "SOAP::SOAPInt"], ["compileProblem", "SOAP::SOAPString"], ["compiled", "SOAP::SOAPBoolean"], ["exceptionMessage", "SOAP::SOAPString"], ["exceptionStackTrace", "SOAP::SOAPString"], ["line", "SOAP::SOAPInt"], ["success", "SOAP::SOAPBoolean"]]

  attr_accessor :column
  attr_accessor :compileProblem
  attr_accessor :compiled
  attr_accessor :exceptionMessage
  attr_accessor :exceptionStackTrace
  attr_accessor :line
  attr_accessor :success

  def initialize(column = nil, compileProblem = nil, compiled = nil, exceptionMessage = nil, exceptionStackTrace = nil, line = nil, success = nil)
    @column = column
    @compileProblem = compileProblem
    @compiled = compiled
    @exceptionMessage = exceptionMessage
    @exceptionStackTrace = exceptionStackTrace
    @line = line
    @success = success
  end
end

# {http://soap.sforce.com/2006/08/apex}CompileClassResult
class CompileClassResult
  @@schema_type = "CompileClassResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["bodyCrc", "SOAP::SOAPInt"], ["column", "SOAP::SOAPInt"], ["id", "SOAP::SOAPString"], ["line", "SOAP::SOAPInt"], ["name", "SOAP::SOAPString"], ["problem", "SOAP::SOAPString"], ["success", "SOAP::SOAPBoolean"], ["warnings", "SOAP::SOAPString[]"]]

  attr_accessor :bodyCrc
  attr_accessor :column
  attr_accessor :id
  attr_accessor :line
  attr_accessor :name
  attr_accessor :problem
  attr_accessor :success
  attr_accessor :warnings

  def initialize(bodyCrc = nil, column = nil, id = nil, line = nil, name = nil, problem = nil, success = nil, warnings = [])
    @bodyCrc = bodyCrc
    @column = column
    @id = id
    @line = line
    @name = name
    @problem = problem
    @success = success
    @warnings = warnings
  end
end

# {http://soap.sforce.com/2006/08/apex}CompileTriggerResult
class CompileTriggerResult
  @@schema_type = "CompileTriggerResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["bodyCrc", "SOAP::SOAPInt"], ["column", "SOAP::SOAPInt"], ["id", "SOAP::SOAPString"], ["line", "SOAP::SOAPInt"], ["name", "SOAP::SOAPString"], ["problem", "SOAP::SOAPString"], ["success", "SOAP::SOAPBoolean"]]

  attr_accessor :bodyCrc
  attr_accessor :column
  attr_accessor :id
  attr_accessor :line
  attr_accessor :name
  attr_accessor :problem
  attr_accessor :success

  def initialize(bodyCrc = nil, column = nil, id = nil, line = nil, name = nil, problem = nil, success = nil)
    @bodyCrc = bodyCrc
    @column = column
    @id = id
    @line = line
    @name = name
    @problem = problem
    @success = success
  end
end

# {http://soap.sforce.com/2006/08/apex}CompileAndTestResult
class CompileAndTestResult
  @@schema_type = "CompileAndTestResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["classes", "CompileClassResult[]"], ["deleteClasses", "DeleteApexResult[]"], ["deleteTriggers", "DeleteApexResult[]"], ["runTestsResult", "RunTestsResult"], ["success", "SOAP::SOAPBoolean"], ["triggers", "CompileTriggerResult[]"]]

  attr_accessor :classes
  attr_accessor :deleteClasses
  attr_accessor :deleteTriggers
  attr_accessor :runTestsResult
  attr_accessor :success
  attr_accessor :triggers

  def initialize(classes = [], deleteClasses = [], deleteTriggers = [], runTestsResult = nil, success = nil, triggers = [])
    @classes = classes
    @deleteClasses = deleteClasses
    @deleteTriggers = deleteTriggers
    @runTestsResult = runTestsResult
    @success = success
    @triggers = triggers
  end
end

# {http://soap.sforce.com/2006/08/apex}DeleteApexResult
class DeleteApexResult
  @@schema_type = "DeleteApexResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["id", "SOAP::SOAPString"], ["problem", "SOAP::SOAPString"], ["success", "SOAP::SOAPBoolean"]]

  attr_accessor :id
  attr_accessor :problem
  attr_accessor :success

  def initialize(id = nil, problem = nil, success = nil)
    @id = id
    @problem = problem
    @success = success
  end
end

# {http://soap.sforce.com/2006/08/apex}RunTestsResult
class RunTestsResult
  @@schema_type = "RunTestsResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["codeCoverage", "CodeCoverageResult[]"], ["codeCoverageWarnings", "CodeCoverageWarning[]"], ["failures", "RunTestFailure[]"], ["numFailures", "SOAP::SOAPInt"], ["numTestsRun", "SOAP::SOAPInt"], ["successes", "RunTestSuccess[]"], ["totalTime", "SOAP::SOAPDouble"]]

  attr_accessor :codeCoverage
  attr_accessor :codeCoverageWarnings
  attr_accessor :failures
  attr_accessor :numFailures
  attr_accessor :numTestsRun
  attr_accessor :successes
  attr_accessor :totalTime

  def initialize(codeCoverage = [], codeCoverageWarnings = [], failures = [], numFailures = nil, numTestsRun = nil, successes = [], totalTime = nil)
    @codeCoverage = codeCoverage
    @codeCoverageWarnings = codeCoverageWarnings
    @failures = failures
    @numFailures = numFailures
    @numTestsRun = numTestsRun
    @successes = successes
    @totalTime = totalTime
  end
end

# {http://soap.sforce.com/2006/08/apex}CodeCoverageResult
class CodeCoverageResult
  @@schema_type = "CodeCoverageResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["id", "SOAP::SOAPString"], ["locationsNotCovered", "CodeLocation[]"], ["name", "SOAP::SOAPString"], ["namespace", "SOAP::SOAPString"], ["numLocations", "SOAP::SOAPInt"], ["numLocationsNotCovered", "SOAP::SOAPInt"], ["type", "SOAP::SOAPString"]]

  attr_accessor :id
  attr_accessor :locationsNotCovered
  attr_accessor :name
  attr_accessor :namespace
  attr_accessor :numLocations
  attr_accessor :numLocationsNotCovered
  attr_accessor :type

  def initialize(id = nil, locationsNotCovered = [], name = nil, namespace = nil, numLocations = nil, numLocationsNotCovered = nil, type = nil)
    @id = id
    @locationsNotCovered = locationsNotCovered
    @name = name
    @namespace = namespace
    @numLocations = numLocations
    @numLocationsNotCovered = numLocationsNotCovered
    @type = type
  end
end

# {http://soap.sforce.com/2006/08/apex}CodeLocation
class CodeLocation
  @@schema_type = "CodeLocation"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["column", "SOAP::SOAPInt"], ["line", "SOAP::SOAPInt"], ["numExecutions", "SOAP::SOAPInt"], ["time", "SOAP::SOAPDouble"]]

  attr_accessor :column
  attr_accessor :line
  attr_accessor :numExecutions
  attr_accessor :time

  def initialize(column = nil, line = nil, numExecutions = nil, time = nil)
    @column = column
    @line = line
    @numExecutions = numExecutions
    @time = time
  end
end

# {http://soap.sforce.com/2006/08/apex}CodeCoverageWarning
class CodeCoverageWarning
  @@schema_type = "CodeCoverageWarning"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["id", "SOAP::SOAPString"], ["message", "SOAP::SOAPString"], ["name", "SOAP::SOAPString"], ["namespace", "SOAP::SOAPString"]]

  attr_accessor :id
  attr_accessor :message
  attr_accessor :name
  attr_accessor :namespace

  def initialize(id = nil, message = nil, name = nil, namespace = nil)
    @id = id
    @message = message
    @name = name
    @namespace = namespace
  end
end

# {http://soap.sforce.com/2006/08/apex}RunTestFailure
class RunTestFailure
  @@schema_type = "RunTestFailure"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["id", "SOAP::SOAPString"], ["message", "SOAP::SOAPString"], ["methodName", "SOAP::SOAPString"], ["name", "SOAP::SOAPString"], ["namespace", "SOAP::SOAPString"], ["stackTrace", "SOAP::SOAPString"], ["time", "SOAP::SOAPDouble"], ["type", "SOAP::SOAPString"]]

  attr_accessor :id
  attr_accessor :message
  attr_accessor :methodName
  attr_accessor :name
  attr_accessor :namespace
  attr_accessor :stackTrace
  attr_accessor :time
  attr_accessor :type

  def initialize(id = nil, message = nil, methodName = nil, name = nil, namespace = nil, stackTrace = nil, time = nil, type = nil)
    @id = id
    @message = message
    @methodName = methodName
    @name = name
    @namespace = namespace
    @stackTrace = stackTrace
    @time = time
    @type = type
  end
end

# {http://soap.sforce.com/2006/08/apex}RunTestSuccess
class RunTestSuccess
  @@schema_type = "RunTestSuccess"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["id", "SOAP::SOAPString"], ["methodName", "SOAP::SOAPString"], ["name", "SOAP::SOAPString"], ["namespace", "SOAP::SOAPString"], ["time", "SOAP::SOAPDouble"]]

  attr_accessor :id
  attr_accessor :methodName
  attr_accessor :name
  attr_accessor :namespace
  attr_accessor :time

  def initialize(id = nil, methodName = nil, name = nil, namespace = nil, time = nil)
    @id = id
    @methodName = methodName
    @name = name
    @namespace = namespace
    @time = time
  end
end

# {http://soap.sforce.com/2006/08/apex}WsdlToApexResult
class WsdlToApexResult
  @@schema_type = "WsdlToApexResult"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["apexScripts", "SOAP::SOAPString[]"], ["errors", "SOAP::SOAPString[]"], ["success", "SOAP::SOAPBoolean"]]

  attr_accessor :apexScripts
  attr_accessor :errors
  attr_accessor :success

  def initialize(apexScripts = [], errors = [], success = nil)
    @apexScripts = apexScripts
    @errors = errors
    @success = success
  end
end

# {http://soap.sforce.com/2006/08/apex}CompileAndTestRequest
class CompileAndTestRequest
  @@schema_type = "CompileAndTestRequest"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["checkOnly", "SOAP::SOAPBoolean"], ["classes", "SOAP::SOAPString[]"], ["deleteClasses", "SOAP::SOAPString[]"], ["deleteTriggers", "SOAP::SOAPString[]"], ["runTestsRequest", "RunTestsRequest"], ["triggers", "SOAP::SOAPString[]"]]

  attr_accessor :checkOnly
  attr_accessor :classes
  attr_accessor :deleteClasses
  attr_accessor :deleteTriggers
  attr_accessor :runTestsRequest
  attr_accessor :triggers

  def initialize(checkOnly = nil, classes = [], deleteClasses = [], deleteTriggers = [], runTestsRequest = nil, triggers = [])
    @checkOnly = checkOnly
    @classes = classes
    @deleteClasses = deleteClasses
    @deleteTriggers = deleteTriggers
    @runTestsRequest = runTestsRequest
    @triggers = triggers
  end
end

# {http://soap.sforce.com/2006/08/apex}RunTestsRequest
class RunTestsRequest
  @@schema_type = "RunTestsRequest"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["allTests", "SOAP::SOAPBoolean"], ["classes", "SOAP::SOAPString[]"], ["namespace", "SOAP::SOAPString"], ["packages", "SOAP::SOAPString[]"]]

  attr_accessor :allTests
  attr_accessor :classes
  attr_accessor :namespace
  attr_accessor :packages

  def initialize(allTests = nil, classes = [], namespace = nil, packages = [])
    @allTests = allTests
    @classes = classes
    @namespace = namespace
    @packages = packages
  end
end

# {http://soap.sforce.com/2006/08/apex}LogInfo
class LogInfo
  @@schema_type = "LogInfo"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["category", "SOAP::SOAPString"], ["level", "SOAP::SOAPString"]]

  attr_accessor :category
  attr_accessor :level

  def initialize(category = nil, level = nil)
    @category = category
    @level = level
  end
end

# {http://soap.sforce.com/2006/08/apex}NamespacePackagePair
class NamespacePackagePair
  @@schema_type = "NamespacePackagePair"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["namespace", "SOAP::SOAPString"], ["packageName", "SOAP::SOAPString"]]

  attr_accessor :namespace
  attr_accessor :packageName

  def initialize(namespace = nil, packageName = nil)
    @namespace = namespace
    @packageName = packageName
  end
end

# {http://soap.sforce.com/2006/08/apex}PackageVersion
class PackageVersion
  @@schema_type = "PackageVersion"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["majorNumber", "SOAP::SOAPInt"], ["minorNumber", "SOAP::SOAPInt"], ["namespace", "SOAP::SOAPString"]]

  attr_accessor :majorNumber
  attr_accessor :minorNumber
  attr_accessor :namespace

  def initialize(majorNumber = nil, minorNumber = nil, namespace = nil)
    @majorNumber = majorNumber
    @minorNumber = minorNumber
    @namespace = namespace
  end
end

# {http://soap.sforce.com/2006/08/apex}WsdlToApexInfo
class WsdlToApexInfo
  @@schema_type = "WsdlToApexInfo"
  @@schema_ns = "http://soap.sforce.com/2006/08/apex"
  @@schema_element = [["mapping", "NamespacePackagePair[]"], ["wsdl", "SOAP::SOAPString"]]

  attr_accessor :mapping
  attr_accessor :wsdl

  def initialize(mapping = [], wsdl = nil)
    @mapping = mapping
    @wsdl = wsdl
  end
end

# {http://soap.sforce.com/2006/08/apex}LogCategory
module LogCategory
  All = "All"
  Apex_code = "Apex_code"
  Apex_profiling = "Apex_profiling"
  Callout = "Callout"
  Db = "Db"
  System = "System"
  Validation = "Validation"
  Visualforce = "Visualforce"
  Workflow = "Workflow"
end

# {http://soap.sforce.com/2006/08/apex}LogCategoryLevel
module LogCategoryLevel
  Debug = "Debug"
  Error = "Error"
  Fine = "Fine"
  Finer = "Finer"
  Finest = "Finest"
  Info = "Info"
  Internal = "Internal"
  Warn = "Warn"
end

# {http://soap.sforce.com/2006/08/apex}LogType
module LogType
  Callout = "Callout"
  Db = "Db"
  Debugonly = "Debugonly"
  Detail = "Detail"
  None = "None"
  Profiling = "Profiling"
end
