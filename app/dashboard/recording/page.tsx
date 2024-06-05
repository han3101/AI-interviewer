'use client';
import React, { useState, useEffect } from 'react';
import { fetchFileLinks, TransformedEntry } from '@/utils/actions/get_recordings'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import {
  PageActions,
  PageHeader,
} from "@/components/ui/page";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const RecordingPage = () => {

    const router = useRouter();  // Get the router object

    // Routing button for new interview
    const handleStartNewInterview = () => {
        router.push('/dashboard/begin');  // Use the router to navigate
    };

    // State to store the fetched file links
  const [fileLinks, setFileLinks] = useState<TransformedEntry[]>([]);

  // Fetch file links on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const links = await fetchFileLinks();
        setFileLinks(links); // Update state with fetched data
      } catch (error) {
        console.error('Failed to fetch file links:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs only once on mount
    return (
      <Table>
      <TableCaption>A breakdown of your recent interview.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Timestamp</TableHead>
          <TableHead>Transcript</TableHead>
          <TableHead>Your Audio</TableHead>
          <TableHead className="">Interviewer&aposs Response</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fileLinks.map((recording) => (
          <TableRow key={recording.transcript}>
            <TableCell className="font-medium">{recording.Timestamp}</TableCell>
            <TableCell>{recording.transcript ? <a href={recording.transcript}>View Transcript</a> : 'N/A'}</TableCell>
            <TableCell>{recording.audio ? <a href={recording.audio}>Listen</a> : 'N/A'}</TableCell>
            <TableCell className="">{recording.response ? <a href={recording.response}>Listen</a> : 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <Button onClick={handleStartNewInterview} className="btn">
        New Interview
      </Button>
    </Table>
    
    )
  }
  
  export default RecordingPage
