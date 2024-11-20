exports.logger = (req, res, next) => {

    const originalJson = res.json;
    let responseBody;

    res.json = function (body) {
        responseBody = body;
        return originalJson.apply(this, arguments);
    };

    const start = Date.now();

    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${responseBody.message} - ${Date.now() - start}ms`);
    });

    next();
}