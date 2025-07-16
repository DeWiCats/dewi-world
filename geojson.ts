export default {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-74.0059, 40.7128],
      },
      properties: {
        title: "New York City",
        description: "The largest city in the United States",
        population: 8336817,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-70.0059, 30.7128],
      },
      properties: {
        title: "New York City",
        description: "The largest city in the United States",
        population: 8336817,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-118.2437, 34.0522],
      },
      properties: {
        title: "Los Angeles",
        description: "Major city in Southern California",
        population: 3898747,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [2.3522, 48.8566],
      },
      properties: {
        title: "Paris",
        description: "Capital city of France",
        population: 2161000,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [2.5522, 48.9566],
      },
      properties: {
        title: "Paris",
        description: "Capital city of France",
        population: 2161000,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [139.6917, 35.6895],
      },
      properties: {
        title: "Tokyo",
        description: "Capital city of Japan",
        population: 13960000,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-87.6298, 41.8781],
      },
      properties: {
        title: "Chicago",
        description: "Major city in the American Midwest",
        population: 2693976,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-0.1276, 51.5074],
      },
      properties: {
        title: "London",
        description: "Capital city of the United Kingdom",
        population: 8982000,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [151.2093, -33.8688],
      },
      properties: {
        title: "Sydney",
        description: "Largest city in Australia",
        population: 5312163,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
      properties: {
        title: "New Delhi",
        description: "Capital city of India",
        population: 28514000,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [55.2708, 25.2048],
      },
      properties: {
        title: "Dubai",
        description: "Major city in the United Arab Emirates",
        population: 3331420,
        category: "city",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-43.1729, -22.9068],
      },
      properties: {
        title: "Rio de Janeiro",
        description: "Major city in Brazil",
        population: 6748000,
        category: "city",
      },
    },
  ],
} as {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: GeoJSON.Geometry;
    properties: {
      title: string;
      description: string;
      population: number;
      category: string;
    };
  }[];
};
