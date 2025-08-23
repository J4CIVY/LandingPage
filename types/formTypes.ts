// Temporary type compatibility file
// This resolves type conflicts between old and new schema

import { z } from 'zod';
import { userSchema } from '../schemas/userSchema';

// Export the new schema type for use in forms
export type FormUserSchema = z.infer<typeof userSchema>;

// Re-export the schema
export { userSchema };
