import { Router } from "express";
import usersController from "../controllers/usersController";

const usersRouter: Router = Router();

usersRouter.route("/").post(usersController.register);

export default usersRouter;
