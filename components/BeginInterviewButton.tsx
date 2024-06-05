'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const BeginInterviewButton = () => {
    const [isClicked, setIsClicked] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const router = useRouter(); // Initialize the router
    const handleClick = async () => {
        const url = await startInterviewer();
        if (url) {
          setAudioUrl(url);
          router.push('/dashboard'); // Route to /dashboard
        }
      };

    useEffect(() => {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    }
    }, [audioUrl]); // Play the audio when the audioUrl state updates
  return (
    <div>
      <Button className='text-xlpy-8 px-16 text-white hover:bg-green-900' onClick={handleClick}>
        Begin Interview
     </Button>
    </div>
  )
}

const startInterviewer = async (): Promise<string | null> => {
    try {
    //   const response = await fetch('http://127.0.0.1:8080/begin', {
    //     method: 'POST',
    //   });
  
      const response = await fetch('https://apriora-python.onrender.com/begin', {
        method: 'POST',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error ending interview:', errorData.message);
        return null;
      }
  
      const fileResponse = await response.blob();
      return URL.createObjectURL(fileResponse);
  
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

export default BeginInterviewButton
