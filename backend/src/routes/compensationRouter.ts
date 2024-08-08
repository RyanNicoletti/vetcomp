import { Router } from "express";
import compensationController from "../controllers/compensationController";

const compensationRouter: Router = Router();

compensationRouter.route("/").get(compensationController.getAllSalaries);
compensationRouter.route("/").post(compensationController.addCompensation);

export default compensationRouter;
