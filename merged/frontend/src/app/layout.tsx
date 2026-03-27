import "@/styles/globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "ProteinScan — Le comparateur whey indépendant",
  description: "Scoring transparent, aminogrammes, prix au gramme. Trouvez la meilleure whey — pas celle qui paie le plus de pub.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
