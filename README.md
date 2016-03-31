pageJsUnit
=======================

![pageJsUnit logo](https://raw.github.com/yaniswang/pageJsUnit/master/logo.png)

[![NPM version](https://badge.fury.io/js/pagejsunit.png)](http://badge.fury.io/js/pagejsunit)

pageJsUnit is a tools for running jsunit by webdriver.

It support 3 test frameworks: [mocha](https://mochajs.org/), [jasmine](http://jasmine.github.io/), [qunit](https://qunitjs.com/)

Install
=======================

1. Install Nodejs
    
    [http://nodejs.org/](http://nodejs.org/)

2. Install pageJsUnit

        npm install pagejsunit

Quick start
=======================

Async demo:

    var PageJsUnit = require('pagejsunit');

    PageJsUnit.run({
        wdHost: '127.0.0.1',
        wdPort: '4444',
        url: 'http://127.0.0.1/test/mocha.html',
        browserName: 'chrome',
        browserVersion: '',
        coverageInclude: [ /\/src\//i ],
        coverageExclude: [],
        coverageBeautify: false,
        hosts: '127.0.0.1 www.google.com'
    }, function(error, result){
        console.log(error, result)
    });

return result:

    {
        "browserName": "chrome", 
        "browserVersion": "49.0.2623.87", 
        "console": [
            {...}, 
            {...}, 
            {...}
        ], 
        "testResult": {
            "summary": {...}, 
            "events": [...]
        }, 
        "jsCoverage": {
            "http://127.0.0.1/test/src/Array.js": {...}
        }
    }

Sync demo:

    var co = require('co');

    co(function*(){
        var result = PageJsUnit.run({
            wdHost: '127.0.0.1',
            wdPort: '4444',
            url: 'http://127.0.0.1/test/mocha.html',
            browserName: 'chrome',
            browserVersion: '',
            coverageInclude: [ /\/src\//i ],
            coverageExclude: [],
            coverageBeautify: false,
            hosts: '127.0.0.1 www.google.com'
        });
        console.log(result);
    }).catch(function(error){
        console.log(error);
    });

License
================

pageJsUnit is released under the MIT license:

> The MIT License
>
> Copyright (c) 2016 Yanis Wang \< yanis.wang@gmail.com \>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* GitHub: [https://github.com/](https://github.com/)
* node-jscover: [https://github.com/yiminghe/node-jscover](https://github.com/yiminghe/node-jscover)
* esprima: [https://github.com/jquery/esprima](https://github.com/jquery/esprima)
* escodegen: [https://github.com/estools/escodegen](https://github.com/estools/escodegen)