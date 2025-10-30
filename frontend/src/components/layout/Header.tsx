"use client";

import { useState } from "react";
import Link from "next/link";
import { Puzzle, LogOut, LogIn, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoginModal } from "@/components/auth/LoginModal";
import { SignupModal } from "@/components/auth/SignupModal";

const Header = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

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
              {isLoading
                ? "Loading..."
                : isAuthenticated && user
                ? `Welcome, ${user.username || user.email}!`
                : "Welcome!"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3 relative">
        {/* Auth Button - Login or User Dropdown */}
        {isAuthenticated ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.username || user?.email} />
                  <AvatarFallback className="bg-primary-600 text-white">
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoading}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => setShowLoginModal(true)}
            variant="ghost"
            className="text-accent-500 gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        )}
      </div>

      {/* Auth Modals */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </header>
  );
};

export default Header;
