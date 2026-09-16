import { Router } from "express";
import { 
    getUserByIdController, 
    upsertUserController,
    updateUserController,
    deleteUserController
} from "./users.controller";

export const userRouter = Router();

userRouter.get("/:id", getUserByIdController);
userRouter.post("/", upsertUserController);
userRouter.patch("/:id", updateUserController);
userRouter.delete("/:id", deleteUserController);
