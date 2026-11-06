import { useEffect, useState } from "react";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwa() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [installed, setInstalled] = useState(window.matchMedia("(display-mode: standalone)").matches);
  useEffect(() => {
    let active = true;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const onInstall = () => {
      setInstalled(true);
      setPrompt(null);
    };
    const onOnline = () => setOnline(navigator.onLine);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstall);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.ready.then(() => {
        if (active) setOfflineReady(true);
      });
    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstall);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOnline);
    };
  }, []);
  return {
    offlineReady,
    online,
    installed,
    canInstall: !!prompt,
    install: async () => {
      if (!prompt) return false;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      return choice.outcome === "accepted";
    },
  };
}
