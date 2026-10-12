import "./globals.css";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {QueryProvider} from "@/components/providers/query-provider";
import {Toaster} from "@/components/ui/sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <QueryProvider>

              {children}
              <Toaster />
          </QueryProvider>


      </ThemeProvider>


      </body>
      </html>

  );
}
