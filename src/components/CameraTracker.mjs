// import React, { useRef, useState, useEffect } from 'react';
// import Webcam from 'react-webcam';
// import * as faceapi from 'face-api.js';

// const FocusTracker = () => {
//   const webcamRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [focusStatus, setFocusStatus] = useState('Initializing...');

//   // Load the facial recognition models on component mount
//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         const MODEL_URL = process.env.PUBLIC_URL + '/models';
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//           faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//         ]);
//         setIsLoaded(true);
//         setFocusStatus('Models loaded. Analyzing...');
//       } catch (error) {
//         console.error("Error loading models:", error);
//         setFocusStatus('Failed to load models.');
//       }
//     };
//     loadModels();
//   }, []);

//   // Set up the tracking loop once models and video are ready
//   useEffect(() => {
//     let trackingInterval;

//     if (isLoaded) {
//       trackingInterval = setInterval(async () => {
//         if (
//           webcamRef.current &&
//           webcamRef.current.video &&
//           webcamRef.current.video.readyState === 4
//         ) {
//           const video = webcamRef.current.video;
          
//           // Detect the face and landmarks
//           const detections = await faceapi
//             .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//             .withFaceLandmarks();

//           if (detections) {
//             analyzeFocus(detections.landmarks);
//           } else {
//             setFocusStatus('No face detected! 🛑');
//           }
//         }
//       }, 500); // Check every 500ms
//     }

//     return () => clearInterval(trackingInterval);
//   }, [isLoaded]);

//   // Logic to determine if the user is focused
//   const analyzeFocus = (landmarks) => {
//     // Get key facial points
//     const leftEye = landmarks.getLeftEye();
//     const rightEye = landmarks.getRightEye();
//     const nose = landmarks.getNose();
//     const jawOutline = landmarks.getJawOutline();

//     // A simple heuristic: calculate the center of the face
//     const leftJawEdge = jawOutline[0].x;
//     const rightJawEdge = jawOutline[16].x;
//     const faceCenter = (leftJawEdge + rightJawEdge) / 2;
//     const noseCenter = nose[3].x; // Tip of the nose

//     // Determine the offset of the nose relative to the face center
//     const faceWidth = rightJawEdge - leftJawEdge;
//     const noseOffset = (noseCenter - faceCenter) / faceWidth;

//     // If the nose is too far left or right relative to the jaw, they are turning their head
//     const YAW_THRESHOLD = 0.15; 

//     if (Math.abs(noseOffset) > YAW_THRESHOLD) {
//       setFocusStatus('Distracted! Looking away. 👀');
//     } else {
//       setFocusStatus('Focused! 🧠');
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'sans-serif' }}>
//       <h2>Study Focus Tracker</h2>
      
//       <div style={{ position: 'relative', display: 'inline-block' }}>
//         <Webcam
//           ref={webcamRef}
//           audio={false}
//           width={640}
//           height={480}
//           style={{ borderRadius: '8px', border: '2px solid #ccc' }}
//         />
//       </div>

//       <div style={{ 
//         marginTop: '20px', 
//         padding: '15px', 
//         fontSize: '1.5rem', 
//         fontWeight: 'bold',
//         backgroundColor: focusStatus.includes('Focused') ? '#d4edda' : '#f8d7da',
//         color: focusStatus.includes('Focused') ? '#155724' : '#721c24',
//         borderRadius: '8px',
//         display: 'inline-block'
//       }}>
//         {focusStatus}
//       </div>
//     </div>
//   );
// };

// export default FocusTracker;