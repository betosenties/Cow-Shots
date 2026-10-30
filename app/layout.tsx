import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cow-shots.vercel.app"),
  title: "COW SHOTS",
  description: "Calostro bovino líquido y listo para tomar, en Vainilla y Chocolate. Fuel. Grow. Perform.",
  openGraph: {
    title: "COW SHOTS",
    description: "Calostro bovino líquido y listo para tomar, en Vainilla y Chocolate.",
    url: "/",
    siteName: "COW SHOTS",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <body className="grain cursor-none-fine">{children}</body>
    </html>
  );
}
