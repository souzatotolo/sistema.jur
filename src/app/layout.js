import { Playfair_Display, Nunito_Sans } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Sistema Jurídico - Marta Neumann Advogada',
  description: 'Sistema de gestão de processos jurídicos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${playfairDisplay.variable} ${nunitoSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
