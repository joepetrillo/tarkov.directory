"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
          variables: {
            borderRadius: "0",
            fontWeight: {
              normal: 400,
              medium: 700,
              bold: 700,
            },
            colorBackground: "#191918",
            colorPrimary: "#CBB99F",
            colorDanger: "#FF9592",
            colorSuccess: "#71D083",
            colorWarning: "#CBB99F",
            colorNeutral: "#CBB99F",
            colorText: "#E8E2D9",
            colorTextSecondary: "#B5B3AD",
            colorTextOnPrimaryBackground: "white",
            colorInputText: "#E8E2D9",
            colorInputBackground: "rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        {children}
      </ClerkProvider>
    </>
  );
}
