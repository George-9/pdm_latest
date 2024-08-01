export class NetTool {
    static MAIN_URL_PREFIX = '';

    static CMMN_HEADERS = {
        JSON_CONTENT_TYPE: 'application/json',
        MULTIPART_FORM_DATA_CONTENT_TYPE: 'mutipart/form-data'
    }

    /**
     * 
     * @param {The endpoint to fetch from} urlEndPoint 
     * @param {Required} contentType the content type of the requests body
     * @param {*} body the body of the request
     * @returns A promise request object
     */
    static POST_CLIENT = (urlEndPoint, contentType, body) => {
        if (urlEndPoint.trim().length < 0) {
            throw new BadUrlEndPointFormat('Empty Endpoint for the quest')
        }

        if (!urlEndPoint.startsWith('/')) {
            throw new BadUrlEndPointFormat('Url End point should start with \'/\'')
        }

        if (!contentType) {
            throw new Error('Enter header type from CMMN_HADERS')
        }

        if (!body) {
            throw new Error('Enter body for the request')
        }

        return fetch(this.MAIN_URL_PREFIX + urlEndPoint, {
            method: 'POST',
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': contentType,
            },
            'body': body,
        })
    }
}

class BadUrlEndPointFormat extends Error {
    constructor(errorMessege) {
        super(errorMessege ?? 'BAD URL FORMAT');
    }
}
