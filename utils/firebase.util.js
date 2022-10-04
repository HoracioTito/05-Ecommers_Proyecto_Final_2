/************************
 *  Firebase : Storage  *
 ************************/

const { initializeApp } = require("firebase/app");

const {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} = require("firebase/storage");

// Model Table
const { ProductImg } = require("../models/productsImgs.model");

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

/* Configuration Firebase */
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    appId: process.env.FIREBASE_APP_ID,
};

/* Inizilize FireBase  */
const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);

const uploadProductsImgs = async (imgs, productId) => {
    // Map async -> Async operations with arrays
    const imgsPromises = imgs.map(async (img) => {
        // Create firebase reference
        const [originalName, ext] = img.originalname.split("."); // -> [pug, jpg]

        const filename = `product_img/${productId}/${originalName}-${Date.now()}.${ext}`;
        const imgRef = ref(storage, filename);

        // Upload image to Firebase
        const result = await uploadBytes(imgRef, img.buffer);

        await ProductImg.create({
            productId,
            imgUrl: result.metadata.fullPath,
        });
    });

    /* Create register UrlImg  : ProductImg.create    */
    await Promise.all(imgsPromises);
};

const getProductsImgsUrls = async (products) => {
    // Loop through products to get to the productImgs
    const productsWithImgsPromises = products.map(async (product) => {
        // Get imgs URLs
        const productstImgsPromises = product.productImgs.map(
            async (productImg) => {
                const imgRef = ref(storage, productImg.imgUrl);
                const imgUrl = await getDownloadURL(imgRef);

                productImg.imgUrl = imgUrl;
                return productImg;
            }
        );

        /*****************
         *  Promise.all  *
         *****************/
        // Resolve imgs urls
        const productImgs = await Promise.all(productstImgsPromises);

        // Update old productImgs array with new array
        product.productImgs = productImgs;

        return product;
    });

    return await Promise.all(productsWithImgsPromises);
};

module.exports = { storage, uploadProductsImgs, getProductsImgsUrls };
