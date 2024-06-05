"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Send, Mic, Trash } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  timerClassName?: string;
};

type Record = {
  id: number;
  name: string;
  file: any;
};

// Declare a global interface to add the webkitSpeechRecognition property to the Window object
declare global {
    interface Window {
      webkitSpeechRecognition: any;
    }
  }

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerTimeout: NodeJS.Timeout;

// Utility function to pad a number with leading zeros
const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, "0");
};

// Utility function to download a blob
const downloadBlob = (blob: Blob, filename: string) => {
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

// Download the blob as a file 
// TODO move upload to s3 storage
const uploadBlob = async (blob: Blob) => {
    const tempUrl = URL.createObjectURL(blob);
  
    try {
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: tempUrl }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error uploading file:', errorData.message);
        return;
      }
  
      const result = await response.json();
      console.log('File uploaded successfully:', result.filePath);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const uploadTranscript = async (blob: Blob, filename: string): Promise<string | null> => {
    try {
        // Prepare the form data to send the file
        const formData = new FormData();
        formData.append("file", blob, filename);  // Use the provided filename

        // Fetch request to the server endpoint
        // const response = await fetch('http://127.0.0.1:8080/interview', {
        //   method: 'POST',
        //   body: formData,  // Send the form data
        // });

        const response = await fetch('http://20.9.136.70:8080/interview', {
          method: 'POST',
          body: formData,  // Send the form data
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error uploading file:', errorData.message);
            return null;
        }

        // If successful, return the object URL for the uploaded file
        const fileResponse = await response.blob();
        const objectUrl = URL.createObjectURL(fileResponse);
        return objectUrl;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
};
  

export const AudioRecorderWithVisualizer = ({
  className,
  timerClassName,
}: Props) => {
  const { theme } = useTheme();
  // States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingFinished, setIsRecordingFinished] =
    useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  // const [transcript, setTranscript] = useState<string[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Record>({
    id: -1,
    name: "",
    file: null,
  });
  // Calculate the hours, minutes, and seconds from the timer
  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  // Split the hours, minutes, and seconds into individual digits
  const [hourLeft, hourRight] = useMemo(
    () => padWithLeadingZeros(hours, 2).split(""),
    [hours]
  );
  const [minuteLeft, minuteRight] = useMemo(
    () => padWithLeadingZeros(minutes, 2).split(""),
    [minutes]
  );
  const [secondLeft, secondRight] = useMemo(
    () => padWithLeadingZeros(seconds, 2).split(""),
    [seconds]
  );
  // Refs
  const mediaRecorderRef = useRef<{
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    mediaRecorder: MediaRecorder | null;
    audioContext: AudioContext | null;
  }>({
    stream: null,
    analyser: null,
    mediaRecorder: null,
    audioContext: null,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<any>(null);
  // Reference to store the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setIsRecording(true);
          // ============ Analyzing ============
          const AudioContext = window.AudioContext;
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          mediaRecorderRef.current = {
            stream,
            analyser,
            mediaRecorder: null,
            audioContext: audioCtx,
          };

          const mimeType = MediaRecorder.isTypeSupported("audio/mpeg")
            ? "audio/mpeg"
            : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/wav";

          const options = { mimeType };
          mediaRecorderRef.current.mediaRecorder = new MediaRecorder(
            stream,
            options
          );
          mediaRecorderRef.current.mediaRecorder.start();
          recordingChunks = [];
          // ============ Recording ============
          recorder = new MediaRecorder(stream);
          recorder.start();
          recorder.ondataavailable = (e) => {
            recordingChunks.push(e.data);
          };

          // ============ Transcription ============

          // Temp storage array for the transcript
            let transcriptArray: string[] = [];
          // Create a new SpeechRecognition instance and configure it
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let storedTranscripts = sessionStorage.getItem('transcripts');
                let transcripts = storedTranscripts ? JSON.parse(storedTranscripts) : [];
            
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcripts.push(event.results[i][0].transcript);
                    }
                }
    
            
                sessionStorage.setItem('transcripts', JSON.stringify(transcripts));
            };

            // Start the speech recognition
            recognitionRef.current.start();
        })
        .catch((error) => {
          alert(error);
          console.log(error);
        });



    }
  }
  function stopRecording() {
    recorder.onstop = async () => {
      const recordBlob = new Blob(recordingChunks, {
        type: "audio/mpeg",
      });

      // Downoload the audio file
      // downloadBlob(recordBlob, `Audio_${Date.now()}.mp3`);
        // uploadBlob(recordBlob);

      // Download the transcrip
      // Combine the transcripts into a single string and download it
      const storedTranscripts = sessionStorage.getItem('transcripts');
      let audioUrl = null;
      if (storedTranscripts) {
        const transcripts = JSON.parse(storedTranscripts);
            const transcriptString = transcripts.join(' ');
        const transcriptBlob = new Blob([transcriptString], {
            type: "text/plain",
        });
        // downloadBlob(transcriptBlob, `Transcript_${Date.now()}.txt`);
        audioUrl = await uploadTranscript(transcriptBlob, `Transcript_${Date.now()}.txt`);
      }

      // setCurrentRecord({
      //   ...currentRecord,
      //   file: window.URL.createObjectURL(recordBlob),
      // });
      recordingChunks = [];
      sessionStorage.removeItem('transcripts');

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();

          // Add event listener to stop audio on any button click
        const stopAudio = () => {
          audio.pause();
          audio.currentTime = 0;
        };

        document.body.addEventListener('click', stopAudio);

        // Clean up the event listener when the audio ends
        audio.onended = () => {
          document.body.removeEventListener('click', stopAudio);
        };

      }
    };

    recorder.stop();
    recognitionRef.current.stop();

    setIsRecording(false);
    setIsRecordingFinished(true);
    setTimer(0);
    clearTimeout(timerTimeout);
  }

  function resetRecording() {
    const { mediaRecorder, stream, analyser, audioContext } =
      mediaRecorderRef.current;

    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        recordingChunks = [];
        sessionStorage.removeItem('transcripts');
      };
      mediaRecorder.stop();
      recognitionRef.current.stop();
    } else {
      alert("recorder instance is null!");
    }

    // Stop the web audio context and the analyser node
    if (analyser) {
      analyser.disconnect();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsRecording(false);
    setIsRecordingFinished(true);
    setTimer(0);
    clearTimeout(timerTimeout);

    // Clear the animation frame and canvas
    cancelAnimationFrame(animationRef.current || 0);
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasCtx = canvas.getContext("2d");
      if (canvasCtx) {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }
    }
  }


  const handleSubmit = () => {
    stopRecording();
  };

  // Effect to update the timer every second
  useEffect(() => {
    if (isRecording) {
      timerTimeout = setTimeout(() => {
        setTimer(timer + 1);
      }, 1000);
    }
    return () => clearTimeout(timerTimeout);
  }, [isRecording, timer]);

  // Visualizer
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawWaveform = (dataArray: Uint8Array) => {
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "#939393";

      const barWidth = 1;
      const spacing = 1;
      const maxBarHeight = HEIGHT / 2.5;
      const numBars = Math.floor(WIDTH / (barWidth + spacing));

      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.pow(dataArray[i] / 128.0, 8) * maxBarHeight;
        const x = (barWidth + spacing) * i;
        const y = HEIGHT / 2 - barHeight / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    const visualizeVolume = () => {
      if (
        !mediaRecorderRef.current?.stream?.getAudioTracks()[0]?.getSettings()
          .sampleRate
      )
        return;
      const bufferLength =
        (mediaRecorderRef.current?.stream?.getAudioTracks()[0]?.getSettings()
          .sampleRate as number) / 100;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) {
          cancelAnimationFrame(animationRef.current || 0);
          return;
        }
        animationRef.current = requestAnimationFrame(draw);
        mediaRecorderRef.current?.analyser?.getByteTimeDomainData(dataArray);
        drawWaveform(dataArray);
      };

      draw();
    };

    if (isRecording) {
      visualizeVolume();
    } else {
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }
      cancelAnimationFrame(animationRef.current || 0);
    }

    return () => {
      cancelAnimationFrame(animationRef.current || 0);
    };
  }, [isRecording, theme]);

  return (
    <div
      className={cn(
        "flex h-16 rounded-md relative w-full items-center justify-center gap-2 max-w-5xl",
        {
          "border p-1": isRecording,
          "border-none p-0": !isRecording,
        },
        className
      )}
    >
      {isRecording ? (
        <Timer
          hourLeft={hourLeft}
          hourRight={hourRight}
          minuteLeft={minuteLeft}
          minuteRight={minuteRight}
          secondLeft={secondLeft}
          secondRight={secondRight}
          timerClassName={timerClassName}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className={`h-full w-full bg-background ${
          !isRecording ? "hidden" : "flex"
        }`}
      />
      <div className="flex gap-2">
        {/* ========== Delete recording button ========== */}
        {isRecording ? (
            <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={resetRecording}
                size={"icon"}
                variant={"destructive"}
              >
                <Trash size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="m-2">
              <span> Reset recording</span>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        ) : null}

        {/* ========== Start and send recording button ========== */}
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {!isRecording ? (
              <Button onClick={() => startRecording()} size={"icon"}>
                <Mic size={15} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} size={"icon"}>
                <Send size={15} />
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent className="m-2">
            <span>
              {" "}
              {!isRecording ? "Start Response" : " Submit Response "}{" "}
            </span>
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const Timer = React.memo(
  ({
    hourLeft,
    hourRight,
    minuteLeft,
    minuteRight,
    secondLeft,
    secondRight,
    timerClassName,
  }: {
    hourLeft: string;
    hourRight: string;
    minuteLeft: string;
    minuteRight: string;
    secondLeft: string;
    secondRight: string;
    timerClassName?: string;
  }) => {
    return (
      <div
        className={cn(
          "items-center -top-12 left-0 absolute justify-center gap-0.5 border p-1.5 rounded-md font-mono font-medium text-foreground flex",
          timerClassName
        )}
      >
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {hourLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {hourRight}
        </span>
        <span>:</span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {minuteLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {minuteRight}
        </span>
        <span>:</span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {secondLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground ">
          {secondRight}
        </span>
      </div>
    );
  }
);
Timer.displayName = "Timer";