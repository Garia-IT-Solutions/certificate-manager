"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Shield, Lock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Step = "email" | "otp" | "newPassword" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetterAndNumber: false,
    hasSpecialChar: false,
  })

  const validatePassword = (password: string) => {
    const validation = {
      length: password.length >= 6,
      hasLetterAndNumber: /(?=.*[a-zA-Z])(?=.*\d)/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    setPasswordValidation(validation)
    return validation
  }

  const steps = [
    { id: "email", label: "Email", icon: Mail },
    { id: "otp", label: "Verify", icon: Shield },
    { id: "newPassword", label: "Password", icon: Lock },
    { id: "success", label: "Complete", icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("otp")
    }, 1500)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return

    setIsLoading(true)
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false)
      if (otp === "123456") {
        setCurrentStep("newPassword")
      } else {
        alert("Invalid OTP. Use 123456 for demo.")
      }
    }, 1000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) return

    if (newPassword !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    const validation = validatePassword(newPassword)
    const isPasswordValid = validation.length && validation.hasLetterAndNumber && validation.hasSpecialChar

    if (!isPasswordValid) {
      alert("Password does not meet all requirements")
      return
    }

    setIsLoading(true)
    // Simulate password reset
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("success")
    }, 1500)
  }

  const handleBackToLogin = () => {
    router.push("/")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="engineer@maritime.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
              <p className="text-sm text-muted-foreground">We'll send a verification code to this email address</p>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        )

      case "otp":
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-11 text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Code sent to {email}. Use <strong>123456</strong> for demo.
              </p>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => setCurrentStep("email")}>
              Resend Code
            </Button>
          </form>
        )

      case "newPassword":
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  validatePassword(e.target.value)
                }}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="text-sm space-y-2">
              <p className="font-medium">Password requirements:</p>
              <div className="space-y-1">
                <div
                  className={`flex items-center gap-2 text-xs ${passwordValidation.length ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${passwordValidation.length ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                  At least 6 characters long
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${passwordValidation.hasLetterAndNumber ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${passwordValidation.hasLetterAndNumber ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                  Contains both letters and numbers
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  />
                  Includes at least one special character
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        )

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Password Reset Successful!</h3>
              <p className="text-muted-foreground">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            <Button onClick={handleBackToLogin} className="w-full h-11">
              Back to Sign In
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 dark:text-white/80 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reset Your Password</h1>
            <p className="text-slate-600 dark:text-white/70">Follow the steps below to reset your password</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isUpcoming = index > currentStepIndex

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-white/10 border-white/30 text-white/50"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-medium ${isCompleted || isCurrent ? "text-slate-700 dark:text-white" : "text-slate-500 dark:text-white/50"}`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-300 dark:bg-white/20 -z-10">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/40 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>
              {currentStep === "email" && "Enter Your Email"}
              {currentStep === "otp" && "Verify Your Identity"}
              {currentStep === "newPassword" && "Create New Password"}
              {currentStep === "success" && "All Done!"}
            </CardTitle>
            <CardDescription>
              {currentStep === "email" && "We'll send you a verification code"}
              {currentStep === "otp" && "Enter the code sent to your email"}
              {currentStep === "newPassword" && "Choose a strong password"}
              {currentStep === "success" && "Your password has been reset"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
