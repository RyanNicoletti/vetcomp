const locationsService = {
  getLocation: async (query: string): Promise<string[]> => {
    const MAPBOX_API_KEY: string | undefined = process.env.MAPBOX_API_KEY;
    const url: string = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      query
    )}&proximity=ip&access_token=${MAPBOX_API_KEY}&limit=5`;
    const response = await fetch(url);
    const data: any = await response.json();
    const suggestions: string[] = data.features
      .filter((feature: any) => feature.properties.feature_type === "place")
      .map((feature: any) => {
        const city: string = feature.properties.name;
        const isUSLocation: boolean =
          feature.properties.context?.country?.name === "United States";
        if (isUSLocation) {
          const stateCode: string =
            feature.properties.context.region?.region_code;
          return `${city}, ${stateCode}`;
        } else {
          const countryCode: string =
            feature.properties.context.country &&
            feature.properties.context.country.country_code;
          return `${city}, ${countryCode?.toUpperCase()}`;
        }
      });
    return suggestions;
  },
};

export default locationsService;
