import { Request, Response } from "express";
import locationService from "./locations.service";

const getLocations = async (req: Request, res: Response) => {
  try {
    if (typeof req.query.q === "string") {
      const query: string = req.query.q;
      const locationSuggestions: string[] = await locationService.getLocation(
        query
      );
      res.json(locationSuggestions);
    } else {
      res.status(400).send("Invalid location, please enter a valid city.");
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).send("Server error, please try again later.");
  }
};

export default { getLocations };
