(function(win, undefined){
    if (win.jasmine === undefined || win.PageJsUnit === undefined || win.PageJsUnit.adaptered) {
        return;
    }
    PageJsUnit.adaptered = true;

    var runnerStartTime, specCount = 0, failedCount = 0, passedCount = 0;
    var specStartTime;
    var arrEvents = [];

    var jasmine = win.jasmine;
    var jasmineEnv = jasmine.getEnv();
    var reporter = {
        jasmineStarted: function(){
            console.log('start')
            runnerStartTime = new Date().getTime();
        },
        suiteStarted: function(suite){
            arrEvents.push({
                'type': 'suiteStart',
                'title': suite.description
            });
        },
        specStarted: function(){
            specStartTime = new Date().getTime();
        },
        specDone: function(spec){
            var status = spec.status;
            var objEvent = {
                'type': 'testEnd',
                'title': spec.description,
                'status': status,
                'duration': new Date().getTime() - specStartTime
            };
            if(status === 'failed'){
                failedCount ++;
                var arrErrors = [];
                var failedExpectations = spec.failedExpectations, item;
                for (var i = 0, c = failedExpectations.length; i < c; i++) {
                    item = failedExpectations[i];
                    arrErrors.push(stackFilter(item.stack));
                }
                objEvent.errors = arrErrors.join('\r\n\r\n');
            }
            else if(status === 'passed'){
                passedCount ++;
            }
            specCount ++;
            arrEvents.push(objEvent); 
        },
        suiteDone: function(suite){
            arrEvents.push({
                'type': 'suiteEnd',
                'title': suite.description
            });
        },
        jasmineDone: function(){
            var duration = new Date().getTime() - runnerStartTime;
            PageJsUnit.endTest({
                'summary': {
                    'all': specCount,
                    'failed': failedCount,
                    'passed': passedCount,
                    'duration': duration
                },
                'events': arrEvents
            });
        }
    }
    function stackFilter(stack) {
        var arrResults = [];
        var arrLines = (stack || '').split(/\r?\n/),
            line;
        for (var i = 0, c = arrLines.length; i < c; i++) {
            line = arrLines[i];
            if (!/\/jasmine(-\d|\.js)/i.test(line)) {
                arrResults.push(line);
            };
        }
        return arrResults.join('\n');
    }
    jasmineEnv.addReporter(reporter);
})(window);