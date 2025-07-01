// src/components/ShapeDetector.tsx
'use client';

declare global {
    var cv: any;
}

const colorRanges = {
    red:    [[0, 120, 70], [10, 255, 255]],
    orange: [[15, 120, 70], [25, 255, 255]],
    yellow: [[26, 120, 70], [35, 255, 255]],
    green:  [[40, 100, 50], [80, 255, 255]],
    blue:   [[90, 100, 50], [130, 255, 255]],
    pink:   [[140, 100, 80], [170, 255, 255]],
};

const getShapeColor = (hsvSrc: any, contour: any): string => {
    if (typeof cv === 'undefined' || !cv.Mat) return 'unknown';

    let mask = cv.Mat.zeros(hsvSrc.rows, hsvSrc.cols, cv.CV_8UC1);
    
    // --- CORRECTED SECTION ---
    // The error "fromI32 is not a constructor" refers to a previous, incorrect version.
    // The correct method is to create a new MatVector and use push_back, as shown here.
    let contourVec = new cv.MatVector();
    contourVec.push_back(contour);
    
    // We now pass the correctly constructed 'contourVec' to the drawContours function.
    cv.drawContours(mask, contourVec, 0, new cv.Scalar(255), cv.FILLED);
    
    const meanHsv = cv.mean(hsvSrc, mask);
    
    // Clean up the created Mat objects to prevent memory leaks
    mask.delete();
    contourVec.delete();

    const [h, s, v] = meanHsv;

    for (const [color, range] of Object.entries(colorRanges)) {
        if (h >= range[0][0] && h <= range[1][0] &&
            s >= range[0][1] && s <= range[1][1] &&
            v >= range[0][2] && v <= range[1][2]) {
            return color;
        }
    }
    return 'unknown';
};

export const detectShapes = (canvas: HTMLCanvasElement) => {
    if (typeof cv === 'undefined' || !cv.Mat) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let src = cv.imread(canvas);
    let hsvSrc = new cv.Mat();
    let gray = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.cvtColor(src, hsvSrc, cv.COLOR_RGB2HSV, 0);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.blur(gray, gray, new cv.Size(5, 5));
        cv.Canny(gray, gray, 50, 150, 3);
        cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        for (let i = 0; i < contours.size(); ++i) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            if (area < 1000) continue;

            let approx = new cv.Mat();
            const peri = cv.arcLength(contour, true);
            cv.approxPolyDP(contour, approx, 0.03 * peri, true);
            
            const vertices = approx.rows;
            const M = cv.moments(contour);
            if (M.m00 === 0) continue;
            
            const cX = M.m10 / M.m00;
            const cY = M.m01 / M.m00;

            let shapeName = 'Unknown';
            if (vertices === 3) shapeName = 'Triangle';
            else if (vertices === 4) shapeName = 'Square';
            else if (vertices === 7) shapeName = 'Arrow';
            else if (vertices > 6) {
                const isConvex = cv.isContourConvex(approx);
                if (isConvex) shapeName = 'Circle';
                else if (vertices > 10) shapeName = 'Heart';
                else shapeName = 'Crescent';
            }

            if (shapeName !== 'Unknown') {
                const colorName = getShapeColor(hsvSrc, contour);
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
                }
            }
            approx.delete();
        }
    } catch (error) {
        console.error("Error in detection:", error);
    } finally {
        src.delete();
        hsvSrc.delete();
        gray.delete();
        contours.delete();
        hierarchy.delete();
    }
};
