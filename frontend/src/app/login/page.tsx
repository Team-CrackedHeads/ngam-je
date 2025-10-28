"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_USERS } from "@/utils/mock-all-data-used";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simple mock login - find user by email
      const user = MOCK_USERS.find((u) => u.email === email);

      if (!user) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // Store current platform user (for listings ownership)
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Also login to auth system
      await login({ email, username: user.name });

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError("Login failed");
      setLoading(false);
    }
  };

  const quickLogin = async (userId: string) => {
    setLoading(true);
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      // Store current platform user (for listings ownership)
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Also login to auth system
      await login({ email: user.email, username: user.name });

      // Redirect to home
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-accent-700 mb-2">
          NGAM-JE
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign in to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">
            Quick Login (Demo)
          </p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin("user-1")}
              disabled={loading}
              className="w-full bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Fitri"}
            </button>
            <button
              onClick={() => quickLogin("user-2")}
              disabled={loading}
              className="w-full bg-accent-100 hover:bg-accent-200 text-accent-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Sani"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo Credentials:</p>
          <p className="mt-1">
            <strong>Fitri:</strong> fitri@example.com
          </p>
          <p>
            <strong>Sani:</strong> sani@example.com
          </p>
          <p className="mt-2 text-xs">Can use any password</p>
        </div>
      </div>
    </div>
  );
}
