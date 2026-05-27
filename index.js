/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler'; // 💡 Obligatoire pour React Navigation sous Android

AppRegistry.registerComponent(appName, () => App);
