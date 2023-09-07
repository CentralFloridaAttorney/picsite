const {spawn} = require('child_process');
require('dotenv').config();

const pythonPath = process.env.PYTHON_EXECUTABLE;

async function generateImage(seed, prompt, fileIdentifier, height, width, inferenceSteps, promptStrength, multiple, collectionName) {
    return new Promise((resolve, reject) => {
        const args = [
            './generate_image.py',
            `--seed=${seed}`,
            `--prompt=${prompt}`,
            `--file_identifier=${fileIdentifier}`,
            `--height=${height}`,
            `--width=${width}`,
            `--inference_steps=${inferenceSteps}`,
            `--prompt_strength=${promptStrength}`,
        ];

        if (multiple) {
            args.push('--multiple'); // Include --multiple if true
        }

        args.push(`--collection_name=${collectionName}`);

        const pythonProcess = spawn(pythonPath, args);

        let outputData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            // Handle any error output from the Python script here
            console.error(data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log('Output from Python script:', outputData);
            if (code === 0) {
                try {
                    const jsonArray = JSON.parse(outputData);
                    resolve(jsonArray)
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(`Python script exited with code ${code}`);
            }
        });
    });
}

// Call the generateImage function with sample arguments
generateImage(
    '1602350664738547800', // Seed
    'a photograph of a cute puppy', // Prompt
    'puppy', // File Identifier
    '312', // Height
    '312', // Width
    '5', // Inference Steps
    '10.0', // Prompt Strength
    false, // Multiple (true or false)
)
    .then((imageJson) => {
        console.log('Image generated successfully:', imageJson);
    })
    .catch((error) => {
        console.error('Error generating image:', error);
    });
