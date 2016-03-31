(function(win, undefined){
    if(win.PageJsUnit){
        return;
    }
    var PageJsUnit = {};
    
    var isEnd = false;
    var arrEndCallbacks = [];

    var arrConsole = [];
    var testResult = {};
    var coverResult = {};

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
            coverResult = processJsCoverageData($jscoverage);
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
            coverResult: coverResult
        };
        for(var i=0,l=arrEndCallbacks.length;i<l;i++){
            arrEndCallbacks[i](objResults);
        }
    }

    function processJsCoverageData(jsCoverageData){
        var allLineCount = 0, coveredLineCount = 0;
        var allBranchCount = 0, coveredBranchCount = 0;
        var allFunctionCount = 0, coveredFunctionCount = 0;
        var fileInfo;
        for(var file in jsCoverageData){
            fileInfo = jsCoverageData[file];
            var lineData = fileInfo.lineData;
            for(var line in lineData){
                allLineCount ++;
                if(lineData[line] > 0){
                    coveredLineCount ++;
                }
            }
            var branchData = fileInfo.branchData;
            for (var lineNumber in branchData) {
                var conditions = branchData[lineNumber];
                for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
                    var branchObject = conditions[conditionIndex];
                    if(branchObject){
                        allBranchCount += 2;
                        if(branchObject.evalFalse > 0){
                            coveredBranchCount ++;
                        }
                        if(branchObject.evalTrue > 0){
                            coveredBranchCount ++;
                        }
                        branchObject.covered = branchObject.covered();
                        branchObject.message = branchObject.message();
                        branchObject.pathsCovered = branchObject.pathsCovered();
                        delete branchObject['init'];
                        delete branchObject['toJSON'];
                        delete branchObject['ranCondition'];
                    }
                }
            }
            var functionData = fileInfo.functionData;
            for(var id in functionData){
                allFunctionCount ++;
                if(functionData[id] > 0){
                    coveredFunctionCount ++;
                }
            }
        }
        var lineRatio = allLineCount > 0 ? getFix(coveredLineCount/allLineCount*100): 0;
        var branchRatio = allBranchCount > 0 ? getFix(coveredBranchCount/allBranchCount*100): 0;
        var functionRatio = allFunctionCount > 0 ? getFix(coveredFunctionCount/allFunctionCount*100): 0;
        var newJsCoverageData = {
            summary: {
                lineCount: allLineCount,
                lineCovered: coveredLineCount,
                lineRatio: lineRatio,

                branchCount: allBranchCount,
                branchCovered: coveredBranchCount,
                branchRatio: branchRatio,

                functionCount: allFunctionCount,
                functionCovered: coveredFunctionCount,
                functionRatio: functionRatio
            },
            files: jsCoverageData
        };
        return newJsCoverageData;
    }

    function getFix(num){
        return Math.round(num*100)/100;
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