import { Router } from "express";
import loginController from "../controllers/loginController";

const loginRouter: Router = Router();

loginRouter.route("/").post(loginController.login);

export default loginRouter;
