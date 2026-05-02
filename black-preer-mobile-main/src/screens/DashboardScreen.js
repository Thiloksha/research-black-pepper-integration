import { Platform } from 'react-native';

const DashboardScreen = Platform.select({
  web: () => require('./DashboardScreen.web').default,
  default: () => require('./DashboardScreen.native').default,
})();

export default DashboardScreen;
