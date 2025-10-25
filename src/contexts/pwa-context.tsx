import { getPWADisplayMode, type InstallEvent } from "@/lib/pwa";
import { useEffect, type ReactNode } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useState } from "react";

interface PWAProvision {
    isInstalled: boolean;
    displayMode: string;
    installPrompt: InstallEvent | undefined;
}

const PWAContext = createContext<PWAProvision | null>(null);


export const PWAProvider = ({ children }: {children: ReactNode}) => {
  const [displayMode, setDisplay] = useState(getPWADisplayMode);
  const [isInstalled, setInstalled] = useState( ['standalone', 'twa'].includes(displayMode) )
  const [installPrompt, setInstallPrompt] = useState();

  useEffect(() => {
    const appInstalled = () => {
      setInstalled(true);
    };

    const installPrompt = (e) => {
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    const DOMLoaded = () => {
      // Replace "standalone" with the display mode used in your manifest
      window.matchMedia('(display-mode: standalone)')
        .addEventListener('change', () => {
          // Log display mode change to analytics
          setDisplay(getPWADisplayMode());
        });
    };

    window.addEventListener('appinstalled', appInstalled);
    window.addEventListener('beforeinstallprompt', installPrompt);
    window.addEventListener('DOMContentLoaded', DOMLoaded);

    // Log install status to analytics
    return () => {
      window.removeEventListener('appinstalled', appInstalled);
      window.removeEventListener('DOMContentLoaded', DOMLoaded);
      window.removeEventListener('beforeinstallprompt', installPrompt);

    };
  }, []);


  return (
    <PWAContext.Provider value={{ isInstalled, displayMode, installPrompt }}>
      {children}
    </PWAContext.Provider>
  );
}


export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWADetails must be used within a PWAProvider');
  }
  return context;
}