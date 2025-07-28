import { z } from 'zod';
import { userSchema } from '@/schemas/userSchema';

export type IFormInput = z.infer<typeof userSchema>;
