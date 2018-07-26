## React-Native Setup

These steps are only applicable if you are using react-native build tool.
We are currently only supporting the official react-native build tool, as for expo we are still looking into the best practices to help SDK developers build with it.

##### Steps to include datum-sdk in your react-native project
1- npm install --save datum-sdk && npm i

2- Follow instructions in https://www.npmjs.com/package/react-native-crypto

- If you faced the following error
```
> A problem occurred configuring project ':react-native-randombytes'.
     > The SDK Build Tools revision (23.0.1) is too low for project ':react-native-randombytes'.
      Minimum required is 25.0.0
```
- You will need to add the following in your project_root/android/gradle.build file
```
subprojects {
  project.configurations.all {
      afterEvaluate {project ->
        if (project.hasProperty("android")) {
            android {
                compileSdkVersion 26
                buildToolsVersion '26.0.2'
            }
        }
    }
     resolutionStrategy.eachDependency { details ->
        if (details.requested.group == 'com.android.support'
              && !details.requested.name.contains('multidex') ) {
           details.useVersion "26.0.2"
        }
     }
  }}
```

3- Create global.js file on your project_root that has the following
```
global.Buffer = require('buffer').Buffer;
global.process = require('process');


if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}
```

4- Include the following in your project_root/index.js [ or your entry point ]
```
import './global';
import './shim';
import crypto from "crypto";
```

5- You can start your project
```
For Android: react-native run-android
For IOS : react-native run-ios
```
