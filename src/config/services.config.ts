export default () => {
    return {
        assetsManager: {
            host: process.env.SERVICE_ASSETS_MANAGER_HOST,
            port: process.env.SERVICE_ASSETS_MANAGER_PORT
        }
    }
}