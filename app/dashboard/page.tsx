import React from 'react'
import HomeView from '@/app/dashboard/(components)/recordAudio'
import { AudioRecorderWithVisualizer } from "@/app/dashboard/(components)/recordAudio1";
import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
  } from "@/components/ui/page";

const DashboardPage = () => {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center min-h-screen">
      <PageHeader>
        <PageHeaderHeading>Start your Interview</PageHeaderHeading>
        <AudioRecorderWithVisualizer className="my-12 w-full max-w-full" />
        <PageHeaderDescription>
          Hi I am Katy your virtual AI Interviewer, please click the microphone button to start recording your answer.
        </PageHeaderDescription>
      </PageHeader>
    </div>
  )
}

export default DashboardPage
