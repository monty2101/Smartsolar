import React, { useState, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logo from './assets/Untitled/Screenshot 2025-05-13 123007-Photoroom 1.png';
import grid1 from './assets/Untitled/Screenshot 2025-05-13 120814 1.png';
import grid2 from './assets/Untitled/Screenshot 2025-05-13 112528.png';
import grid3 from './assets/Untitled/Screenshot 2025-05-13 111917.png';
import grid4 from './assets/Untitled/Screenshot 2025-05-13 120612.png';

const shadingLevels = [
  { level: 0, color: "bg-white" },
  { level: 1, color: "bg-gray-300" },
  { level: 2, color: "bg-gray-500" },
  { level: 3, color: "bg-gray-700" },
  { level: 4, color: "bg-gray-900" },
  { level: 5, color: "bg-black" },
];
const GEMINI_API_KEY = 'AIzaSyBOcAsChKGZTpRkHG5deshkAvGoe6V9YRI';
export default function App() {
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(6);
  const [budget, setBudget] = useState("low");
  const [technique, setTechnique] = useState("static");
  const [grid, setGrid] = useState([]);
  const [result, setResult] = useState(null);
  const gridRef = useRef(null);
  const resultRef = useRef(null);

  const handleGenerateGrid = () => {
    const newGrid = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 0)
    );
    setGrid(newGrid);
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCellClick = (row, col) => {
    setGrid((prev) => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = (newGrid[row][col] + 1) % 6;
      return newGrid;
    });
  };


const handleFindBestTechnique = async () => {
  const shadingData = grid.map(row =>
    row.map(val => ({
      shadingLevel: typeof val === "number" ? val * 20 : 0,
    }))
  );
  // 1. API Key and Endpoint Verification
  //    - Double-check that your API key is correct and hasn't expired or been invalidated.
  //    - VERY IMPORTANT:  Ensure the API endpoint is correct.  Small typos can cause 404s.
  const apiKey = "AIzaSyATRQN1I7UxwVcYecqcDrIjo8V4ggqFh_s"; // Replace with your actual API key
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  // 2. Request Payload Inspection
  //    -  Make absolutely sure the 'instruction' key is correct.  Gemini uses 'prompt' within content.
  //    -  Include the prompt and data in the content array.
  //    -  The structure should match the Gemini API's expected format.
  const promptText = `
Based on the given shading levels for solar panels, recommend the most suitable reconfiguration technique from the following options only: 
if it is specified to choose static technique then choose from the following - **BL (bridge Line), TCT (Total Cross Tied), SP (Series Parallel), Honeycomb**.
if it is specified to choose dynamic technique then choose from the following - **automatic switching , m square, sudoku**.
if it is specified to choose both then choose from the following - **automatic switching , m square, sudoku, BL (bridge Line), TCT (Total Cross Tied), SP (Series Parallel), Honeycomb**.
Please consider:
- row: ${height}, column: ${width}.
- Shading levels: ${JSON.stringify(shadingData)}.
- Cost-effectiveness (prefer ${budget}-cost solutions).
- prefered technique type: ${technique}.
- Performance under partial shading.
- Simplicity of implementation.

Only return a concise **Markdown summary** of the best technique selected, including:
- Technique name
- One-line reason for selection
- Advantages & disadvantages (cost, complexity, performance, suitability) in table format.

Do not include any unrelated content.
`;

  const requestBody = {
    contents: [{
      parts: [
        { text: promptText }, // Use the promptText variable
      ],
    }],
  };

  try {
    const response = await fetch(endpoint, { // Use the endpoint variable
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Send the correctly structured body
    });

    if (!response.ok) {
      // 3. Detailed Error Handling
      //    - Include the status code in the error message for better debugging.
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`Failed to fetch data from the analysis API. Status: ${response.status}, Response: ${errorText}`);
    }

    const data = await response.json();
    console.log("Gemini API Response:", data); // Log the entire response for inspection

    // 4. Response Structure Check
    //    -  The Gemini API response structure is crucial.  It's often nested.
    //    -  Check the console log to see the actual structure and adjust accordingly.
    //    -  I'm making an initial guess here; you'll need to confirm.
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        setResult(data.candidates[0].content.parts[0].text || "No suitable static technique found.");
    } else {
        setResult("Unexpected response structure from the Gemini API.");
    }

  } catch (error) {
    console.error("Analysis error:", error);
    setResult(`Error: ${error.message}`);
  }
};

//   const handleFindBestTechnique = () => {
//     const shadingData = grid
//       .map((row) => row.map((val) => val * 20).join(","))
//       .join("; ");
//     const fakeResult = `
// Recommended Reconfiguration Technique: **Honeycomb Reconfiguration**

// | **Aspect**       | **Advantages**                                                                                          | **Disadvantages**                                                                 |
// |------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
// | Cost             | Static solution with no moving parts or optimizers — lower cost than dynamic or per-panel electronics.   | Slightly more complex wiring than simple SP; requires customized layout.         |
// | Complexity       | Moderate — more complex than SP, but simpler than solutions using DC optimizers or microinverters.       | Fixed wiring means limited adaptability after deployment.                         |
// | Performance      | Great under **non-uniform shading** like in your case — reduces mismatch loss by evenly spreading shading. | Not as effective as dynamic reconfigurations in rapidly changing shading.        |
// | Suitability      | Well-suited for static setups with known, repeating partial shading patterns (e.g., like your 80% spots). | Not ideal if shading patterns change unpredictably or across the whole array.    |
// `;
//     setResult(fakeResult);
//     setTimeout(() => {
//       resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 100);
//   };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-gray-900 overflow-hidden relative">
      {/* Decorative Grid Images */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-left grid */}
        <div 
          style={{
            transform: 'rotate(-11deg)',
            borderRadius: '8px',
            border: '1px solid #EAEAEA',
            boxShadow: '-6px 5px 35px 0px rgba(0, 0, 0, 0.25)',
            position: 'absolute',
            top: '80%',
            transform: 'translateY(-140%) rotate(-11deg)',
            left: '-2rem'
          }}
        >
          <img 
            src={grid3} 
            alt="" 
            style={{
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Top-right grid */}
        <div 
          style={{
            transform: 'rotate(-11deg)',
            borderRadius: '8px',
            boxShadow: '-6px 5px 35px 0px rgba(0, 0, 0, 0.25)',
            position: 'absolute',
            top: '15%',
            right: '-2rem'
          }}
        >
          <img 
            src={grid4} 
            alt="" 
            style={{
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Bottom-left grid */}
        <div 
          style={{
            transform: 'rotate(11deg)',
            borderRadius: '8px',
            boxShadow: '-6px 5px 35px 0px rgba(0, 0, 0, 0.25)',
            position: 'absolute',
            bottom: '2rem',
            left: '-2rem'
          }}
        >
          <img 
            src={grid1} 
            alt="" 
            style={{
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Bottom-right grid */}
        <div 
          style={{
            transform: 'rotate(6deg)',
            borderRadius: '16px',
            border: '1px solid #EAEAEA',
            boxShadow: '-6px 5px 35px 0px rgba(0, 0, 0, 0.25)',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-40%) rotate(6deg)',
            right: '-2rem'
          }}
        >
          <img 
            src={grid2} 
            alt="" 
            style={{
              display: 'block',
              borderRadius: '16px'
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12">
          <nav className="col-span-8 col-start-3 flex justify-between items-center py-4">
            <img src={logo} alt="Mountain Logo" className="h-12" />
            <div className="flex gap-8 text-gray-700">
              <a href="#" className="hover:text-gray-900">Home</a>
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="bg-[#F5F5F0]/80 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-5xl font-bold text-center mb-6 text-gray-900">
            Solar Panel<br />
            Shading Simulator
          </h1>
          
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Design and optimize your solar panel layout with our advanced shading analysis tool,
            providing maximum efficiency.<br /><br />
            Simulate different scenarios and find the perfect configuration
            for optimal performance in various environmental conditions.
          </p>

          <div className="bg-white/90 rounded-lg p-8 shadow-lg backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2">Column </label>
                <input
                  type="number"
                  className="w-full p-3 rounded bg-white border border-gray-400 text-gray-900"
                  placeholder="Width"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block mb-2">Row</label>
                <input
                  type="number"
                  className="w-full p-3 rounded bg-white border border-gray-400 text-gray-900"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2">Technique Type</label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full p-3 rounded bg-white border border-gray-400 text-gray-900"
              >
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block mb-2">Budget Type</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-3 rounded bg-white border border-gray-400 text-gray-900"
              >
                <option value="low">Low Budget</option>
                <option value="mid">Mid Budget</option>
                <option value="high">High Budget</option>
              </select>
            </div>

            <button
              onClick={handleGenerateGrid}
              className="w-full bg-white text-gray-900 px-6 py-3 rounded hover:bg-gray-100 flex items-center justify-center gap-2 font-medium"
            >
              Generate Grid
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {grid.length > 0 && (
          <div className="mt-8 bg-[#F5F5F0]/80 backdrop-blur-sm p-8 rounded-lg" ref={gridRef}>
            <div
              className="grid mb-6 bg-white p-4 rounded-lg mx-auto"
              style={{
                gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
                gap: "2px",
                maxWidth: "400px"
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((level, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`aspect-square cursor-pointer border border-gray-200 ${shadingLevels[level].color}`}
                    title={`Shading Level: ${level * 20}%`}
                  ></div>
                ))
              )}
            </div>

            <button
              className="w-full bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 mb-8 font-medium"
              onClick={handleFindBestTechnique}
            >
              Find Best Reconfiguration Technique
            </button>

            {result && (
              <div className="bg-white p-6 rounded-lg shadow-lg prose max-w-none" ref={resultRef}>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <table
                        {...props}
                        className="w-full border-collapse border border-gray-200"
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        {...props}
                        className="border border-gray-200 px-4 py-2 bg-gray-50"
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        {...props}
                        className="border border-gray-200 px-4 py-2"
                      />
                    ),
                  }}
                >
                  {result}
                </Markdown>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
