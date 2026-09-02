// 303 : le navigateur repasse en GET, y compris quand Monetico nous a renvoyés en POST.
const REDIRECT_STATUS = 303;

export function redirectTo(request: Request, pathname: string): Response {
  return Response.redirect(new URL(pathname, request.url), REDIRECT_STATUS);
}
