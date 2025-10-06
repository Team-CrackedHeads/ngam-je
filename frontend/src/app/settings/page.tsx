"use client";

import { Switch } from "@/components/ui/switch";
import { Bell, Shield, User, LogOut } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Responsive Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Settings */}
        <div
          className="rounded-2xl shadow p-4"
          style={{ backgroundColor: "#fff" }}
        >
          <h2 className="font-semibold mb-4 flex items-center space-x-2">
            <User size={18} />
            <span>Account</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Change Display Name</span>
              <button
                className="px-3 py-1 rounded-lg text-sm font-medium bg-secondary-500"
              >
                Update
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>Change Email</span>
              <button
                className="px-3 py-1 rounded-lg text-sm font-medium bg-secondary-500"
              >
                Update
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>Change Password</span>
              <button
                className="px-3 py-1 rounded-lg text-sm font-medium bg-secondary-500"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div
          className="rounded-2xl shadow p-4"
          style={{ backgroundColor: "#fff" }}
        >
          <h2 className="font-semibold mb-4 flex items-center space-x-2">
            <Bell size={18} />
            <span>Notifications</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Email Alerts</span>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <span>Push Notifications</span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div
          className="rounded-2xl shadow p-4"
          style={{ backgroundColor: "#fff" }}
        >
          <h2 className="font-semibold mb-4 flex items-center space-x-2">
            <Shield size={18} />
            <span>Privacy & Security</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Two-Factor Authentication</span>
              <Switch />
            </div>
            <div className="flex justify-between items-center">
              <span>Make Profile Private</span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div
          className="rounded-2xl shadow p-4 flex justify-between items-center md:col-span-2 lg:col-span-3"
          style={{ backgroundColor: "#fff" }}
        >
          <span className="font-semibold flex items-center space-x-2">
            <LogOut size={18} />
            <span>Log Out</span>
          </span>
          <button
            className="px-3 py-1 rounded-lg text-sm font-medium bg-secondary-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
