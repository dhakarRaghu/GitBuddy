// "use client"

// import Link from "next/link"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { MoonIcon, SunIcon, MenuIcon, XIcon } from "lucide-react"
// import { useTheme } from "next-themes"

// export default function Header() {
//   const { theme, setTheme } = useTheme()
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   return (
//     <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md bg-opacity-80">
//       <div className="container px-4 md:px-6 mx-auto">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center space-x-2">
//               <span className="text-2xl font-bold text-white">GitBuddy</span>
//             </Link>
//           </div>

//           <nav className="hidden md:flex items-center space-x-6">
//             <Link href="#features" className="text-sm font-medium text-white/70 hover:text-white">
//               Features
//             </Link>
//             <Link href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white">
//               How It Works
//             </Link>
//             <Link href="#pricing" className="text-sm font-medium text-white/70 hover:text-white">
//               Pricing
//             </Link>
//             <Link href="#docs" className="text-sm font-medium text-white/70 hover:text-white">
//               Docs
//             </Link>
//           </nav>

//           <div className="flex items-center space-x-4">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//               className="mr-2 text-white/70 hover:text-white hover:bg-white/10"
//               aria-label="Toggle theme"
//             >
//               {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
//             </Button>

//             <div className="hidden md:flex items-center space-x-4">
//               <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
//                 Sign In
//               </Button>
//               <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Get Started</Button>
//             </div>

//             <button
//               className="md:hidden text-white/70 hover:text-white"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               aria-label="Toggle menu"
//             >
//               {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-slate-900/95 backdrop-blur-sm">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Link
//               href="#features"
//               className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Features
//             </Link>
//             <Link
//               href="#how-it-works"
//               className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               How It Works
//             </Link>
//             <Link
//               href="#pricing"
//               className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Pricing
//             </Link>
//             <Link
//               href="#docs"
//               className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Docs
//             </Link>
//             <div className="pt-4 pb-3 border-t border-white/10">
//               <div className="flex items-center px-5">
//                 <Button
//                   variant="ghost"
//                   className="w-full text-white/70 hover:text-white hover:bg-white/10"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Sign In
//                 </Button>
//               </div>
//               <div className="mt-3 px-5">
//                 <Button
//                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Get Started
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </header>
//   )
// }

