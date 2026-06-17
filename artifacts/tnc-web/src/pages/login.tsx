import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { setUser } from "@/lib/auth";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  mobile: z.string().min(10, "Enter valid mobile number"),
  password: z.string().min(4, "Password required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: "", password: "" },
  });

  function onSubmit(values: FormData) {
    login.mutate(
      { data: { mobile: values.mobile, password: values.password } },
      {
        onSuccess: (user) => {
          setUser(user as { userId: string; name: string; mobile: string; email?: string | null; college?: string | null; state?: string | null; token: string });
          toast({ title: "Welcome back!", description: `Logged in as ${(user as { name: string }).name}` });
          setLocation("/");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid mobile number or password", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen tnc-hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 font-black text-white text-3xl shadow-lg">
            T
          </div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-white/70 text-sm mt-1">Login to continue your preparation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          type="tel"
                          placeholder="10-digit mobile number"
                          className="pl-9"
                          data-testid="input-mobile"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="pl-9"
                          data-testid="input-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full tnc-brand-gradient text-white font-semibold py-2.5 rounded-xl hover:opacity-90"
                disabled={login.isPending}
                data-testid="btn-login-submit"
              >
                {login.isPending ? "Logging in..." : (
                  <span className="flex items-center gap-2">Login <ArrowRight size={16} /></span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              New student?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline" data-testid="link-register">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
