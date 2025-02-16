import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dAIos - AI-Powered DAO Platform",
  description:
    "Launch and manage DAOs with intelligent, unbiased member admittance",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.className}`}>
      <body>
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
