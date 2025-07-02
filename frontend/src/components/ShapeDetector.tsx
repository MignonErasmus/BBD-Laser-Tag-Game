// src/components/ShapeDetector.tsx
'use client'; // This directive is typically for Next.js, might not be needed in Vite/CRA but harmless

declare global {
    var cv: any; // Important for TypeScript to recognize the global 'cv' object
}

const colorRanges = {
    red:    [[0, 120, 70], [10, 255, 255]],
    orange: [[15, 120, 70], [25, 255, 255]],
    yellow: [[26, 120, 70], [35, 255, 255]],
    green:  [[40, 50, 30], [80, 255, 255]], // Adjusted green range
    blue:   [[90, 100, 50], [130, 255, 255]],
    pink:   [[140, 100, 80], [170, 255, 255]],
};

const getShapeColor = (hsvSrc: any, contour: any): string => {
    if (typeof cv === 'undefined' || !cv.Mat) {
        console.warn("[getShapeColor] cv or cv.Mat not available. Cannot determine color.");
        return 'unknown';
    }

    let mask = cv.Mat.zeros(hsvSrc.rows, hsvSrc.cols, cv.CV_8UC1);
    
    let contourVec = new cv.MatVector();
    try {
        contourVec.push_back(contour);
        cv.drawContours(mask, contourVec, 0, new cv.Scalar(255), cv.FILLED);
        
        const meanHsv = cv.mean(hsvSrc, mask);
        const [h, s, v] = meanHsv;

        console.log(`[getShapeColor] Mean HSV for contour: H=${h.toFixed(2)}, S=${s.toFixed(2)}, V=${v.toFixed(2)}`);

        for (const [color, range] of Object.entries(colorRanges)) {
            if (h >= range[0][0] && h <= range[1][0] &&
                s >= range[0][1] && s <= range[1][1] &&
                v >= range[0][2] && v <= range[1][2]) {
                console.log(`[getShapeColor] Color detected: ${color}`);
                return color;
            }
        }
        console.log("[getShapeColor] Color: unknown (no range match)");
        return 'unknown';
    } finally {
        mask.delete();
        contourVec.delete();
    }
};

export const detectShapes = (canvas: HTMLCanvasElement) => {
    console.log("[detectShapes] Function started.");
    if (typeof cv === 'undefined' || !cv.Mat) {
        console.error("[detectShapes] OpenCV (cv) is not loaded or cv.Mat is undefined. Cannot perform detection.");
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        console.error("[detectShapes] Could not get 2D context from canvas.");
        return;
    }

    let src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4); // Initialize src Mat
    try {
        // Read image data from canvas into src Mat. This is crucial for live video.
        cv.imshow(canvas, src); 
        console.log(`[detectShapes] Image loaded from canvas. Dimensions: ${src.cols}x${src.rows}`);
    } catch (e) {
        console.error("[detectShapes] Error loading image from canvas with cv.imshow:", e);
        // Important: delete src even on error if it was created
        src.delete(); 
        return;
    }

    let hsvSrc = new cv.Mat();
    let gray = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.cvtColor(src, hsvSrc, cv.COLOR_RGB2HSV, 0);
        console.log("[detectShapes] Converted to HSV.");

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.blur(gray, gray, new cv.Size(5, 5));
        console.log("[detectShapes] Converted to Grayscale and blurred.");

        cv.Canny(gray, gray, 50, 150, 3);
        console.log("[detectShapes] Canny edge detection applied.");

        cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        console.log(`[detectShapes] Found ${contours.size()} contours.`);

        for (let i = 0; i < contours.size(); ++i) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            
            console.log(`[detectShapes] Processing contour ${i}: Area = ${area.toFixed(2)}`);

            if (area < 200) { 
                console.log(`[detectShapes] Contour ${i} area (${area.toFixed(2)}) too small, skipping.`);
                contour.delete(); // Delete the specific contour if not processed further
                continue;
            }

            let approx = new cv.Mat();
            const peri = cv.arcLength(contour, true);
            cv.approxPolyDP(contour, approx, 0.04 * peri, true); 

            const vertices = approx.rows;
            console.log(`[detectShapes] Contour ${i}: Vertices = ${vertices}`);

            const M = cv.moments(contour);
            if (M.m00 === 0) {
                console.log(`[detectShapes] Contour ${i}: M.m00 is 0 (division by zero), skipping.`);
                approx.delete();
                contour.delete(); 
                continue;
            }
            
            const cX = M.m10 / M.m00;
            const cY = M.m01 / M.m00;

            let shapeName = 'Unknown';

            // More robust circle detection logic
            if (vertices >= 6) { // A higher number of vertices often indicates a smoother shape
                let circleCenter = new cv.Point(); 
                let circleRadius = new cv.Point(); // radius is a scalar, but returned in .x property of Point
                [circleCenter, circleRadius] = cv.minEnclosingCircle(contour);
                let circleArea = Math.PI * circleRadius.x * circleRadius.x;
                
                console.log(`[detectShapes] Contour ${i} (Vertices ${vertices}): Enclosing Circle Area = ${circleArea.toFixed(2)}, Radius = ${circleRadius.x.toFixed(2)}`);

                // Check if contour area is close to its enclosing circle's area (implies roundness)
                if (Math.abs(area - circleArea) / area < 0.25) { // Adjusted tolerance slightly
                    let rect = cv.boundingRect(contour);
                    let aspectRatio = rect.width / rect.height;
                    console.log(`[detectShapes] Contour ${i}: Bounding Rect Aspect Ratio = ${aspectRatio.toFixed(2)}`);

                    // Check if aspect ratio is close to 1 (implies square-like bounding box, for a circle)
                    if (aspectRatio > 0.7 && aspectRatio < 1.3) { // Adjusted tolerance
                        shapeName = 'Circle';
                    }
                }
            } else if (vertices === 3) {
                shapeName = 'Triangle';
            } else if (vertices === 4) {
                let rect = cv.boundingRect(approx);
                let aspectRatio = rect.width / rect.height;
                if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { 
                    shapeName = 'Square';
                } else {
                    shapeName = 'Rectangle'; 
                }
            } else if (vertices === 7) {
                shapeName = 'Arrow'; // Custom shape (7 vertices often approximated for arrows)
            } 
            // NOTE: Heart/Crescent detection with just vertex count is very unreliable.
            // You'd typically need template matching or more complex curvature analysis for these.
            else if (vertices > 10 && !cv.isContourConvex(approx)) { 
                shapeName = 'Heart'; 
            } else if (vertices > 6 && !cv.isContourConvex(approx)) {
                shapeName = 'Crescent'; 
            }

            console.log(`[detectShapes] Contour ${i}: Determined shapeName = ${shapeName}`);

            if (shapeName !== 'Unknown') {
                const colorName = getShapeColor(hsvSrc, contour);
                
                console.log(`[detectShapes] Detected combination: ${colorName} ${shapeName} (Area: ${area.toFixed(2)}) at C(X: ${cX.toFixed(2)}, Y: ${cY.toFixed(2)})`);

                const isMatch = (shapeName === 'Circle' && colorName === 'green') ||
                                (shapeName === 'Triangle' && colorName === 'orange') ||
                                (shapeName === 'Square' && colorName === 'yellow') ||
                                (shapeName === 'Crescent' && colorName === 'blue') ||
                                (shapeName === 'Heart' && colorName === 'pink') ||
                                (shapeName === 'Arrow' && colorName === 'red');

                if (isMatch && !isNaN(cX) && !isNaN(cY)) {
                    const label = `${shapeName.toUpperCase()}`;
                    context.fillStyle = '#FFFFFF';
                    context.font = 'bold 28px Arial';
                    context.textAlign = 'center';
                    context.strokeStyle = 'black';
                    context.lineWidth = 4;
                    context.strokeText(label, cX, cY);
                    context.fillText(label, cX, cY);
                    console.log(`[detectShapes] Matched and Displayed: ${label} at (${cX.toFixed(2)}, ${cY.toFixed(2)})`);
                } else {
                    console.log(`[detectShapes] Contour ${i}: Match condition NOT met. Shape: ${shapeName}, Color: ${colorName}, isMatch: ${isMatch}, cX:${cX.toFixed(2)}, cY:${cY.toFixed(2)}`);
                }
            }
            approx.delete();
            contour.delete(); // Delete individual contour after processing it
        }
    } catch (error) {
        console.error("[detectShapes] Error during shape detection process:", error);
    } finally {
        // Ensure all Mats are deleted to prevent memory leaks
        src.delete();
        hsvSrc.delete();
        gray.delete();
        contours.delete(); // This deletes all contours within the MatVector
        hierarchy.delete();
        console.log("[detectShapes] All OpenCV Mats and MatVectors deleted.");
    }
    console.log("[detectShapes] Function finished.");
};