import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import SettingsScreen from './screens/SettingsScreen';

export type RootStackParamList = {
	Splash: undefined;
	Dashboard: undefined;
	Transactions: undefined;
	Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const darkTheme: Theme = {
	...DefaultTheme,
	dark: true,
	colors: {
		...DefaultTheme.colors,
		background: 'transparent',
		card: 'transparent',
		text: '#F5F5F5',
		primary: '#E50914',
	}
};

export default function RootNavigator() {
	return (
		<NavigationContainer theme={darkTheme}>
			<Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Splash" component={SplashScreen} />
				<Stack.Screen name="Dashboard" component={DashboardScreen} />
				<Stack.Screen name="Transactions" component={TransactionsScreen} />
				<Stack.Screen name="Settings" component={SettingsScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}