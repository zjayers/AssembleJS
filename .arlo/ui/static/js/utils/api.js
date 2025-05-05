/**
 * API utilities for making requests
 */

/**
 * Make an API request with standardized error handling
 *
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} [data] - Request body data (for POST/PUT)
 * @param {Object} [options] - Additional fetch options
 * @return {Promise<Object>} API response data
 */
export async function makeRequest(
  url,
  method = "GET",
  data = null,
  options = {}
) {
  try {
    const fetchOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      credentials: "same-origin",
      ...options,
    };

    // Add body data for POST/PUT requests
    if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Make the request
    const response = await fetch(url, fetchOptions);

    // Parse response data
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Check for error responses
    if (!response.ok) {
      // Create a structured error object
      const error = new Error(responseData.message || "API request failed");
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    // Log the error and rethrow
    console.error("API request error:", error);
    throw error;
  }
}

/**
 * Upload a file to the API
 *
 * @param {string} url - API endpoint URL
 * @param {FormData} formData - Form data containing files
 * @param {Object} [options] - Additional options
 * @return {Promise<Object>} API response data
 */
export async function uploadFile(url, formData, options = {}) {
  try {
    const fetchOptions = {
      method: "POST",
      credentials: "same-origin",
      // No Content-Type header for multipart/form-data
      ...options,
      body: formData,
    };

    const response = await fetch(url, fetchOptions);

    // Parse response
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const error = new Error(responseData.message || "File upload failed");
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Make a paginated API request with automatic pagination handling
 *
 * @param {string} url - API endpoint URL
 * @param {Object} [params] - Query parameters
 * @param {Object} [options] - Additional options
 * @return {Promise<Object[]>} All items from paginated endpoint
 */
export async function fetchAllPages(url, params = {}, options = {}) {
  const allItems = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const pageUrl = new URL(url, window.location.origin);

    // Add page parameters
    pageUrl.searchParams.append("page", currentPage);
    pageUrl.searchParams.append("limit", params.limit || 50);

    // Add other query params
    Object.entries(params).forEach(([key, value]) => {
      if (key !== "limit") {
        pageUrl.searchParams.append(key, value);
      }
    });

    const response = await makeRequest(
      pageUrl.toString(),
      "GET",
      null,
      options
    );

    // Add items from current page
    // Handle different API response formats
    if (response.data && Array.isArray(response.data)) {
      allItems.push(...response.data);
    } else if (Array.isArray(response)) {
      allItems.push(...response);
    } else if (response.items && Array.isArray(response.items)) {
      allItems.push(...response.items);
    }

    // Check if there are more pages with various pagination formats
    hasMore =
      response.hasMore ||
      response.hasNextPage ||
      (response.pagination && response.pagination.hasMore) ||
      (response.meta && response.meta.hasMore) ||
      false;
    currentPage++;

    // Safety check to prevent infinite loops
    if (currentPage > 100) {
      console.warn("Pagination safety limit reached (100 pages)");
      break;
    }
  }

  return allItems;
}
