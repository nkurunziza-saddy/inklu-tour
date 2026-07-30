import {
	SiteHeader,
	SiteLayout,
	SiteLayoutFooter,
	SiteLayoutHeader,
	SiteLayoutMain,
	SiteProvider,
} from "@inklu/docs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Inklu Tour Documentation",
	description: "Headless product tour primitive for React & Next.js",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
			>
				<SiteProvider>
					<Providers>
						<SiteLayout>
							<SiteLayoutHeader>
								<SiteHeader
									navItems={[{ label: "Docs", href: "/docs" }]}
									githubUrl="https://github.com/nkurunziza-saddy/inklu-tour"
								/>
							</SiteLayoutHeader>
							<SiteLayoutMain>{children}</SiteLayoutMain>
							<SiteLayoutFooter />
						</SiteLayout>
					</Providers>
				</SiteProvider>
			</body>
		</html>
	);
}
