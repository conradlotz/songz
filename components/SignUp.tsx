import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SignUpProps {
  onSignUp: (email: string, password: string) => Promise<void>;
  message: string;
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, message }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    try {
      await onSignUp(data.email, data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Full Name"
          {...register("name", { // Changed from "name" to "email"
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters long"
            }
          })}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name?.message}</p>}
      </div>
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
      <div>
        <Input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword", { 
            required: "Please confirm your password",
            validate: (val: string) => {
              if (watch('password') != val) {
                return "Your passwords do not match";
              }
            }
          })}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignUp;