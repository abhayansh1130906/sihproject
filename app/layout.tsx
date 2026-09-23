import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('skillintel_theme');
                var isDark = theme === 'dark' || (theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                if (localStorage.getItem('skillintel_compact_mode') === 'true') {
                  document.documentElement.classList.add('compact-mode');
                }
                if (localStorage.getItem('skillintel_high_contrast') === 'true') {
                  document.documentElement.classList.add('high-contrast');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] dark:bg-[#090d16] text-[#0d1c2e] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <AdminAuthProvider>{children}</AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

