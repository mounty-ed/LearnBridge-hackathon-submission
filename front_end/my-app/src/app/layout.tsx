import './globals.css';
import { ThemeProviderWrapper } from '@/context/ThemeContext';
import ClientLayout from '@/components/layout/ClientLayout';
import createEmotionCache from '@/utils/createEmotionCache';
import ThemeRegistry from '@/ThemeRegistry';
import 'katex/dist/katex.min.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <ThemeProviderWrapper>
          <ThemeRegistry>
            <ClientLayout>{children}</ClientLayout>
          </ThemeRegistry>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
