import { Router } from "express";
import locationsController from "./locations.controller";

const locationsRouter = Router();

locationsRouter.route("/").get(locationsController.getLocations);

export default locationsRouter;
