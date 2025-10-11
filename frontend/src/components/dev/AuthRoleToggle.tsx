"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { User, UserCog, Shield, ChevronDown } from "lucide-react";

/**
 * Dev-only component for quickly switching user roles
 * Hidden in production builds
 *
 * Shows in bottom-right corner with current role and dropdown to switch
 */
export function AuthRoleToggle() {
  const { user, setMockRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Only show if setMockRole is available (mock auth)
  if (!setMockRole) {
    return null;
  }

  const currentRole = user?.isAuthenticated
    ? user.username.includes("Poster")
      ? "poster"
      : user.username.includes("Moderator")
      ? "moderator"
      : "visitor"
    : "visitor";

  const roles = [
    { value: "poster", label: "Poster", icon: UserCog, color: "text-blue-600" },
    { value: "visitor", label: "Visitor", icon: User, color: "text-gray-600" },
    { value: "moderator", label: "Moderator", icon: Shield, color: "text-purple-600" },
  ] as const;

  const currentRoleData = roles.find(r => r.value === currentRole) || roles[1];
  const CurrentIcon = currentRoleData.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Current role button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all"
        >
          <CurrentIcon className={`w-4 h-4 ${currentRoleData.color}`} />
          <span className="text-sm font-medium">{currentRoleData.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Role dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-card border-2 border-border rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 bg-secondary-subtle border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dev Mode: Switch Role
                </p>
              </div>

              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = role.value === currentRole;

                return (
                  <button
                    key={role.value}
                    onClick={() => {
                      setMockRole(role.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary-subtle transition-colors ${
                      isActive ? "bg-secondary-subtle" : ""
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${role.color}`} />
                    <span className="text-sm font-medium">{role.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs text-muted-foreground">Active</span>
                    )}
                  </button>
                );
              })}

              <div className="px-3 py-2 bg-secondary-subtle/50 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  User: {user?.username || "None"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {user?.id || "N/A"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
