export function createApiClient({ baseUrl, project }) {
  const endpoint = (path) => `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const shouldMock =
    process.env.MOCK_API !== "false" && baseUrl.includes("example.com");

  async function request(path, options = {}) {
    if (shouldMock) {
      return Promise.resolve({
        mocked: true,
        project,
        path,
        timestamp: new Date().toISOString()
      });
    }

    const url = endpoint(path);
    const result = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-atomx-project": project,
        ...(options.headers ?? {})
      }
    });

    if (!result.ok) {
      const text = await result.text();
      throw new Error(`Request failed (${result.status}): ${text}`);
    }

    if (result.status === 204) return null;
    return result.json();
  }

  return {
    get(path) {
      return request(path, { method: "GET" });
    },
    post(path, body) {
      return request(path, { method: "POST", body: JSON.stringify(body) });
    },
    health() {
      return request("health");
    }
  };
}
