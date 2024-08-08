import { Router } from "express";
import locationsController from "../controllers/locationsController";

const locationsRouter: Router = Router();

locationsRouter.route("/").get(locationsController.getLocations);

export default locationsRouter;
