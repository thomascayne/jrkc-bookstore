import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * This function updates the relevant tables in the database after a user's email has been confirmed.
 *
 * @param user - The user object containing the user's information.
 * @returns {Promise<void>} - A promise that resolves when the tables are updated successfully, or rejects with an error.
 *
 * @throws Will throw an error if any of the database operations fail.
 *
 * @remarks
 * This function assumes that the `Profiles`, `UserRoles`, and `Users` tables exist in the database.
 * It inserts a new record into each table with the user's ID and email.
 * If any of the database operations fail, an error will be logged to the console.
 *
 * @example
 * ```typescript
 * import { User } from "@supabase/supabase-js";
 * import { updateAfterEmailConfirmation } from "./updateAfterEmailConfirmation";
 *
 * const user: User = {
 *   id: "user123",
 *   email: "user@example.com",
 *   //... other user properties
 * };
 *
 * updateAfterEmailConfirmation(user)
 *  .then(() => {
 *     console.log("Tables updated successfully");
 *   })
 *  .catch((error) => {
 *     console.error("Error updating tables:", error);
 *   });
 * ```
 */
export async function updateAfterEmailConfirmation(user: User) {
    const supabase = createClient();

    try {
        const { error: profileError } = await supabase
            .from("Profiles")
            .insert({ userId: user.id });

        if (profileError) {
            console.error("Error updating Profiles:", profileError);
        }

        // Add a default 'USER' role for the new record to the UserRoles table
        const { error: rolesError } = await supabase
            .from("UserRoles")
            .insert({ userId: user.id, role: "USER" });
        if (rolesError) {
            console.error("Error updating UserRoles:", rolesError);
        }

        const { error: usersError } = await supabase
            .from("Users")
            .insert({ id: user.id, email: user.email });

        if (usersError) {
            console.error("Error updating Users:", usersError);
        }

    } catch (error) {
        console.error("Error updating tables:", error);
        // Handle errors appropriately, e.g., return error response
    }
}
