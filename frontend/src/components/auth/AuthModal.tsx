"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AuthUIProvider,
  AuthView,
  type AuthViewClassNames,
} from "@daveyplate/better-auth-ui";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const router = useRouter();

  const authViewClassNames: AuthViewClassNames = {
    header: "px-6 pt-6 pb-0",
    title: "text-xl text-foreground",
    description: "text-sm text-muted-foreground",
    content: "px-6 pb-6 pt-4 gap-6",
    separator: "bg-border",
    footer: "border-t border-border bg-muted/30 px-6 py-4",
    footerLink: "text-primary hover:text-primary/80",
    form: {
      input:
        "bg-background text-foreground placeholder:text-muted-foreground border border-border focus-visible:ring-primary/60 focus-visible:border-primary",
      primaryButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/70",
      secondaryButton:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary/60",
      outlineButton:
        "border border-border text-foreground hover:bg-muted/50 focus-visible:ring-muted/60",
      providerButton:
        "border border-border text-foreground hover:bg-muted/60 focus-visible:ring-primary/60",
      forgotPasswordLink: "text-primary hover:text-primary/80",
      error: "text-destructive",
    },
  };

  const handleAuthSuccess = () => {
    onClose();
    // Debounce router.refresh() to prevent multiple calls and potential errors
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] border-none bg-transparent p-0 shadow-none sm:rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account</DialogDescription>
        </DialogHeader>
        <AuthUIProvider authClient={authClient} onAuthSuccess={handleAuthSuccess}>
          <AuthView
            className="bg-card text-card-foreground border border-border shadow-lg rounded-[var(--radius-lg)]"
            classNames={authViewClassNames}
          />
        </AuthUIProvider>
      </DialogContent>
    </Dialog>
  );
}
