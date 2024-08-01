function homeCallback(req, resp) {
    resp.json({ 'response': 'sent' })
}

module.exports = { homeCallback }