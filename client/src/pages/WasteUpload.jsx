import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, Coins, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { wasteAPI } from '../services/api';

const WasteUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('');
  const [manualWasteType, setManualWasteType] = useState('');
  const [mlPrediction, setMlPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Updated waste types to match your ML model's categories
  const wasteTypes = [
    { value: 'bio-degradable', label: 'Bio-Degradable', color: 'text-green-400', coins: 15 },
    { value: 'plastic', label: 'Plastic', color: 'text-blue-400', coins: 25 },
    { value: 'e-waste', label: 'E-Waste', color: 'text-purple-400', coins: 50 },
    { value: 'hazardous', label: 'Hazardous', color: 'text-red-400', coins: 40 },
    { value: 'other', label: 'Other', color: 'text-gray-400', coins: 10 }
  ];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        analyzeImageWithML(file);
      };
      reader.readAsDataURL(file);
    }
  };

 const analyzeImageWithML = async (file) => {
  setIsAnalyzing(true);
  setMlPrediction(null);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('🔄 Sending image to your ML model...');
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/ml/predict`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('📊 ML response:', data);
    
    if (data.success) {
      // Format the prediction for display
      const formattedLabel = data.type.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      setMlPrediction({
        type: data.type,
        label: formattedLabel,
        confidence: data.confidence,
        coins: data.coins,
        isFallback: data.isFallback || false,
        rawType: data.raw_prediction
      });
    } else {
      // Show error message to user
      setMlPrediction({
        type: 'error',
        label: 'Analysis Failed',
        confidence: 0,
        coins: 0,
        isFallback: false,
        error: data.error || 'Prediction service error'
      });
    }
  } catch (error) {
    console.error('Error calling ML service:', error);
    setMlPrediction({
      type: 'error',
      label: 'Connection Error',
      confidence: 0,
      coins: 0,
      isFallback: false,
      error: 'Cannot connect to ML service'
    });
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !location) return;

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('location', location);
      
      // Use ML prediction if available, otherwise manual selection
      const wasteTypeToSubmit = manualWasteType || (mlPrediction?.type || 'other');
      formData.append('manualWasteType', wasteTypeToSubmit);
      
      const response = await wasteAPI.createWasteSubmission(formData);
      
      setSubmitStatus('success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedImage(null);
        setImagePreview(null);
        setLocation('');
        setManualWasteType('');
        setMlPrediction(null);
        setSubmitStatus(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting waste:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCoinsToEarn = () => {
    if (manualWasteType) {
      const type = wasteTypes.find(t => t.value === manualWasteType);
      return type ? type.coins : 10;
    }
    if (mlPrediction) return mlPrediction.coins;
    return 10;
  };

  const getCurrentWasteType = () => {
    if (manualWasteType) {
      return wasteTypes.find(t => t.value === manualWasteType);
    }
    if (mlPrediction) {
      return wasteTypes.find(t => t.value === mlPrediction.type);
    }
    return null;
  };

  const currentWasteType = getCurrentWasteType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 mb-4">
              Upload Waste & Earn Eco Coins
            </h1>
            <p className="text-gray-400 text-lg">
              Our AI model analyzes your waste and categorizes it correctly
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center">
              <CheckCircle className="w-8 h-8 text-green-400 mr-4" />
              <div>
                <h3 className="text-green-400 font-semibold">Upload Successful!</h3>
                <p className="text-gray-300">Your waste report has been submitted for review.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center">
              <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
              <div>
                <h3 className="text-red-400 font-semibold">Upload Failed</h3>
                <p className="text-gray-300">There was an error submitting your waste report.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Camera className="w-6 h-6 mr-2 text-cyan-400" />
                Waste Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Upload Waste Image *
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            setImagePreview(null);
                            setMlPrediction(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm mt-2">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter waste location (e.g., Central Park, NYC)"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Waste Type (Manual Selection)
                  </label>
                  <select
                    value={manualWasteType}
                    onChange={(e) => setManualWasteType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select waste type</option>
                    {wasteTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} (+{type.coins} coins)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedImage || !location || isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Submit Waste Report
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-cyan-400" />
                  AI Waste Classification
                </h3>
                
                {!selectedImage ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Upload an image for AI classification</p>
                  </div>
                ) : isAnalyzing ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-cyan-400 mx-auto mb-4 animate-spin" />
                    <p className="text-cyan-400">Analyzing with your ML model...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                  </div>
                ) : mlPrediction && !manualWasteType ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-600">
                      <div>
                        <h4 className="font-semibold text-white">{mlPrediction.label}</h4>
                        <p className="text-sm text-gray-400">Confidence: {(mlPrediction.confidence * 100).toFixed(1)}%</p>
                        {mlPrediction.rawType && (
                          <p className="text-xs text-gray-500 mt-1">Detected: {mlPrediction.rawType}</p>
                        )}
                        {mlPrediction.isFallback && (
                          <p className="text-xs text-yellow-400 mt-1 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {mlPrediction.message || 'Using fallback detection'}
                          </p>
                        )}
                        {!mlPrediction.isFallback && (
                          <p className="text-xs text-green-400 mt-1 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Your ML Model Prediction
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-400">
                          <Coins className="w-4 h-4 mr-1" />
                          <span className="font-semibold">+{mlPrediction.coins}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${mlPrediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-gray-400 text-center">
                      Not correct? Select the correct type manually above.
                    </p>
                  </div>
                ) : manualWasteType ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-white">Manual Selection</p>
                    <p className={currentWasteType?.color || "text-gray-400"}>
                      {currentWasteType?.label || "Other"}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Coins className="w-6 h-6 mr-2 text-yellow-400" />
                  Eco Coins Reward
                </h3>
                
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Coins className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-400 mb-2">+{getCoinsToEarn()}</p>
                  <p className="text-gray-400">Eco Coins to be earned</p>
                  
                  {currentWasteType && (
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-gray-700/50">
                      <span className={currentWasteType.color}>{currentWasteType.label}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-2">Coin Breakdown:</h4>
                  <div className="space-y-2 text-sm">
                    {wasteTypes.map((type) => (
                      <div key={type.value} className="flex justify-between items-center py-1">
                        <span className={type.color}>{type.label}</span>
                        <span className="text-yellow-400 flex items-center">
                          <Coins className="w-3 h-3 mr-1" />+{type.coins}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">📝 Upload Tips</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Take clear, well-lit photos of the waste
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Focus on a single type of waste for best results
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Our AI model is trained to recognize various waste categories
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Hazardous and E-Waste earn the most coins
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteUpload;