'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Home,
  LogOut,
  Menu,
  Settings,
  Smile,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogout } from '@/hooks/use-logout';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/home/mood', label: 'Mood', icon: Smile },
  { href: '/home/journal', label: 'Journal', icon: BookOpen },
  { href: '/home/activities', label: 'Activities', icon: Activity },
  { href: '/home/profile', label: 'Profile', icon: UserIcon },
];

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { handleLogout } = useLogout();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const isTopLevelPage = navItems.some((item) => item.href === pathname);

  const NavLinks = ({ className, onLinkClick }: { className?: string; onLinkClick?: () => void }) => (
    <nav className={cn('grid items-start gap-2 text-lg font-medium', className)}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/home' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all hover:text-primary text-base',
              { 'bg-muted text-primary': isActive }
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Logo />
            <p>Loading...</p>
          </div>
        </div>
    )
  }
  
  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/home" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="flex-1">
            <NavLinks className="px-2 lg:px-4"/>
          </div>
          <div className="mt-auto p-4">
             {/* Can add a card or other component here */}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="relative flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {isTopLevelPage ? (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-[260px]">
                 <SheetHeader>
                   <SheetTitle>
                     <Link
                      href="/home"
                      className="flex items-center gap-2 font-semibold border-b pb-4 mb-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Logo />
                       <span className="sr-only">MindBloom Home</span>
                    </Link>
                   </SheetTitle>
                   <SheetDescription className="sr-only">
                     A list of navigation links to browse the application.
                   </SheetDescription>
                </SheetHeader>
                <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="outline" size="icon" className="shrink-0" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <Link href="/home" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
          </div>
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="border">
                  <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt={user.displayName || "User"} data-ai-hint="profile" />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/home/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/home/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
