const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse form data
    let body;
    if (event.headers['content-type']?.includes('application/json')) {
      body = JSON.parse(event.body);
    } else {
      // Parse URL-encoded form data
      const formData = new URLSearchParams(event.body);
      body = Object.fromEntries(formData);
    }

    const { name, email } = body;

    if (!name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Name and email are required' 
        }),
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Please enter a valid email address' 
        }),
      };
    }

    // Create signup data
    const signupData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: body.company || '',
      platform: body.platform || '',
      monthlyOrders: body.monthlyOrders || '',
      returnRate: body.returnRate || '',
      categories: body.categories || '',
      timestamp: new Date().toISOString()
    };

    // For Netlify, we'll use a simple in-memory storage or external service
    // Since we can't write files in serverless functions, we'll just log and return success
    console.log('New beta signup:', signupData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Thank you for signing up! We\'ll keep you updated.' 
      }),
    };

  } catch (error) {
    console.error('Error processing beta signup:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'An error occurred. Please try again.' 
      }),
    };
  }
};