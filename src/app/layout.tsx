import 'react-loading-skeleton/dist/skeleton.css';
import 'simplebar-react/dist/simplebar.min.css';
import './globals.css';

import { Inter, Poppins } from 'next/font/google';

import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';
import { cn, constructMetadata } from '@/lib/utils';

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	variable: "--font-inter",
});
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	variable: "--font-poppins",
});

export const metadata = constructMetadata();

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="light">
			<Providers>
				<body
					className={cn(
						"min-h-screen font-poppins antialiased grainy",
						inter.variable,
						poppins.variable
					)}
				>
					<Toaster />
					<Navbar />
					{children}
				</body>
			</Providers>
		</html>
	);
}
