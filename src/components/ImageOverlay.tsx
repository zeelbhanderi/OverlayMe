"use client";

import { useState, useRef } from "react";

export default function ImageOverlay() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    image?: string;
  }>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear validation error when user types
    if (e.target.value) {
      setValidationErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Handle phone number input change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    // Clear validation error when user types
    if (e.target.value) {
      setValidationErrors((prev) => ({ ...prev, phoneNumber: undefined }));
    }
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    try {
      // Safety check for e and e.target
      if (!e || !e.target) {
        setError("Invalid event object");
        return;
      }

      const files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!file) {
        setError("No file selected");
        return;
      }

      // Check if window/document objects are available (prevents SSR issues)
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        setError("Browser environment not available");
        return;
      }

      // Double check file type exists before using it
      if (!file.type) {
        setError("Unable to determine file type");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (!event || !event.target || !event.target.result) {
            setError("Failed to load image data");
            return;
          }
          setUserImage(event.target.result as string);
          // Clear validation error when image is uploaded
          setValidationErrors((prev) => ({ ...prev, image: undefined }));
        } catch (loadErr) {
          console.error("Error in reader.onload:", loadErr);
          setError("Error processing image data");
        }
      };

      reader.onerror = () => {
        setError("Error reading the file");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error handling file selection:", err);
      setError("Error processing the selected file");
    }
  };

  // Reset form
  const handleReset = () => {
    setName("");
    setPhoneNumber("");
    setUserImage(null);
    setCombinedImage(null);
    setImageFile(null);
    setError(null);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form and create image
  const handleCreateImage = () => {
    // First clear any existing errors
    setError(null);
    setValidationErrors({});

    try {
      let isValid = true;
      const newErrors: {
        name?: string;
        phoneNumber?: string;
        image?: string;
      } = {};

      // Validate name
      if (!name || !name.trim()) {
        newErrors.name = "Name is required";
        isValid = false;
      }

      // Validate phone number
      if (!phoneNumber || !phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\D/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
        isValid = false;
      }

      // Validate image
      if (!imageFile) {
        newErrors.image = "Please upload an image";
        isValid = false;
      }

      if (!isValid) {
        setValidationErrors(newErrors);
        return;
      }

      // If valid, proceed with image generation
      processImage();
    } catch (error) {
      console.error("Error in form validation:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // Process image for overlay
  const processImage = () => {
    if (!userImage || !canvasRef.current) {
      setError("Missing image data or canvas reference");
      return;
    }

    // Check if window object exists (prevents SSR issues and extension conflicts)
    if (typeof window === 'undefined') {
      setError("Browser environment not available");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setError("Could not initialize image processing");
        setIsProcessing(false);
        return;
      }

      // Use the built-in HTML image constructor instead of Next.js Image
      const logoImg = new window.Image();
      logoImg.crossOrigin = "anonymous"; // Handle CORS issues

      // Set logo path with fallback
      const logoPath = "/images/company-logo.png";
      logoImg.src = logoPath;

      // Preemptively check if logo exists
      const logoTimeout = setTimeout(() => {
        setError("Logo image is taking too long to load");
        setIsProcessing(false);
      }, 5000); // 5 second timeout

      // Handle logo loading errors
      logoImg.onerror = () => {
        clearTimeout(logoTimeout);
        setError(
          "Failed to load company logo. Please check if the image exists at " +
          logoPath
        );
        setIsProcessing(false);
      };

      logoImg.onload = () => {
        clearTimeout(logoTimeout);
        try {
          // Set canvas dimensions to match the logo image
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;

          // Draw the logo (background)
          ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);

          // Draw the user image on top (overlay)
          const userImg = new window.Image();
          userImg.crossOrigin = "anonymous"; // Handle CORS issues

          if (!userImage) {
            setError("User image data is missing");
            setIsProcessing(false);
            return;
          }

          userImg.src = userImage;

          // Handle user image loading errors
          userImg.onerror = () => {
            setError("Failed to process uploaded image");
            setIsProcessing(false);
          };

          userImg.onload = () => {
            try {
              if (!ctx || !canvas) {
                setError("Canvas context lost during processing");
                setIsProcessing(false);
                return;
              }

              // Allow manual positioning of the appended image
              const manualXPosition = 580; // Example manual X position
              const manualYPosition = 220; // Example manual Y position

              // Calculate dimensions for the appended image
              const userImgHeight = 380;
              const userImgWidth = 380;

              // Use manual positions for the image
              const xPosition = manualXPosition;
              const yPosition = manualYPosition;

              // Create a hexagonal clipping path with a point on top and two parallel sides
              const hexRadius = Math.min(userImgWidth, userImgHeight) / 2;
              const hexCenterX = xPosition + userImgWidth / 2;
              const hexCenterY = yPosition + userImgHeight / 2;

              ctx.save(); // Save the current state of the canvas

              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2; // Rotate to have a point on top
                const x = hexCenterX + hexRadius * Math.cos(angle);
                const y = hexCenterY + hexRadius * Math.sin(angle);
                if (i === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              ctx.closePath();
              ctx.clip();

              // Draw user image within the hexagonal clipping area
              ctx.drawImage(
                userImg,
                xPosition,
                yPosition,
                userImgWidth,
                userImgHeight
              );

              ctx.restore(); // Restore the canvas state to avoid affecting other drawings

              // Add name - position in bottom right instead
              ctx.font = "bold 20px Arial";
              ctx.fillStyle = "white";
              ctx.textAlign = "right";
              ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
              ctx.shadowBlur = 4;
              ctx.fillText(name || "", canvas.width - 30, canvas.height - 50);

              // Add phone number below name
              ctx.font = "bold 16px Arial";
              ctx.fillText(
                phoneNumber || "",
                canvas.width - 30,
                canvas.height - 25
              );

              // Convert canvas to data URL
              const dataUrl = canvas.toDataURL("image/png");
              if (!dataUrl) {
                setError("Failed to generate image data");
                setIsProcessing(false);
                return;
              }
              setCombinedImage(dataUrl);
            } catch (err) {
              console.error("Error drawing user image:", err);
              setError("Error creating overlay image");
            } finally {
              setIsProcessing(false);
            }
          };
        } catch (err) {
          console.error("Error in logo onload handler:", err);
          setError("Error processing images");
          setIsProcessing(false);
        }
      };
    } catch (err) {
      console.error("Error in image processing:", err);
      setError("Unexpected error during image processing");
      setIsProcessing(false);
    }
  };

  // Handle image download
  const handleDownload = () => {
    if (!combinedImage) {
      setError("No image generated yet");
      return;
    }

    // Check if document object exists (prevents SSR issues and extension conflicts)
    if (typeof document === 'undefined') {
      setError("Browser environment not available");
      return;
    }

    try {
      const link = document.createElement("a");
      if (!link) {
        setError("Unable to create download link");
        return;
      }

      link.href = combinedImage;
      link.download = `${name || "image"}-overlay.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError("Failed to download image");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-12 w-full max-w-6xl mx-auto">
      {/* Image preview section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center mb-8 lg:mb-0 order-2 lg:order-1">
        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {isProcessing ? (
          <div className="flex items-center justify-center h-[300px] sm:h-[350px] lg:h-[450px] w-full border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 font-medium">Processing image...</p>
            </div>
          </div>
        ) : combinedImage ? (
          <div className="relative w-full">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img
                src={combinedImage}
                alt="Combined Image"
                className="max-w-full h-auto max-h-[300px] sm:max-h-[350px] lg:max-h-[450px] mx-auto"
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download Image
              </button>
              <button
                onClick={handleReset}
                className="bg-white text-gray-700 py-2.5 px-5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-sm text-sm font-medium"
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] sm:h-[350px] lg:h-[450px] w-full border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <div className="text-center px-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium mb-2">Your preview will appear here</p>
              <p className="text-gray-400 text-sm">
                Fill in the form and upload your image
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form controls section */}
      <div className="w-full lg:w-1/2 space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 order-1 lg:order-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Create Your Celebration
          </h2>
          <p className="text-gray-500 text-sm">
            Add your details to personalize your birthday wish
          </p>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 ${validationErrors.name ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
          />
          {validationErrors.name && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{validationErrors.name}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-500">
            Will appear at the bottom of your celebration image
          </p>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter your phone number"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-800 ${validationErrors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
          />
          {validationErrors.phoneNumber && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {validationErrors.phoneNumber}
            </p>
          )}
          <p className="mt-1.5 text-xs text-gray-500">
            Will appear below your name on the image
          </p>
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Your Photo
          </label>
          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${validationErrors.image ? "border-red-500 bg-red-50" : "border-gray-200"
              } border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-wrap justify-center text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a photo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {validationErrors.image && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {validationErrors.image}
            </p>
          )}
        </div>

        {imageFile && (
          <div className="bg-blue-50 p-3 rounded-lg flex items-center text-left">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-blue-800">Selected photo:</p>
              <p className="text-sm text-blue-600 truncate max-w-full">
                {imageFile.name}
              </p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleCreateImage}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 font-medium text-base"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Create Celebration Image
              </>
            )}
          </button>
        </div>

        {/* Canvas (hidden, used for image processing) */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
