import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { setUser } from "@/lib/auth";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { User, Phone, Lock, GraduationCap, MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Full name required"),
  mobile: z.string().min(10, "Enter valid mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().optional(),
  college: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", password: "", email: "", college: "", state: "", city: "", gender: "" },
  });

  function onSubmit(values: FormData) {
    register.mutate(
      {
        data: {
          name: values.name,
          mobile: values.mobile,
          password: values.password,
          email: values.email,
          college: values.college,
          state: values.state,
          city: values.city,
          gender: values.gender,
        },
      },
      {
        onSuccess: (user) => {
          setUser(user as { userId: string; name: string; mobile: string; email?: string | null; college?: string | null; state?: string | null; token: string });
          toast({ title: "Account created!", description: `Welcome to TNC, ${(user as { name: string }).name}!` });
          setLocation("/");
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? "";
          if (msg.includes("409") || msg.toLowerCase().includes("already")) {
            toast({ title: "Already registered", description: "This mobile number is already registered. Please login.", variant: "destructive" });
          } else {
            toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
          }
        },
      }
    );
  }

  return (
    <div className="min-h-screen tnc-hero-gradient flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 font-black text-white text-2xl shadow-lg">T</div>
          <h1 className="text-2xl font-black text-white">Create Account</h1>
          <p className="text-white/70 text-sm mt-1">Join thousands of nursing aspirants</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-sm font-semibold">Full Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input {...field} placeholder="Your full name" className="pl-9" data-testid="input-name" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Mobile *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input {...field} type="tel" placeholder="10-digit number" className="pl-9" data-testid="input-mobile" />
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
                      <FormLabel className="text-sm font-semibold">Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input {...field} type="password" placeholder="Min 6 characters" className="pl-9" data-testid="input-password" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Optional" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">College/Institution</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input {...field} placeholder="Your college" className="pl-9" data-testid="input-college" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">State</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">City</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input {...field} placeholder="Your city" className="pl-9" data-testid="input-city" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full tnc-brand-gradient text-white font-semibold py-2.5 rounded-xl hover:opacity-90 mt-2"
                disabled={register.isPending}
                data-testid="btn-register-submit"
              >
                {register.isPending ? "Creating account..." : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline" data-testid="link-login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
