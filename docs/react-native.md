## React-Native Setup

These steps are only applicable if you are using react-native build tool.
We are currently **only supporting the official react-native build tool**

**As of now, we are not supporting Expo**

#### Getting Started
**_This setup is is done with Node.js  Version: 10.8.0, and npm  Version: 6.2.0_**
1) Run the following code:

```bash
npm i --save datum-sdk  
```

---------------------------

2) Follow instructions in https://www.npmjs.com/package/react-native-crypto

_If you faced the following error:_
```bash
> A problem occurred configuring project ':react-native-randombytes'.
     > The SDK Build Tools revision (23.0.1) is too low for project ':react-native-randombytes'.
      Minimum required is 25.0.0
```
 You will need to add the following in your project_root/android/build.gradle file after dependencies
```gradle
{

dependencies{
  ...
}  
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
}
```

---------------------------

3) Create global.js file on your project_root that has the following
```javascript
/* eslint disable */
global.Buffer = require('buffer').Buffer;
global.process = require('process');


if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}
if(typeof self ==='undefined'){
  global.self = global;
}
```

---------------------------

4) Include the following in your project_root/index.js [ or your entry point ]
```javascript
/* eslint disable */
import './global';
import './shim';
```

---------------------------

5) You can start your project
> For Android: react-native run-android

> For IOS : react-native run-ios

---------------------------

### Example


##### index.js

_Assuming that index.js is your project entry point_

```javascript
/** @format */
import './global';
import './shim';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

```


##### App.js

_Assuming that App.js is where you have your root element_

```javascript
import React, {Component} from 'react';
import {View,Text} from 'react-native';


class App extends Component{
  constructor(props){
    super(props);
    this.Datum = require('datum-sdk');
    this.state={};
  }
  componentDidMount(){
    this.Datum.createIdentity("password")
    .then(id=>this.setState({key:id.keystore}))
    .catch(err=>this.setState({error:JSON.stringify(err)}));
  }
  render() {
    return (
      <View>
        <Text>Welcome to Datum</Text>
        <Text>{this.state.key}</Text>
        <Text>{this.state.error}</Text>
      </View>

    );
  }
}

export default App;
```
