'use server';


// We want to obtain the Timestamp, audio, response, and transcript fields from the FastAPI endpoint
// in a nice format which we can plug straight into the table component in the dashboard/recording page.

interface FileLinks {
    audio?: string;
    response?: string;
    transcript?: string;
}

interface FilesResponse {
    [key: string]: FileLinks;
}

export interface TransformedEntry {
    Timestamp: string;
    audio?: string;
    response?: string;
    transcript?: string;
}

// Function to fetch file links from the FastAPI endpoint
export async function fetchFileLinks(): Promise<TransformedEntry[]> {
    // const endpointUrl = 'http://127.0.0.1:8080/get_files';
    const endpointUrl = 'https://apriora-python.onrender.com/get_files';
    try {
        const response = await fetch(endpointUrl, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FilesResponse = await response.json(); 

        const formattedData = transformResponse(data);
        console.log('Fetched file links:', formattedData);
        return formattedData;
    } catch (error) {
        console.error('Error fetching file links:', error);
        throw error;  // Rethrow the error after logging it
    }
}

function formatTimestamp(timestamp: string): string {
    // Convert string timestamp to number
    const date = new Date(Number(timestamp));

    // Create an options object for formatting
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Use 24-hour time
    };

    // Use toLocaleDateString to format the date
    return date.toLocaleDateString('en-US', options);
}

function transformResponse(data: FilesResponse): TransformedEntry[] {
    const transformed: TransformedEntry[] = [];

    for (const timestamp in data) {
        const formattedTime: string = formatTimestamp(timestamp);

        const entry: TransformedEntry = {
            Timestamp: formattedTime
        };

        if (data[timestamp].audio) {
            entry.audio = data[timestamp].audio;
        }
        if (data[timestamp].response) {
            entry.response = data[timestamp].response;
        }
        if (data[timestamp].transcript) {
            entry.transcript = data[timestamp].transcript;
        }

        transformed.push(entry);
    }

    return transformed;
}

// const readableDate = formatTimestamp("1717612491779");
// console.log(readableDate);
