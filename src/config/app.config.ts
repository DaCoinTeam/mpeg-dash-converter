export default () => {
    return {
        host: process.env.HOST,
        port :  process.env.PORT,
        appUrl: process.env.APP_URL
    }
}