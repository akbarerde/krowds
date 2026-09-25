"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@krowds/ui/components/badge";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krowds/ui/components/card";

type ConnectionKind = "online" | "offline" | "stale" | "unavailable" | "reconnected";
type PresentationMode = "stale" | "unavailable";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const connectionCopy: Record<
  Exclude<ConnectionKind, "online">,
  { label: string; title: string; description: string }
> = {
  offline: {
    label: "Offline",
    title: "Live status cannot be confirmed",
    description:
      "Reconnect before relying on payment, ticket, wristband, redemption, or access information.",
  },
  stale: {
    label: "Saved presentation",
    title: "You are viewing a cached page",
    description:
      "This presentation may be out of date and grants no business or access authority.",
  },
  unavailable: {
    label: "Unavailable",
    title: "This page was not saved for offline use",
    description:
      "Reconnect and try again. No different or current business state was substituted.",
  },
  reconnected: {
    label: "Reconnected",
    title: "The network is available again",
    description: "Refresh the page to request the current presentation from the server.",
  },
};

export function PwaRegister() {
  const [connection, setConnection] = useState<ConnectionKind>("online");
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateRequestedRef = useRef(false);

  const readPresentationMode = useCallback(
    () =>
      new Promise<PresentationMode | null>((resolve) => {
        if (
          !("serviceWorker" in navigator) ||
          !navigator.serviceWorker.controller
        ) {
          resolve(null);
          return;
        }

        const channel = new MessageChannel();
        const timeout = window.setTimeout(() => resolve(null), 500);

        channel.port1.onmessage = (event: MessageEvent<{ mode: PresentationMode | null }>) => {
          window.clearTimeout(timeout);
          resolve(event.data.mode);
        };

        navigator.serviceWorker.controller.postMessage(
          {
            type: "GET_PRESENTATION_FALLBACK",
            path: window.location.pathname,
          },
          [channel.port2],
        );
      }),
    [],
  );

  const syncConnection = useCallback(async () => {
    const fallback = await readPresentationMode();

    if (!navigator.onLine) {
      setConnection(fallback === "stale" ? "stale" : "offline");
      return;
    }

    setConnection(fallback ?? "online");
  }, [readPresentationMode]);

  useEffect(() => {
    const handleOffline = () => setConnection("offline");
    const handleOnline = () => {
      setConnection("reconnected");
      void registrationRef.current?.update();
    };
    const handlePageShow = () => void syncConnection();
    const initialSync = window.setTimeout(() => void syncConnection(), 0);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [syncConnection]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let disposed = false;

    const watchRegistration = (registration: ServiceWorkerRegistration) => {
      registrationRef.current = registration;

      if (registration.waiting && navigator.serviceWorker.controller) {
        setUpdateWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateWorker(installingWorker);
          }
        });
      });
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        if (!disposed) {
          watchRegistration(registration);
          void registration.update();
        }
      } catch {
        if (!disposed) setRegistrationFailed(true);
      }
    };

    const handleControllerChange = () => {
      if (updateRequestedRef.current) {
        updateRequestedRef.current = false;
        window.location.reload();
        return;
      }

      void syncConnection();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    void register();

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [syncConnection]);

  const install = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const activateUpdate = () => {
    if (!updateWorker) return;

    setUpdating(true);
    updateRequestedRef.current = true;
    updateWorker.postMessage({ type: "ACTIVATE_UPDATE" });
    window.setTimeout(() => window.location.reload(), 750);
  };

  const connectionNotice =
    connection === "online" ? null : connectionCopy[connection];

  if (
    !connectionNotice &&
    !registrationFailed &&
    !updateWorker &&
    !installPrompt
  ) {
    return null;
  }

  return (
    <aside
      aria-label="PWA status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-xl flex-col gap-3"
    >
      {connectionNotice ? (
        <Card size="sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              {connectionNotice.label}
            </Badge>
            <CardTitle>{connectionNotice.title}</CardTitle>
            <CardDescription>{connectionNotice.description}</CardDescription>
          </CardHeader>
          {connection !== "offline" ? (
            <CardFooter>
              <Button onClick={() => window.location.reload()} size="lg">
                Refresh page
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      ) : null}

      {registrationFailed ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Offline shell unavailable</CardTitle>
            <CardDescription>
              Live features still require a network connection. No business
              decision will be made from this browser.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {updateWorker ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>A new app version is ready</CardTitle>
            <CardDescription>
              Update when convenient. The current view remains available until
              you confirm.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={activateUpdate} disabled={updating} size="lg">
              {updating ? "Updating" : "Update app"}
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {installPrompt ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Install KROWDS</CardTitle>
            <CardDescription>
              Open the presentation in a standalone app window where your
              browser supports installation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => void install()} size="lg">
              Install app
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </aside>
  );
}
