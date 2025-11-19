"use client";

import { usePathname } from "next/navigation";
import { Puzzle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth, useUser, SignInButton, useClerk } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const Header = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <header className="w-full flex justify-between items-center px-4 sm:px-6 py-3 bg-primary-100 border-b-8 border-secondary-500">
      {/* Left Logo / App Name + Nav (desktop only) */}
      <div className="flex items-center gap-4 sm:gap-6">
        <SidebarTrigger className="md:hidden text-accent-700 hover:bg-primary-200" />
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-secondary-500">
            <Puzzle className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl text-accent-700">
              Ngam-je
            </span>
            <span className="text-xs sm:text-sm text-accent-500">
              {!isLoaded
                ? "Loading..."
                : isSignedIn && user
                ? `Welcome, ${user.username || user.primaryEmailAddress?.emailAddress}!`
                : "Welcome!"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3 relative">
        {/* Auth Button - Login or User Button */}
        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
            afterSignOutUrl="/threads"
          />
        ) : (
          <SignInButton mode="modal" forceRedirectUrl={pathname}>
            <Button variant="ghost" className="text-accent-500 gap-2">
              <LogIn className="w-5 h-5" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
};

export default Header;
