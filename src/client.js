export function createClient(options = {}) {
  if (!options.url) throw new Error("createClient: options.url is required");
  return {
    url: options.url,
    auth: null,
    realtime: null,
    cells: null,
  };
}
