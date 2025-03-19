
    import Image from "next/image";
    import Link from "next/link";


    export default async function Home () {
    return (
        <main className="relative min-h-screen flex flex-col bg-gradient-to-b from-black via-zinc-900 to-zinc-800 text-white">
        <nav className="flex items-center justify-between py-4 px-8 bg-black bg-opacity-90 shadow-sm">
            <div className="flex items-center space-x-2">
            <Image
                src="/globe.svg"
                alt="WebGenie Logo"
                width={40}
                height={40}
            />
            <span className="text-xl font-bold tracking-wide">WebGenie</span>
            </div>
            <div>
            <Link
                href="/login"
                className="px-4 py-2 font-semibold border border-white rounded hover:bg-white hover:text-black transition"
            >
                Sign In
            </Link>
            </div>
        </nav>

        <section className="flex flex-col items-center justify-center flex-grow text-center p-6">
            <div className="max-w-2xl">
            <div className="mx-auto w-40 h-40  mb-4 relative">
                <Image
                src="/vercel.svg"
                alt="Next.js Logo"
                layout="fill"
                objectFit="contain"
                />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-100">
                Welcome to <span className="text-blue-400">WebGenie</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 px-4 md:px-0 text-gray-300">
                Your project has been successfully generated! Build faster with{" "}
                <strong>Next.js</strong>, <strong>Prisma</strong>, and{" "}
                <strong>NextAuth</strong>—all set up and ready to go.
            </p>
            <div className="space-x-4">
                <Link
                href="https://web-genie-one.vercel.app/"
                className="inline-block px-6 py-2 text-lg font-medium bg-zinc-700 rounded hover:bg-zinc-600 transition"
                >
                Go to Dashboard
                </Link>
                 <Link
                href="https://web-genie-one.vercel.app/docs"
                className="inline-block px-6 py-2 text-lg font-medium bg-zinc-700 rounded hover:bg-zinc-600 transition"
                >
                Learn more
                </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">
                Edit{" "}
                <code className="bg-zinc-700 px-1 py-0.5 rounded">
                pages/index.tsx
                </code>{" "}
                to customize this page.
            </p>
            </div>
        </section>

        <footer className="w-full py-4 text-center bg-black bg-opacity-90">
            <p className="text-sm text-gray-400">
            © 2025 WebGenie · Built with Next.js ·{" "}
            <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
            >
                Deployed on Vercel
            </a>
            </p>
        </footer>
        </main>
    );
    }
        