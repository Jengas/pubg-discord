module.exports = async (client, message) => {
    const logger = client.logger;

    logger.error(`ERROR OCCURED: ${message}`)
};
