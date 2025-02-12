import * as fs from 'fs';

console.log("parser.js is being executed...");

export const getInfo = (url: string): void => {
    // Your logic to handle and process the URL goes here
    console.log(`Processing URL: ${url}`);
};

export const processUrls = (filePath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        console.log(`Attempting to process file: ${filePath}`);

        // Read the file content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading the file: ${err}`);
                reject(err);
                return;
            }

            if (!data.trim()) {
                console.error("File is empty or contains only whitespace.");
                reject(new Error("File is empty or contains only whitespace."));
                return;
            }

            // Split lines and process each URL
            const urls = data.split('\n').filter(url => url.trim() !== ''); // this will filter out any empty lines
            if (urls.length === 0) {
                console.error("No URLs found in the file.");
                reject(new Error("No URLs found in the file."));
                return;
            }
            resolve(urls);
        });
    });
}

// Check if this module is being run directly
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("No file path provided.");
        process.exit(1);
    }
    processUrls(filePath);
}
