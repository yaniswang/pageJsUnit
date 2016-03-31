(function(win, undefined){
    if (win.QUnit === undefined || win.PageJsUnit === undefined || win.PageJsUnit.adaptered) {
        return;
    }
    PageJsUnit.adaptered = true;
    
    var arrMessages = [];
    var arrEvents = [];

    var specCount = 0, failedCount = 0, passedCount = 0;

    QUnit.begin = function(){
    }
    QUnit.moduleStart = function(message){
        arrEvents.push(
            {
                'type': 'suiteStart',
                'title': message.name
            }
        );
    }
    QUnit.testStart = function(message) {
        arrMessages = [];
    }
    QUnit.log = function(message) {
        if(!message.result){
            arrMessages.push(message.message+'\r\n'+message.source);
        }
    };
    QUnit.testDone = function(message) {
        var status = message.total === message.passed ? 'passed' : 'failed';
        var objEvent = {
            'type': 'testEnd',
            'title' : message.name,
            'status' :  status,
            'duration' : message.runtime
        };
        if(status === 'failed'){
            objEvent.errors = arrMessages.join('\r\n\r\n');
            failedCount ++;
        }
        else{
            passedCount ++;
        }
        specCount ++;
        arrEvents.push(objEvent);
    };
    QUnit.moduleDone = function(message){
        arrEvents.push(
            {
                'type': 'suiteEnd',
                'title' : message.name
            }
        );
    }
    QUnit.done = function(message) {
        PageJsUnit.endTest({
            'summary': {
                'all': specCount,
                'failed': failedCount,
                'passed': passedCount,
                'duration': message.runtime
            },
            'events': arrEvents
        });
    };
})(window);