
export function getPWADisplayMode() {
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  // iOS-specific check
  if (isIOS && window.navigator.standalone) {
    return 'standalone'; // iOS Safari in standalone mode
  }

  // Android TWA
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  }

  // Standard display-mode detection
  const modes = [
    'fullscreen', 'standalone', 'minimal-ui', 'browser', 'window-controls-overlay'
  ];

  for (const mode of modes) {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) {
      return mode;
    }
  }

  return 'unknown';
}


export type InstallEvent = {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  [key: string]: any;
}

export const installPWA = (e: InstallEvent) => {
  if (!e)
    return
  // Show the install prompt
  e.prompt();

  // prompt.userChoice.then((choiceResult) => {
  //   if (choiceResult.outcome === 'accepted') {
  //     console.log('User accepted the A2HS prompt');
  //   } else {
  //     console.log('User dismissed the A2HS prompt');
  //   }
  // });
}

window.addEventListener('DOMContentLoaded', () => {
  // Log launch display mode to analytics
  console.log('DISPLAY_MODE_LAUNCH:', getPWADisplayMode());
});


if (navigator.getInstalledRelatedApps!) {
  navigator.getInstalledRelatedApps()
    .then(console.log)
    .catch((error: Error) => {
      console.error('Error fetching related apps:', error);
    });
} else {
  console.warn('getInstalledRelatedApps is not supported on this browser.');
}