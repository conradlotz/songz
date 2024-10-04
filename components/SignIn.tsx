import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, isAuthenticated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      await onSignIn(data.email, data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register("email", { 
              required: "Email is required", 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long"
              }
            })}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default SignIn;