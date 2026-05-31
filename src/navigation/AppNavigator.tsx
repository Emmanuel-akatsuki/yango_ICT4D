import React from 'react';

import {createNativeStackNavigator}
from '@react-navigation/native-stack';

import LoginScreen
from '../screens/LoginScreen';

import RegisterScreen
from '../screens/RegisterScreen';

import ClientHome
from '../screens/ClientHome';

import DriverHome
from '../screens/DriverHome';

const Stack =
createNativeStackNavigator();

export default function AppNavigator() {

  return (

    <Stack.Navigator>

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="ClientHome"
        component={ClientHome}
      />

      <Stack.Screen
        name="DriverHome"
        component={DriverHome}
      />

    </Stack.Navigator>

  );
}