// Temporary type compatibility file
// This resolves type conflicts between old and new schema

import { z } from 'zod';
import { compatibleUserSchema } from '@/schemas/compatibleUserSchema';

// Export the new schema type for use in forms
export type FormUserSchema = z.infer<typeof compatibleUserSchema>;

// Re-export the schema
export { compatibleUserSchema as userSchema };
