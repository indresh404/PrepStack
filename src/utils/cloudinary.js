// src/utils/cloudinary.js
import axios from 'axios';

const CLOUD_NAME = 'dfsb8p4os'; // Your cloud name
const UPLOAD_PRESET = 'prepstack_notes'; // The preset you just created

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);
  formData.append('resource_type', 'raw'); // Important for PDFs

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );
    
    return response.data.secure_url; // Returns the PDF URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.response?.data?.error?.message || 'Upload failed');
  }
};