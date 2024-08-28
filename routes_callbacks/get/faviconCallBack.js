export function faviconCallBack(_req, resp) {
    resp.status(200).sendfile('./favicon.ico');
}