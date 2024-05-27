const locationsService = {
  getLocation: async (query: string) => {
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_API_KEY}&limit=5`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch locations from Mapbox API.");
    }

    const data: any = await response.json();
    const suggestions = data.features.map((feature: any) => {
      const [city, countryOrState] = feature.place_name.split(",");
      return `${city.trim()}, ${countryOrState.trim().slice(-2)}`;
    });

    return suggestions;
  },
};

export default locationsService;
