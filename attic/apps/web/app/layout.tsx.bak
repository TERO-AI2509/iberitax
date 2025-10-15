export const dynamic = 'force-dynamic'
export const revalidate = 0

import React from 'react';
import BannerHost from "../components/BannerHost";
import ToastHost from "../components/ToastHost";
import Providers from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <BannerHost />
      <ToastHost />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
