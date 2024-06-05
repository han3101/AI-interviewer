import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: 'File URL is missing' });
      console.log('File URL is missing');
    }

    try {
      // const response = await fetch(fileUrl);
      // const buffer = await response.buffer();

      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filePath = path.join(process.cwd(), 'audio_recordings', `Audio_${Date.now()}.mp3`);

      fs.mkdirSync(path.join(process.cwd(), 'audio_recordings'), { recursive: true });

      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error saving file' });
        }
        res.status(200).json({ message: 'File uploaded successfully', filePath });
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Error processing file' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};


export { handler as POST };
