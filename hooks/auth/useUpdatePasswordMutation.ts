import { useMutation } from '@tanstack/react-query';

import { Auth } from '@/services/authService';

type UpdatePasswordPayload = App.Data.User.UpdatePasswordData;

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => Auth.updatePassword(payload),
  });
}
