// Learning.jsx
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from '../components/Navbar';

const Learning = () => {
  const [activeCategory, setActiveCategory] = useState('recycling');
  const [isVisible, setIsVisible] = useState(false);
  const globeMountRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Initialize Three.js scene for the globe
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    // Set renderer size to perfectly match the container
    const globeSize = 640; // Matches w-36 h-36 (144px with some padding)
    renderer.setSize(globeSize, globeSize);
    renderer.setClearColor(0x000000, 0);
    
    if (globeMountRef.current) {
      // Clear any existing content
      while (globeMountRef.current.firstChild) {
        globeMountRef.current.removeChild(globeMountRef.current.firstChild);
      }
      globeMountRef.current.appendChild(renderer.domElement);
    }
    
    // MAXIMUM LIGHTING - increased all values to maximum
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // Maximum intensity
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5.0); // Maximum intensity
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Additional directional light from the opposite side
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Add multiple point lights for maximum illumination
    const pointLight1 = new THREE.PointLight(0x88ccff, 3, 50); // Blueish light
    pointLight1.position.set(10, 5, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff8866, 3, 50); // Orangeish light
    pointLight2.position.set(-10, -5, -10);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x88ff88, 2, 30); // Greenish light
    pointLight3.position.set(0, 10, 0);
    scene.add(pointLight3);
    
    // Add a hemisphere light for even more ambient illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x4444aa, 2.0);
    scene.add(hemisphereLight);
    
    // Load the globe model
    const loader = new GLTFLoader();
    loader.load(
      '/globe.glb',
      (gltf) => {
        const globe = gltf.scene;
        globe.scale.set(2.5, 2.5, 2.5);
        globe.position.y = 0;
        scene.add(globe);
        
        // Add extra lights specifically targeting the globe
        const globeLight1 = new THREE.PointLight(0xffffff, 2, 20);
        globeLight1.position.set(3, 3, 3);
        globe.add(globeLight1);
        
        const globeLight2 = new THREE.PointLight(0xffffff, 2, 20);
        globeLight2.position.set(-3, -3, -3);
        globe.add(globeLight2);
      },
      undefined,
      (error) => {
        console.error('Error loading globe model:', error);
        
        // Fallback: create a simple sphere if the model fails to load
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x22a7f0,
          shininess: 100,
          specular: 0x1188ff,
          emissive: 0x112233 // Add some emissive property for self-illumination
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        
        // Add some details to make it look like a globe
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineGeometry = new THREE.RingGeometry(1, 1.01, 32);
        const ring1 = new THREE.Line(lineGeometry, lineMaterial);
        ring1.rotation.x = Math.PI / 2;
        scene.add(ring1);
        
        const ring2 = new THREE.Line(lineGeometry, lineMaterial);
        ring2.rotation.z = Math.PI / 2;
        scene.add(ring2);
        
        // Add a cloud layer for more realism
        const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
        const cloudMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3 // Increased opacity
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        scene.add(clouds);
        
        // Add lights specifically for the fallback globe
        const sphereLight = new THREE.PointLight(0xffffff, 3, 15);
        sphereLight.position.set(2, 2, 2);
        sphere.add(sphereLight);
      }
    );
    
    // Camera position - adjusted to perfectly fit the circle
    camera.position.z = 2.8;
    
    // Add orbit controls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    
    // Auto-rotation
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      
      // Add a slight animation to some lights for extra dynamism
      const time = Date.now() * 0.001;
      pointLight1.intensity = 3 + Math.sin(time) * 0.5;
      pointLight2.intensity = 3 + Math.cos(time * 0.7) * 0.5;
    };
    
    animate();
    
    // Clean up
    return () => {
      if (globeMountRef.current && renderer.domElement) {
        globeMountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Function to handle PDF download
  const handleDownload = () => {
    const pdfUrl = 'https://www.khushiparisara.in/wp-content/uploads/2016/11/Waste_Management_Handbook.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'Waste_Management_Handbook.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const wasteCategories = {
    recycling: {
      title: 'Recycling',
      color: 'bg-gradient-to-r from-blue-600 to-cyan-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-300',
      icon: '♻️',
      items: [
        'Paper and cardboard (clean and dry)',
        'Glass bottles and jars',
        'Plastic containers (#1-7, clean)',
        'Aluminum and steel cans',
        'Clean beverage cartons'
      ],
      donts: [
        'No plastic bags or film',
        'No food-contaminated items',
        'No Styrofoam',
        'No hazardous materials',
        'No clothing or textiles'
      ]
    },
    composting: {
      title: 'Composting',
      color: 'bg-gradient-to-r from-green-600 to-emerald-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-300',
      icon: '🌱',
      items: [
        'Fruit and vegetable scraps',
        'Coffee grounds and filters',
        'Eggshells and nutshells',
        'Yard waste (leaves, grass)',
        'Tea bags (without staples)'
      ],
      donts: [
        'No meat or dairy products',
        'No fats, grease, or oils',
        'No diseased plants',
        'No pet wastes',
        'No synthetic materials'
      ]
    },
    trash: {
      title: 'General Waste',
      color: 'bg-gradient-to-r from-amber-600 to-orange-500',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-300',
      icon: '🗑️',
      items: [
        'Plastic wrappers and film',
        'Styrofoam containers',
        'Used tissues and paper towels',
        'Chip bags and candy wrappers',
        'Broken glass and ceramics'
      ],
      donts: [
        'No hazardous materials',
        'No liquids',
        'No recyclables',
        'No electronic waste',
        'No bulky items'
      ]
    },
    hazardous: {
      title: 'Hazardous Waste',
      color: 'bg-gradient-to-r from-red-600 to-rose-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-300',
      icon: '⚠️',
      items: [
        'Batteries (all types)',
        'Electronics and cables',
        'Light bulbs and tubes',
        'Paints and solvents',
        'Cleaning chemicals'
      ],
      donts: [
        'Never dispose in regular trash',
        'Don\'t pour down drains',
        'Don\'t mix different chemicals',
        'Don\'t incinerate',
        'Check local disposal guidelines'
      ]
    }
  };

  const tips = [
    {
      title: 'Reduce Single-Use Plastics',
      description: 'Bring reusable bags, bottles, and containers when shopping or dining out.',
      icon: '🛍️',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-400'
    },
    {
      title: 'Proper E-Waste Disposal',
      description: 'Take old electronics to designated collection points for safe recycling.',
      icon: '📱',
      color: 'bg-gradient-to-r from-green-500 to-emerald-400'
    },
    {
      title: 'Compost Food Scraps',
      description: 'Turn food waste into nutrient-rich compost for your garden.',
      icon: '🥕',
      color: 'bg-gradient-to-r from-amber-500 to-orange-400'
    },
    {
      title: 'Buy in Bulk',
      description: 'Reduce packaging waste by purchasing items with minimal packaging.',
      icon: '📦',
      color: 'bg-gradient-to-r from-purple-500 to-fuchsia-400'
    }
  ];

  const stats = [
    {
      value: '75%',
      description: 'of waste is recyclable, but only about 30% actually gets recycled',
      color: 'text-blue-400'
    },
    {
      value: '1 ton',
      description: 'of recycled paper can save 17 trees and 7,000 gallons of water',
      color: 'text-green-400'
    },
    {
      value: '90%',
      description: 'of plastic waste ends up in landfills or the environment',
      color: 'text-red-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white py-8 px-4 font-sans overflow-hidden">
      <Navbar />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-700 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800 rounded-full filter blur-3xl opacity-30 animate-pulse-slower"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-700 rounded-full filter blur-3xl opacity-25 animate-pulse-medium"></div>
      </div>
      
      <div className="max-w-6xl mt-48 mx-auto relative z-10">
        {/* Header */}
        <header className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block  backdrop-blur-md rounded-full mb-6 animate-bounce-slow border border-cyan-500/30">
            {/* Globe container with perfect circle and full radius */}
            <div className="w-36 h-36 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden p-0 m-0">
              <div ref={globeMountRef} className="w-full h-full flex items-center justify-center p-0 m-0"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse">
            WASTE MANAGEMENT
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-green-400 to-cyan-400 mx-auto mb-6 rounded-full shadow-lg shadow-cyan-400/50"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn how to properly manage waste to protect our environment and create a sustainable future.
          </p>
        </header>

        {/* Waste Category Tabs */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-10 text-center">
            <span className="border-b-4 border-cyan-400 pb-2 shadow-lg shadow-cyan-400/30">WASTE SORTING GUIDE</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Object.keys(wasteCategories).map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center shadow-lg ${activeCategory === category 
                  ? `${wasteCategories[category].color} ${wasteCategories[category].borderColor} text-white scale-105 shadow-xl` 
                  : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/70 backdrop-blur-sm hover:border-cyan-500/50'}`}
              >
                <span className="text-3xl mb-2">{wasteCategories[category].icon}</span>
                <span className="font-medium">{wasteCategories[category].title}</span>
              </button>
            ))}
          </div>

          {/* Category Content */}
          <div className={`p-8 rounded-2xl bg-gray-800/70 backdrop-blur-md border-2 ${wasteCategories[activeCategory].borderColor} shadow-2xl transition-all duration-500 mb-12`}>
            <div className="flex items-center mb-8">
              <span className="text-4xl mr-4">{wasteCategories[activeCategory].icon}</span>
              <h3 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                {wasteCategories[activeCategory].title} GUIDELINES
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-black/30 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h4 className="font-medium text-green-400 mb-4 flex items-center text-lg">
                  <span className="mr-3 text-2xl">✅</span> ACCEPTABLE ITEMS
                </h4>
                <ul className="space-y-3">
                  {wasteCategories[activeCategory].items.map((item, index) => (
                    <li key={index} className="text-gray-200 flex items-start">
                      <span className="text-green-400 mr-2">•</span> 
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-black/30 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h4 className="font-medium text-red-400 mb-4 flex items-center text-lg">
                  <span className="mr-3 text-2xl">❌</span> WHAT TO AVOID
                </h4>
                <ul className="space-y-3">
                  {wasteCategories[activeCategory].donts.map((item, index) => (
                    <li key={index} className="text-gray-200 flex items-start">
                      <span className="text-red-400 mr-2">•</span> 
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Reduction Tips */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-10 text-center">
            <span className="border-b-4 border-emerald-400 pb-2 shadow-lg shadow-emerald-400/30">WASTE REDUCTION TIPS</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <div 
                key={index} 
                className="bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-2 group shadow-lg hover:shadow-cyan-500/20"
              >
                <div className={`w-16 h-16 ${tip.color} rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-md`}>
                  {tip.icon}
                </div>
                <h3 className="font-semibold text-lg mb-3 text-white group-hover:text-cyan-300 transition-colors">{tip.title}</h3>
                <p className="text-gray-300">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl border-2 border-purple-500 shadow-2xl mb-16">
          <h2 className="text-3xl font-semibold text-white mb-10 text-center">
            <span className="border-b-4 border-purple-400 pb-2 shadow-lg shadow-purple-400/30">ENVIRONMENTAL IMPACT</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-black/30 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 shadow-lg"
              >
                <div className={`text-6xl font-bold mb-4 ${stat.color} font-mono drop-shadow-lg`}>{stat.value}</div>
                <p className="text-gray-300">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Visualization */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-10 text-center">
            <span className="border-b-4 border-rose-400 pb-2 shadow-lg shadow-rose-400/30">WASTE MANAGEMENT PROCESS</span>
          </h2>
          
          <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl border-2 border-cyan-500 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { step: 1, title: 'SEPARATE', desc: 'Sort your waste', icon: '📋', color: 'bg-gradient-to-r from-blue-600 to-cyan-500' },
                { step: 2, title: 'CLEAN', desc: 'Rinse containers', icon: '💧', color: 'bg-gradient-to-r from-green-600 to-emerald-500' },
                { step: 3, title: 'DISPOSE', desc: 'Use proper bins', icon: '🗑️', color: 'bg-gradient-to-r from-amber-600 to-orange-500' },
                { step: 4, title: 'REDUCE', desc: 'Minimize waste', icon: '📉', color: 'bg-gradient-to-r from-purple-600 to-fuchsia-500' }
              ].map((item, index) => (
                <div key={index} className="p-5 rounded-xl border-2 border-gray-700 hover:scale-105 transition-all duration-300 bg-black/30 shadow-lg">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-2xl mb-3 mx-auto shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-lg">{item.title}</div>
                    <div className="text-sm text-gray-300">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
        </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-cyan-700 to-blue-700 p-12 rounded-2xl border-2 border-cyan-400 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full opacity-10"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500 rounded-full opacity-30"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">READY TO MAKE A DIFFERENCE?</h2>
            <p className="mb-8 max-w-2xl mx-auto text-gray-200 text-xl">
              Download our comprehensive waste management handbook to become an eco-warrior!
            </p>
            <button 
              onClick={handleDownload}
              className="bg-white text-cyan-800 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-cyan-500/50 animate-pulse border-2 border-cyan-300"
            >
              📥 DOWNLOAD HANDBOOK
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Eco-Warrior Waste Management</p>
        </footer>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.35; }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 8s infinite;
        }
        .animate-pulse-medium {
          animation: pulse-medium 7s infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default Learning;