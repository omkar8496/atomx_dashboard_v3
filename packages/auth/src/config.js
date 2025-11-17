export const authMatrix = {
  livelink: {
    audience: "livelink-users",
    loginRoute: "/login",
    cookieName: "livelink-token"
  },
  tag_series: {
    audience: "tag-series-admin",
    loginRoute: "/login",
    cookieName: "tag-series-token"
  }
};

export function getAuthConfig(app) {
  return authMatrix[app] ?? {
    audience: "public",
    loginRoute: "/login",
    cookieName: "atomx-token"
  };
}
