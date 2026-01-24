import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
    const { toast } = useToast();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: 'Please enter your email',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Use Supabase's built-in password reset (handles email sending automatically)
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            toast({
                title: 'Email sent!',
                description: 'Check your email for password reset instructions.',
            });

            setEmailSent(true);
        } catch (error) {
            console.error('Password reset error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send reset email',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-2xl p-8 shadow-elevated">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-display text-2xl font-semibold text-primary">
                                9 Planet Impex
                            </span>
                        </Link>
                        <h1 className="font-display text-2xl font-semibold text-foreground">
                            Reset Password
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {emailSent ? 'Check your email for reset link' : 'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    {emailSent ? (
                        // Success state
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-3">
                                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                    Email sent successfully!
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    We've sent a password reset link to {email}. The link expires in 30 minutes.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Check your spam folder if you don't see the email within a few minutes.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setEmailSent(false)}
                                >
                                    Send another email
                                </Button>
                                <Link to="/login" className="block">
                                    <Button variant="gold" className="w-full">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Form state
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Enter the email address associated with your account.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                variant="gold"
                                size="lg"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-card text-muted-foreground">or</span>
                                </div>
                            </div>

                            <Link to="/login" className="block">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to login
                                </Button>
                            </Link>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
