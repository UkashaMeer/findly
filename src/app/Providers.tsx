"use client";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Toaster } from "sonner";
import ConvexClientProvider from "./ConvexProviderWithClerk";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexClientProvider>
        <Provider store={store}>{children}</Provider>
        <Toaster />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
