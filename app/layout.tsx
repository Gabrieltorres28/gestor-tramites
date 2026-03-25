import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { getCurrentUserContext } from "@/lib/auth/session";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestor Previsional",
  description: "Sistema previsional para gestionar clientes, tramites, caja y medicamentos desde un solo panel.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserContext();
  const isLoggedIn = user !== null;

  return (
    <html lang="es">
      <body className={inter.className + " min-h-screen bg-slate-950 text-slate-100"}>
        {isLoggedIn && user ? <Navigation businessName={user.businessName} ownerName={user.ownerName} /> : null}
        <main className={isLoggedIn ? "pb-24 md:pb-10" : ""}>{children}</main>
      </body>
    </html>
  );
}
