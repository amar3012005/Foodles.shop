import React, { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/95 border-t border-green-500/20 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="text-white font-mono">
          <div className="text-sm text-green-400">Install Foodles App</div>
          <div className="text-xs text-gray-400">Add to home screen for quick access</div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="px-3 py-1 text-xs text-white/50 font-mono hover:text-white/70"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-xs bg-green-500 text-black font-mono hover:bg-green-400"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
