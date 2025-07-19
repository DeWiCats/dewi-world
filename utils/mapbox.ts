export const equalCoordinates = (a: GeoJSON.Position, b: GeoJSON.Position) => {
  return a[0] === b[0] && a[1] === b[1];
};
