export const REAL_CANVAS_ROUTES = Object.freeze({
  dashboard: "/",
  courses: "/courses",
  calendar: "/calendar",
  inbox: "/conversations"
});

export function resolveCanvasUrl(baseURL, route) {
  return new URL(route, baseURL).toString();
}
