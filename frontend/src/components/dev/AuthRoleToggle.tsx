"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { User, UserCog, Shield } from "lucide-react";

/**
 * Next.js-style floating dev indicator for auth role switching
 * Hidden in production builds
 *
 * Minimal button in bottom-left corner (like Next.js dev indicator)
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
    { value: "poster", label: "Poster", icon: UserCog, color: "#3b82f6" },
    { value: "visitor", label: "Visitor", icon: User, color: "#6b7280" },
    { value: "moderator", label: "Moderator", icon: Shield, color: "#a855f7" },
  ] as const;

  const currentRoleData = roles.find(r => r.value === currentRole) || roles[1];
  const CurrentIcon = currentRoleData.icon;

  return (
    <div className="fixed bottom-3 left-3 z-[9999]">
      <div className="relative">
        {/* Next.js-style floating button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md shadow-lg transition-all duration-200 backdrop-blur-sm"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            border: `1.5px solid ${currentRoleData.color}`,
          }}
          title="Switch Auth Role (Dev Only)"
        >
          <CurrentIcon
            className="w-3.5 h-3.5"
            style={{ color: currentRoleData.color }}
          />
          <span>{currentRoleData.label}</span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setIsOpen(false)}
            />

            {/* Role selection menu */}
            <div
              className="absolute bottom-full left-0 mb-2 rounded-lg shadow-2xl overflow-hidden backdrop-blur-md"
              style={{
                background: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.6)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                Switch Auth Role
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
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: role.color }} />
                    <span className="font-medium">{role.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                        ●
                      </span>
                    )}
                  </button>
                );
              })}

              <div
                className="px-3 py-2 text-xs"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "rgba(255, 255, 255, 0.4)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="truncate">ID: {user?.id || "N/A"}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
