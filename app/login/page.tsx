"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Anchor, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "otp" | "newPassword">("email")
  const [forgotEmail, setForgotEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1500)
  }

  const handleForgotPasswordSubmit = async () => {
    if (forgotPasswordStep === "email") {
      // Simulate sending OTP
      setTimeout(() => {
        setForgotPasswordStep("otp")
      }, 1000)
    } else if (forgotPasswordStep === "otp") {
      // Simulate OTP verification
      if (otp === "123456") {
        setForgotPasswordStep("newPassword")
      } else {
        alert("Invalid OTP. Use 123456 for demo.")
      }
    } else if (forgotPasswordStep === "newPassword") {
      if (newPassword === confirmPassword && newPassword.length >= 6) {
        alert("Password reset successful!")
        setIsForgotPasswordOpen(false)
        setForgotPasswordStep("email")
        setForgotEmail("")
        setOtp("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Passwords don't match or are too short (min 6 characters)")
      }
    }
  }

  const resetForgotPassword = () => {
    setForgotPasswordStep("email")
    setForgotEmail("")
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/40 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your MarineTracker Pro account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="engineer@maritime.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="px-0 text-sm">
                  Contact Administrator
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {forgotPasswordStep !== "email" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (forgotPasswordStep === "otp") setForgotPasswordStep("email")
                      else if (forgotPasswordStep === "newPassword") setForgotPasswordStep("otp")
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                {forgotPasswordStep === "email" && "Reset Password"}
                {forgotPasswordStep === "otp" && "Verify OTP"}
                {forgotPasswordStep === "newPassword" && "Set New Password"}
              </DialogTitle>
              <DialogDescription>
                {forgotPasswordStep === "email" && "Enter your email address to receive a reset code"}
                {forgotPasswordStep === "otp" && "Enter the 6-digit code sent to your email"}
                {forgotPasswordStep === "newPassword" && "Create a new password for your account"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {forgotPasswordStep === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="engineer@maritime.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              )}

              {forgotPasswordStep === "otp" && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Code sent to {forgotEmail}. Use 123456 for demo.</p>
                </div>
              )}

              {forgotPasswordStep === "newPassword" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleForgotPasswordSubmit}>
                {forgotPasswordStep === "email" && "Send Code"}
                {forgotPasswordStep === "otp" && "Verify Code"}
                {forgotPasswordStep === "newPassword" && "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
