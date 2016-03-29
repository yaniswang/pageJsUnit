(function(win, undefined){
    if(win.PageJsUnit){
        return;
    }
    var PageJsUnit = {};
    
    var isEnd = false;
    var arrEndCallbacks = [];

    var arrConsole = [];
    var testResult = {};
    var jsCoverage = {};

    PageJsUnit.addConsole = function(type, message){
        arrConsole.push({
            type: type,
            message: message
        });
    };

    PageJsUnit.endTest = function(result){
        testResult = result;
        var $jscoverage = window._$jscoverage;
        if($jscoverage){
            jsCoverage = processJsCoverageData($jscoverage);
        }
        isEnd = true;
        execEndCallback();
    }

    PageJsUnit.afterEnd = function(callback){
        arrEndCallbacks.push(callback);
        if(isEnd){
            execEndCallback();
        }
    }

    function execEndCallback(){
        var objResults = {
            console: arrConsole,
            testResult: testResult,
            jsCoverage: jsCoverage
        };
        for(var i=0,l=arrEndCallbacks.length;i<l;i++){
            arrEndCallbacks[i](objResults);
        }
    }

    function processJsCoverageData(jsCoverageData){
        for(var file in jsCoverageData){
            var branchData = jsCoverageData[file].branchData;
            for (var lineNumber in branchData) {
                var conditions = branchData[lineNumber];
                for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
                    var branchObject = conditions[conditionIndex];
                    if(branchObject){
                        branchObject.covered = branchObject.covered();
                        branchObject.message = branchObject.message();
                        branchObject.pathsCovered = branchObject.pathsCovered();
                        delete branchObject['init'];
                        delete branchObject['toJSON'];
                        delete branchObject['ranCondition'];
                    }
                }
            }
        }
        return jsCoverageData;
    }

    win.PageJsUnit = PageJsUnit;
    
    if(win.console === undefined){
        win.console = {};
    }
    console.log = function() {
        PageJsUnit.addConsole('log', Array.prototype.slice.call(arguments));
    };
    console.info = function() {
        PageJsUnit.addConsole('info', Array.prototype.slice.call(arguments));
    };
    console.debug = function() {
        PageJsUnit.addConsole('debug', Array.prototype.slice.call(arguments));
    };
    console.warn = function() {
        PageJsUnit.addConsole('warn', Array.prototype.slice.call(arguments));
    };
    console.error = function() {
        PageJsUnit.addConsole('error', Array.prototype.slice.call(arguments));
    };

    win.alert = function(message) {
        PageJsUnit.addConsole('alert', message);
    };
    win.confirm = function(message) {
        PageJsUnit.addConsole('confirm', message);
    };
    win.prompt = function(message) {
        PageJsUnit.addConsole('prompt', message);
    };
})(window);