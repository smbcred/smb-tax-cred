import {  Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">
              Registration via Stripe
            </CardTitle>
            <CardDescription>
              Complete your purchase to automatically create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Use Our Calculator</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get your R&D tax credit estimate and see potential savings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Complete Your Purchase</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your service tier and complete payment through Stripe.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Account Created Automatically</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is created instantly upon successful payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Secure & Instant
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Registration is handled securely through our payment system. 
                    You'll receive login credentials immediately after purchase.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Get Started with Calculator
                </Button>
              </Link>
              
              <Link href="/pricing" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  View Pricing Options
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;