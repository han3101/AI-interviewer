import React from 'react'
import BeginInterviewButton from "@/components/BeginInterviewButton";
import {
    PageHeader,
    PageHeaderHeading,
  } from "@/components/ui/page";

function beginInterview() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center min-h-screen">
      <PageHeader>
        <BeginInterviewButton />
      </PageHeader>
    </div>
  )
}

export default beginInterview
