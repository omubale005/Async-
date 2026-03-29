import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";

const ToothIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m14 2 2 4c.462.923.692 1.384.623 1.838a2 2 0 0 1-1.353 1.62C14.735 9.624 14.12 9.4 12.89 8.95c-1.23-.45-1.845-.675-2.38-.517a2 2 0 0 0-1.353 1.62C9.088 10.507 9.32 10.968 9.78 11.89l2 4c.645 1.29 1.5 2.11 2.22 2.11s1.575-.82 2.22-2.11L18 12c1.332-2.664 2-3.996 2-5 0-3.314-2.686-6-6-6-1.5 0-3 1-3 1s-1.5-1-3-1c-3.314 0-6 2.686-6 6 0 1.004.668 2.336 2 5l1.78 3.56c.645 1.29 1.5 2.11 2.22 2.11s1.575-.82 2.22-2.11l2-4"/>
  </svg>
);

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Email Policy Check
      const role = user?.user_metadata?.role;
      const personalDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"];
      const emailDomain = email.split("@")[1]?.toLowerCase();

      if ((role === "admin" || role === "receptionist") && personalDomains.includes(emailDomain)) {
        await supabase.auth.signOut();
        setError(`Access Denied: ${role.charAt(0).toUpperCase() + role.slice(1)}s must use a professional clinic email, not a personal ${emailDomain} account.`);
        return;
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ToothIcon className="text-white w-7 h-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Async
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@dentalclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:ring-blue-600"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <p className="text-sm text-gray-500">
               Secure cloud-based management for Async.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
