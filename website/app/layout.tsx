import "./globals.css";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import localFont from 'next/font/local'
import { ThemeProvider } from "@/providers/theme-provider";
import UserProvider from "@/entities/user/model/user-context";
import ClientRootLayout from "./client-layout";

// Moscow Transport brand typeface.
// Regular (400)   -> body / UI text
// ExtraBold (800) -> display + headings
export const MoscowSans = localFont({
  src: [
    { path: '../public/fonts/Moscow-Sans-Regular.woff2',    weight: '400', style: 'normal' },
    { path: '../public/fonts/Moscow-Sans-Extra-Bold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-moscow-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Геймификация для ВСМ · Московский транспорт",
  description: "Тренажёр проводника высокоскоростной магистрали ВСМ-400",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={cn(MoscowSans.variable, MoscowSans.className, "font-sans")}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <UserProvider>
            <TooltipProvider>
              <ClientRootLayout>
                {children}
              </ClientRootLayout>
            </TooltipProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
