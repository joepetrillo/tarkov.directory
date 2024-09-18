import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { DatabaseError } from "pg";

export class AuthError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error(error.message);

    if (error instanceof AuthError) {
      return error.message;
    }

    if (error instanceof DatabaseError) {
      if (
        error.code === "23505" &&
        error.constraint === "user_username_unique"
      ) {
        return "Username taken";
      }
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});
