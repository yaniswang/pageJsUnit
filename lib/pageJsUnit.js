var fs = require('fs');
var os = require('os');
var path = require('path');
var JWebDriver = require('jwebdriver');
var PageProxy = require('pageproxy');
var jscover = require('node-jscover');
var esprima = require('esprima');
var escodegen = require('escodegen');
var utils = require('./utils');

var clientPath = path.resolve(__dirname+'/../client/');

function runJsUnit(config, callback){
    return new Promise(function(resolve, reject){
        var wdHost = config.wdHost;
        var wdPort = config.wdPort;
        var url = config.url;
        var browserName = config.browserName;
        var browserVersion = config.browserVersion || '';
        var coverageInclude = config.coverageInclude || [ /\/src\//i ];
        var coverageExclude = config.coverageExclude || [];
        var coverageBeautify = config.coverageBeautify || false;
        var hosts = config.hosts || '';
        var timeout = config.timeout || 60000;
        var mapHosts = getMapHosts(hosts);

        var mapJsCoverageSource = {};

        var localIp = utils.getLocalIP();

        var proxy = PageProxy.createServer({
            keyPath: os.tmpdir(),
            gunzip: true,
            delgzip: false
        });
        proxy.addFilter(function(httpData, next, end){
            if(httpData.type === 'request'){
                // hosts
                var newHost = mapHosts[httpData.hostname];
                if(newHost !== undefined){
                    httpData.hostname = newHost;
                }
            }
            else{
                var url = httpData.url;
                var responseContent = httpData.responseContent;
                if(httpData.responseCode === 200
                    && httpData.responseType === 'js'
                    && responseContent !== undefined){
                    // adapter for test runner
                    var match = url.match(/(mocha|jasmine|qunit|yuitest)(\-[^\/]+?)?\.js(\?|$)/i);
                    if(match !== null){
                        var testType = match[1];
                        var jsBridgeContent = fs.readFileSync(clientPath + '/bridge.js').toString();
                        var jsAdapterContent = fs.readFileSync(clientPath + '/adapter-'+testType+'.js').toString();
                        responseContent = responseContent + jsBridgeContent + jsAdapterContent;
                    }
                    // jscoverage
                    else if(checkUrlInclude(url, coverageInclude, coverageExclude)){
                        if(coverageBeautify){
                            var syntax = esprima.parse(responseContent, { raw: true, tokens: true, range: true, comment: true });
                            syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);
                            responseContent = escodegen.generate(syntax, 
                                {
                                    comment: true,
                                    format: {
                                        indent: {
                                            style: '  '
                                        },
                                        quotes: 'single'
                                    }
                                }
                            );
                        }
                        var arrSource = responseContent.split(/\r?\n/);
                        mapJsCoverageSource[url] = arrSource;
                        responseContent = jscover.instrument(responseContent, url);
                    }
                    httpData.responseContent = responseContent;
                }
            }
            next();
        });
        proxy.on('error', function(e){
        });
        proxy.listen(0, function(msg){
            var proxyHost = localIp + ':' + msg.httpPort;
            var driver = new JWebDriver({
                'host': wdHost,
                'port': wdPort
            });
            driver.session({
                'browserName': browserName,
                'browserVersion': browserVersion,
                'proxy': {
                    'proxyType': 'manual',
                    'httpProxy': proxyHost,
                    'sslProxy': proxyHost
                }
            }, function*(error, browser){
                if(!error){
                    var browserInfo = yield browser.info();
                    yield browser.config({
                        asyncScriptTimeout: timeout
                    });
                    yield browser.maximize();
                    yield browser.url(url);
                    var result;
                    try{
                        result = yield browser.eval(function(done){
                            var PageJsUnit = window.PageJsUnit;
                            if(PageJsUnit){
                                PageJsUnit.afterEnd(done);
                            }
                            else{
                                done(false);
                            }
                        });
                        if(result === false){
                            error = 'Test run failed!';
                        }
                    }
                    catch(e){
                        error = 'Test run timeout!'
                    }
                    yield browser.close();
                    proxy.close();
                    if(result){
                        result.browserName = browserInfo.browserName;
                        result.browserVersion = browserInfo.version;
                        var coverResult = result.coverResult;
                        if(coverResult){
                            var coverFiles = coverResult.files;
                            for(var file in coverFiles){
                                var arrSource = mapJsCoverageSource[file];
                                if(arrSource){
                                    coverFiles[file].source = arrSource;
                                }
                            }
                        }
                        doCallback(null, result);
                    }
                    else{
                        doCallback(error);
                    }
                }
                else{
                    doCallback(error);
                }
            });
        });

        function doCallback(error, result){
            if(callback){
                callback(error, result);
            }
            error?reject(error):resolve(result);
        }
    });
}


function checkUrlInclude(url, arrIncludes, arrExcludes){
    var isInclude = false;
    var reInclude;
    for(var i = 0,l=arrIncludes.length;i<l;i++){
        reInclude = arrIncludes[i];
        if(reInclude instanceof RegExp && reInclude.test(url)){
            isInclude = true;
            break;
        }
    }
    var reExclude;
    for(var i = 0,l=arrExcludes.length;i<l;i++){
        reExclude = arrExcludes[i];
        if(reExclude instanceof RegExp && reExclude.test(url)){
            isInclude = false;
            break;
        }
    }
    return isInclude;
}

function getMapHosts(strHosts){
    var arrLines = strHosts.split(/\r?\n/),
        line, match;
    var mapHosts = {};
    arrLines.forEach(function(line){
        match = line.match(/^\s*([^\s#]+)\s+([^#]+)/);
        if(match){
            match[2].split(/\s+/).forEach(function(host){
                if(host){
                    mapHosts[host.toLowerCase()] = match[1];
                }
            });
        }
    });
    return mapHosts;
}

module.exports = {
    run: runJsUnit
};