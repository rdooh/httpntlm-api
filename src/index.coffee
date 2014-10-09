#======================================
# !Require modules
#======================================
ntlm = require("httpntlm").ntlm
async = require("async")
httpreq = require("httpreq")
HttpsAgent = require("agentkeepalive").HttpsAgent
keepaliveAgent = new HttpsAgent()
#======================================
# End Require modules
#======================================




#======================================
# !Main module
#======================================

exports.method = (method, options, callback) ->
  options.workstation = ""  unless options.workstation
  options.domain = ""  unless options.domain
  
  # is https?
  isHttps = false
  reqUrl = url.parse(options.url)
  isHttps = true  if reqUrl.protocol is "https:"
  
  # set keepaliveAgent (http or https):
  keepaliveAgent = undefined
  if isHttps
    HttpsAgent = require("agentkeepalive").HttpsAgent
    keepaliveAgent = new HttpsAgent()
  else
    Agent = require("agentkeepalive")
    keepaliveAgent = new Agent()
  async.waterfall [
    ($) ->
      type1msg = ntlm.createType1Message(options)
      httpreq.get options.url,
        headers:
          Connection: "keep-alive"
          Authorization: type1msg

        agent: keepaliveAgent
      , $
    (res, $) ->
      return $(new Error("www-authenticate not found on response of second request"))  unless res.headers["www-authenticate"]
      type2msg = ntlm.parseType2Message(res.headers["www-authenticate"])
      type3msg = ntlm.createType3Message(type2msg, options)
      httpreq[method] options.url,
        headers:
          Connection: "Close"
          Authorization: type3msg

        allowRedirects: false
        # !Added call for parameters
        parameters: options.params
        agent: keepaliveAgent
      , $
  ], callback
  return

[
  "get"
  "put"
  "post"
  "delete"
  "head"
].forEach (method) ->
  exports[method] = exports.method.bind(exports, method)
  return


#======================================
# End Main module
#======================================

