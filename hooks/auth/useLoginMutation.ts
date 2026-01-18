import { useMutation } from '@tanstack/react-query';

import { Auth } from '@/services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => Auth.login(credentials),
  });
}
