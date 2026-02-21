import analytics from '@react-native-firebase/analytics';

export const logEvent = async (name: string, params?: Record<string, any>) => {
    try {
        await analytics().logEvent(name, params);
    } catch (error) {
        console.error('Analytics logEvent error:', error);
    }
};

export const logScreenView = async (screenName: string, screenClass: string = 'Screen') => {
    try {
        await analytics().logScreenView({
            screen_name: screenName,
            screen_class: screenClass,
        });
    } catch (error) {
        console.error('Analytics logScreenView error:', error);
    }
};

export default analytics;
