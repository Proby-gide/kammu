import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function getChatResponse(message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response. Please try again.");
  }
}

export async function getImageAnalysis(imageData, prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const imageParts = await Promise.all(
      imageData.map(async (file) => {
        try {
          const data = await fileToGenerativePart(file);
          return {
            inlineData: {
              data: data,
              mimeType: file.type
            }
          };
        } catch (error) {
          console.error("Error processing image:", error);
          throw new Error("Failed to process image. Please make sure it's a valid image file.");
        }
      })
    );

    try {
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating content:", error);
      if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      } else if (error.message.includes("invalid")) {
        throw new Error("Invalid image format. Please try a different image.");
      } else {
        throw new Error("Failed to analyze image. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload only images.'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } catch (error) {
        reject(new Error('Failed to process image. Please try again.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
