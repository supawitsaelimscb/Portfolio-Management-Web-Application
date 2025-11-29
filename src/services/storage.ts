// Profile photo service using Base64 encoding (no Firebase Storage required)
export const storageService = {
  // Convert file to Base64 data URL
  async uploadProfilePhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Only image files are allowed'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size should be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('✅ Profile photo converted to Base64');
        resolve(base64String);
      };
      
      reader.onerror = () => {
        console.error('❌ Error reading file');
        reject(new Error('Failed to read image file'));
      };
      
      // Read file as data URL (Base64)
      reader.readAsDataURL(file);
    });
  },

  // Delete profile photo (no-op for Base64, just returns success)
  async deleteProfilePhoto(_photoURL: string): Promise<void> {
    // For Base64 data URLs, we don't need to delete anything from storage
    // The data is removed when we update Firestore
    console.log('✅ Profile photo marked for removal');
    return Promise.resolve();
  },
};
