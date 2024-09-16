import { Request, Response } from "express";
import locationService from "../services/locationsService";
import { asyncHandler } from "../middleware/asyncHandler";
import { BadRequestError } from "../errors/httpErrors";

const getLocations = asyncHandler(async (req: Request, res: Response) => {
  if (typeof req.query.q === "string") {
    const query: string = req.query.q;
    const locationSuggestions: string[] = await locationService.getLocation(
      query
    );
    res.json(locationSuggestions);
  } else {
    new BadRequestError("Invalid location, please enter a valid city.");
  }
});

export default { getLocations };
