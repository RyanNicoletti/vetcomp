import { Router } from "express";
import locationsController from "./locations.controller";

const locationsRouter = Router();

locationsRouter.get("/locations", locationsController.getLocations);

export default locationsRouter;
