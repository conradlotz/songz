export interface SignUpProps {
    onSignUp: (name: string, email: string, password: string) => void;
    message: string;
  }