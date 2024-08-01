function homeCallback(req, resp) {
    resp.redirect('parish/index')
}

module.exports = { homeCallback }