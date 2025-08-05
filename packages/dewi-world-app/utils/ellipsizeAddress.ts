export default (address?: string | null, opts?: { chunkSize?: number }) => {
  if (!address) return '';
  const chunkSize = opts?.chunkSize || 8;
  return [address.slice(0, chunkSize), address.slice(-1 * chunkSize)].join('...');
};
