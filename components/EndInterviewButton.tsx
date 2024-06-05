"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const EndInterviewButton = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router

  const handleClick = async () => {
    setIsClicked(true); // Update the state first
    const url = await endInterviewer();
    if (url) {
      setAudioUrl(url);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        router.push('/dashboard/recording'); // Redirect after audio ends
      };
    }
  }, [audioUrl, router]); // Play the audio and redirect when the audioUrl state updates

  return (
    <div>
      {isClicked ? (
        <p className="text-gray-900 dark:text-gray-400">
          Interview ended, taking you to recordings page
        </p>
      ) : (
        <Button
          className="hover:bg-red-800 text-white"
          onClick={handleClick}
        >
          End Interview
        </Button>
      )}
    </div>
  );
};

const endInterviewer = async (): Promise<string | null> => {
  try {
    const response = await fetch('http://127.0.0.1:8080/end', {
      method: 'POST',
    });

    // const response = await fetch('https://apriora-python.onrender.com/end', {
    //   method: 'POST',
    // });

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

export default EndInterviewButton;
