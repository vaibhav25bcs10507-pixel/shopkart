const mongoose = require('mongoose');
const Product = require('../models/product.model');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Escape regex special characters so user input like "(" or "[" can't break the query
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /products
async function createProduct(req, res, next) {
  try {
    const { name, description, category, image } = req.body || {};
    let { price, stock } = req.body || {};

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(description) ||
      !isNonEmptyString(category) ||
      !isNonEmptyString(image) ||
      price === undefined || price === null || price === '' ||
      stock === undefined || stock === null || stock === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    price = Number(price);
    stock = Number(stock);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0'
      });
    }

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a whole number, 0 or more'
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      image: image.trim(),
      stock
    });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
}

// GET /products?search=&category=&sort=
async function getAllProducts(req, res, next) {
  try {
    const { search, category, sort } = req.query;

    if (
      (search !== undefined && typeof search !== 'string') ||
      (category !== undefined && typeof category !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'search and category must be plain text'
      });
    }

    if (sort !== undefined && sort !== '' && sort !== 'price_asc' && sort !== 'price_desc') {
      return res.status(400).json({
        success: false,
        message: 'sort must be price_asc or price_desc'
      });
    }

    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    if (category && category.trim()) {
      query.category = category.trim();
    }

    let productsQuery = Product.find(query).select(
      'name price category image stock'
    );

    if (sort === 'price_asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    }

    const products = await productsQuery;

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
}

// GET /products/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById
};
