const express = require('express');
const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();
const cors = require('cors');

const app = express();
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Home route with API documentation
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Sneaks API",
        availableEndpoints: {
            getProducts: "/sneakers?q=KEYWORD&limit=NUMBER",
            getProductPrices: "/sneaker-prices?id=STYLEID",
            getMostPopular: "/most-popular?limit=NUMBER"
        },
        example: {
            searchProducts: "/sneakers?q=Yeezy%20Cinder&limit=10",
            getPrice: "/sneaker-prices?id=FY2903",
            popular: "/most-popular?limit=10"
        }
    });
});

// Route to fetch sneakers by keyword
app.get('/sneakers', (req, res) => {
    const keyword = req.query.q || "Yeezy";
    const limit = parseInt(req.query.limit) || 10;

    console.log(`Searching for sneakers with keyword: "${keyword}", limit: ${limit}`);

    sneaks.getProducts(keyword, limit, (err, products) => {
        if (err) {
            console.error('Error fetching sneakers:', err);
            return res.status(500).json({ 
                error: "Error fetching sneakers",
                details: err.message
            });
        }
        console.log(`Found ${products ? products.length : 0} products`);
        res.json(products);
    });
});

// Route to fetch sneaker prices by styleID
app.get('/sneaker-prices', (req, res) => {
    const styleID = req.query.id;
    if (!styleID) {
        console.log('Request missing styleID');
        return res.status(400).json({ error: "Missing styleID" });
    }

    console.log(`Fetching prices for styleID: ${styleID}`);

    sneaks.getProductPrices(styleID, (err, product) => {
        if (err) {
            console.error('Error fetching sneaker prices:', err);
            return res.status(500).json({ 
                error: "Error fetching sneaker prices",
                details: err.message
            });
        }
        console.log('Successfully fetched price data');
        res.json(product);
    });
});

// Route to get most popular sneakers
app.get('/most-popular', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    console.log(`Fetching most popular sneakers, limit: ${limit}`);

    sneaks.getMostPopular(limit, (err, products) => {
        if (err) {
            console.error('Error fetching popular sneakers:', err);
            return res.status(500).json({ 
                error: "Error fetching popular sneakers",
                details: err.message
            });
        }
        console.log(`Found ${products ? products.length : 0} popular products`);
        res.json(products);
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.url}`,
        availableRoutes: [
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/sneakers?q=KEYWORD&limit=NUMBER' },
            { method: 'GET', path: '/sneaker-prices?id=STYLEID' },
            { method: 'GET', path: '/most-popular?limit=NUMBER' }
        ]
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('  GET / - API documentation');
    console.log('  GET /sneakers?q=KEYWORD&limit=NUMBER');
    console.log('  GET /sneaker-prices?id=STYLEID');
    console.log('  GET /most-popular?limit=NUMBER');
});