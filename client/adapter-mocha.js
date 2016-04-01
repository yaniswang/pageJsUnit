(function(win, undefined){
    if (win.mocha === undefined || win.PageJsUnit === undefined || win.PageJsUnit.adaptered) {
        return;
    }
    PageJsUnit.adaptered = true;
    
    mocha.reporter(function(runner){
        var runnerStartTime, specCount = 0, failedCount = 0, passedCount = 0;
        
        var arrEvents = [];

        runner.on('start', function() {
            runnerStartTime = new Date().getTime();
        });
        
        runner.on('suite', function(suite){
            if (suite.root) return;
            arrEvents.push({
                'type': 'suiteStart',
                'title': suite.title
            });
        });
        
        runner.on('pass', function(test){
            var slow = test.slow(),
                medium = slow / 2,
                duration = test.duration;
            test.speed = duration > slow
              ? 'slow'
              : duration > medium
                ? 'medium'
                : 'fast';
        });
        
        runner.on('fail', function(test, error) {
            if(test.errors === undefined){
                test.errors = [];
            }
            test.errors.push(error);
        });

        runner.on('suite end', function(suite){
            if (suite.root) return;
            arrEvents.push({
                'type': 'suiteEnd',
                'title': suite.title
            });
        });
        
        runner.on('test end', function(test) {
            specCount ++;
            var status = test.state ? test.state : 'pending';
            var objEvent = {
                'type': 'testEnd',
                'title': test.title,
                'status': status,
                'duration': test.duration,
                'speed': test.speed
            };
            if(status === 'failed'){
                var arrTextErrors = [], errors = test.errors;
                for(var i=0,c=errors.length;i<c;i++){
                    arrTextErrors.push(getErrorMessage(errors[i]));
                }
                objEvent.errors = arrTextErrors.join('\n\n');
                failedCount ++;
            }
            else if(status === 'passed'){
                passedCount ++;
            }
            arrEvents.push(objEvent);           
        });

        runner.on('end', function() {
            var duration = new Date().getTime() - runnerStartTime;
            PageJsUnit.endTest({
                'type': 'mocha',
                'summary': {
                    'all': specCount,
                    'failed': failedCount,
                    'passed': passedCount,
                    'duration': duration
                },
                'events': arrEvents
            });
        });
    });

    function getErrorMessage(err){
        var message = err.message || '',
            stack = err.stack;
        if(!stack && err.sourceURL && err.line !== undefined){
           stack = '(' + err.sourceURL + ':' + err.line + ')';
        }
        if(stack !== undefined){
            stack = stackFilter(stack);
            if (stack.indexOf(message) !== -1) {
                message = stack;
            }
            else{
                message += '\n' + stack;
            }
        }
        return message;
    }
    function stackFilter(stack) {
        var arrResults = [];
        var arrLines = (stack || '').split(/\r?\n/),
            line;
        for (var i = 0, c = arrLines.length; i < c; i++) {
            line = arrLines[i];
            if (!/\/mocha([-_][^\.]+)?\.js/i.test(line)) {
                arrResults.push(line);
            };
        }
        return arrResults.join('\n');
    }
})(window);