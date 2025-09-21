
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const imageEditModel = 'gemini-2.5-flash-image-preview';

const dataUrlToPart = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1];
    const base64Data = parts[1];
    if (!mimeType || !base64Data) {
        throw new Error("Invalid data URL");
    }
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        }
    };
};

const performSimpleImageEdit = async (baseImage: string, prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("A Gemini API key is required for AI features. Please add it in the AI Edit panel.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const imagePart = dataUrlToPart(baseImage);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: imageEditModel,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error('AI did not return an image. Please try again.');
};


export const performGenerativeFill = async (
    baseImage: string, 
    maskImage: string,
    prompt: string,
    mimeType: string,
    apiKey: string,
): Promise<string> => {
    if (!apiKey) {
        throw new Error("A Gemini API key is required for AI Edit features. Please add it in the AI Edit panel.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // Create an image with a transparent hole where the mask is
    const createImageWithHole = async (): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const base = new Image();
            base.onload = () => {
                canvas.width = base.width;
                canvas.height = base.height;
                ctx!.drawImage(base, 0, 0);

                const mask = new Image();
                mask.onload = () => {
                    ctx!.globalCompositeOperation = 'destination-out';
                    ctx!.drawImage(mask, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                mask.src = maskImage;
            };
            base.src = baseImage;
        });
    };

    const imageWithHole = await createImageWithHole();

    const imagePart = dataUrlToPart(imageWithHole);
    const fullPrompt = `Realistically fill in the transparent area of this image based on the following instruction: "${prompt}". Maintain the original image's style and lighting.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: imageEditModel,
        contents: { parts: [imagePart, { text: fullPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error('AI did not return an image. Please try a different prompt.');
};


export const applyArtisticStyle = (baseImage: string, prompt: string, apiKey: string): Promise<string> => {
    return performSimpleImageEdit(baseImage, prompt, apiKey);
};

export const restoreOldPhoto = (baseImage: string, apiKey: string): Promise<string> => {
    const prompt = "Restore this old, damaged photo. Remove scratches, dust, and spots. Correct color fading and enhance the overall clarity and color balance to make it look like a modern, high-quality photograph.";
    return performSimpleImageEdit(baseImage, prompt, apiKey);
};

export const upscaleImage = (baseImage: string, apiKey: string): Promise<string> => {
    const prompt = "Recreate this image with significantly higher detail and clarity, as if it were taken with a professional high-resolution camera. Enhance textures, sharpness, and fine details without altering the composition or subject. Make the output image look like a high-resolution version of the input.";
    return performSimpleImageEdit(baseImage, prompt, apiKey);
};

export const fixLowLight = (baseImage: string, apiKey: string): Promise<string> => {
    const prompt = "This photo was taken in low light. Intelligently brighten the underexposed areas, reduce noise, and enhance colors. The result should look natural and well-lit, not artificially brightened or overexposed.";
    return performSimpleImageEdit(baseImage, prompt, apiKey);
};
