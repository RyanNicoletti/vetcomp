import { Request, Response } from "express";
import locationService from "./locations.service";

const getLocations = async (req: Request, res: Response) => {
  try {
    if (typeof req.query.q === "string") {
      console.log("got to controller: ", req);
      const query = req.query.q;
      const locations = await locationService.getLocation(query);
      res.json(locations);
    } else {
      console.log("req.query.q is not a string error");
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).send("Server error");
  }
};

export default { getLocations };
