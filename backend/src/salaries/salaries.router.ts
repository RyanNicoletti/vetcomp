import { Router } from "express";
import salariesController from "./salaries.controller";

const salariesRouter = Router();

salariesRouter.route("/").get(salariesController.getAllSalaries);

export default salariesRouter;
