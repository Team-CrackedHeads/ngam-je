"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthUIProvider, SignIn, SignUp } from "@daveyplate/better-auth-ui";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup";
};

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "signin",
}: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState(initialView);

  const handleAuthSuccess = () => {
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {view === "signin" ? "Sign in to your account" : "Create an account"}
          </DialogTitle>
          <DialogDescription>
            {view === "signin"
              ? "Enter your credentials below to access your account."
              : "Enter your details below to create a new account."}
          </DialogDescription>
        </DialogHeader>
        <AuthUIProvider authClient={authClient} onAuthSuccess={handleAuthSuccess}>
          {view === "signin" ? (
            <SignIn
              onSignUpClick={() => setView("signup")}
              onForgotPasswordClick={() => console.log("Forgot password")}
            />
          ) : (
            <SignUp onSignInClick={() => setView("signin")} />
          )}
        </AuthUIProvider>
      </DialogContent>
    </Dialog>
  );
}
