const fs = require('fs');
const path = require('path');

const inputFile = 'e:/Media/Documents/AI_Released_Models/AI_Models.md';
const outputFile = 'e:/Media/Documents/AI_Released_Models/data.json';

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    const models = [];
    let currentModel = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect Model Name (Lines that start with ** and end with **)
        // But exclude lines that are headers like **Video: ...** or field labels
        if (line.startsWith('**') && line.endsWith('**') && !line.includes('Video:') && !line.includes(':')) {
            // If we have a previous model with data, save it
            if (currentModel.name) {
                models.push(currentModel);
            }
            currentModel = {
                name: line.replace(/\*\*/g, '').trim(),
                description: '',
                category: '',
                subcategory: '',
                link: '',
                date: ''
            };
        } else if (line.startsWith('- **Description:**')) {
            currentModel.description = line.replace('- **Description:**', '').trim();
        } else if (line.startsWith('- **Category:**')) {
            currentModel.category = line.replace('- **Category:**', '').trim();
        } else if (line.startsWith('- **Subcategory:**')) {
            currentModel.subcategory = line.replace('- **Subcategory:**', '').trim();
        } else if (line.startsWith('- **Link:**')) {
            // Extract link url and text
            const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                currentModel.link = linkMatch[2];
                currentModel.linkText = linkMatch[1];
            } else {
                 // Fallback if simple text
                 currentModel.link = line.replace('- **Link:**', '').trim();
            }
        } else if (line.startsWith('- **Time:**')) {
             // Extract date from \[YYYY-MM-DD\]
            const dateMatch = line.match(/\[(.*?)\]/);
            if (dateMatch) {
                currentModel.date = dateMatch[1];
            } else {
                currentModel.date = line.replace('- **Time:**', '').trim();
            }
        }
    }
    // Push the last model
    if (currentModel.name) {
        models.push(currentModel);
    }

    console.log(`Extracted ${models.length} models.`);
    fs.writeFileSync(outputFile, JSON.stringify(models, null, 2));
    console.log(`Data saved to ${outputFile}`);

} catch (err) {
    console.error('Error parsing file:', err);
}
