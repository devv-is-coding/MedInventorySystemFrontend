"use client"; // Marks this component to be rendered on the client side (Next.js feature)

import React, { useEffect, useState } from "react";
import { myAppHook } from "@/context/AppContext"; // Custom app hook for authentication logic
import { useRouter } from "next/navigation"; // Router for programmatic navigation
import { Lock, User, Eye, EyeOff, Activity } from 'lucide-react'; // Icon components

// Define the shape of the form data for login
interface formData {
    username: string;
    password: string;
}

const Auth: React.FC = () => {
    // Initialize state for form inputs
    const [formdata, setFormData] = useState<formData>({
        username: "",
        password: ""
    });

    // Toggle state to show/hide password
    const [showPassword, setShowPassword] = useState(false);

    // Get router instance for navigation
    const router = useRouter();

    // Extract login function and auth status from global context
    const { login, isAuthenticated, isLoading } = myAppHook();
    
    // Redirect to dashboard if the user is already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log("User authenticated, redirecting to dashboard");
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    // Handles input change and updates form state
    const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formdata,
            [event.target.name]: event.target.value
        });
    }

    // Handles form submission logic
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent page reload
        
        // Debug log with masked password
        console.log("Form submitted with data:", { 
            username: formdata.username, 
            password: formdata.password ? '***' : 'empty' 
        });

        // Validate inputs
        if (!formdata.username || !formdata.password) {
            console.error("Username or password is empty");
            return;
        }

        try {
            // Attempt login with form data
            const success = await login(formdata.username, formdata.password);
            console.log("Login result:", success);
            
            // Handle post-login logic
            if (success) {
                console.log("Login successful, should redirect to dashboard");
            } else {
                console.log("Login failed");
            }
        } catch (error) {
            console.error(`Authentication error:`, error);
        }
    }

    // JSX for login UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Branding Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Medical Inventory</h2>
                    <p className="mt-2 text-sm text-gray-600">Admin Access Portal</p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleFormSubmit}>
                    <div className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formdata.username}
                                    onChange={handleOnChangeInput}
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter username"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Field with Toggle */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'} // Toggle between password and text
                                    value={formdata.password}
                                    onChange={handleOnChangeInput}
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)} // Show/hide password toggle
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !formdata.username || !formdata.password}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                // Loading spinner if logging in
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>

                    {/* Demo Info (optional) */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Demo credentials: admin / admin123
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Auth;
