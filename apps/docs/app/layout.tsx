import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'bitmapped',
    template: '%s — bitmapped',
  },
  description:
    'Hardware-accurate retro pixel art conversion library for TypeScript',
  openGraph: {
    title: 'bitmapped — Retro pixel art conversion',
    description:
      'Turn any image into hardware-accurate retro pixel art. 49 system presets from NES to PS1.',
  },
};

const logo = (
  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
    <span style={{ fontFamily: 'monospace' }}>&#x2B1B;</span> bitmapped
  </span>
);

const navbar = (
  <Navbar logo={logo} projectLink="https://github.com/user/bitmapped" />
);

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} &copy;{' '}
    <a
      href="https://github.com/user/bitmapped"
      target="_blank"
      rel="noopener noreferrer"
    >
      bitmapped
    </a>
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        backgroundColor={{ dark: '#0a0a0a', light: '#fafafa' }}
        color={{ hue: 160, saturation: 60 }}
      />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/user/bitmapped-docs/tree/main"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
