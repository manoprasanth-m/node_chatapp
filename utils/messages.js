const generateMessage = (username,text) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {generateMessage, generateLocation}



