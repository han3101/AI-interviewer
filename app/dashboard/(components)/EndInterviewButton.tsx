"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const EndInterviewButton = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
    }
  }, [audioUrl]); // Play the audio when the audioUrl state updates

  return (
    <div>
      {isClicked ? (
        <Link href="/dashboard/recording" passHref>
          <Button className="hover:text-gray-200 dark:text-gray-400">
            Recording Ended, click to go to Recording
          </Button>
        </Link>
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
    const response = await fetch('http://127.0.0.1:8000/end', {
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

export default EndInterviewButton;
