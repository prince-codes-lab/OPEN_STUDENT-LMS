"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Logo } from "@/components/logo"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const MenuIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )

  const XIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DD91D0]/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="transition-transform group-hover:scale-110">
              <Logo size="md" />
            </div>
            <div className="hidden md:block">
              <div className="text-[#4E0942] font-bold text-lg leading-tight">The OPEN Students</div>
              <div className="text-[#FF2768] text-xs font-medium">Beyond the Classroom</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#about" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              About
            </Link>
            <Link href="/programs" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Programs
            </Link>
            <Link href="/tours" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Tours
            </Link>
            <Link href="/community" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Community
            </Link>
            <Link href="/dashboard" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Dashboard
            </Link>
            <Button
              asChild
              className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/auth/sign-up">Join the Journey</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#4E0942]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in-up">
            <Link
              href="/#about"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/programs"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Programs
            </Link>
            <Link
              href="/tours"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/community"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link
              href="/dashboard"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Button
              asChild
              className="w-full bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/auth/sign-up">Join the Journey</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
