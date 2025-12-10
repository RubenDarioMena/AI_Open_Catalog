const SECTION_MAPPING = {
    "All Models": [], // Special key for "View All"
    "3D & Robotics": [
        "3D Generator",
        "3D Model Generator",
        "3D Tool",
        "3D Tool / Computer Vision",
        "3D/4D Generator",
        "Multimodal / 3D Tool",
        "Robotics",
        "Robotics / Motion AI",
        "Robotics AI"
    ],
    "Video": [
        "Video Editor",
        "Video Generator",
        "Video Generator / Game",
        "Video Tool",
        "Video Understanding",
        "Image/Video Architecture"
    ],
    "Image & Vision": [
        "Image Editor",
        "Image Generator",
        "Image Tool",
        "Computer Vision",
        "Computer Vision / Image Generator"
    ],
    "Audio": [
        "Audio Generator",
        "Audio Tool"
    ],
    "Language & Agents": [
        "Agent",
        "Agent / Productivity",
        "Coding AI",
        "Developer Tool / Agent",
        "AI Development Tool",
        "LLM",
        "LLM Tool",
        "Multimodal / VLM",
        "Multimodal Agent",
        "Multimodal LLM",
        "Multimodal Model",
        "Text / LLM",
        "Text / LLM Architecture",
        "Vision / Text Tool"
    ],
    "Science": [
        "Bio-AI / Science",
        "Scientific/Biological AI",
        "Scientific/Geospatial AI",
        "Scientific/Medical AI",
        "Optimization Tool"
    ]
};

// Export for Node.js (verification script) and Window (browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECTION_MAPPING;
} else {
    window.SECTION_MAPPING = SECTION_MAPPING;
}
