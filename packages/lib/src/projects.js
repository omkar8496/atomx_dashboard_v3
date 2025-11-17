export const projects = {
  livelink: {
    displayName: "LiveLink",
    tagline: "Real-time content orchestration"
  },
  tag_series: {
    displayName: "Tag Series",
    tagline: "Advanced analytics for IoT tags"
  }
};

export function getProjectCopy(key) {
  return (
    projects[key] ?? {
      displayName: "AtomX",
      tagline: "Unified operations"
    }
  );
}
