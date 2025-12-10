import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.deliveryapp.mvp',
	appName: 'DeliveryApp MVP',
	webDir: 'dist',
	server: {
		androidScheme: 'https',
	},
	android: {
		buildOptions: {
			keystorePath: undefined,
			keystoreAlias: undefined,
		},
	},
};

export default config;

