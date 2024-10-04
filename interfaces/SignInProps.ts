export interface SignInProps {
    onSignIn: (email: string, password: string) => void;
    message: string;
  }