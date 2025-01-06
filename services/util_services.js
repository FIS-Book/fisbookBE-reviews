var axios = require('axios');
require('dotenv').config();


const BASE_URL = process.env.BASE_URL;
const USER_SERVICE_URL = BASE_URL + process.env.MS_USERS_URL;
const CATALOGUE_SERVICE_URL = BASE_URL + process.env.MS_CATALOGUE_URL;
const READING_LIST_SERVICE_URL = BASE_URL + process.env.MS_READING_LIST_URL;

const axiosInstance = axios.create({
  timeout: 5000 // Timeout de 5 segundos
});

// Auxiliar functions 
async function getUserInfo(userID, token) {
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${USER_SERVICE_URL}/users/${userID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching user info for userID ${userID}`, err);
    return null;
  }
}

async function getBookTitle(ISBN,token) {
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${CATALOGUE_SERVICE_URL}/isbn/${ISBN}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.title;
  } catch (err) {
    console.error(`Error fetching book info for book with ISBN: ${ISBN}`, err);
    return null;
  }
}

async function getReadingListTitle(genreID,token){
  // #swagger.ignore = true
  try {
    const response = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/genres?genreId=${genreID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.title;
  } catch (err) {
    console.error(`Error fetching reading list info for reading list with ID: ${genreID}`, err);
    return null;
  }
}

async function updateBookScore(ISBN,token,score,method) {
  // #swagger.ignore = true
  try {
    let book = await axiosInstance.get(`${CATALOGUE_SERVICE_URL}/ISBN/${ISBN}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    let new_nreviews;
    let new_score;
    if(method == 'post'){
      let old_nreviews = book.data.totalReviews;
      let old_score = book.data.totalRating;
      new_nreviews = old_nreviews + 1;
      new_score = (old_score * old_nreviews + score) / new_nreviews;
    }else if(method == 'put'){
      let old_score = book.data.totalRating;
      new_nreviews = book.data.totalReviews;
      let diff = score - old_score;
      new_score = (old_score * old_nreviews + diff) / new_nreviews;
    }else if (method == 'delete'){
      let old_nreviews = book.data.totalReviews;
      let old_score = book.data.totalRating;
      new_nreviews = old_nreviews - 1;
      if (new_nreviews === 0) {
        new_score = 0;
      } else {
        new_score = (old_score * old_nreviews - score) / new_nreviews;
      }
    }else{
      console.error("Method not supported");
      return null
    }
    
    try {
      const response = await axiosInstance.patch(`${CATALOGUE_SERVICE_URL}/${ISBN}/review`, {
        // #swagger.ignore = true
        "totalRating": new_score,
        "totalReviews": new_nreviews
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.title;
    } catch (err) {
      console.error(`Error updating book info for book with ISBN: ${ISBN}`, err);
      return null;
    }
  } catch (err) {
    console.error(`Error fetching book info for book with ISBN: ${ISBN}`, err);
    return null;
  }
}


async function updateReadingListScore(genreID,token,score,method) {
  // #swagger.ignore = true
  try {
    let readingList = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/genres?genreId=${genreID}`, {
      // #swagger.ignore = true
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    let new_nreviews;
    let new_score;
    let old_nreviews = readingList.data.totalReviews;
    let old_score = readingList.data.totalRating;
    if(method == 'post'){
      new_nreviews = old_nreviews + 1;
      new_score = (old_score * old_nreviews + score) / new_nreviews;
    }else if(method == 'put'){
      let diff = score - old_score;
      new_score = (old_score * old_nreviews + diff) / new_nreviews;
    }else if (method == 'delete'){
      new_nreviews = old_nreviews - 1;
      if (new_nreviews === 0) {
        new_score = 0;
      } else {
        new_score = (old_score * old_nreviews - score) / new_nreviews;
      }
    }else{
      console.error("Method not supported");
      return null
    }
    try {
      const response = await axiosInstance.get(`${READING_LIST_SERVICE_URL}/readings/update-genre`, {
        // #swagger.ignore = true
        "genreId": genreID,
        "score": new_score,
        "numberReviews": new_nreviews
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.title;
    } catch (err) {
      console.error(`Error updating reading list score for reading list: ${genreID}`, err);
      return null;
    }
  } catch (err) {
    console.error(`Error fetching reading list info for reading list with ID: ${genreID}`, err);
    return null;
  }
}

module.exports= {getUserInfo, getBookTitle, getReadingListTitle, updateBookScore, updateReadingListScore}
  