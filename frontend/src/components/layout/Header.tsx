import Link from "next/link";
import { User, Puzzle, Bell, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { placeholderActivities } from "@/utils/mock-activity-data";
import AuthModal from "@/components/auth/AuthModal";
import { useState } from "react";

type HeaderProps = {
  notifications?: number;
};

const Header = ({ notifications = 0 }: HeaderProps) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"signin" | "signup">("signin");

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/"); // Redirect to home after logout
    router.refresh();
  };

  const openAuthModal = (view: "signin" | "signup") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const recentActivities = placeholderActivities.slice(0, 10);

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
              {isPending
                ? "Loading..."
                : session
                ? `Welcome, ${session.user.name || session.user.email}!`
                : "Welcome!"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3 relative">
        {/* Notifications Dropdown */}
        {session && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-accent-500"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-bold bg-error-500 text-white">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Recent Activity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentActivities.map((activity, index) => (
                <DropdownMenuItem key={index}>
                  <div className="flex flex-col">
                    <span className="font-medium">{activity.message}</span>
                    <span className="text-xs text-accent-500">
                      {activity.date}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/activity" className="justify-center">
                  View all activity
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Auth Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            {isPending ? (
              <Button variant="ghost" size="icon" className="text-accent-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-500"></div>
              </Button>
            ) : session ? (
              <Button variant="ghost" size="icon" className="text-accent-500">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            ) : (
              <Button variant="ghost" className="text-accent-500">
                <LogIn className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Login / Sign Up
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {session ? (
              <>
                <DropdownMenuLabel>
                  {session.user.name || session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => openAuthModal("signin")}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuthModal("signup")}>
                  <User className="w-4 h-4 mr-2" />
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </header>
  );
};

export default Header;

