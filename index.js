var HttpsAgent, async, httpreq, keepaliveAgent, ntlm, url;

ntlm = require("httpntlm").ntlm;

async = require("async");

httpreq = require("httpreq");

HttpsAgent = require("agentkeepalive").HttpsAgent;

keepaliveAgent = new HttpsAgent();

url = require("url");

exports.method = function(method, options, callback) {
  var Agent, isHttps, reqUrl;
  if (!options.workstation) {
    options.workstation = "";
  }
  if (!options.domain) {
    options.domain = "";
  }
  isHttps = false;
  reqUrl = url.parse(options.url);
  if (reqUrl.protocol === "https:") {
    isHttps = true;
  }
  keepaliveAgent = void 0;
  if (isHttps) {
    HttpsAgent = require("agentkeepalive").HttpsAgent;
    keepaliveAgent = new HttpsAgent();
  } else {
    Agent = require("agentkeepalive");
    keepaliveAgent = new Agent();
  }
  async.waterfall([
    function($) {
      var type1msg;
      type1msg = ntlm.createType1Message(options);
      httpreq.get(options.url, {
        headers: {
          Connection: "keep-alive",
          Authorization: type1msg
        },
        agent: keepaliveAgent
      }, $);
    }, function(res, $) {
      var type2msg, type3msg;
      if (!res.headers["www-authenticate"]) {
        return $(new Error("www-authenticate not found on response of second request"));
      }
      type2msg = ntlm.parseType2Message(res.headers["www-authenticate"]);
      type3msg = ntlm.createType3Message(type2msg, options);
      httpreq[method](options.url, {
        headers: {
          Connection: "Close",
          Authorization: type3msg
        },
        allowRedirects: false,
        parameters: options.params,
        agent: keepaliveAgent
      }, $);
    }
  ], callback);
};

["get", "put", "post", "delete", "head"].forEach(function(method) {
  exports[method] = exports.method.bind(exports, method);
});
