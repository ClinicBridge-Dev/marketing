"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/common/Button"

interface NavigationItem {
  name: string
  href: string
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  navigation: NavigationItem[]
}

export function MobileNav({ open, onClose, navigation }: MobileNavProps) {
  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (open) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className="fixed right-0 top-0 h-screen w-80 bg-white shadow-xl flex flex-col overflow-hidden"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">메뉴</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="block text-lg font-medium text-gray-900 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* CTA */}
        <div className="p-6 pb-8 border-t">
          <Button asChild variant="gradient" className="w-full">
            <Link href="/inquiry" data-meta-placement="mobile_nav" onClick={onClose}>
              문의하기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
