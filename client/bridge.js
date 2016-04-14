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
        var newJsCoverageData = {};
        var newFileInfo;
        var newBranchData;
        for(var file in jsCoverageData){
            fileInfo = jsCoverageData[file];
            newFileInfo = {};
            // line data
            var lineData = fileInfo.lineData;
            for(var line in lineData){
                allLineCount ++;
                if(lineData[line] > 0){
                    coveredLineCount ++;
                }
            }
            newFileInfo.lineData = lineData;
            // branch data
            var branchData = fileInfo.branchData;
            newBranchData = {};
            for (var lineNumber in branchData) {
                var arrConditions = [];
                var conditions = branchData[lineNumber];
                for (var conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
                    var branchObject = conditions[conditionIndex];
                    if(branchObject){
                        var newBranchObject = {};
                        allBranchCount += 2;
                        if(branchObject.evalFalse > 0){
                            coveredBranchCount ++;
                        }
                        if(branchObject.evalTrue > 0){
                            coveredBranchCount ++;
                        }
                        newBranchObject.evalFalse = branchObject.evalFalse;
                        newBranchObject.evalTrue = branchObject.evalTrue;
                        newBranchObject.nodeLength = branchObject.nodeLength;
                        newBranchObject.position = branchObject.position;
                        newBranchObject.src = branchObject.src;
                        newBranchObject.covered = branchObject.covered();
                        newBranchObject.message = branchObject.message();
                        newBranchObject.pathsCovered = branchObject.pathsCovered();
                        arrConditions[conditionIndex] = newBranchObject;
                    }
                }
                newBranchData[lineNumber] = arrConditions;
            }
            newFileInfo.branchData = newBranchData;
            // function data
            var functionData = fileInfo.functionData;
            var fnHits;
            allFunctionCount += functionData.length;
            for(var id in functionData){
                fnHits = functionData[id];
                if(fnHits && fnHits > 0){
                    coveredFunctionCount ++;
                }
            }
            newFileInfo.functionData = functionData;
            newJsCoverageData[file] = newFileInfo;
        }
        var lineRatio = allLineCount > 0 ? getFix(coveredLineCount/allLineCount*100): 0;
        var branchRatio = allBranchCount > 0 ? getFix(coveredBranchCount/allBranchCount*100): 0;
        var functionRatio = allFunctionCount > 0 ? getFix(coveredFunctionCount/allFunctionCount*100): 0;
        return {
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
            files: newJsCoverageData
        };
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