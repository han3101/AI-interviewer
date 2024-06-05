import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false  // We disable the default Next.js body parser
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // Create an instance of the Formidable form for parsing
        const form = new formidable.IncomingForm();
        // Specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;
        // Set the directory where files will be uploaded temporarily
        form.uploadDir = "./tmp";
        // Parse the request to get file data
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error parsing the files:', err);
                return res.status(500).json({ message: 'Error parsing the files' });
            }
            // files.file will contain the file(s) uploaded
            if (!files.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            // Define the path where the text file will be saved
            const filePath = path.join(process.cwd(), 'audio_recordings', file.originalFilename || `Transcript_${Date.now()}.txt`);

            // Ensure the directory exists; create it if it doesn't
            fs.mkdirSync(path.join(process.cwd(), 'audio_recordings'), { recursive: true });

            // Move the file from the temporary directory to the target directory
            fs.rename(file.filepath, filePath, (err) => {
                if (err) {
                    console.error('Error saving file:', err);
                    return res.status(500).json({ message: 'Error saving file' });
                }
                res.status(200).json({ message: 'File uploaded successfully', filePath });
            });
        });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};


export { handler as POST };
