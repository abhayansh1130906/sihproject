import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillIntel — Skill Intelligence & Learning Platform | MoSPI (SIH26101)",
  description:
    "AI-enabled Skill Intelligence and Learning Platform for India's Official Statistical System (MoSPI / iGOT Karmayogi)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9ff]">
        <AuthProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
