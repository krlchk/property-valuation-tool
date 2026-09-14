import type { Request, Response } from "express";
import {
  getNormalizedAddress,
  IncompleteAddressError,
  PlaceNotFoundError,
  reverseGeocode,
  searchAddresses,
} from "./address.service";

export const searchAddressesController = async (req: Request, res: Response) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";

  try {
    const results = await searchAddresses(query);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Failed to search addresses:", error);
    return res.status(500).json({
      error: "Failed to search addresses",
    });
  }
};

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

export const reverseGeocodeController = async (req: Request, res: Response) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);

  const isValidCoordinates =
    typeof req.query.lat === "string" &&
    typeof req.query.lng === "string" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= MIN_LATITUDE &&
    latitude <= MAX_LATITUDE &&
    longitude >= MIN_LONGITUDE &&
    longitude <= MAX_LONGITUDE;

  if (!isValidCoordinates) {
    return res.status(400).json({ error: "Invalid latitude/longitude" });
  }

  try {
    const address = await reverseGeocode(latitude, longitude);
    return res.status(200).json(address);
  } catch (error) {
    if (error instanceof PlaceNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof IncompleteAddressError) {
      return res.status(422).json({ error: error.message });
    }
    console.error("Failed to reverse geocode location:", error);
    return res.status(500).json({
      error: "Failed to reverse geocode location",
    });
  }
};

export const getAddressDetailsController = async (req: Request, res: Response) => {
  const placeId = typeof req.params.placeId === "string" ? req.params.placeId : "";

  if (!placeId) {
    return res.status(400).json({ error: "Missing placeId" });
  }

  try {
    const address = await getNormalizedAddress(placeId);
    return res.status(200).json(address);
  } catch (error) {
    if (error instanceof PlaceNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof IncompleteAddressError) {
      return res.status(422).json({ error: error.message });
    }
    console.error("Failed to fetch place details:", error);
    return res.status(500).json({
      error: "Failed to fetch place details",
    });
  }
};
