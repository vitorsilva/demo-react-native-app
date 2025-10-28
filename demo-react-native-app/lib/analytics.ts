import { meter } from './telemetry';

// Counter for tracking screen views
const screenViewCounter = meter.createCounter('screen.views', {
  description: 'Number of times screens are viewed',
});

// Counter for tracking user actions (button clicks, etc.)
const userActionCounter = meter.createCounter('user.actions', {
  description: 'Number of user interactions',
});

export const analytics = {
  screenView: (screenName: string) => {
    screenViewCounter.add(1, {
      screen: screenName,
    });
  },

  userAction: (action: string, metadata?: Record<string, string>) => {
    userActionCounter.add(1, {
      action,
      ...metadata,
    });
  },
};
